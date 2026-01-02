import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { FaCalendar, FaClock, FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import Chatbot from '../components/Chatbot';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [appointmentsRes, recommendationsRes] = await Promise.all([
        api.get('/appointments'),
        user.role === 'customer' ? api.get('/recommendations') : Promise.resolve({ data: { recommendations: [] } })
      ]);

      setAppointments(appointmentsRes.data.data || []);
      setRecommendations(recommendationsRes.data.recommendations || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await api.delete(`/appointments/${appointmentId}`);
      toast.success('Appointment cancelled');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to cancel appointment');
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
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Dashboard</h1>

        {/* Recommendations for Customers */}
        {user.role === 'customer' && recommendations.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 transition-colors duration-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Recommended Salons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.slice(0, 6).map((salon) => (
                <Link
                  key={salon._id}
                  to={`/salons/${salon._id}`}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition bg-white dark:bg-gray-700"
                >
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">{salon.name}</h3>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>{salon.city}</span>
                  </div>
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="text-gray-900 dark:text-white">{salon.rating}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Appointments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">My Appointments</h2>
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
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                        {appointment.serviceId?.name}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center">
                          <FaCalendar className="mr-2" />
                          <span>
                            {new Date(appointment.appointmentDateTime).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FaClock className="mr-2" />
                          <span>
                            {new Date(appointment.appointmentDateTime).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="mr-2" />
                          <span>{appointment.salonId?.name}</span>
                        </div>
                        {appointment.barberId?.userId?.firstName && appointment.barberId?.userId?.lastName && (
                          <p>
                            Barber: {appointment.barberId.userId.firstName}{' '}
                            {appointment.barberId.userId.lastName}
                          </p>
                        )}
                      </div>
                      <div className="mt-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${appointment.status === 'completed'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : appointment.status === 'cancelled'
                                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            }`}
                        >
                          {appointment.status}
                        </span>
                        <span
                          className={`ml-2 px-2 py-1 rounded text-xs ${appointment.paymentStatus === 'paid'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                            }`}
                        >
                          {appointment.paymentStatus}
                        </span>
                      </div>
                    </div>
                    {appointment.status !== 'cancelled' &&
                      appointment.status !== 'completed' && (
                        <button
                          onClick={() => handleCancelAppointment(appointment._id)}
                          className="ml-4 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded hover:bg-red-700 dark:hover:bg-red-800 transition"
                        >
                          Cancel
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {user.role === 'customer' && <Chatbot />}
      </div>
    </div>
  );
};

export default Dashboard;


