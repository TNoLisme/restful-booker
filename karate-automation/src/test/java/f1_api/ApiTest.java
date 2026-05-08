package f1_api;
import com.intuit.karate.Results;
import com.intuit.karate.Runner;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
class ApiTest {

    @Test
    void testAll() {
        // Tạo mốc thời gian để đặt tên thư mục báo cáo duy nhất cho mỗi lần chạy
        String timestamp = java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")
                            .format(java.time.LocalDateTime.now());
        String reportDir = "target/karate-reports_" + timestamp;

        Results results = Runner.path("classpath:f1_api")
                .outputHtmlReport(true)
                .reportDir(reportDir) // Chỉ định thư mục báo cáo riêng biệt
                .parallel(5);
        
        System.out.println("Báo cáo của lần chạy này được lưu tại: " + reportDir);
        assertEquals(0, results.getFailCount(), results.getErrorMessages());
    }

}
