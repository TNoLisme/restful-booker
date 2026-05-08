Feature: Brute Force Security Test

Scenario: Thử tất cả tổ hợp User/Pass và dừng lại khi tìm thấy Token
  * def rawData = read('classpath:heroku/api/auth/data/pass_use.txt')
  * def creds = karate.filter(rawData.split('\n'), function(x){ return x.trim().length > 0 })
  * eval
  """
  for (let u of creds) {
      for (let p of creds) {
          let user = u.trim();
          let pass = p.trim();

          let res = karate.http('https://restful-booker.herokuapp.com/auth').post({ 
              username: user, 
              password: pass 
          });

          karate.log('Checking:', user, '/', pass);

          if (res.status == 200 && res.body.token) {
              let errorMsg = '!!! SECURITY BUG FOUND !!!';
              let credentials = 'User: ' + user + ' | Pass: ' + pass;
              let tokenFound = 'Token: ' + res.body.token;

              break outer;
          }
      }
  }
  """