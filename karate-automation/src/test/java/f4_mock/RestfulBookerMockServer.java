package f4_mock;

import com.intuit.karate.core.MockServer;

public final class RestfulBookerMockServer {

    private RestfulBookerMockServer() {
    }

    public static void main(String[] args) {
        int port = args.length > 0 ? Integer.parseInt(args[0]) : 9090;
        MockServer server = MockServer
                .feature("classpath:f4_mock/restful_booker_mock.feature")
                .http(port)
                .build();
        Runtime.getRuntime().addShutdownHook(new Thread(() -> server.stop().join()));
        System.out.println("Restful Booker mock server running at http://localhost:" + server.getPort());
        server.waitSync();
    }
}
