Feature: Brute Force Security Test

Scenario: Try attack by user and password

    * def rawData = read('classpath:f1_api/auth/data/pass_use.txt')
    * def creds = karate.filter(rawData.split('\n'), function(x){ return x.trim().length > 0 })

    * def securityBug = null

    * eval
    """
    let found = false;

    for (let u of creds) {

        if (found) break;

        for (let p of creds) {

            if (found) break;

            let user = u.trim();
            let pass = p.trim();

            let res = karate.http('https://restful-booker.herokuapp.com/auth')
                .post({
                    username: user,
                    password: pass
                });

            karate.log('Checking:', user, '/', pass);

            if (res.status == 200 && res.body.token) {

                securityBug = {
                    user: user,
                    pass: pass,
                    token: res.body.token
                };

                found = true;
            }
        }
    }
    """

    * print 'Security bug result:', securityBug

    * match securityBug == null # gpt đề xuất là != null, cần check
