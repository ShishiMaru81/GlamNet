import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { FaStar } from 'react-icons/fa';

const Reviews = () => {
  const { salonId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    reviewText: '',
    appointmentId: ''
  });
  const [userAppointments, setUserAppointments] = useState([]);

  useEffect(() => {
    fetchReviews();
    if (user) {
      fetchUserAppointments();
    }
  }, [salonId, user]);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/salon/${salonId}`);
      setReviews(res.data.data || []);
      
      // Get salon info from first review or fetch separately
      if (res.data.data.length > 0 && res.data.data[0].salonId) {
        setSalon(res.data.data[0].salonId);
      }
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      const completedAppointments = (res.data.data || []).filter(
        apt => apt.status === 'completed' && apt.salonId?._id === salonId
      );
      setUserAppointments(completedAppointments);
    } catch (error) {
      console.error('Failed to fetch appointments');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!formData.appointmentId) {
      toast.error('Please select an appointment');
      return;
    }

    try {
      await api.post('/reviews', {
        salonId,
        appointmentId: formData.appointmentId,
        rating: formData.rating,
        reviewText: formData.reviewText
      });
      toast.success('Review submitted successfully!');
      setShowForm(false);
      setFormData({ rating: 5, reviewText: '', appointmentId: '' });
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Reviews</h1>

        {/* Add Review Button */}
        {user && userAppointments.length > 0 && !showForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary-600 dark:bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition"
            >
              Write a Review
            </button>
          </div>
        )}

        {/* Review Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 transition-colors duration-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Write a Review</h2>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Appointment
                </label>
                <select
                  value={formData.appointmentId}
                  onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400"
                >
                  <option value="">Choose an appointment</option>
                  {userAppointments.map((apt) => (
                    <option key={apt._id} value={apt._id}>
                      {apt.serviceId?.name} - {new Date(apt.appointmentDateTime).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating })}
                      className={`text-2xl ${
                        rating <= formData.rating
                          ? 'text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    >
                      <FaStar />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Review
                </label>
                <textarea
                  value={formData.reviewText}
                  onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                  required
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400"
                  placeholder="Share your experience..."
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-primary-600 dark:bg-primary-500 text-white px-6 py-2 rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ rating: 5, reviewText: '', appointmentId: '' });
                  }}
                  className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center transition-colors duration-200">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No reviews yet</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {review.customerId?.userId?.firstName}{' '}
                      {review.customerId?.userId?.lastName}
                    </h3>
                    <div className="flex items-center mt-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <FaStar
                          key={rating}
                          className={
                            rating <= review.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{review.reviewText}</p>
                {review.sentimentLabel && (
                  <div className="mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        review.sentimentLabel === 'positive'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : review.sentimentLabel === 'negative'
                          ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {review.sentimentLabel}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;


