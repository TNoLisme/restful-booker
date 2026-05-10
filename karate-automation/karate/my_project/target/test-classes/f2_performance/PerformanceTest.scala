package f2_performance

import com.intuit.karate.gatling.PreDef._
import io.gatling.core.Predef._
import scala.concurrent.duration._

class PerformanceTest extends Simulation {

  // Tái sử dụng lại kịch bản Get Booking từ F1
  val getBooking = scenario("Get Bookings Load Test")
    .exec(karateFeature("classpath:f1_api/get_booking.feature"))

  setUp(
    // Mô phỏng 10 users truy cập đồng thời để stress test
    getBooking.inject(atOnceUsers(10))
  )
}
