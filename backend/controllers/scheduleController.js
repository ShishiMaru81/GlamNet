const ScheduleSlot = require('../models/ScheduleSlot');
const Barber = require('../models/Barber');
const Salon = require('../models/Salon');
const SalonStaff = require('../models/SalonStaff');
const User = require('../models/User');

// @desc    Get schedule slots
// @route   GET /api/schedules
// @access  Private
exports.getScheduleSlots = async (req, res, next) => {
  try {
    const { barberId, salonId, date, isBooked } = req.query;
    let query = {};

    if (barberId) {
      query.barberId = barberId;
    }

    if (salonId) {
      query.salonId = salonId;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    if (isBooked !== undefined) {
      query.isBooked = isBooked === 'true';
    }

    const slots = await ScheduleSlot.find(query)
      .populate('barberId', 'userId specialty')
      .populate({
        path: 'barberId',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .populate('salonId', 'name address')
      .populate('appointmentId')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get available slots
// @route   GET /api/schedules/available
// @access  Public
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { barberId, salonId, date } = req.query;

    if (!date || !salonId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide salonId and date'
      });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get salon info
    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }

    // Get all barbers for this salon
    const allBarbers = await Barber.find({ salonId })
      .populate({
        path: 'userId',
        select: 'firstName lastName'
      })
      .select('userId specialty experienceYears rating totalReviews');

    // Get all active salon staff
    const allStaff = await SalonStaff.find({ salonId, isActive: true })
      .populate({
        path: 'userId',
        select: 'firstName lastName'
      });

    // Merge Staff into Barbers list if they are not already present (as actual Barbers)
    // This handles the case where a user created "Staff" but not a "Barber" profile
    const validBarbers = [...allBarbers];

    for (const staff of allStaff) {
      // Check if this staff member is already represented in the barbers list
      // (either via barberId linkage or just same userId)
      const isAlreadyListed = validBarbers.some(b =>
        (staff.barberId && b._id.toString() === staff.barberId.toString()) ||
        (b.userId._id.toString() === staff.userId._id.toString())
      );

      if (!isAlreadyListed) {
        // Create a mock barber object from the staff member
        validBarbers.push({
          _id: staff._id, // Use staff ID as the reference
          userId: staff.userId,
          specialty: 'Stylist', // Default
          experienceYears: 0,
          rating: 0,
          totalReviews: 0,
          isStaffRef: true // Internal flag
        });
      }
    }

    if (validBarbers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No barbers or staff found for this salon'
      });
    }

    // If specific barber requested, filter to that barber
    let barbersToCheck = validBarbers;
    if (barberId && barberId !== 'default') {
      const specificBarber = validBarbers.find(b => b._id.toString() === barberId);
      if (specificBarber) {
        barbersToCheck = [specificBarber];
      }
    }

    // Get existing booked slots for the date
    const bookedSlots = await ScheduleSlot.find({
      salonId,
      date: { $gte: startOfDay, $lte: endOfDay },
      isBooked: true
    }).select('barberId startTime endTime');

    // Generate time slots based on salon hours
    const timeSlots = [];
    if (salon.openingTime && salon.closingTime) {
      let [openHour, openMin] = salon.openingTime.split(':').map(Number);
      const [closeHour, closeMin] = salon.closingTime.split(':').map(Number);

      let currentHour = openHour;
      let currentMin = openMin;

      while (currentHour < closeHour) {
        // defined 2-hour slots
        let endHour = currentHour + 2;
        let endMin = currentMin;

        if (endHour > closeHour || (endHour === closeHour && endMin > closeMin)) break;

        const startTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
        const endTimeStr = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

        // 12-hour buffer check
        const slotStartTime = new Date(startOfDay);
        slotStartTime.setHours(currentHour, currentMin, 0, 0);
        const bufferTime = new Date(Date.now() + 12 * 60 * 60 * 1000);

        if (slotStartTime < bufferTime) {
          currentHour += 1; // Increment by 1 hour
          continue;
        }

        // For each time slot, find available barbers
        const availableBarbers = [];

        for (const barber of barbersToCheck) {
          // Check if this barber has a booked slot at this time
          const isBooked = bookedSlots.some(bs => {
            const bsBarberId = bs.barberId ? bs.barberId.toString() : null;
            if (bsBarberId !== barber._id.toString()) return false;

            // Check time overlap
            const bsStart = bs.startTime;
            const bsEnd = bs.endTime;
            return !(endTimeStr <= bsStart || startTimeStr >= bsEnd);
          });

          if (!isBooked) {
            availableBarbers.push({
              _id: barber._id.toString(),
              name: `${barber.userId.firstName} ${barber.userId.lastName}`,
              specialty: barber.specialty,
              experienceYears: barber.experienceYears,
              rating: barber.rating,
              totalReviews: barber.totalReviews
            });
          }
        }

        // Determine the segment
        let segment = 'Evening';
        if (currentHour < 12) {
          segment = 'Morning';
        } else if (currentHour < 17) {
          segment = 'Afternoon';
        }

        // Only include slot if at least one barber is available
        if (availableBarbers.length > 0) {
          timeSlots.push({
            _id: `virtual-${startTimeStr}`,
            salonId,
            date: startOfDay,
            startTime: startTimeStr,
            endTime: endTimeStr,
            isBooked: false,
            isVirtual: true,
            segment: segment,
            availableBarbers: availableBarbers,
            // Default to first available barber for backward compatibility
            barberId: availableBarbers[0]._id
          });
        }

        currentHour += 1;
      }
    }

    res.status(200).json({
      success: true,
      count: timeSlots.length,
      data: timeSlots
    });
  } catch (error) {
    console.error('Error in getAvailableSlots:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add schedule slot
// @route   POST /api/schedules
// @access  Private
exports.addSchedule = async (req, res, next) => {
  try {
    const { barberId, salonId, date, startTime, endTime } = req.body;

    // Verify barber belongs to salon
    const barber = await Barber.findById(barberId);
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found'
      });
    }

    if (barber.salonId.toString() !== salonId) {
      return res.status(400).json({
        success: false,
        message: 'Barber does not belong to this salon'
      });
    }

    // Get day of week
    const dateObj = new Date(date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[dateObj.getDay()];

    const slot = await ScheduleSlot.create({
      barberId,
      salonId,
      date: dateObj,
      dayOfWeek,
      startTime,
      endTime,
      isBooked: false
    });

    const populatedSlot = await ScheduleSlot.findById(slot._id)
      .populate('barberId', 'userId specialty')
      .populate('salonId', 'name');

    res.status(201).json({
      success: true,
      data: populatedSlot
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update schedule slot
// @route   PUT /api/schedules/:id
// @access  Private
exports.updateSchedule = async (req, res, next) => {
  try {
    let slot = await ScheduleSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Schedule slot not found'
      });
    }

    // Check authorization
    const barber = await Barber.findById(slot.barberId);
    if (barber.userId.toString() !== req.user.id && req.user.role !== 'salon_staff' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this schedule'
      });
    }

    // Update day of week if date changed
    if (req.body.date) {
      const dateObj = new Date(req.body.date);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      req.body.dayOfWeek = days[dateObj.getDay()];
    }

    slot = await ScheduleSlot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('barberId', 'userId specialty')
      .populate('salonId', 'name');

    res.status(200).json({
      success: true,
      data: slot
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete schedule slot
// @route   DELETE /api/schedules/:id
// @access  Private
exports.deleteSchedule = async (req, res, next) => {
  try {
    const slot = await ScheduleSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Schedule slot not found'
      });
    }

    // Check if slot is booked
    if (slot.isBooked) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a booked schedule slot'
      });
    }

    // Check authorization
    const barber = await Barber.findById(slot.barberId);
    if (barber.userId.toString() !== req.user.id && req.user.role !== 'salon_staff' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this schedule'
      });
    }

    await slot.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check availability
// @route   GET /api/schedules/check-availability
// @access  Public
exports.checkAvailability = async (req, res, next) => {
  try {
    const { barberId, date, startTime, endTime } = req.query;

    if (!barberId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide barberId, date, startTime, and endTime'
      });
    }

    const dateObj = new Date(date);
    const slots = await ScheduleSlot.find({
      barberId,
      date: dateObj,
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    const isAvailable = slots.every(slot => !slot.isBooked);

    res.status(200).json({
      success: true,
      data: {
        isAvailable,
        conflictingSlots: slots.filter(s => s.isBooked)
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


