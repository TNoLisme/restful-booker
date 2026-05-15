function fn() {
  var config = {};

  config.baseUrl = karate.properties['api.baseUrl'] || 'http://localhost:3001';
  config.env = karate.env || 'f2_performance';

  karate.configure('connectTimeout', 5000);
  karate.configure('readTimeout', 5000);
  karate.configure('logging', { report: 'warn', console: 'warn' });
  karate.configure('matchEachEmptyAllowed', true);

  return config;
}
