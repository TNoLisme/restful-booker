package f4_mock;

import com.intuit.karate.Results;
import com.intuit.karate.Runner;
import com.intuit.karate.core.MockServer;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

class MockRunner {
    @Test
    void testMock() {
        MockServer server = MockServer
                .feature("classpath:f4_mock/restful_booker_mock.feature")
                .http(0)
                .build();
        try {
            Results results = Runner.path("classpath:f4_mock/restful_booker_mock_test.feature")
                    .karateEnv("mock-test")
                    .systemProperty("mockBaseUrl", "http://localhost:" + server.getPort())
                    .outputHtmlReport(true)
                    .parallel(1);
            assertEquals(0, results.getFailCount(), results.getErrorMessages());
        } finally {
            server.stop();
        }
    }
}
