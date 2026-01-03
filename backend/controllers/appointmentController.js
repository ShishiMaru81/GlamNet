const Appointment = require('../models/Appointment');
const ScheduleSlot = require('../models/ScheduleSlot');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const sendEmail = require('../utils/email');

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res, next) => {
  try {
    let query = {};

    // Filter based on user role
    if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ userId: req.user.id });
      if (customer) {
        query.customerId = customer._id;
      } else {
        return res.status(404).json({
          success: false,
          message: 'Customer profile not found'
        });
      }
    } else if (req.user.role === 'barber') {
      const Barber = require('../models/Barber');
      const barber = await Barber.findOne({ userId: req.user.id });
      if (barber) {
        query.barberId = barber._id;
      }
    } else if (req.user.role === 'salon_staff') {
      const SalonStaff = require('../models/SalonStaff');
      const staff = await SalonStaff.findOne({ userId: req.user.id });
      if (staff) {
        query.salonId = staff.salonId;
      }
    }

    const appointments = await Appointment.find(query)
      .populate('customerId', 'userId')
      .populate({
        path: 'customerId',
        populate: { path: 'userId', select: 'firstName lastName email phoneNumber' }
      })
      .populate('barberId', 'userId specialty')
      .populate({
        path: 'barberId',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .populate('salonId', 'name address city phone')
      .populate('serviceId', 'name price duration')
      .populate('scheduleSlotId')
      .sort({ appointmentDateTime: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('customerId')
      .populate({
        path: 'customerId',
        populate: { path: 'userId', select: 'firstName lastName email phoneNumber' }
      })
      .populate('barberId')
      .populate({
        path: 'barberId',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .populate('salonId')
      .populate('serviceId')
      .populate('scheduleSlotId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res, next) => {
  try {
    const { barberId, salonId, serviceId, scheduleSlotId, appointmentDateTime, notes } = req.body;

    // Get customer
    const customer = await Customer.findOne({ userId: req.user.id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    // Enforce 12-hour advance booking rule
    const bufferTime = new Date(Date.now() + 12 * 60 * 60 * 1000);
    const appointmentDate = new Date(appointmentDateTime);

    if (appointmentDate < bufferTime) {
      return res.status(400).json({
        success: false,
        message: 'Appointments must be booked at least 12 hours in advance'
      });
    }

    // Check if slot is available and book it atomically
    let slot;
    const isVirtual = typeof scheduleSlotId === 'string' && scheduleSlotId.startsWith('virtual-');

    if (isVirtual) {
      // Handle virtual slot: Atomic creation/check
      const startTime = scheduleSlotId.split('-')[1];

      // Calculate end time (2 hours duration)
      let [h, m] = startTime.split(':').map(Number);
      h += 2;

      const endTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      const dateObj = new Date(appointmentDateTime);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      // ATOMIC UPSERT: Try to find an existing slot or create one if it doesn't exist.
      try {
        slot = await ScheduleSlot.findOneAndUpdate(
          {
            barberId,
            salonId,
            date: dateObj,
            startTime: startTime
          },
          {
            $setOnInsert: {
              barberId,
              salonId,
              date: dateObj,
              dayOfWeek: days[dateObj.getDay()],
              startTime,
              endTime,
              isBooked: false
            }
          },
          { upsert: true, new: true } // Return the document (found or created)
        );
      } catch (upsertError) {
        if (upsertError.code === 11000) {
          // Race condition: Another request created the slot just now.
          // Fetch the slot that was just created.
          slot = await ScheduleSlot.findOne({
            barberId,
            salonId,
            date: dateObj,
            startTime: startTime
          });
        } else {
          throw upsertError;
        }
      }

    } else {
      slot = await ScheduleSlot.findById(scheduleSlotId);
    }

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Schedule slot not found or could not be created'
      });
    }

    // Now securely try to book the slot.
    // This atomic operation ensures only ONE request succeeds if multiple are trying to book the same slot ID.
    const bookedSlot = await ScheduleSlot.findOneAndUpdate(
      { _id: slot._id, isBooked: false },
      { $set: { isBooked: true } },
      { new: true }
    );

    if (!bookedSlot) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Use the booked slot for further checks (though we know it belongs to the right barber if we just created it correctly, 
    // but good to double check for non-virtual consistency)
    slot = bookedSlot; // Update reference

    // Verify slot belongs to the selected barber (Double check)
    if (slot.barberId.toString() !== barberId) {
      // Rollback booking if barber mismatch (Unlikely given query, but safety first)
      await ScheduleSlot.findByIdAndUpdate(slot._id, { isBooked: false });
      return res.status(400).json({
        success: false,
        message: 'Schedule slot does not match the selected barber'
      });
    }

    // Create appointment
    let appointment;
    try {
      appointment = await Appointment.create({
        customerId: customer._id,
        barberId,
        salonId,
        serviceId,
        scheduleSlotId: slot._id, // Use the real slot ID
        appointmentDateTime,
        notes,
        paymentStatus: 'pending'
      });
    } catch (createError) {
      // Rollback the slot booking if appointment creation fails
      console.error("Appointment creation failed, rolling back slot:", createError);
      await ScheduleSlot.findByIdAndUpdate(slot._id, { isBooked: false });
      throw createError; // Rethrow to be caught by main catch block
    }

    // Update slot with appointment ID
    slot.appointmentId = appointment._id;
    await slot.save();

    // Populate appointment with error handling
    let populatedAppointment;
    try {
      populatedAppointment = await Appointment.findById(appointment._id)
        .populate('customerId')
        .populate({
          path: 'customerId',
          populate: { path: 'userId', select: 'firstName lastName email' }
        })
        .populate('salonId', 'name address phone')
        .populate('serviceId', 'name price duration');

      // Try to populate barberId - it might be a Barber or SalonStaff reference
      try {
        const barberPopulated = await Appointment.findById(appointment._id)
          .populate({
            path: 'barberId',
            model: 'Barber',
            populate: { path: 'userId', select: 'firstName lastName' }
          });
        if (barberPopulated.barberId) {
          populatedAppointment.barberId = barberPopulated.barberId;
        }
      } catch (barberError) {
        try {
          const staffPopulated = await Appointment.findById(appointment._id)
            .populate({
              path: 'barberId',
              model: 'SalonStaff',
              populate: { path: 'userId', select: 'firstName lastName' }
            });
          populatedAppointment.barberId = staffPopulated.barberId;
        } catch (staffError) {
          console.error('Failed to populate barber/staff for appointment:', appointment._id);
          populatedAppointment.barberId = null;
        }
      }
    } catch (error) {
      console.error('Error populating appointment:', error);
      populatedAppointment = appointment;
    }

    // Send confirmation email
    const customerEmail = populatedAppointment.customerId?.userId?.email;
    const customerName = populatedAppointment.customerId?.userId ?
      `${populatedAppointment.customerId.userId.firstName} ${populatedAppointment.customerId.userId.lastName}` :
      'Valued Customer';
    const barberName = populatedAppointment.barberId?.userId ?
      `${populatedAppointment.barberId.userId.firstName} ${populatedAppointment.barberId.userId.lastName}` :
      'Our Staff';
    const salonName = populatedAppointment.salonId?.name || 'Our Salon';
    const serviceName = populatedAppointment.serviceId?.name || 'Service';
    const formattedAppointmentDate = new Date(populatedAppointment.appointmentDateTime).toLocaleDateString();
    const appointmentTime = new Date(populatedAppointment.appointmentDateTime).toLocaleTimeString();

    const emailSubject = 'Appointment Confirmation - GlamNet';
    const emailMessage = `
Dear ${customerName},

Your appointment has been successfully booked!

Appointment Details:
- Service: ${serviceName}
- Barber: ${barberName}
- Salon: ${salonName}
- Date: ${formattedAppointmentDate}
- Time: ${appointmentTime}
- Notes: ${populatedAppointment.notes || 'None'}

Thank you for choosing GlamNet. We look forward to serving you!

Best regards,
GlamNet Team
    `;

    try {
      if (customerEmail) {
        await sendEmail({
          email: customerEmail,
          subject: emailSubject,
          message: emailMessage,
        });
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const customer = await Customer.findOne({ userId: req.user.id });
    if (appointment.customerId.toString() !== customer?._id.toString() &&
      req.user.role !== 'barber' &&
      req.user.role !== 'salon_staff' &&
      req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('customerId')
      .populate('barberId')
      .populate('salonId')
      .populate('serviceId');

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const customer = await Customer.findOne({ userId: req.user.id });
    if (appointment.customerId.toString() !== customer?._id.toString() &&
      req.user.role !== 'barber' &&
      req.user.role !== 'salon_staff' &&
      req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }

    // Free up the schedule slot
    const slot = await ScheduleSlot.findById(appointment.scheduleSlotId);
    if (slot) {
      slot.isBooked = false;
      slot.appointmentId = null;
      await slot.save();
    }

    // Update appointment status
    appointment.status = 'cancelled';
    await appointment.save();

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

// @desc    Confirm payment
// @route   PUT /api/appointments/:id/payment
// @access  Private
exports.confirmPayment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    appointment.paymentStatus = 'paid';
    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


