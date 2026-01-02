import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { FaStar, FaMapMarkerAlt, FaClock, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const SalonDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [offers, setOffers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalonDetails();
  }, [id]);

  const fetchSalonDetails = async () => {
    try {
      const res = await api.get(`/salons/${id}`);
      setSalon(res.data.data.salon);
      setServices(res.data.data.services || []);
      setOffers(res.data.data.offers || []);
      setReviews(res.data.data.reviews || []);
    } catch (error) {
      toast.error('Failed to load salon details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = () => {
    if (!user) {
      toast.error('Please login to book an appointment');
      navigate('/login');
      return;
    }
    navigate(`/booking/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Salon not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Salon Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8 transition-colors duration-200">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{salon.name}</h1>
          <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
            <FaMapMarkerAlt className="mr-2" />
            <span>{salon.address}, {salon.city}</span>
          </div>
          <div className="flex items-center mb-4">
            <FaStar className="text-yellow-400 mr-1" />
            <span className="font-semibold text-gray-900 dark:text-white">{salon.rating}</span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">
              ({salon.totalReviews} reviews)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <FaClock className="mr-2" />
              <span>{salon.openingTime} - {salon.closingTime}</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <FaPhone className="mr-2" />
              <span>{salon.phone}</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <FaEnvelope className="mr-2" />
              <span>{salon.email}</span>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{salon.description}</p>
          <button
            onClick={handleBookAppointment}
            className="bg-primary-600 dark:bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition"
          >
            Book Appointment
          </button>
        </div>

        {/* Services */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8 transition-colors duration-200">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No services available</p>
            ) : (
              services.map((service) => (
                <div key={service._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-700">
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">{service.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary-600 dark:text-primary-400 font-bold">TK {service.price}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{service.duration} min</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Offers */}
        {offers.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8 transition-colors duration-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Special Offers</h2>
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
          </div>
        )}

        {/* Reviews */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 transition-colors duration-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reviews</h2>
            <Link
              to={`/reviews/${id}`}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              View All Reviews
            </Link>
          </div>
          {reviews.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center mr-4">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {review.customerId?.userId?.firstName} {review.customerId?.userId?.lastName}
                    </span>
                    <span className="text-sm text-gray-400 dark:text-gray-500 ml-auto">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{review.reviewText}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalonDetail;


