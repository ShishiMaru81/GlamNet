import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { FaStar, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const Home = () => {
  const [featuredSalons, setFeaturedSalons] = useState([]);
  const [activeOffers, setActiveOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedContent();
  }, []);

  const fetchFeaturedContent = async () => {
    try {
      const [salonsRes, offersRes] = await Promise.all([
        api.get('/salons/featured'),
        api.get('/offers/active')
      ]);

      setFeaturedSalons(salonsRes.data.data || []);
      setActiveOffers(offersRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load featured content');
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Welcome to GlamNet
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Your Smart Salon Network - Book appointments with ease
            </p>
            <Link
              to="/salons"
              className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Browse Salons
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Salons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Featured Salons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredSalons.map((salon) => (
            <Link
              key={salon._id}
              to={`/salons/${salon._id}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{salon.name}</h3>
                <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                  <FaMapMarkerAlt className="mr-2" />
                  <span>{salon.city}</span>
                </div>
                <div className="flex items-center mb-4">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span className="font-semibold text-gray-900 dark:text-white">{salon.rating}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    ({salon.totalReviews} reviews)
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                  {salon.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Active Offers */}
      {activeOffers.length > 0 && (
        <div className="bg-gray-100 dark:bg-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Special Offers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOffers.map((offer) => (
                <div
                  key={offer._id}
                  className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 border-2 border-primary-500 dark:border-primary-400"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{offer.offerName}</h3>
                    <span className="bg-primary-600 dark:bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {offer.discountPercentage}% OFF
                    </span>
                  </div>
                  {offer.description && (
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{offer.description}</p>
                  )}
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>
                      Valid until:{' '}
                      {new Date(offer.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;


