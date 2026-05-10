package f1_api;
import io.karatelabs.junit6.Karate;

public class ApiTest {
    
    @Karate.Test
    Karate testAll() {
        return Karate.run("classpath:f1_api/van_heroku");
    }
}