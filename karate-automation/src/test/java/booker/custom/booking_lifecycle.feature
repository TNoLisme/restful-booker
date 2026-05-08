Feature: Luồng Dòng dữ liệu "Sát thủ" (Data Flow & Clean up)

  Background:
    * url baseUrl
    * def createdIds = []
    
    * def createAndStore = 
    """
    function(i) {
      var payload = {
        firstname: 'User' + i,
        lastname: 'Test',
        totalprice: 100 + i,
        depositpaid: true,
        bookingdates: { checkin: '2024-01-01', checkout: '2024-01-10' }
      };
      var res = karate.call('classpath:booker/custom/create-helper.feature', { payload: payload });
      createdIds.push(res.id);
    }
    """

  Scenario: Vòng đời dữ liệu phức tạp (Tạo 5 -> Kiểm tra danh sách -> Dọn rác)
    # 1. Action: Tạo 5 bookings liên tiếp
    * karate.repeat(5, createAndStore)
    * print 'Các IDs vừa tạo:', createdIds

    # 2. Verify: Gọi GET /booking để lấy toàn bộ danh sách ID
    Given path 'booking'
    When method get
    Then status 200
    And match response[*].bookingid contains createdIds

    # 3. Clean up: Xóa toàn bộ 5 cái để dọn rác
    * def deleteAction = function(id){ karate.call('classpath:booker/custom/delete-helper.feature', { id: id }) }
    * karate.forEach(createdIds, deleteAction)
    
    # 4. Final Check: Đảm bảo không còn ID nào tồn tại
    * def checkDeleted = function(id){ karate.call('classpath:booker/custom/check-deleted-helper.feature', { id: id }) }
    * karate.forEach(createdIds, checkDeleted)
