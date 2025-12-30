const Ride = require('../models/Ride');

// @desc    Yeni yolculuk ilanı oluştur
// @route   POST /api/rides
// @access  Private (Driver only)
const createRide = async (req, res) => {
  try {
    const { origin, destination, date, price, totalSeats, coordinates } = req.body;

    const ride = await Ride.create({
      driver: req.user._id,
      origin,
      destination,
      date,
      price,
      totalSeats,
      availableSeats: totalSeats,
      coordinates
    });

    res.status(201).json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tüm yolculuk ilanlarını listele
// @route   GET /api/rides
// @access  Public
const getRides = async (req, res) => {
  try {
    const { origin, destination, date } = req.query;

    let filter = { status: 'active', availableSeats: { $gt: 0 } };

    if (origin) filter.origin = { $regex: origin, $options: 'i' };
    if (destination) filter.destination = { $regex: destination, $options: 'i' };
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const rides = await Ride.find(filter)
      .populate('driver', 'username email')
      .sort({ date: 1 });

    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tek bir yolculuk ilanının detayını getir
// @route   GET /api/rides/:id
// @access  Public
const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driver', 'username email');

    if (!ride) {
      return res.status(404).json({ message: 'Yolculuk ilanı bulunamadı' });
    }

    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sürücünün kendi ilanlarını getir
// @route   GET /api/rides/my-rides
// @access  Private (Driver only)
const getMyRides = async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user._id })
      .sort({ date: -1 });

    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Yolculuk ilanını güncelle
// @route   PUT /api/rides/:id
// @access  Private (Driver only - own rides)
const updateRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Yolculuk ilanı bulunamadı' });
    }

    // Sadece ilan sahibi güncelleyebilir
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu ilanı güncelleme yetkiniz yok' });
    }

    const updatedRide = await Ride.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedRide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Yolculuk ilanını sil
// @route   DELETE /api/rides/:id
// @access  Private (Driver only - own rides)
const deleteRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Yolculuk ilanı bulunamadı' });
    }

    // Sadece ilan sahibi silebilir
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu ilanı silme yetkiniz yok' });
    }

    await ride.deleteOne();

    res.json({ message: 'Yolculuk ilanı silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRide,
  getRides,
  getRideById,
  getMyRides,
  updateRide,
  deleteRide
};
