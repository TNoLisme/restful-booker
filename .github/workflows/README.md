# CI API Gate Cho App-Code

Thu muc nay chua GitHub Actions workflow dung de chan code moi neu thay doi trong `app-code` lam bo Karate API regression fail.

Workflow chinh:

```text
.github/workflows/app-code-api-gate.yml
```

## Khi Nao CI Chay

Workflow chay tren:

- `push`
- `pull_request`

Nhung chi khi thay doi cham vao cac path:

- `app-code/**`
- `karate-automation/karate/my_project/**`
- `.github/workflows/app-code-api-gate.yml`

## CI Lam Gi

Job `api-regression` thuc hien cac buoc:

1. Checkout source code.
2. Cai Node.js 22.
3. Cai dependency backend trong `app-code` bang `npm ci`.
4. Start backend Restful-Booker o background.
5. Cho endpoint `http://localhost:3001/ping` san sang.
6. Cai Java 21.
7. Chay Karate API regression:

```bash
mvn -B -ntp clean test -Dtest=ApiTest
```

Thu muc chay Maven:

```text
karate-automation/karate/my_project
```

8. Upload Karate report len GitHub Actions artifact, ke ca khi test fail.

## Ket Qua Mong Doi

- Neu tat ca `f1_api` pass, workflow pass.
- Neu test fail vi defect that cua API, workflow fail va report se chi ra scenario bi fail.
- Neu backend khong start duoc, workflow fail o buoc wait `/ping`.

## Xem Report Tren GitHub

Sau khi workflow chay:

1. Vao tab `Actions`.
2. Mo run tuong ung.
3. Tai artifact `karate-api-report`.
4. Mo file:

```text
karate-summary.html
```

## Chay Tuong Tu Tren Local

Terminal 1:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\app-code
npm install
npm start
```

Terminal 2:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\karate-automation\karate\my_project
mvn clean test -Dtest=ApiTest
```

## Pre-Push Hook Local

Project co hook:

```text
.githooks/pre-push
```

Cai hook:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-pre-push-hook.ps1
```

Hook nay chi chay API gate khi commit sap push co thay doi trong `app-code/**`. Neu test fail, Git se chan push tren may local. Hook khong thay the CI tren GitHub, chi giup bat loi som hon truoc khi push.

