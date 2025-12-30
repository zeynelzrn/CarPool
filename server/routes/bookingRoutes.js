const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingsByRide,
  updateBookingStatus,
  deleteBooking
} = require('../controllers/bookingController');
const { protect, authorizePassenger, authorizeDriver } = require('../middleware/auth');

router.route('/')
  .post(protect, authorizePassenger, createBooking);

router.get('/my-bookings', protect, authorizePassenger, getMyBookings);

router.get('/ride/:rideId', protect, authorizeDriver, getBookingsByRide);

router.route('/:id')
  .put(protect, authorizeDriver, updateBookingStatus)
  .delete(protect, authorizePassenger, deleteBooking);

module.exports = router;
