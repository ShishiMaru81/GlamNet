import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { FaCalendar, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const SalonDashboard = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [offers, setOffers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState('appointments');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const appointmentsRes = await api.get('/appointments');
      setAppointments(appointmentsRes.data.data || []);

      if (activeTab === 'services') {
        const servicesRes = await api.get('/services');
        setServices(servicesRes.data.data || []);
      }

      if (activeTab === 'offers') {
        const offersRes = await api.get('/offers');
        setOffers(offersRes.data.data || []);
      }

      if (activeTab === 'schedules') {
        const schedulesRes = await api.get('/schedules');
        setSchedules(schedulesRes.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId, status) => {
    try {
      await api.put(`/appointments/${appointmentId}`, { status });
      toast.success('Appointment status updated');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update appointment');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Salon Dashboard</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['appointments', 'services', 'offers', 'schedules'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${activeTab === tab
                    ? 'border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Appointments</h2>
            {appointments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No appointments found</p>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition bg-white dark:bg-gray-700"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {appointment.serviceId?.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {appointment.customerId?.userId?.firstName}{' '}
                          {appointment.customerId?.userId?.lastName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(appointment.appointmentDateTime).toLocaleString()}
                        </p>
                        <span
                          className={`inline-block mt-2 px-2 py-1 rounded text-xs ${appointment.status === 'completed'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : appointment.status === 'cancelled'
                                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            }`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                      {appointment.status === 'scheduled' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleUpdateAppointmentStatus(appointment._id, 'completed')
                            }
                            className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-800 transition"
                          >
                            Mark Complete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Services</h2>
              <button className="bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-700 dark:hover:bg-primary-600 transition">
                <FaPlus className="inline mr-2" />
                Add Service
              </button>
            </div>
            {services.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No services found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <div key={service._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-700">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">{service.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{service.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-primary-600 dark:text-primary-400 font-bold">TK {service.price}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">{service.duration} min</span>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                        <FaEdit />
                      </button>
                      <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === 'offers' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Offers</h2>
              <button className="bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-700 dark:hover:bg-primary-600 transition">
                <FaPlus className="inline mr-2" />
                Add Offer
              </button>
            </div>
            {offers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No offers found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offers.map((offer) => (
                  <div key={offer._id} className="border-2 border-primary-500 dark:border-primary-400 rounded-lg p-4 bg-white dark:bg-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{offer.offerName}</h3>
                      <span className="bg-primary-600 dark:bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {offer.discountPercentage}% OFF
                      </span>
                    </div>
                    {offer.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{offer.description}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Valid until: {new Date(offer.endDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Schedules Tab */}
        {activeTab === 'schedules' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Schedules</h2>
              <button className="bg-primary-600 dark:bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-700 dark:hover:bg-primary-600 transition">
                <FaPlus className="inline mr-2" />
                Add Schedule
              </button>
            </div>
            {schedules.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No schedules found</p>
            ) : (
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <div key={schedule._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {new Date(schedule.date).toLocaleDateString()}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {schedule.startTime} - {schedule.endTime}
                        </p>
                        <span
                          className={`inline-block mt-2 px-2 py-1 rounded text-xs ${schedule.isBooked
                              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                              : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            }`}
                        >
                          {schedule.isBooked ? 'Booked' : 'Available'}
                        </span>
                      </div>
                      {!schedule.isBooked && (
                        <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalonDashboard;


