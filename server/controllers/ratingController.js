const Rating = require('../models/Rating');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');

// @desc    Yolculuk sonrası değerlendirme oluştur
// @route   POST /api/ratings
// @access  Private
const createRating = async (req, res) => {
  try {
    const { rideId, toUserId, rating, comment, role } = req.body;

    // Yolculuğu kontrol et
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Yolculuk bulunamadı' });
    }

    // Yolculuğun tamamlanmış olması gerekiyor
    if (ride.status !== 'completed') {
      return res.status(400).json({ message: 'Sadece tamamlanmış yolculuklar değerlendirilebilir' });
    }

    // Kullanıcının bu yolculukta olup olmadığını kontrol et
    let hasAccess = false;
    if (role === 'driver' && ride.driver.toString() === req.user._id.toString()) {
      hasAccess = true;
    } else if (role === 'passenger') {
      const booking = await Booking.findOne({
        ride: rideId,
        passenger: req.user._id,
        status: 'approved'
      });
      hasAccess = !!booking;
    }

    if (!hasAccess) {
      return res.status(403).json({ message: 'Bu yolculuk için değerlendirme yapma yetkiniz yok' });
    }

    // Kendini değerlendiremez
    if (toUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Kendinizi değerlendiremezsiniz' });
    }

    const ratingData = await Rating.create({
      ride: rideId,
      fromUser: req.user._id,
      toUser: toUserId,
      rating,
      comment,
      role
    });

    const populatedRating = await Rating.findById(ratingData._id)
      .populate('fromUser', 'username')
      .populate('toUser', 'username');

    res.status(201).json(populatedRating);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Bu kullanıcı için zaten değerlendirme yaptınız' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Kullanıcının aldığı değerlendirmeleri getir
// @route   GET /api/ratings/user/:userId
// @access  Public
const getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ toUser: req.params.userId })
      .populate('fromUser', 'username')
      .populate('ride', 'origin destination date')
      .sort({ createdAt: -1 });

    // Ortalama puan hesapla
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    res.json({
      ratings,
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: ratings.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Yolculuk için değerlendirmeleri getir
// @route   GET /api/ratings/ride/:rideId
// @access  Public
const getRideRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ ride: req.params.rideId })
      .populate('fromUser', 'username')
      .populate('toUser', 'username')
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Kullanıcının yaptığı değerlendirmeleri getir
// @route   GET /api/ratings/my-ratings
// @access  Private
const getMyRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ fromUser: req.user._id })
      .populate('toUser', 'username')
      .populate('ride', 'origin destination date')
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRating,
  getUserRatings,
  getRideRatings,
  getMyRatings
};

