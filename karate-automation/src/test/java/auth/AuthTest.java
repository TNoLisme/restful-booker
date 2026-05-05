package auth;

import io.karatelabs.junit6.Karate;
class AuthTest {
    @Karate.Test
    Karate testAuth() {
        // Chỉ định chạy đúng file feature này
        return Karate.run("create-token").relativeTo(getClass());
    }
}