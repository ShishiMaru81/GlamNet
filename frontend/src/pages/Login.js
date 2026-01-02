import React, { useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaGoogle, FaApple } from 'react-icons/fa';
import ReCAPTCHA from 'react-google-recaptcha';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const LoginContent = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const { login, googleLogin, appleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Verify CAPTCHA if enabled
    if (process.env.REACT_APP_RECAPTCHA_SITE_KEY && !captchaToken) {
      toast.error('Please complete the CAPTCHA verification');
      return;
    }

    setLoading(true);

    const result = await login(email, password, captchaToken);

    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
      // Reset CAPTCHA
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setCaptchaToken(null);
    } else {
      toast.error(result.message || 'Login failed');
      // Reset CAPTCHA on error
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setCaptchaToken(null);
    }

    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const result = await googleLogin(credentialResponse.credential);
      if (result.success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Google login failed');
      }
    } catch (error) {
      toast.error('Google login failed');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login failed');
  };

  const handleAppleLogin = async () => {
    try {
      // Apple Sign-In requires a different approach
      // For web, we'll use a popup or redirect flow
      toast.info('Apple Sign-In is being configured. Please use email/password or Google Sign-In for now.');
    } catch (error) {
      toast.error('Apple login failed');
    }
  };

  const onCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(229, 12, 30, 0.85), rgba(183, 217, 239, 0.75)), url('/login-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* floating accents with warmer tones */}
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
              Welcome back
            </h2>
            <p className="text-sm text-white/80">
              Sign in to manage your bookings and salons
            </p>
            <p className="text-sm text-white/80">
              Or{' '}
              <Link
                to="/register"
                className="font-semibold text-white underline decoration-white/50 hover:decoration-white"
              >
                create a new account
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-4">
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
                    onChange={onChange}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-white/70" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-xl relative block w-full px-12 py-3 bg-white/15 border border-white/25 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent backdrop-blur-sm"
                    placeholder="Password"
                    value={password}
                    onChange={onChange}
                  />
                </div>
              </div>
            </div>

            {/* CAPTCHA */}
            {process.env.REACT_APP_RECAPTCHA_SITE_KEY && (
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                  onChange={onCaptchaChange}
                  theme="dark"
                />
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-slate-900 bg-white/95 shadow-lg shadow-black/10 hover:shadow-black/25 transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-200 disabled:opacity-60"
              >
                <span className="absolute inset-y-0 left-0 w-1 rounded-full bg-gradient-to-b from-teal-400 via-amber-300 to-pink-300 opacity-90 animate-pulse" />
                <span className="pl-2">{loading ? 'Signing in...' : 'Sign in'}</span>
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-white/70">Or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            {process.env.REACT_APP_GOOGLE_CLIENT_ID ? (
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="filled_black"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  logo_alignment="left"
                />
              </div>
            ) : (
              <button
                onClick={() => toast.info('Google Sign-In is not configured. Please set REACT_APP_GOOGLE_CLIENT_ID')}
                className="w-full flex items-center justify-center px-4 py-3 border border-white/30 rounded-xl text-white bg-white/10 hover:bg-white/20 transition transform hover:-translate-y-0.5"
              >
                <FaGoogle className="h-5 w-5 mr-3" />
                <span className="font-semibold">Sign in with Google</span>
              </button>
            )}
            <button
              onClick={handleAppleLogin}
              className="w-full flex items-center justify-center px-4 py-3 border border-white/30 rounded-xl text-white bg-white/10 hover:bg-white/20 transition transform hover:-translate-y-0.5"
            >
              <FaApple className="h-5 w-5 mr-3" />
              <span className="font-semibold">Sign in with Apple</span>
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-white/90 hover:text-white transition underline decoration-white/50 hover:decoration-white"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  if (googleClientId) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        <LoginContent />
      </GoogleOAuthProvider>
    );
  }

  return <LoginContent />;
};

export default Login;


