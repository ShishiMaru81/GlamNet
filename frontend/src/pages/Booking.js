import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { FaCalendar, FaClock, FaUser, FaCheck, FaChevronRight, FaChevronLeft, FaStar, FaInfoCircle } from 'react-icons/fa';

const Booking = () => {
  const { salonId } = useParams();
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceId: '',
    barberId: '',
    scheduleSlotId: '',
    appointmentDateTime: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSalonData();
  }, [salonId]);

  useEffect(() => {
    if (formData.appointmentDateTime && currentStep === 3) {
      fetchAvailableSlots();
    }
  }, [formData.appointmentDateTime, currentStep]);

  const fetchSalonData = async () => {
    try {
      const [salonRes, servicesRes, barbersRes] = await Promise.all([
        api.get(`/salons/${salonId}`),
        api.get(`/services/salon/${salonId}`),
        api.get(`/salons/${salonId}/barbers`).catch(() => ({ data: { data: [] } }))
      ]);

      setSalon(salonRes.data.data.salon);
      setServices(servicesRes.data.data || []);
      setBarbers(barbersRes.data.data || []);
    } catch (error) {
      console.error('Failed to load salon data:', error);
      toast.error('Failed to load salon data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      if (!formData.appointmentDateTime) return;

      const date = formData.appointmentDateTime;
      const res = await api.get('/schedules/available', {
        params: {
          salonId: salonId,
          date: date,
          barberId: 'default'
        }
      });
      setAvailableSlots(res.data.data || []);
    } catch (error) {
      console.error('Failed to load available slots:', error);
      setAvailableSlots([]);
      if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || 'Failed to load available slots');
      }
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !formData.serviceId) {
      toast.warning('Please select a service');
      return;
    }
    if (currentStep === 2 && !formData.appointmentDateTime) {
      toast.warning('Please select a date');
      return;
    }
    if (currentStep === 3 && !formData.scheduleSlotId) {
      toast.warning('Please select a time slot');
      return;
    }
    if (currentStep === 4 && !formData.barberId) {
      toast.warning('Please select a professional');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const selectedSlot = availableSlots.find(
        slot => slot._id === formData.scheduleSlotId
      );

      if (!selectedSlot) {
        toast.error('Please select a valid time slot');
        setSubmitting(false);
        return;
      }

      const appointmentData = {
        serviceId: formData.serviceId,
        barberId: formData.barberId,
        scheduleSlotId: selectedSlot.isVirtual ? null : formData.scheduleSlotId,
        salonId: salonId,
        appointmentDateTime: new Date(`${formData.appointmentDateTime}T${selectedSlot.startTime}:00`).toISOString(),
        notes: formData.notes
      };

      if (selectedSlot.isVirtual) {
        appointmentData.scheduleSlotId = `virtual-${selectedSlot.startTime}`;
      }

      await api.post('/appointments', appointmentData);
      toast.success('Appointment booked successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedService = services.find(s => s._id === formData.serviceId);
  const selectedBarber = barbers.find(b => b._id === formData.barberId);
  const selectedSlot = availableSlots.find(s => s._id === formData.scheduleSlotId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary-200 dark:border-primary-800"></div>
          <div className="absolute top-0 h-16 w-16 rounded-full border-4 border-primary-600 dark:border-primary-400 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header & Steps */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Book Your Experience</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{salon?.name} • {salon?.address}</p>

          <div className="mt-8 flex items-center justify-center space-x-2 md:space-x-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <React.Fragment key={step}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all duration-300 ${currentStep >= step
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 dark:shadow-primary-900'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                  }`}>
                  {currentStep > step ? <FaCheck className="w-4 h-4" /> : step}
                </div>
                {step < 5 && (
                  <div className={`w-8 md:w-16 h-1 rounded-full transition-all duration-300 ${currentStep > step ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-800'
                    }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-8">

            {/* Step 1: Service Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose a Service</h2>
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 px-3 py-1 rounded-full">Step 1 of 5</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div
                      key={service._id}
                      onClick={() => setFormData({ ...formData, serviceId: service._id })}
                      className={`cursor-pointer group relative p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg ${formData.serviceId === service._id
                        ? 'border-primary-600 bg-primary-50/30 dark:bg-primary-900/20'
                        : 'border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white capitalize">{service.name}</h3>
                        <span className="text-primary-600 dark:text-primary-400 font-extrabold text-xl">TK {service.price}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{service.description}</p>
                      <div className="flex items-center text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        <FaClock className="mr-1.5" /> {service.duration} MINS
                      </div>
                      {formData.serviceId === service._id && (
                        <div className="absolute top-2 right-2 bg-primary-600 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2 ">
                          <FaCheck className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Date Selection */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select Date</h2>
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 px-3 py-1 rounded-full">Step 2 of 5</span>
                </div>
                <div className="max-w-sm mx-auto">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <FaCalendar />
                    </div>
                    <input
                      type="date"
                      value={formData.appointmentDateTime}
                      onChange={(e) => setFormData({ ...formData, appointmentDateTime: e.target.value })}
                      min={(() => {
                        const buffer = new Date(Date.now() + 12 * 60 * 60 * 1000);
                        return `${buffer.getFullYear()}-${String(buffer.getMonth() + 1).padStart(2, '0')}-${String(buffer.getDate()).padStart(2, '0')}`;
                      })()}
                      className="block w-full pl-11 pr-4 py-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
                    />
                  </div>
                  <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    <FaInfoCircle className="inline mr-1" />
                    Bookings must be made at least 12 hours in advance.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Slot Selection */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Available Times</h2>
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 px-3 py-1 rounded-full">Step 3 of 5</span>
                </div>

                {availableSlots.length > 0 ? (
                  <div className="space-y-10">
                    {['Morning', 'Afternoon', 'Evening'].map((segment) => {
                      const segmentSlots = availableSlots.filter(s => s.segment === segment);
                      if (segmentSlots.length === 0) return null;

                      return (
                        <div key={segment}>
                          <h3 className="text-lg font-bold text-gray-600 dark:text-gray-400 mb-4 flex items-center">
                            {segment === 'Morning' && <span className="mr-2">🌅</span>}
                            {segment === 'Afternoon' && <span className="mr-2">☀️</span>}
                            {segment === 'Evening' && <span className="mr-2">🌙</span>}
                            {segment} Slots
                          </h3>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {segmentSlots.map((slot) => (
                              <button
                                key={slot._id}
                                onClick={() => setFormData({ ...formData, scheduleSlotId: slot._id })}
                                className={`py-3 px-2 rounded-xl text-sm font-bold transition-all duration-200 border-2 ${formData.scheduleSlotId === slot._id
                                  ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-100 dark:shadow-none translate-y-[-2px]'
                                  : 'bg-white dark:bg-gray-700 border-gray-100 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-500'
                                  }`}
                              >
                                {slot.startTime}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No time slots available for this date.</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Staff Selection */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose a Professional</h2>
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 px-3 py-1 rounded-full">Step 4 of 5</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableSlots.find(s => s._id === formData.scheduleSlotId)?.availableBarbers.map((barber) => (
                    <div
                      key={barber._id}
                      onClick={() => setFormData({ ...formData, barberId: barber._id })}
                      className={`cursor-pointer group flex items-start p-5 rounded-2xl border-2 transition-all duration-200 ${formData.barberId === barber._id
                        ? 'border-primary-600 bg-primary-50/30 dark:bg-primary-900/20'
                        : 'border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800 shadow-sm'
                        }`}
                    >
                      <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 overflow-hidden mr-4 border-2 border-white dark:border-gray-800 shadow-md">
                        <FaUser className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{barber.name}</h3>
                        <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-2">{barber.specialty || 'Professional Stylist'}</p>
                        <div className="flex items-center text-xs bg-yellow-400/10 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full w-fit">
                          <FaStar className="mr-1 h-3 w-3" />
                          <span className="font-bold">{barber.rating ? barber.rating.toFixed(1) : 'New'}</span>
                          <span className="mx-1 opacity-50">•</span>
                          <span>{barber.totalReviews || 0} Reviews</span>
                        </div>
                      </div>
                      {formData.barberId === barber._id && (
                        <div className="bg-primary-600 text-white rounded-full p-1.5 self-center shadow-lg">
                          <FaCheck className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Final Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review Booking</h2>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/40 px-3 py-1 rounded-full">Final Step</span>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Service</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{selectedService?.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedService?.duration} mins • TK {selectedService?.price}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">When</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {new Date(formData.appointmentDateTime).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-primary-600 dark:text-primary-400 font-semibold">{selectedSlot?.startTime} - {selectedSlot?.endTime}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Specialist</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedBarber?.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedBarber?.specialty}</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 block">Notes for {selectedBarber?.name}</label>
                        <textarea
                          placeholder="Any special requests?"
                          className="w-full mt-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-primary-500 focus:border-primary-500"
                          rows="2"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className={`mt-10 pt-6 border-t border-gray-100 dark:border-gray-700 flex ${currentStep === 1 ? 'justify-end' : 'justify-between'}`}>
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 font-bold hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <FaChevronLeft className="mr-2 h-3 w-3" /> Back
                </button>
              )}

              {currentStep < 5 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary-200 dark:shadow-none transition-all active:scale-95"
                >
                  Continue <FaChevronRight className="ml-2 h-3 w-3" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-green-200 dark:shadow-none transition-all disabled:opacity-50 active:scale-95"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCheck className="mr-2 h-4 w-4" /> Confirm Booking
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;


