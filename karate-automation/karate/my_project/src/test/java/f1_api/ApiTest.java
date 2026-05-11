package f1_api;
import com.intuit.karate.Results;
import com.intuit.karate.Runner;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

class ApiTest {
    @Test
    void testApi() {
        Results results = Runner.path("classpath:f1_api")
                .karateEnv("api-local")
                .outputHtmlReport(true)
                .parallel(1);
        assertEquals(0, results.getFailCount(), results.getErrorMessages());

// public class ApiTest {
    
//     @Karate.Test
//     Karate testAll() {
//         return Karate.run("classpath:f1_api/van_heroku/auth/create_token_boundary.feature");
// >>>>>>> 5824686c2 (commit before pull code)
    }
}
