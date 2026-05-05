function fn() {
  var env = karate.env; // lấy biến môi trường từ dòng lệnh
  if (!env) { env = 'dev'; }

  var config = {
    baseUrl: 'https://restful-booker.herokuapp.com' // Mặc định chạy trên Cloud
  };

  if (env == 'local') {
    config.baseUrl = 'http://localhost:3001'; // Chạy trên local (nếu đã start app-code)
  }

  // Cấu hình timeout và auth mặc định cho v2
  karate.configure('connectTimeout', 5000);
  karate.configure('readTimeout', 5000);

  return config;
}