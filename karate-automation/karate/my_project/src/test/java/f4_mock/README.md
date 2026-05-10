# Restful Booker Karate Mock

Mock server chay bang Karate feature: `restful_booker_mock.feature`.

## Endpoint da mock

- `GET /ping`
- `POST /auth`
- `GET /booking`
- `GET /booking/{id}`
- `POST /booking`
- `PUT /booking/{id}`
- `PATCH /booking/{id}`
- `DELETE /booking/{id}`

Token hop le mac dinh:

```text
mock-token-12345
```

## Chay smoke test

Can dung JDK 21. Project dang bi loi voi JDK 26 do GraalJS cua Karate `1.5.0.RC1` khong tuong thich.

```powershell
$env:JAVA_HOME='c:\Users\ngoth\.vscode\extensions\redhat.java-1.54.0-win32-x64\jre\21.0.10-win32-x86_64'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
.\apache-maven-3.9.6\bin\mvn.cmd "-Dtest=f4_mock.MockRunner" test
```

## Chay mock server thu cong

Run class `f4_mock.RestfulBookerMockServer` trong IDE. Mac dinh server dung port `9090`; co the truyen port khac qua argument dau tien.

Khi server dang chay o `http://localhost:9090`, co the chay API tests voi env `mock`:

```powershell
$env:JAVA_HOME='c:\Users\ngoth\.vscode\extensions\redhat.java-1.54.0-win32-x64\jre\21.0.10-win32-x86_64'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
.\apache-maven-3.9.6\bin\mvn.cmd "-Dkarate.env=mock" "-Dtest=f1_api.ApiTest" test
```
