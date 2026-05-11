# Cach Chay Cac Nhom Test

Tat ca lenh ben duoi chay tu thu muc:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\karate-automation\karate\my_project
```

## Dieu kien chung

Can cai dat:

- Java 21 hoac phien ban tuong thich voi `pom.xml`.
- Maven.
- Node.js cho backend/frontend local.
- Chrome neu chay UI testing bang Karate driver.

## Chay Backend Local

API test va performance test can backend Restful-Booker o port `3001`:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\app-code
npm install
npm start
```

Kiem tra backend:

```powershell
curl http://localhost:3001/ping
```

## F1 - API Testing

Chay toan bo API regression:

```powershell
mvn clean test -Dtest=ApiTest
```

Runner nay dung env `api-local`, mac dinh goi:

```text
http://localhost:3001
```

Neu muon doi backend target:

```powershell
mvn clean test -Dtest=ApiTest -Dapi.baseUrl=http://localhost:3001
```

Ket qua co the fail neu API that co loi hoac testcase dang duoc thiet ke de bat defect. Khi fail, xem report:

```text
target/karate-reports/karate-summary.html
```

## F2 - Performance Testing

Chay Gatling performance test hien tai:

```powershell
mvn clean test-compile gatling:test -P gatling
```

Simulation mac dinh trong `pom.xml`:

```text
perf.RestfulBookerSimulation
```

Neu can chi ro simulation:

```powershell
mvn clean test-compile gatling:test -P gatling -Dgatling.simulationClass=perf.RestfulBookerSimulation
```

Performance report nam trong:

```text
target/gatling
```

Ghi chu: `src/test/java/f2_performance/PerformanceTest.scala` la file legacy. Luong performance dang dung trong project la package `perf` voi Java DSL.

## F3 - UI Testing

Can chay ca backend va React web.

Terminal 1:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\app-code
npm install
npm start
```

Terminal 2:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\app-code\web
npm install
npm run dev
```

Sau do chay UI suite:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\karate-automation\karate\my_project
mvn clean test -Dtest=UiTest
```

UI test dung:

```text
baseUrl = http://localhost:3001
webUrl  = http://localhost:5173
```

Report:

```text
target/karate-reports/karate-summary.html
```

## F4 - Mock Testing

Chay mock server smoke tests:

```powershell
mvn clean test -Dtest=MockRunner
```

Runner se khoi dong mock server tu:

```text
classpath:f4_mock/restful_booker_mock.feature
```

Va chay test:

```text
classpath:f4_mock/restful_booker_mock_test.feature
```

Neu muon chay mock server rieng de thao tac thu cong:

```powershell
mvn test-compile exec:java
```

Mock server se in ra URL local trong terminal.

## Chay Tat Ca Unit/Runner Test Maven Nhin Thay

```powershell
mvn clean test
```

Lenh nay co the chay nhieu runner cung luc. Khi chi muon test mot nhom, nen dung `-Dtest=ApiTest`, `-Dtest=UiTest` hoac `-Dtest=MockRunner`.

