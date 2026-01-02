import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';

const SHIFT_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Full Day'];

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    // Salon account fields
    salonName: '',
    salonAddress: '',
    city: '',
    ownerName: '',
    ownerNationalId: '',
    salonPhoneNumber: '',
    openingTime: '',
    closingTime: '',
    description: '',
    // Salon staff fields
    staffNationalId: '',
    shift: '',
    specialty: '',
    experienceYears: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
    confirmPassword,
    role,
    salonName,
    salonAddress,
    city,
    ownerName,
    ownerNationalId,
    salonPhoneNumber,
    openingTime,
    closingTime,
    description,
    staffNationalId,
    shift,
    specialty,
    experienceYears
  } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Role-specific client validation
    if (role === 'salon_staff') {
      if (!salonName.trim()) {
        toast.error('Salon Name is required for Salon Staff');
        return;
      }

      if (!staffNationalId.trim()) {
        toast.error("Staff's National ID is required");
        return;
      }
    }

    if (role === 'salon') {
      if (!salonName.trim()) {
        toast.error('Salon Name is required');
        return;
      }
      if (!salonAddress.trim()) {
        toast.error('Salon Address is required');
        return;
      }
      if (!city.trim()) {
        toast.error('City is required');
        return;
      }
      if (!ownerName.trim()) {
        toast.error('Owner Name is required');
        return;
      }
      if (!ownerNationalId.trim()) {
        toast.error("Owner's National ID is required");
        return;
      }
      if (!salonPhoneNumber.trim()) {
        toast.error('Salon Phone Number is required');
        return;
      }
      if (!openingTime) {
        toast.error('Opening Time is required');
        return;
      }
      if (!closingTime) {
        toast.error('Closing Time is required');
        return;
      }
      if (!description.trim()) {
        toast.error('Description is required');
        return;
      }
    }

    setLoading(true);

    const result = await register(formData);

    if (result.success) {
      toast.success('Registration successfully done!');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Registration failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 sm:text-sm"
                  placeholder="First Name"
                  value={firstName}
                  onChange={onChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 sm:text-sm"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={onChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 sm:text-sm"
                  placeholder="Email"
                  value={email}
                  onChange={onChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 sm:text-sm"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={onChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={onChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 sm:text-sm"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={onChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <select
                id="role"
                name="role"
                className="mt-1 block w-full px-3 py-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={role}
                onChange={onChange}
              >
                <option value="customer">Customer</option>
                <option value="salon">Saloon</option>
                <option value="salon_staff">Salon Staff</option>
              </select>
            </div>

            {/* Role-specific fields */}
            {role === 'salon' && (
              <>
                <div>
                  <label htmlFor="salonName" className="block text-sm font-medium text-gray-700">
                    Saloon Name
                  </label>
                  <input
                    id="salonName"
                    name="salonName"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter the saloon name"
                    value={salonName}
                    onChange={onChange}
                  />
                </div>
                <div>
                  <label htmlFor="salonAddress" className="block text-sm font-medium text-gray-700">
                    Saloon Address
                  </label>
                  <input
                    id="salonAddress"
                    name="salonAddress"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter the saloon address"
                    value={salonAddress}
                    onChange={onChange}
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter the city"
                    value={city}
                    onChange={onChange}
                  />
                </div>
                <div>
                  <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">
                    Owner Name
                  </label>
                  <input
                    id="ownerName"
                    name="ownerName"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter the owner name"
                    value={ownerName}
                    onChange={onChange}
                  />
                </div>
                <div>
                  <label htmlFor="ownerNationalId" className="block text-sm font-medium text-gray-700">
                    Owner National ID
                  </label>
                  <input
                    id="ownerNationalId"
                    name="ownerNationalId"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter the owner's national ID"
                    value={ownerNationalId}
                    onChange={onChange}
                  />
                </div>
                <div>
                  <label htmlFor="salonPhoneNumber" className="block text-sm font-medium text-gray-700">
                    Saloon Phone Number
                  </label>
                  <input
                    id="salonPhoneNumber"
                    name="salonPhoneNumber"
                    type="tel"
                    required
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter the saloon phone number"
                    value={salonPhoneNumber}
                    onChange={onChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="openingTime" className="block text-sm font-medium text-gray-700">
                      Opening Time
                    </label>
                    <input
                      id="openingTime"
                      name="openingTime"
                      type="time"
                      required
                      className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={openingTime}
                      onChange={onChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="closingTime" className="block text-sm font-medium text-gray-700">
                      Closing Time
                    </label>
                    <input
                      id="closingTime"
                      name="closingTime"
                      type="time"
                      required
                      className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={closingTime}
                      onChange={onChange}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows="3"
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Tell us about your saloon..."
                    value={description}
                    onChange={onChange}
                  />
                </div>
              </>
            )}

            {role === 'salon_staff' && (
              <>
                <div>
                  <label htmlFor="salonName" className="block text-sm font-medium text-gray-700">
                    Saloon Name
                  </label>
                  <input
                    id="salonName"
                    name="salonName"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter the saloon name you work for"
                    value={salonName}
                    onChange={onChange}
                  />
                </div>
                <div>
                  <label htmlFor="staffNationalId" className="block text-sm font-medium text-gray-700">
                    Staff National ID
                  </label>
                  <input
                    id="staffNationalId"
                    name="staffNationalId"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter your national ID"
                    value={staffNationalId}
                    onChange={onChange}
                  />
                </div>
                <div>
                  <label htmlFor="shift" className="block text-sm font-medium text-gray-700">
                    Shift
                  </label>
                  <select
                    id="shift"
                    name="shift"
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={shift}
                    onChange={onChange}
                    required
                  >
                    <option value="">Select shift</option>
                    {SHIFT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;


