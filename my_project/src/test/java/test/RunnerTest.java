package demo;

import io.karatelabs.junit6.Karate;

public class RunnerTest {
    
    @Karate.Test
    Karate testAll() {
        return Karate.run("classpath:heroku/api/auth");
    }
}
// karate.fail(errorMsg + ' -> ' + credentials + ' | ' + tokenFound);