function fn() {
  var utils = {};
  
  utils.getAuthFuzzData = function() {
    return [
      { id: 1, user: 'admin', pass: 'password123', status: 200, exp: { token: '#string' }, desc: 'Thông tin hợp lệ' },
      { id: 2, user: 'admin', pass: 'wrongpass', status: 200, exp: { reason: 'Bad credentials' }, desc: 'Sai mật khẩu' },
      { id: 3, user: 'wrong', pass: 'password123', status: 200, exp: { reason: 'Bad credentials' }, desc: 'Sai username' },
      { id: 4, user: null, pass: 'password123', status: 200, exp: { reason: 'Bad credentials' }, desc: 'Thiếu username' },
      { id: 5, user: 'admin', pass: null, status: 200, exp: { reason: 'Bad credentials' }, desc: 'Thiếu password' },
      { id: 6, user: '', pass: '', status: 200, exp: { reason: 'Bad credentials' }, desc: 'Chuỗi rỗng' },
      { id: 7, user: "' OR 1=1 --", pass: 'password123', status: 200, exp: { reason: 'Bad credentials' }, desc: 'SQL Injection' }
    ];
  };

  utils.getCreateFuzzData = function() {
    var today = new Date().toISOString().split('T')[0];
    var tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
    
    return [
      { id: 1, fn: 'Jim', ln: 'B', p: 111, d: true, ci: today, co: tomorrow, ex: 'Wifi', status: 200, desc: 'Happy Path' },
      { id: 2, fn: 'Jim', ln: 'B', p: 0, d: true, ci: today, co: today, ex: null, status: 200, desc: 'Biên dưới giá' },
      { id: 3, fn: '', ln: 'B', p: 100, d: true, ci: today, co: tomorrow, ex: 'Food', status: 400, desc: 'Rỗng bắt buộc' },
      { id: 4, fn: 'Jim', ln: 'B', p: -1, d: true, ci: today, co: tomorrow, ex: null, status: 400, desc: 'Giá âm' },
      { id: 5, fn: 'Jim', ln: 'B', p: 'abc', d: true, ci: today, co: tomorrow, ex: null, status: 400, desc: 'Sai type giá' },
      { id: 6, fn: 'Jim', ln: 'B', p: 100, d: 'yes', ci: today, co: tomorrow, ex: null, status: 400, desc: 'Sai type bool' },
      { id: 7, fn: 'Jim', ln: 'B', p: 100, d: true, ci: '01-01', co: tomorrow, ex: null, status: 400, desc: 'Sai format date' }
    ];
  };

  return utils;
}
