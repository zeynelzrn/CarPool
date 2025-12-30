const Message = require('../models/Message');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');

// @desc    Mesaj gönder
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, rideId, content } = req.body;

    if (!receiverId || !rideId || !content) {
      return res.status(400).json({ message: 'Eksik bilgi: receiverId, rideId ve content gereklidir' });
    }

    // Yolculuğu kontrol et
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Yolculuk bulunamadı' });
    }

    // Kullanıcı bu yolculukta mı kontrol et
    const isDriver = ride.driver.toString() === req.user._id.toString();
    const isPassenger = await Booking.findOne({
      ride: rideId,
      passenger: req.user._id,
      status: 'approved'
    });

    if (!isDriver && !isPassenger) {
      return res.status(403).json({ message: 'Bu yolculuk için mesaj gönderme yetkiniz yok' });
    }

    // Alıcı bu yolculukta mı kontrol et
    const receiverIsDriver = ride.driver.toString() === receiverId.toString();
    const receiverIsPassenger = await Booking.findOne({
      ride: rideId,
      passenger: receiverId,
      status: 'approved'
    });

    if (!receiverIsDriver && !receiverIsPassenger) {
      return res.status(403).json({ message: 'Alıcı bu yolculukta değil' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      ride: rideId,
      content
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture')
      .populate('ride', 'origin destination');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Kullanıcının mesajlarını getir (belirli bir yolculuk için)
// @route   GET /api/messages/ride/:rideId?passengerId=xxx
// @access  Private
const getMessagesByRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { passengerId } = req.query; // Sürücü için hangi yolcuyla mesajlaştığını belirtmek için

    // Yolculuğu kontrol et
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Yolculuk bulunamadı' });
    }

    // Kullanıcı bu yolculukta mı kontrol et
    const isDriver = ride.driver.toString() === req.user._id.toString();
    const isPassenger = await Booking.findOne({
      ride: rideId,
      passenger: req.user._id,
      status: 'approved'
    });

    if (!isDriver && !isPassenger) {
      return res.status(403).json({ message: 'Bu yolculuk için mesaj görme yetkiniz yok' });
    }

    // Kullanıcının bu yolculukta mesajlaştığı kişileri bul
    let otherUserId;
    if (isDriver) {
      // Sürücü ise, passengerId parametresi ile belirtilen yolcuyla mesajlaşıyor
      if (passengerId) {
        // passengerId'nin bu yolculukta onaylanmış olduğunu kontrol et
        const booking = await Booking.findOne({
          ride: rideId,
          passenger: passengerId,
          status: 'approved'
        });
        if (!booking) {
          return res.status(403).json({ message: 'Bu yolcu bu yolculukta onaylanmamış' });
        }
        otherUserId = passengerId.toString();
      } else {
        // passengerId yoksa, ilk onaylanmış yolcu ile
        const booking = await Booking.findOne({
          ride: rideId,
          status: 'approved'
        }).populate('passenger');
        if (!booking) {
          return res.json([]);
        }
        otherUserId = booking.passenger._id.toString();
      }
    } else {
      // Yolcu ise, sürücüyle mesajlaşıyor
      otherUserId = ride.driver.toString();
    }

    const messages = await Message.find({
      ride: rideId,
      $or: [
        { sender: req.user._id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user._id }
      ]
    })
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture')
      .sort({ createdAt: 1 });

    // Okunmamış mesajları işaretle
    await Message.updateMany(
      {
        receiver: req.user._id,
        sender: otherUserId,
        read: false
      },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Kullanıcının tüm konuşmalarını getir
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', req.user._id] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'otherUser'
        }
      },
      {
        $unwind: '$otherUser'
      },
      {
        $project: {
          otherUser: {
            _id: '$otherUser._id',
            username: '$otherUser.username',
            profilePicture: '$otherUser.profilePicture'
          },
          lastMessage: 1,
          unreadCount: 1
        }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessagesByRide,
  getConversations
};

