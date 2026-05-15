package f2_performance;

import io.gatling.javaapi.core.ScenarioBuilder;
import io.gatling.javaapi.core.Simulation;
import io.karatelabs.gatling.KarateProtocolBuilder;

import static io.gatling.javaapi.core.CoreDsl.*;
import static io.karatelabs.gatling.KarateDsl.*;

public class RestfulBookerSimulation extends Simulation {

    public RestfulBookerSimulation() {

        if (System.getProperty("karate.env") == null) {
            System.setProperty("karate.env", "f2_performance");
        }
        if (System.getProperty("api.baseUrl") == null) {
            System.setProperty("api.baseUrl", "http://localhost:3001");
        }

        KarateProtocolBuilder protocol = karateProtocol(
                uri("/auth").nil(),
                uri("/ping").nil(),
                uri("/booking").nil(),
                uri("/booking/{id}").nil()
        );

        ScenarioBuilder browse = scenario("browse bookings")
                .group("Browse").on(exec(karateFeature("classpath:f2_performance/booking-list.feature")));

        ScenarioBuilder read = scenario("read booking")
                .group("Read").on(exec(karateFeature("classpath:f2_performance/booking-read.feature")));

        ScenarioBuilder write = scenario("write booking flow")
                .group("Write").on(exec(karateFeature("classpath:f2_performance/booking-admin-flow.feature")));

        ScenarioBuilder ping = scenario("ping")
                .group("Ping").on(exec(karateFeature("classpath:f2_performance/ping.feature")));

        setUp(
                browse.injectOpen(rampUsers(100).during(10)),
                read.injectOpen(rampUsers(100).during(10)),
                write.injectOpen(rampUsers(30).during(10)),
                ping.injectOpen(constantUsersPerSec(5).during(15))
        ).protocols(protocol);
    }
}
