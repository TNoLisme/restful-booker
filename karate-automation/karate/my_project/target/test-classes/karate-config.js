function fn() {
  var env = karate.env || karate.properties['karate.env'];
  karate.log('karate.env:', env);

  if (!env) {
    env = 'dev';
  }

  var config = {
    env: env,
    baseUrl: 'http://localhost:3001',
    webUrl: 'http://localhost:5173'
  };

  if (env === 'e2e') {
    config.baseUrl = 'https://restful-booker.herokuapp.com';
    config.webUrl = 'https://restful-booker.herokuapp.com';
  }

  if (env === 'mock') {
    config.baseUrl = 'http://localhost:9090';
    config.webUrl = 'http://localhost:5173';
  }

  karate.configure('connectTimeout', 5000);
  karate.configure('readTimeout', 5000);

  if (env === 'ui') {
    config.authToken = null;
    return config;
  }

  if (env === 'api-local') {
    config.baseUrl = karate.properties['api.baseUrl'] || config.baseUrl;
    config.authToken = null;
    return config;
  }

  if (env === 'perf') {
    config.baseUrl = karate.properties['api.baseUrl'] || config.baseUrl;
    karate.configure('logging', { report: 'warn', console: 'warn' });
    karate.configure('matchEachEmptyAllowed', true);
    config.authToken = null;
    return config;
  }

  if (env === 'mock-test') {
    config.authToken = 'mock-token-12345';
    return config;
  }

  var result = karate.callSingle('classpath:f1_api/login-helper.feature', config);
  config.authToken = result.authToken;

  return config;
}
