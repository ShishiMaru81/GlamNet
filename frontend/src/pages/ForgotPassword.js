import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/auth/forgotpassword', { email });
      
      if (res.data.success) {
        setEmailSent(true);
        toast.success('Password reset email sent! Please check your inbox.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    }

    setLoading(false);
  };

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
              <FaEnvelope className="h-5 w-5" />
            </div>
            <h2 className="text-3xl font-extrabold text-white drop-shadow-md">
              Forgot Password?
            </h2>
            <p className="text-sm text-white/80">
              {emailSent
                ? 'We\'ve sent a password reset link to your email address.'
                : 'Enter your email address and we\'ll send you a link to reset your password.'}
            </p>
          </div>

          {!emailSent ? (
            <form className="space-y-6" onSubmit={onSubmit}>
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-white/70" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-xl relative block w-full px-12 py-3 bg-white/15 border border-white/25 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent backdrop-blur-sm"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-slate-900 bg-white/95 shadow-lg shadow-black/10 hover:shadow-black/25 transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-200 disabled:opacity-60"
                >
                  <span className="absolute inset-y-0 left-0 w-1 rounded-full bg-gradient-to-b from-teal-400 via-amber-300 to-pink-300 opacity-90 animate-pulse" />
                  <span className="pl-2">{loading ? 'Sending...' : 'Send Reset Link'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-white/90 mb-4">
                  Please check your email inbox and click on the reset link to create a new password.
                </p>
                <p className="text-sm text-white/70">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>
              <button
                onClick={() => setEmailSent(false)}
                className="w-full py-3 px-4 border border-white/30 text-sm font-semibold rounded-xl text-white bg-white/10 hover:bg-white/20 transition"
              >
                Try Again
              </button>
            </div>
          )}

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-white/90 hover:text-white transition"
            >
              <FaArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

