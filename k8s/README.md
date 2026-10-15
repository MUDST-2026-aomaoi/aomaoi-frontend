# Kubernetes + CI/CD ของ aomaoi-frontend

Web app (nginx + static build) deploy เข้า namespace เดียวกับ backend (`aomaoi-app`) Ingress path `/`
backend อยู่ที่ `/aomaoi-api` (repo `aomaoi-backend`, ดู `k8s/README.md` ของ repo นั้น) จึงเข้าได้ทั้งคู่ผ่าน host เดียวกัน

```
k8s/web.yaml       Deployment x2 + Service
k8s/ingress.yaml   path /
scripts/k8s-deploy.sh   deploy + เช็ค rollout และ image
scripts/k8s-smoke.sh    ทดสอบ index, SPA fallback, API base URL ใน bundle
```

## รันบนเครื่องตัวเอง

ต้องมี: Docker, `kubectl`, cluster, ingress controller (ดูขั้นตอนติดตั้งใน README ของ backend), bash

```bash
# API base URL ถูกฝังตอน build -- ต้องเป็น /aomaoi-api/api เพื่อให้เรียก backend ผ่าน Ingress host เดียวกัน
# Git Bash บน Windows ต้องใส่ MSYS_NO_PATHCONV=1 ไม่งั้น /aomaoi-api/api จะถูกแปลงเป็น path ของ Windows
MSYS_NO_PATHCONV=1 docker build --build-arg VITE_API_BASE_URL=/aomaoi-api/api -t aomaoi-frontend:local .
#    kind เท่านั้น: kind load docker-image aomaoi-frontend:local

FRONTEND_IMAGE=aomaoi-frontend:local scripts/k8s-deploy.sh

kubectl -n ingress-nginx port-forward svc/ingress-nginx-controller 16969:80 &
scripts/k8s-smoke.sh            # http://localhost:16969  (ทดสอบ API ด้วย k8s-smoke.sh ของ backend)
```

ตัวแปร: `NAMESPACE` (default `aomaoi-app`), `FRONTEND_IMAGE` (default `ghcr.io/mudst-2026-aomaoi/aomaoi-frontend:latest`), `INGRESS_CLASS` (default `nginx`), `KUBE_CONTEXT`

## CI/CD (`.github/workflows/build.yml`)

| job | ทำอะไร | เมื่อไหร่ |
|---|---|---|
| test | `npm ci`, lint, build, parse script, render manifest | ทุก push/PR ที่ main, dev, integrate |
| build | build image (ฝัง `/aomaoi-api/api`), push GHCR tag `<sha>` + tag branch (`main` -> `latest`) | PR build อย่างเดียวไม่ push |
| deploy-kind | kind cluster ชั่วคราว + ingress-nginx, `k8s-deploy.sh`, `k8s-smoke.sh` | ทุกครั้ง ไม่ต้องมี secret |
| deploy | deploy image `<sha>` ไป cluster จริง | push main หรือรันเอง และต้องมี `KUBE_CONFIG` |

ตั้งค่า deploy ไป cluster จริง: Secret `KUBE_CONFIG` (base64 ของ kubeconfig), Variable ไม่บังคับ `KUBE_NAMESPACE` / `INGRESS_CLASS` / `DEPLOY_RUNNER` เหมือน backend ไม่ตั้ง `KUBE_CONFIG` job `deploy` จะข้าม

หมายเหตุ: `.github/workflows/release.yml` เป็นไฟล์ว่าง (มีอยู่ก่อนแล้ว) GitHub จะแสดงเป็น workflow ผิดพลาด ควรลบหรือเขียนให้เสร็จ
