const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const { getIO, getReceiverSocketId } = require('../socket/socketServer');

// @desc    Yolculuğa rezervasyon isteği gönder
// @route   POST /api/bookings
// @access  Private (Passenger only)
const createBooking = async (req, res) => {
  try {
    const { rideId } = req.body;

    // Yolculuğu kontrol et
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: 'Yolculuk bulunamadı' });
    }

    // Müsait koltuk var mı kontrol et
    if (ride.availableSeats <= 0) {
      return res.status(400).json({ message: 'Bu yolculukta müsait koltuk kalmamış' });
    }

    // Kullanıcı kendi ilanına rezervasyon yapamaz
    if (ride.driver.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Kendi yolculuğunuza rezervasyon yapamazsınız' });
    }

    // Rezervasyon oluştur
    const booking = await Booking.create({
      ride: rideId,
      passenger: req.user._id
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('ride')
      .populate('passenger', 'username email');

    // Socket.io ile sürücüye bildirim gönder
    const io = getIO();
    const driverIdStr = ride.driver.toString();
    const driverSocketId = getReceiverSocketId(driverIdStr);

    console.log('📅 Rezervasyon bildirimi gönderiliyor:', {
      driverId: driverIdStr,
      driverSocketId: driverSocketId,
      passenger: populatedBooking.passenger.username
    });

    // Room bazlı gönderim
    io.to(`user_${driverIdStr}`).emit('new-booking-request', {
      booking: populatedBooking,
      message: `${populatedBooking.passenger.username} size rezervasyon isteği gönderdi`
    });
    io.to(`ride_${rideId.toString()}`).emit('booking-updated', populatedBooking);

    // Generic notification event
    const notificationData = {
      type: 'booking',
      text: `${populatedBooking.passenger.username} yeni bir rezervasyon isteği gönderdi!`,
      link: '/my-rides',
      data: populatedBooking
    };

    io.to(`user_${driverIdStr}`).emit('notification', notificationData);

    // Eğer sürücü online ise direkt socket'e de gönder
    if (driverSocketId) {
      io.to(driverSocketId).emit('notification', notificationData);
      console.log('✅ Rezervasyon bildirimi direkt socket\'e gönderildi:', driverSocketId);
    } else {
      console.log('⚠️ Sürücü şu an online değil');
    }

    res.status(201).json(populatedBooking);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Bu yolculuk için zaten rezervasyon isteğiniz var' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Yolcunun rezervasyonlarını getir
// @route   GET /api/bookings/my-bookings
// @access  Private (Passenger only)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ passenger: req.user._id })
      .populate({
        path: 'ride',
        populate: {
          path: 'driver',
          select: 'username email profilePicture'
        }
      });

    // Silinmiş ride'ları filtrele
    const validBookings = bookings.filter(booking => booking.ride !== null);

    // Tarihe göre sırala (yakından uzağa)
    validBookings.sort((a, b) => new Date(a.ride.date) - new Date(b.ride.date));

    res.json(validBookings);
  } catch (error) {
    console.error('Rezervasyonlar yüklenirken hata:', error);
    res.status(500).json({ message: error.message || 'Rezervasyonlar yüklenemedi' });
  }
};

// @desc    Sürücünün ilanlarına gelen rezervasyon isteklerini getir
// @route   GET /api/bookings/ride/:rideId
// @access  Private (Driver only)
const getBookingsByRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);

    if (!ride) {
      return res.status(404).json({ message: 'Yolculuk bulunamadı' });
    }

    // Sadece ilan sahibi görebilir
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu rezervasyonları görme yetkiniz yok' });
    }

    const bookings = await Booking.find({ ride: req.params.rideId })
      .populate('passenger', 'username email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rezervasyon isteğini onayla/reddet
// @route   PUT /api/bookings/:id
// @access  Private (Driver only)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Geçersiz durum. "approved" veya "rejected" olmalı' });
    }

    const booking = await Booking.findById(req.params.id).populate('ride');

    if (!booking) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }

    // Sadece yolculuğun sahibi onaylayabilir
    if (booking.ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu rezervasyonu yönetme yetkiniz yok' });
    }

    // Onaylanıyorsa koltuk sayısını azalt
    if (status === 'approved' && booking.status !== 'approved') {
      if (booking.ride.availableSeats <= 0) {
        return res.status(400).json({ message: 'Müsait koltuk kalmamış' });
      }

      await Ride.findByIdAndUpdate(booking.ride._id, {
        $inc: { availableSeats: -1 }
      });
    }

    // Daha önce onaylanmışsa ve şimdi reddediliyorsa koltuk sayısını artır
    if (status === 'rejected' && booking.status === 'approved') {
      await Ride.findByIdAndUpdate(booking.ride._id, {
        $inc: { availableSeats: 1 }
      });
    }

    booking.status = status;
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('ride')
      .populate('passenger', 'username email');

    // Socket.io ile yolcuya bildirim gönder
    const io = getIO();
    const passengerIdStr = booking.passenger.toString();
    const passengerSocketId = getReceiverSocketId(passengerIdStr);
    const message = status === 'approved'
      ? 'Rezervasyon isteğiniz onaylandı!'
      : 'Rezervasyon isteğiniz reddedildi.';

    console.log('📋 Rezervasyon durumu bildirimi gönderiliyor:', {
      passengerId: passengerIdStr,
      passengerSocketId: passengerSocketId,
      status: status
    });

    // Room bazlı gönderim
    io.to(`user_${passengerIdStr}`).emit('booking-status-updated', {
      booking: updatedBooking,
      message: message
    });
    io.to(`ride_${booking.ride._id.toString()}`).emit('booking-updated', updatedBooking);

    // Generic notification event
    const notificationData = {
      type: 'status',
      text: status === 'approved'
        ? 'Rezervasyonunuz onaylandı! Yolculuğunuz hazır.'
        : 'Rezervasyon talebiniz maalesef reddedildi.',
      link: '/my-bookings',
      data: updatedBooking
    };

    io.to(`user_${passengerIdStr}`).emit('notification', notificationData);

    // Eğer yolcu online ise direkt socket'e de gönder
    if (passengerSocketId) {
      io.to(passengerSocketId).emit('notification', notificationData);
      console.log('✅ Durum bildirimi direkt socket\'e gönderildi:', passengerSocketId);
    } else {
      console.log('⚠️ Yolcu şu an online değil');
    }

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rezervasyonu iptal et
// @route   DELETE /api/bookings/:id
// @access  Private (Passenger - own bookings)
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('ride');

    if (!booking) {
      return res.status(404).json({ message: 'Rezervasyon bulunamadı' });
    }

    // Sadece rezervasyon sahibi iptal edebilir
    if (booking.passenger.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu rezervasyonu iptal etme yetkiniz yok' });
    }

    // Onaylanmış rezervasyon iptal ediliyorsa koltuk sayısını artır
    if (booking.status === 'approved') {
      await Ride.findByIdAndUpdate(booking.ride._id, {
        $inc: { availableSeats: 1 }
      });
    }

    await booking.deleteOne();

    res.json({ message: 'Rezervasyon iptal edildi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingsByRide,
  updateBookingStatus,
  deleteBooking
};
