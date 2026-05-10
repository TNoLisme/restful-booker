# Restful-Booker Karate Mock Server

Mock server nay bam theo API trong `API.md`:

- `GET /ping`
- `POST /auth`
- `GET /booking`
- `GET /booking/{id}`
- `POST /booking`
- `PUT /booking/{id}`
- `PATCH /booking/{id}`
- `DELETE /booking/{id}`

Moi API duoc tach thanh mot handler `.feature` rieng:

- `ping.feature`
- `auth.feature`
- `booking_list.feature`
- `booking_get.feature`
- `booking_create.feature`
- `booking_update.feature`
- `booking_patch.feature`
- `booking_delete.feature`
- `reset.feature`

`restful_booker_mock.feature` chi dong vai tro dispatcher, route request den dung handler.

## Chay mock server

Tu thu muc `karate-automation/karate/my_project`:

```powershell
mvn test-compile exec:java -Dexec.mainClass=f4_mock.RestfulBookerMockServer
```

Mac dinh server chay tai:

```text
http://localhost:9090
```

Co the truyen port khac:

```powershell
mvn test-compile exec:java -Dexec.mainClass=f4_mock.RestfulBookerMockServer -Dexec.args="3001"
```

## Auth

`PUT`, `PATCH`, `DELETE` yeu cau mot trong hai cach:

- `Cookie: token=<token>` voi token lay tu `POST /auth`
- `Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=`

## Test nhanh

```powershell
mvn test -Dtest=f4_mock.MockRunner
```

Sau khi test pass, mo report tai:

```text
target/karate-reports/index.html
```

Mock co them endpoint tien ich `POST /reset` de dua du lieu test ve trang thai ban dau.
