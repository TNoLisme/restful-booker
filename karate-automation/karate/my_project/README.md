# Restful-Booker Karate Test Project

Thu muc nay chua bo kiem thu Karate cho du an Restful-Booker local. Muc tieu khong phai la ep moi test deu pass, ma la dung test de phat hien loi API, UI, mock va hieu nang khi code trong `app-code` thay doi.

## Cau truc chinh

- `src/test/java/f1_api`: API regression test cho cac endpoint Restful-Booker.
- `src/test/java/perf`: Performance testing bang Karate Gatling Java DSL.
- `src/test/java/f2_performance`: khu vuc performance legacy, giu lai de tham khao.
- `src/test/java/f3_ui`: UI testing bang Karate driver cho landing page `3001` va React UI `5173`.
- `src/test/java/f4_mock`: Mock server va mock API tests cho Restful-Booker.
- `src/test/java/karate-config.js`: cau hinh moi truong chung.
- `src/test/java/karate-config-perf.js`: cau hinh rieng cho performance test.

## F1 API Testing

`f1_api` kiem thu cac nhom API:

- Auth: tao token, boundary input, SQL/NoSQL injection, user enumeration, timing, token randomness va brute force detection.
- Booking read: lay danh sach booking, filter theo ten/ngay, lay chi tiet booking theo id.
- Booking write: create, update, patch, delete booking voi token, basic auth, missing auth va invalid data.
- Ping: kiem tra health endpoint `/ping`.

Runner chinh la `f1_api.ApiTest`. Runner nay dung env `api-local`, nen `baseUrl` mac dinh la `http://localhost:3001` va khong goi helper auth khong ton tai.

## F2 Performance Testing

Performance test hien tai dung Karate Gatling Java DSL trong package `perf`.

Cac flow chinh:

- `booking-list.feature`: list booking IDs duoi tai.
- `booking-read.feature`: lay booking detail sau khi lay id tu list.
- `booking-admin-flow.feature`: create, update, patch, delete voi assertion day du.
- `ping.feature`: kiem tra `/ping` duoi tai nhe.

Simulation chinh la `perf.RestfulBookerSimulation`, duoc cau hinh trong Maven profile `gatling`.

## F3 UI Testing

`f3_ui` kiem thu hai lop giao dien:

- Landing page goc tai `http://localhost:3001`.
- React dashboard tai `http://localhost:5173`.

Nhom test bao gom:

- Landing page: noi dung, link, anh, nut Sign In va kha nang quay lai sau khi mo link.
- Auth UI: login dung, login sai, logout va session state.
- Navigation: sidebar va action cards.
- Booking read/write UI: filter, get detail, create, update, patch, delete.
- Ping UI: kiem tra trang thai server.
- Defect discovery: cac ky vong dung cua san pham de test co the fail khi UI co loi that.

## F4 Mock Testing

`f4_mock` cung cap mock server Restful-Booker bang Karate, phuc vu kiem thu doc lap khi khong muon phu thuoc backend that.

Mock server ho tro:

- `GET /ping`
- `POST /auth`
- `GET /booking`
- `GET /booking/{id}`
- `POST /booking`
- `PUT /booking/{id}`
- `PATCH /booking/{id}`
- `DELETE /booking/{id}`
- `POST /reset`

Runner chinh la `f4_mock.MockRunner`, tu khoi dong mock server va chay smoke tests tren mock API.

## Report

Karate report sau moi lan chay nam tai:

```text
target/karate-reports/karate-summary.html
```

Surefire report cua Maven nam tai:

```text
target/surefire-reports
```

