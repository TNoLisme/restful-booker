package f3_ui;

import com.intuit.karate.Results;
import com.intuit.karate.Runner;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

class UiTest {
    @Test
    void testUi() {
        Results results = Runner.path("classpath:f3_ui")
                .karateEnv("ui")
                .outputHtmlReport(true)
                .parallel(1);
        assertEquals(0, results.getFailCount(), results.getErrorMessages());
    }
}
