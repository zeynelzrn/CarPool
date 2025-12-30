const express = require('express');
const router = express.Router();
const {
  createRide,
  getRides,
  getRideById,
  getMyRides,
  updateRide,
  deleteRide
} = require('../controllers/rideController');
const { protect, authorizeDriver } = require('../middleware/auth');

router.route('/')
  .get(getRides)
  .post(protect, authorizeDriver, createRide);

router.get('/my-rides', protect, authorizeDriver, getMyRides);

router.route('/:id')
  .get(getRideById)
  .put(protect, authorizeDriver, updateRide)
  .delete(protect, authorizeDriver, deleteRide);

module.exports = router;
