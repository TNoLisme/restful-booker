package f4_mock;

import com.intuit.karate.Results;
import com.intuit.karate.Runner;
import com.intuit.karate.core.MockServer;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
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
                    .outputDir("target/reports/f4_mock")
                    .outputHtmlReport(true)
                    .parallel(1);
            createMockServerReport();
            assertEquals(0, results.getFailCount(), results.getErrorMessages());
        } finally {
            server.stop();
        }
    }

    private static void createMockServerReport() {
        Path reportDir = Path.of("target", "reports", "f4_mock");
        Path karateSummary = reportDir.resolve("karate-summary.html");
        Path mockServerSummary = reportDir.resolve("mockserver-summary.html");
        try {
            Files.copy(karateSummary, mockServerSummary, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("Mock server report: " + mockServerSummary.toAbsolutePath());
        } catch (IOException e) {
            throw new RuntimeException("Failed to create mockserver-summary.html", e);
        }
    }
}
