const loki = require('lokijs');
const mockBookings = require('../data/mock-bookings.json');

let counter = 0;
const db = new loki('booking.db');
const booking = db.addCollection('bookings');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function seedMockBookings() {
  booking.clear();
  mockBookings.forEach(function(mockBooking) {
    booking.insert(clone(mockBooking));
  });
  counter = mockBookings.reduce(function(max, mockBooking) {
    return Math.max(max, Number(mockBooking.bookingid) || 0);
  }, 0);
}

seedMockBookings();

exports.getIDs = function(query, callback) {
  try {
    // Convert nedb-style query to LokiJS query
    const results = booking.find(query);
    callback(null, results);
  } catch (err) {
    callback(err);
  }
};

exports.get = function(id, callback) {
  try {
    const result = booking.findOne({ bookingid: parseInt(id) });
    callback(null, result);
  } catch (err) {
    callback(err, null);
  }
};

exports.create = function(payload, callback) {
  try {
    counter++;
    payload.bookingid = counter;
    booking.insert(payload);
    callback(null, payload);
  } catch (err) {
    callback(err);
  }
};

exports.update = function(id, updatedBooking, callback) {
  try {
    const doc = booking.findOne({ bookingid: parseInt(id) });
    if (!doc) {
      return callback(new Error(`Booking ${id} not found`));
    }
    Object.assign(doc, updatedBooking);
    booking.update(doc);
    callback(null);
  } catch (err) {
    callback(err);
  }
};

exports.delete = function(id, callback) {
  try {
    const doc = booking.findOne({ bookingid: parseInt(id) });
    if (!doc) {
      return callback(new Error(`Booking ${id} not found`));
    }
    booking.remove(doc);
    callback(null);
  } catch (err) {
    callback(err);
  }
};

exports.deleteAll = function(callback) {
  try {
    counter = 0;
    booking.clear();
    callback(null);
  } catch (err) {
    callback(err);
  }
};
