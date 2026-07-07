# ARC — self-hosted GitHub runners in the WSL cluster (+ SonarQube in CI)

COGNIVITA CI used to run on **GitHub-hosted** runners, which couldn't reach the in-cluster
SonarQube, so Sonar was skipped. These runners live **inside** the WSL kubeadm cluster
(via [Actions Runner Controller](https://github.com/actions/actions-runner-controller)), so
they can hit SonarQube at its ClusterIP DNS
(`sonarqube-sonarqube.sonarqube.svc.cluster.local:9000`) — that's what lets every pipeline
run a real Sonar analysis + quality gate.

```
 push to main ─▶ GitHub queues the job for `runs-on: cognivita-runners`
                    ▼
 ARC listener (arc-runners ns) spins up an ephemeral runner pod (+ dind sidecar)
                    ▼
 build + test + SonarQube analysis (gate)  ─▶  docker build/push  ─▶  yq bump k8s/** [skip ci]
                    ▼
 Argo CD deploys (unchanged)
```

## What gets installed

| Namespace | What | Chart |
|---|---|---|
| `arc-systems` | ARC controller (watches the CRDs) | `gha-runner-scale-set-controller` 0.14.2 |
| `arc-runners` | Listener + ephemeral runner pods; PAT secret | `gha-runner-scale-set` 0.14.2 |

The runner scale set's Helm **release name is the `runs-on:` label** → `cognivita-runners`.
Runners use **Docker-in-Docker** (`containerMode: dind`) so the existing
`docker/build-push-action` steps keep working with no change.

## 1. Create a PAT (classic)

github.com ▸ Settings ▸ Developer settings ▸ **Personal access tokens (classic)** ▸ Generate.
Scope: **`repo`** (repo-level runner registration). Copy the `ghp_…` value — it's used once to
create a Kubernetes Secret and is **never committed**.

## 2. Install (run once, in WSL, from the repo root)

```bash
export GH_PAT=ghp_xxxxxxxx
./k8s/arc/install-arc.sh
```

That installs the controller, creates the `arc-github-secret` Secret from your PAT, and
installs the `cognivita-runners` scale set from [`runner-scale-set-values.yaml`](runner-scale-set-values.yaml).

## 3. SonarQube token → GitHub secret

The pipelines authenticate to SonarQube with a token:

1. Open SonarQube (`http://sonarqube.local:30080`) ▸ **My Account ▸ Security** ▸ generate a token.
2. GitHub repo ▸ Settings ▸ Secrets and variables ▸ Actions ▸ new secret **`SONAR_TOKEN`**.

`SONAR_HOST_URL` defaults to the in-cluster DNS in the workflows; override it with a repo
**variable** of the same name only if your Sonar service moves.

## 4. Verify

```bash
kubectl -n arc-systems get pods                                   # controller Running
kubectl -n arc-runners  get pods,autoscalingrunnersets            # listener Running
```
- GitHub ▸ Settings ▸ Actions ▸ Runners → **cognivita-runners** shows online.
- Trigger a workflow (Actions ▸ *CI · medical-service* ▸ Run workflow). A runner pod appears
  in `arc-runners`, the job runs, and its log shows the Sonar step hitting the `svc.cluster.local` URL.
- SonarQube lists the `cognivita-*` projects with analysis + gate results.

## Quality gate notes (enforced)

Pipelines run with `-Dsonar.qualitygate.wait=true`, so a **RED gate fails the job**. The
default "Sonar way" gate requires **≥80% coverage on New Code** and 0 new issues, which a
brand-new project can trip on the first analysis. If a gate blocks you:

- **Set the New Code definition** (Project ▸ Administration ▸ New Code → *Previous version*)
  so only changed code is gated after the baseline analysis. Do this once per project.
- Backend coverage comes from **JaCoCo** (wired in each `Backend/*/pom.xml`).
- The **frontend** suite is still stabilizing; its coverage may be low. If that project's
  gate blocks CI, either relax it (flip `sonar.qualitygate.wait=false` in
  `frontend/sonar-project.properties`) or give `cognivita-frontend` a custom gate without the
  coverage condition.

## Operate

```bash
# scale / retune: edit runner-scale-set-values.yaml then re-run install-arc.sh (idempotent)
helm -n arc-runners list
# rotate the PAT:
kubectl -n arc-runners create secret generic arc-github-secret \
  --from-literal=github_token=ghp_new --dry-run=client -o yaml | kubectl apply -f -
# tear down:
helm -n arc-runners uninstall cognivita-runners
helm -n arc-systems  uninstall arc
```

> Trade-off: CI now depends on the WSL cluster + ARC being **up**. If they're down, jobs
> queue on GitHub until a runner appears (they don't fall back to cloud).
