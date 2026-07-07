# COGNIVITA — CI/CD (GitHub Actions → Docker Hub → Argo CD)

GitOps deployment for the five projects: **eureka-server**, **apiGateway**,
**medical-service**, **mmse-service**, **frontend**.

```
 push to main ──▶ GitHub Actions (per project, path-filtered) on SELF-HOSTED ARC runners
                    │  build + test  ->  SonarQube analysis + gate  ->  docker build  ->  push docker.io/<user>/<svc>:<sha>
                    │  then: yq bumps k8s/apps/<svc>/kustomization.yaml  ->  commit [skip ci]
                    ▼
              Git (this repo, k8s/**)
                    ▼
             Argo CD  (app-of-apps, auto-sync prune+selfHeal, in your WSL cluster)
                    ▼
           namespace: cognivita   ->  http://cognivita.local:30080
```

CI does **build + ship + tag-bump**; Argo CD does **deploy**. The two only meet in git.

---

## 1. One-time setup

### a) GitHub repository secrets
`Settings ▸ Secrets and variables ▸ Actions ▸ New repository secret`:

| Secret | Value |
|---|---|
| `DOCKERHUB_USERNAME` | your Docker Hub username |
| `DOCKERHUB_TOKEN` | a Docker Hub **access token** (`hub.docker.com ▸ Account Settings ▸ Personal access tokens`, Read/Write) |
| `SONAR_TOKEN` | a SonarQube token (`sonarqube.local ▸ My Account ▸ Security`) — used by every pipeline's Sonar step |

> The manifests are seeded with `docker.io/borhen42/...`. If your Docker Hub user
> differs, you don't need to hand-edit them — the first push to `main` runs CI, which
> rewrites `newName` in each `k8s/apps/<svc>/kustomization.yaml` from `DOCKERHUB_USERNAME`.
> (Or edit the 5 `kustomization.yaml` files once.)

### a-bis) Self-hosted runners (ARC) — REQUIRED, and how SonarQube got wired in
The pipelines run on **self-hosted runners inside the cluster** (`runs-on: cognivita-runners`),
not GitHub-hosted ones — that's the only way CI can reach the in-cluster SonarQube
(`sonarqube-sonarqube.sonarqube.svc.cluster.local:9000`). Install them once with Actions
Runner Controller and generate the `SONAR_TOKEN` above: see **[`k8s/arc/README.md`](arc/README.md)**.
Until the runners are online, workflow jobs queue instead of running. Backend Sonar analysis
uses JaCoCo coverage and **enforces** the quality gate; the frontend is report-only until its
Vitest suite is fixed.

### b) Docker Hub image visibility
Simplest for a demo: let the 5 repos be **public** (default) — the cluster then pulls
with no credentials. If you make them **private**, create a pull secret and reference it:
```bash
kubectl -n cognivita create secret docker-registry dockerhub \
  --docker-username=<user> --docker-password=<token>
# then add `imagePullSecrets: [{name: dockerhub}]` to each Deployment's pod spec.
```

### c) Hosts entries (both Windows and WSL, same as argocd.local/sonarqube.local)
Point the ingress hostnames at the node. Ingress-nginx is on NodePort **30080/30443**.
```
<node-ip>   cognivita.local eureka.local
```
Find `<node-ip>` with `kubectl get nodes -o wide` (your note had ~172.27.191.232; it can
change across WSL reboots). Add to `C:\Windows\System32\drivers\etc\hosts` and `/etc/hosts`.

### d) Azure AI key (sensitive — never committed; rotate first!)
The old key was committed to git history — **rotate it in Azure AI Foundry**, then:
```bash
kubectl -n cognivita create secret generic medical-ai-secret \
  --from-literal=api-key='<YOUR_ROTATED_KEY>'
```
`medical-service` reads it with `optional: true`, so it runs without the key (AI summary
returns "not configured") and picks it up on the next restart once created.

---

## 2. Bootstrap Argo CD (run once, in WSL)

```bash
kubectl apply -f k8s/argocd/project.yaml
kubectl apply -f k8s/argocd/root-app.yaml
```

That single **app-of-apps** (`cognivita-root`) creates the child Applications in
`k8s/argocd/apps/` and Argo CD syncs everything, ordered by sync-wave:

| Wave | App | What |
|---|---|---|
| 0 | `cognivita-infra` | namespace, DB secrets, medical-mysql, mmse-mysql |
| 1 | `eureka-server` | service registry |
| 2 | `api-gateway`, `medical-service`, `mmse-service` | gateway + domain services |
| 3 | `frontend` | Angular + nginx (`/api` → api-gateway) |

Watch it: `kubectl -n argocd get applications` and the Argo CD UI (`argocd.local`).

> First sync shows `latest` tags. Push each project once (or use **Run workflow** in the
> Actions tab) so CI publishes real `:<sha>` images and bumps the manifests — Argo CD then
> rolls out the pinned tags automatically.

---

## 3. Verify

```bash
kubectl -n cognivita get pods,svc,ingress
```
- App:            http://cognivita.local:30080
- Eureka registry: http://eureka.local:30080  (should list MEDICAL-SERVICE, MMSE-SERVICE, APIGATEWAY)
- API through the gateway: http://cognivita.local:30080/api/medical-records

---

## Layout

```
.github/workflows/
  _reusable-backend.yml     # shared build→test→image→tag-bump for the 4 Spring services
  ci-eureka-server.yml  ci-apigateway.yml  ci-medical-service.yml  ci-mmse-service.yml
  ci-frontend.yml           # Node build→test→image→tag-bump
k8s/
  infra/     namespace, secrets (DB), medical-mysql, mmse-mysql, (keycloak optional)
  apps/      one kustomize dir per service (Deployment/Service[/Ingress] + images: tag)
  argocd/    project.yaml, root-app.yaml, apps/*  (app-of-apps)
```

## Notes / known follow-ups
- **Auth (Keycloak):** out of scope here. The frontend inits Keycloak at
  `http://localhost:8082` with a `cognivita` realm that isn't in this repo. `onLoad:
  'check-sso'` means the app still loads unauthenticated. For full in-cluster SSO: enable
  `k8s/infra/keycloak.yaml`, import the realm, expose it, and update `app.config.ts`.
- **Out-of-scope services** (admin/user/cnn, ports 8091/8082/8084/8000) are still called
  directly by the frontend and aren't deployed — those features stay dark until added.
- **Rollback** = `git revert` the tag-bump commit (Argo CD redeploys the previous image),
  or pin `newTag` by hand and let selfHeal apply it.
