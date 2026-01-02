import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { FaLock, FaCheckCircle } from 'react-icons/fa';

const ResetPassword = () => {
  const { resettoken } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { password, confirmPassword } = formData;

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

    setLoading(true);

    try {
      const res = await api.put(`/auth/resetpassword/${resettoken}`, { password });
      
      if (res.data.success) {
        setSuccess(true);
        toast.success('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div
        className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden dark:bg-gray-900"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(229, 12, 30, 0.85), rgba(183, 217, 239, 0.75)), url('/login-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative w-full max-w-md">
          <div className="backdrop-blur-2xl bg-white/12 border border-white/20 shadow-2xl rounded-2xl p-8 space-y-8 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shadow-lg">
              <FaCheckCircle className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-white drop-shadow-md">
              Password Reset Successful!
            </h2>
            <p className="text-white/80">
              Your password has been reset successfully. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden dark:bg-gray-900"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(229, 12, 30, 0.85), rgba(183, 217, 239, 0.75)), url('/login-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* floating accents */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute -top-12 -left-12 w-44 h-44 bg-amber-300 rounded-full mix-blend-screen blur-3xl animate-pulse" />
        <div className="absolute bottom-6 right-10 w-56 h-56 bg-teal-300 rounded-full mix-blend-screen blur-3xl animate-pulse" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-2xl bg-white/12 border border-white/20 shadow-2xl rounded-2xl p-8 space-y-8">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-white shadow-lg">
              <FaLock className="h-5 w-5" />
            </div>
            <h2 className="text-3xl font-extrabold text-white drop-shadow-md">
              Reset Password
            </h2>
            <p className="text-sm text-white/80">
              Enter your new password below
            </p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="sr-only">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-white/70" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="appearance-none rounded-xl relative block w-full px-12 py-3 bg-white/15 border border-white/25 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent backdrop-blur-sm"
                    placeholder="New Password"
                    value={password}
                    onChange={onChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-white/70" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="appearance-none rounded-xl relative block w-full px-12 py-3 bg-white/15 border border-white/25 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent backdrop-blur-sm"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={onChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-slate-900 bg-white/95 shadow-lg shadow-black/10 hover:shadow-black/25 transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-200 disabled:opacity-60"
              >
                <span className="absolute inset-y-0 left-0 w-1 rounded-full bg-gradient-to-b from-teal-400 via-amber-300 to-pink-300 opacity-90 animate-pulse" />
                <span className="pl-2">{loading ? 'Resetting...' : 'Reset Password'}</span>
              </button>
            </div>
          </form>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-white/90 hover:text-white transition"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

