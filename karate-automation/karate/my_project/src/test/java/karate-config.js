function fn() {
  var env = karate.env; // Lấy biến môi trường 'karate.env' (ví dụ: dev, staging)
  karate.log('Môi trường hiện tại (karate.env) là:', env);
  
  if (!env) {
    env = 'dev';
  }
  
  var config = {
    env: env,
    baseUrl: 'http://localhost:3001'
  };

  if (env === 'e2e') {
    config.baseUrl = 'https://restful-booker.herokuapp.com';
  }

  // Cấu hình timeout mặc định
  karate.configure('connectTimeout', 5000);
  karate.configure('readTimeout', 5000);

  // DECLARATIVE AUTH: Sử dụng callSingle để lấy Token duy nhất 1 lần (Singleton)
  // Tính năng này gọi file feature phụ trợ và cache lại kết quả để dùng cho toàn bộ project
  var result = karate.callSingle('classpath:f1_api/login-helper.feature', config);
  
  // Gắn token vào biến config để tất cả các kịch bản khác tự động có biến `authToken`
  config.authToken = result.authToken;

  return config;
}