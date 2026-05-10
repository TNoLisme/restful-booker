package f4_mock;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

public final class MockData {

    private static final Map<Integer, Map<String, Object>> BOOKINGS = new ConcurrentHashMap<>();
    private static final Set<String> TOKENS = Collections.newSetFromMap(new ConcurrentHashMap<>());
    private static final AtomicInteger NEXT_ID = new AtomicInteger(1);
    private static final String BASIC_AUTH = "Basic YWRtaW46cGFzc3dvcmQxMjM=";

    static {
        reset();
    }

    private MockData() {
    }

    public static synchronized void reset() {
        BOOKINGS.clear();
        TOKENS.clear();
        NEXT_ID.set(1);

        seed("Sally", "Brown", 111, true, "2013-02-23", "2014-10-23", "Breakfast");
        seed("Jim", "Brown", 111, true, "2018-01-01", "2019-01-01", "Breakfast");
        seed("Mary", "Wilson", 222, false, "2024-01-01", "2024-01-10", "Wifi");
        seed("John", "Doe", 120, true, "2026-06-01", "2026-06-05", "Airport Shuttle");
        seed("Alice", "Wonder", 450, false, "2026-07-10", "2026-07-15", "High Floor");
    }

    public static Map<String, Object> authenticate(Map<String, Object> body) {
        if (body == null
                || !"admin".equals(body.get("username"))
                || !"password123".equals(body.get("password"))) {
            return response(200, mapOf("reason", "Bad credentials"));
        }
        String token = UUID.randomUUID().toString().replace("-", "").substring(0, 15);
        TOKENS.add(token);
        return response(200, mapOf("token", token));
    }

    public static List<Map<String, Integer>> listIds(Map<String, List<String>> params) {
        String firstname = firstParam(params, "firstname");
        String lastname = firstParam(params, "lastname");
        String checkin = firstParam(params, "checkin");
        String checkout = firstParam(params, "checkout");

        List<Integer> ids = new ArrayList<>(BOOKINGS.keySet());
        Collections.sort(ids);

        List<Map<String, Integer>> result = new ArrayList<>();
        for (Integer id : ids) {
            Map<String, Object> booking = BOOKINGS.get(id);
            if (booking == null || !matches(booking, firstname, lastname, checkin, checkout)) {
                continue;
            }
            Map<String, Integer> item = new LinkedHashMap<>();
            item.put("bookingid", id);
            result.add(item);
        }
        return result;
    }

    public static Map<String, Object> get(Object id) {
        Integer bookingId = toId(id);
        if (bookingId == null || !BOOKINGS.containsKey(bookingId)) {
            return response(404, mapOf("error", "Not Found"));
        }
        return response(200, copyBooking(BOOKINGS.get(bookingId)));
    }

    public static Map<String, Object> create(Map<String, Object> body) {
        String validationError = validateBooking(body, true);
        if (validationError != null) {
            return response(400, mapOf("error", validationError));
        }
        int id = NEXT_ID.getAndIncrement();
        Map<String, Object> booking = copyBooking(body);
        BOOKINGS.put(id, booking);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("bookingid", id);
        payload.put("booking", copyBooking(booking));
        return response(200, payload);
    }

    public static Map<String, Object> update(Object id, Map<String, Object> body, String cookie, String authorization) {
        Map<String, Object> authFailure = authorize(cookie, authorization);
        if (authFailure != null) {
            return authFailure;
        }

        String validationError = validateBooking(body, true);
        if (validationError != null) {
            return response(400, mapOf("error", validationError));
        }

        Integer bookingId = toId(id);
        if (bookingId == null || !BOOKINGS.containsKey(bookingId)) {
            return response(405, mapOf("error", "Method Not Allowed"));
        }

        Map<String, Object> booking = copyBooking(body);
        BOOKINGS.put(bookingId, booking);
        return response(200, copyBooking(booking));
    }

    public static Map<String, Object> patch(Object id, Map<String, Object> body, String cookie, String authorization) {
        Map<String, Object> authFailure = authorize(cookie, authorization);
        if (authFailure != null) {
            return authFailure;
        }
        if (body == null || body.isEmpty()) {
            return response(400, mapOf("error", "Bad Request"));
        }

        Integer bookingId = toId(id);
        if (bookingId == null || !BOOKINGS.containsKey(bookingId)) {
            return response(405, mapOf("error", "Method Not Allowed"));
        }

        String validationError = validateBooking(body, false);
        if (validationError != null) {
            return response(400, mapOf("error", validationError));
        }

        Map<String, Object> updated = copyBooking(BOOKINGS.get(bookingId));
        for (Map.Entry<String, Object> entry : body.entrySet()) {
            if ("bookingdates".equals(entry.getKey())) {
                Map<String, Object> currentDates = asMap(updated.get("bookingdates"));
                Map<String, Object> patchDates = asMap(entry.getValue());
                currentDates.putAll(patchDates);
                updated.put("bookingdates", currentDates);
            } else {
                updated.put(entry.getKey(), entry.getValue());
            }
        }
        BOOKINGS.put(bookingId, updated);
        return response(200, copyBooking(updated));
    }

    public static Map<String, Object> delete(Object id, String cookie, String authorization) {
        Map<String, Object> authFailure = authorize(cookie, authorization);
        if (authFailure != null) {
            return authFailure;
        }

        Integer bookingId = toId(id);
        if (bookingId == null || BOOKINGS.remove(bookingId) == null) {
            return response(405, mapOf("error", "Method Not Allowed"));
        }
        return response(201, null);
    }

    private static void seed(String firstname, String lastname, int totalprice, boolean depositpaid,
            String checkin, String checkout, String additionalneeds) {
        int id = NEXT_ID.getAndIncrement();
        BOOKINGS.put(id, booking(firstname, lastname, totalprice, depositpaid, checkin, checkout, additionalneeds));
    }

    private static Map<String, Object> authorize(String cookie, String authorization) {
        if (authorization != null && authorization.trim().equals(BASIC_AUTH)) {
            return null;
        }
        if (cookie != null) {
            for (String part : cookie.split(";")) {
                String trimmed = part.trim();
                if (trimmed.startsWith("token=") && TOKENS.contains(trimmed.substring(6))) {
                    return null;
                }
            }
        }
        return response(403, mapOf("error", "Forbidden"));
    }

    private static boolean matches(Map<String, Object> booking, String firstname, String lastname,
            String checkin, String checkout) {
        if (firstname != null && !firstname.equalsIgnoreCase(String.valueOf(booking.get("firstname")))) {
            return false;
        }
        if (lastname != null && !lastname.equalsIgnoreCase(String.valueOf(booking.get("lastname")))) {
            return false;
        }

        Map<String, Object> dates = asMap(booking.get("bookingdates"));
        if (checkin != null && String.valueOf(dates.get("checkin")).compareTo(checkin) < 0) {
            return false;
        }
        return checkout == null || String.valueOf(dates.get("checkout")).compareTo(checkout) <= 0;
    }

    private static String validateBooking(Map<String, Object> body, boolean requireAllFields) {
        if (body == null) {
            return "Bad Request";
        }
        if (requireAllFields || body.containsKey("firstname")) {
            if (!(body.get("firstname") instanceof String) || ((String) body.get("firstname")).isBlank()) {
                return "firstname must be a non-empty string";
            }
        }
        if (requireAllFields || body.containsKey("lastname")) {
            if (!(body.get("lastname") instanceof String) || ((String) body.get("lastname")).isBlank()) {
                return "lastname must be a non-empty string";
            }
        }
        if (requireAllFields || body.containsKey("totalprice")) {
            if (!(body.get("totalprice") instanceof Number)) {
                return "totalprice must be a number";
            }
        }
        if (requireAllFields || body.containsKey("depositpaid")) {
            if (!(body.get("depositpaid") instanceof Boolean)) {
                return "depositpaid must be a boolean";
            }
        }
        if (requireAllFields || body.containsKey("bookingdates")) {
            if (!(body.get("bookingdates") instanceof Map)) {
                return "bookingdates must be an object";
            }
            String dateError = validateDates(asMap(body.get("bookingdates")), requireAllFields);
            if (dateError != null) {
                return dateError;
            }
        }
        if (body.containsKey("additionalneeds") && !(body.get("additionalneeds") instanceof String)) {
            return "additionalneeds must be a string";
        }
        return null;
    }

    private static String validateDates(Map<String, Object> dates, boolean requireAllFields) {
        if (requireAllFields || dates.containsKey("checkin")) {
            if (!isIsoDate(dates.get("checkin"))) {
                return "bookingdates.checkin must be YYYY-MM-DD";
            }
        }
        if (requireAllFields || dates.containsKey("checkout")) {
            if (!isIsoDate(dates.get("checkout"))) {
                return "bookingdates.checkout must be YYYY-MM-DD";
            }
        }
        return null;
    }

    private static boolean isIsoDate(Object value) {
        if (!(value instanceof String)) {
            return false;
        }
        try {
            LocalDate.parse((String) value);
            return true;
        } catch (DateTimeParseException e) {
            return false;
        }
    }

    private static Integer toId(Object raw) {
        if (raw == null) {
            return null;
        }
        try {
            return Integer.valueOf(raw.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static String firstParam(Map<String, List<String>> params, String key) {
        if (params == null || !params.containsKey(key) || params.get(key).isEmpty()) {
            return null;
        }
        return params.get(key).get(0);
    }

    private static Map<String, Object> booking(String firstname, String lastname, int totalprice,
            boolean depositpaid, String checkin, String checkout, String additionalneeds) {
        Map<String, Object> booking = new LinkedHashMap<>();
        booking.put("firstname", firstname);
        booking.put("lastname", lastname);
        booking.put("totalprice", totalprice);
        booking.put("depositpaid", depositpaid);
        booking.put("bookingdates", mapOf("checkin", checkin, "checkout", checkout));
        booking.put("additionalneeds", additionalneeds);
        return booking;
    }

    private static Map<String, Object> copyBooking(Map<String, Object> source) {
        Map<String, Object> copy = new LinkedHashMap<>();
        copy.put("firstname", source.get("firstname"));
        copy.put("lastname", source.get("lastname"));
        copy.put("totalprice", source.get("totalprice"));
        copy.put("depositpaid", source.get("depositpaid"));
        copy.put("bookingdates", new LinkedHashMap<>(asMap(source.get("bookingdates"))));
        if (source.containsKey("additionalneeds")) {
            copy.put("additionalneeds", source.get("additionalneeds"));
        }
        return copy;
    }

    private static Map<String, Object> response(int status, Object body) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", status);
        result.put("body", body);
        return result;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> asMap(Object value) {
        return (Map<String, Object>) value;
    }

    private static Map<String, Object> mapOf(Object... values) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (int i = 0; i < values.length; i += 2) {
            map.put(String.valueOf(values[i]), values[i + 1]);
        }
        return map;
    }
}
