# Runbook — Clone the WSL2 single-node Kubernetes (kubeadm) stack

**Audience:** an autonomous AI agent (or engineer) provisioning a second machine.
**Starting state:** Windows 11 + WSL2 with an Ubuntu distro already installed; `containerd` already installed via apt. Nothing else.
**End state:** single-node kubeadm cluster (Kubernetes 1.31) + Flannel + Helm + ingress-nginx + ArgoCD + SonarQube (Community Build), all pods `Running`, reachable via ingress.

This stack was originally built on WSL2/Ubuntu and hit **three non-obvious WSL traps**. They are fixed here **up front** as pre-flight gates so you never hit them. Do not skip §1.

---

## 0. Execution model & conventions

- Run **everything as root inside the Ubuntu WSL distro**. From Windows PowerShell: `wsl -u root -- bash -c "<cmd>"`. Prefer root over `sudo` (avoids non-interactive password prompts).
- **CRLF trap when driving from Windows:** if you write a `.sh` file from Windows and run it in WSL, strip carriage returns first or bash fails on `\r`:
  ```
  wsl -u root -- bash -c "tr -d '\r' < /mnt/c/path/to/script.sh > /tmp/s.sh && bash /tmp/s.sh"
  ```
- Set `export KUBECONFIG=/etc/kubernetes/admin.conf` in every shell that runs `kubectl`/`helm` (or use `/root/.kube/config` after §3).
- **GATE = a verification you must pass before continuing.** If a gate fails, see **Appendix A** (failure signatures → fix).
- **Never print Kubernetes Secrets to stdout** (a credential-materialization guard may block it, and it leaks into logs). Hand the retrieval command to the human instead.
- Order matters. Execute §1 → §10 in sequence.

**Overview checklist**
1. Pre-flight WSL fixes (systemd, swap, modules/sysctl, malformed mounts, IPv6, containerd)
2. Install kubeadm/kubelet/kubectl + CNI plugins
3. `kubeadm init` + kubeconfig + untaint
4. Flannel
5. Helm + repos
6. ingress-nginx (NodePort)
7. Default StorageClass (local-path)
8. ArgoCD
9. SonarQube
10. Verify + access

---

## 1. Pre-flight — fix WSL basics BEFORE touching Kubernetes

### 1.1 systemd must be PID 1 (kubelet requires it)
```bash
ps -p 1 -o comm=          # must print: systemd
```
If it prints `init`/`sh`/`bash`, enable systemd and restart the distro:
```bash
grep -q '^\[boot\]' /etc/wsl.conf 2>/dev/null || printf '[boot]\nsystemd=true\n' >> /etc/wsl.conf
```
Then **from Windows PowerShell**: `wsl --shutdown`, wait ~8s, reopen the distro, and re-check. **GATE:** PID 1 is `systemd`.

### 1.2 Swap off (kubeadm preflight fails with swap on)
```bash
swapoff -a || true
free -h | grep -i swap    # total should be 0
```
WSL2 is normally 0. If not, set `swap=0` under `[wsl2]` in `C:\Users\<you>\.wslconfig`, then `wsl --shutdown`.

### 1.3 Kernel modules + sysctl (persisted)
```bash
cat >/etc/modules-load.d/k8s.conf <<'EOF'
overlay
br_netfilter
EOF
modprobe overlay; modprobe br_netfilter

cat >/etc/sysctl.d/99-kubernetes.conf <<'EOF'
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
sysctl --system >/dev/null
```
**GATE:** `sysctl net.ipv4.ip_forward` = 1 and `lsmod | grep br_netfilter` is non-empty.

### 1.4 Remove malformed `/proc/mounts` lines (Docker Desktop trap) ⚠️
kubelet parses `/proc/mounts` expecting **exactly 6 whitespace fields per line**. Docker Desktop's WSL integration mounts `/Docker/host` with an **unescaped space** (`path=C:\Program Files\...`) → the line has **7 fields** → kubelet dies at ContainerManager start with:
> `system validation failed - wrong number of fields (expected 6, got 7)`

Detect and remove:
```bash
awk 'NF!=6{print NR": NF="NF"  "$0}' /proc/mounts     # list offenders
grep -q ' /Docker/host ' /proc/mounts && { umount /Docker/host || umount -l /Docker/host; }
awk 'NF!=6{c++} END{print "bad lines:", c+0}' /proc/mounts    # must be 0
```
If other offending lines exist, unmount each one's mountpoint (the 2nd field).
**Permanent fix — tell the human:** Docker Desktop → Settings → Resources → **WSL Integration → turn OFF the Ubuntu toggle**, then `wsl --shutdown`. Otherwise `/Docker/host` re-mounts on every boot and re-breaks kubelet.
**GATE:** `bad lines: 0`.

### 1.5 IPv6 sanity (Docker Hub image pulls) ⚠️
Many WSL hosts have **no working IPv6 route** while `docker.io` resolves to IPv6. Small requests (auth/manifest) succeed, but **large layer pulls hang forever with no error** — this only bites Docker Hub images (registry.k8s.io/ghcr/quay are unaffected). Fix by disabling IPv6 on the **external interface only** — **NEVER on `lo`**, because the API server's loopback admission client uses `[::1]:6443` and removing `::1` blocks all pod creation.
```bash
IFACE=$(ip -o -4 route show default | awk '{print $5}' | head -1); : "${IFACE:=eth0}"
if ! ip -6 route show default | grep -q .; then
  echo "No IPv6 default route -> disabling IPv6 on $IFACE only"
  sysctl -w net.ipv6.conf.$IFACE.disable_ipv6=1
  echo "net.ipv6.conf.$IFACE.disable_ipv6=1" >/etc/sysctl.d/99-disable-ipv6.conf
fi
ip -6 addr show dev lo | grep -q '::1' && echo "loopback ::1 present (good)"
```
**GATE:** `::1` still present on `lo`. If the fix was applied, `cat /proc/sys/net/ipv6/conf/$IFACE/disable_ipv6` = 1.
(Quick confirmation that IPv4 to Docker Hub works: `getent ahostsv4 registry-1.docker.io | head` returns IPv4s and `curl -4 -sI --max-time 10 https://registry-1.docker.io/v2/` returns HTTP 401.)

### 1.6 containerd — CRI enabled + systemd cgroup driver
Fresh containerd installs vary (some ship `disabled_plugins=["cri"]`, some default to the `cgroupfs` driver). WSL uses **cgroup v2**, so kubelet's default `systemd` driver must match containerd. Normalize with a fresh default config:
```bash
mkdir -p /etc/containerd
containerd config default >/etc/containerd/config.toml
sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
systemctl restart containerd
systemctl enable containerd >/dev/null 2>&1 || true

# quiet crictl + pin it to containerd
cat >/etc/crictl.yaml <<'EOF'
runtime-endpoint: unix:///run/containerd/containerd.sock
image-endpoint: unix:///run/containerd/containerd.sock
timeout: 10
EOF
```
**GATE:**
```bash
systemctl is-active containerd                    # active
grep SystemdCgroup /etc/containerd/config.toml     # ... = true
crictl version                                     # prints RuntimeName: containerd
```

---

## 2. Install Kubernetes tools (kubeadm/kubelet/kubectl 1.31) + CNI plugins
```bash
apt-get update
apt-get install -y apt-transport-https ca-certificates curl gpg
mkdir -p /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key \
  | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /' \
  >/etc/apt/sources.list.d/kubernetes.list
apt-get update
apt-get install -y kubelet kubeadm kubectl
apt-mark hold kubelet kubeadm kubectl
systemctl enable kubelet >/dev/null 2>&1 || true
```
Ensure base CNI plugins exist (Flannel needs `bridge`, `portmap`, `host-local`, `loopback` in `/opt/cni/bin`):
```bash
if [ ! -e /opt/cni/bin/bridge ]; then
  apt-get install -y containernetworking-plugins
  mkdir -p /opt/cni/bin
  [ -d /usr/lib/cni ] && cp -n /usr/lib/cni/* /opt/cni/bin/ 2>/dev/null || true
fi
ls /opt/cni/bin | tr '\n' ' '; echo
```
**GATE:** `kubeadm version -o short` → `v1.31.x`; `/opt/cni/bin` contains bridge, portmap, host-local, loopback.

---

## 3. `kubeadm init`
```bash
kubeadm init --pod-network-cidr=10.244.0.0/16 --cri-socket=unix:///run/containerd/containerd.sock
```
Wait for **"Your Kubernetes control-plane has initialized successfully!"** Then configure kubeconfig and remove the single-node taint:
```bash
mkdir -p /root/.kube && cp -f /etc/kubernetes/admin.conf /root/.kube/config
# also for the default login user (uid 1000), if present:
U=$(id -un 1000 2>/dev/null || true)
[ -n "$U" ] && { H=$(getent passwd "$U"|cut -d: -f6); mkdir -p "$H/.kube"; \
  cp -f /etc/kubernetes/admin.conf "$H/.kube/config"; chown -R "$U:$U" "$H/.kube"; }

export KUBECONFIG=/etc/kubernetes/admin.conf
kubectl taint nodes --all node-role.kubernetes.io/control-plane- || true   # allow scheduling on the single node
```
**GATE:** `kubectl get nodes` lists the node (`STATUS NotReady` until CNI — expected).
If init **hangs** at "waiting for the kubelet to boot up the control plane" or 6443 is refused: `journalctl -u kubelet -n 30`, re-verify §1.4 and §1.6, then `kubeadm reset -f` and retry.

---

## 4. Flannel CNI
Pre-check the VXLAN backend works:
```bash
modprobe vxlan && ip link add v_tst type vxlan id 1 dstport 4789 && ip link del v_tst && echo "vxlan OK"
```
(If VXLAN is unavailable, use `host-gw` backend — see Appendix A. Fine for a single node.)
Install and wait:
```bash
export KUBECONFIG=/etc/kubernetes/admin.conf
kubectl apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml
kubectl -n kube-flannel rollout status ds/kube-flannel-ds --timeout=150s
kubectl wait --for=condition=Ready node --all --timeout=150s
```
**GATE:** `kubectl get nodes` → `Ready`; both CoreDNS pods reach `Running` (may take ~30–60s).

---

## 5. Helm + chart repos
```bash
curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo add argo         https://argoproj.github.io/argo-helm
helm repo add sonarqube    https://SonarSource.github.io/helm-chart-sonarqube
helm repo update
```
**GATE:** `helm version` (v3.x); `helm repo list` shows all three.

---

## 6. NGINX Ingress (NodePort — bare-metal has no cloud LoadBalancer)
A `LoadBalancer` service would hang on `<pending>`, so use NodePort with fixed ports and make `nginx` the default class:
```bash
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  --set controller.service.type=NodePort \
  --set controller.service.nodePorts.http=30080 \
  --set controller.service.nodePorts.https=30443 \
  --set controller.ingressClassResource.default=true \
  --wait --timeout 300s
```
**GATE:** controller pod `Running`; `kubectl -n ingress-nginx get svc ingress-nginx-controller` shows `80:30080, 443:30443`; `kubectl get ingressclass` shows `nginx`.

---

## 7. Default StorageClass (local-path) — required by SonarQube
kubeadm ships **no** storage provisioner, so any PVC stays `Pending`. Install Rancher local-path and mark it default:
```bash
if ! kubectl get sc 2>/dev/null | grep -q '(default)'; then
  kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.30/deploy/local-path-storage.yaml
  kubectl -n local-path-storage rollout status deploy/local-path-provisioner --timeout=120s
  kubectl patch storageclass local-path -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
fi
kubectl get sc
```
**GATE:** `local-path (default)` is listed.

---

## 8. ArgoCD
Use a values file (avoids `--set` dot-escaping pitfalls). `server.insecure: true` lets it sit cleanly behind the nginx ingress (TLS terminates at ingress):
```bash
cat >/tmp/argocd-values.yaml <<'EOF'
configs:
  params:
    server.insecure: true
EOF
helm upgrade --install argocd argo/argo-cd \
  --namespace argocd --create-namespace \
  -f /tmp/argocd-values.yaml --wait --timeout 480s

cat <<'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-server
  namespace: argocd
  annotations:
    nginx.ingress.kubernetes.io/backend-protocol: "HTTP"
spec:
  ingressClassName: nginx
  rules:
    - host: argocd.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: argocd-server
                port:
                  number: 80
EOF
```
**GATE:** all `argocd-*` pods `Running`; `kubectl -n argocd get ingress` shows `argocd.local`.
**Admin password (give this command to the HUMAN — do not run/print it yourself):**
```
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d; echo
```

---

## 9. SonarQube (Community Build)
Three requirements: host `vm.max_map_count` (bundled Elasticsearch), the **`community.enabled=true`** flag (chart errors otherwise), and a monitoring passcode (don't print it).
```bash
sysctl -w vm.max_map_count=262144
echo 'vm.max_map_count=262144' >/etc/sysctl.d/99-sonarqube.conf

PASS=$(openssl rand -hex 16)
cat >/tmp/sonar-values.yaml <<EOF
community:
  enabled: true
monitoringPasscode: "${PASS}"
initSysctl:
  enabled: false
resources:
  requests:
    cpu: 400m
    memory: 2Gi
  limits:
    cpu: "2"
    memory: 3Gi
ingress:
  enabled: true
  ingressClassName: nginx
  hosts:
    - name: sonarqube.local
      path: /
  annotations:
    nginx.ingress.kubernetes.io/proxy-body-size: "64m"
EOF

helm upgrade --install sonarqube sonarqube/sonarqube \
  --namespace sonarqube --create-namespace \
  -f /tmp/sonar-values.yaml --timeout 300s
```
The image is ~1 GB from Docker Hub — with §1.5 done it pulls over IPv4 in well under a minute. App boot (ES + web + compute engine) then takes ~2–4 min:
```bash
kubectl -n sonarqube rollout status statefulset/sonarqube-sonarqube --timeout=600s
```
**GATE:** `sonarqube-sonarqube-0` is `1/1 Running`. Login `admin` / `admin` (forces a password change).
Notes: the Community Build uses an **embedded database** (no separate PostgreSQL pod/PVC). If pull ever stalls, that's §1.5 not done.

---

## 10. Final verification & access
```bash
export KUBECONFIG=/etc/kubernetes/admin.conf
kubectl get nodes -o wide
kubectl get pods -A
kubectl get ingress -A
kubectl -n ingress-nginx get svc ingress-nginx-controller     # NodePorts 30080/30443
helm list -A
hostname -I | awk '{print $1}'                                 # WSL/node IP
```
Add to the Windows hosts file (`C:\Windows\System32\drivers\etc\hosts`, as admin):
```
<WSL-IP>   argocd.local  sonarqube.local
```
Then browse (note the `:30080` NodePort):
- ArgoCD → `http://argocd.local:30080` (user `admin`)
- SonarQube → `http://sonarqube.local:30080` (`admin`/`admin`)

The WSL IP changes across reboots — re-check with `wsl hostname -I`, or use `kubectl port-forward` for stable local access, e.g. `kubectl -n argocd port-forward svc/argocd-server 8080:80` → `http://localhost:8080`.

---

## Appendix A — failure signatures → fix
| Symptom | Cause → fix |
|---|---|
| kubelet log: `wrong number of fields (expected 6, got 7)` | Malformed `/proc/mounts` line (Docker Desktop) → **§1.4** unmount it. |
| `kubeadm init` hangs at "waiting for the kubelet…"; `:6443` refused | cgroup driver mismatch (**§1.6**, `SystemdCgroup = true`) or the mount trap (**§1.4**). `kubeadm reset -f` then retry. |
| docker.io image stuck `ContainerCreating`, single `Pulling` event, no error, image never lands | Broken IPv6 (**§1.5**). Confirm: `getent ahostsv4 registry-1.docker.io` returns IPv4 and `curl -4 https://registry-1.docker.io/v2/` → 401. |
| Pods never created; controller-manager logs `forbidden … https://[::1]:6443 … cannot assign requested address` | IPv6 was disabled on `lo`. Re-enable globally, disable only on `eth0`: `sysctl -w net.ipv6.conf.all.disable_ipv6=0; sysctl -w net.ipv6.conf.lo.disable_ipv6=0; sysctl -w net.ipv6.conf.eth0.disable_ipv6=1`. If pod still absent, nudge: `kubectl -n <ns> rollout restart statefulset/<name>`. |
| SonarQube helm: `You must choose an 'edition'…` | Add `community.enabled: true` (**§9**). |
| PVC `Pending` forever | No default StorageClass (**§7**). |
| Node `NotReady`, CNI errors | Missing base CNI plugins in `/opt/cni/bin` (**§2**), or VXLAN unavailable → switch Flannel to host-gw: `kubectl -n kube-flannel patch cm kube-flannel-cfg --type merge -p '{"data":{"net-conf.json":"{\"Network\":\"10.244.0.0/16\",\"Backend\":{\"Type\":\"host-gw\"}}"}}'` then `kubectl -n kube-flannel rollout restart ds/kube-flannel-ds`. |

## Appendix B — known-good versions (source machine)
Kubernetes 1.31.14 · containerd 2.2.2 · Ubuntu 26.04 (WSL2 kernel 6.18) · Helm v3.21.2 · charts: ingress-nginx 4.15.1, argo-cd 10.1.2 (ArgoCD v3.4.4), sonarqube 2026.3.1 (image `sonarqube:26.5.0.122743-community`) · flannel latest · local-path-provisioner v0.0.30.
For byte-for-byte reproducibility, pin the chart versions with `--version`. For a lab, latest is fine.

## Appendix C — reboot durability
All fixes persist: containerd config, `/etc/sysctl.d/*`, `/etc/modules-load.d/*`, `/etc/crictl.yaml`. systemd auto-starts containerd + kubelet, so the cluster returns after `wsl --shutdown`.
**The one exception:** if Docker Desktop WSL integration is left enabled, `/Docker/host` re-mounts on boot and re-breaks kubelet (§1.4). Disable that integration for a durable cluster.
