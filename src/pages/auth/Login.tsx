import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { login, loginWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path and success message from location state
  const from = (location.state as { from?: string })?.from || '/';
  const message = (location.state as { message?: string })?.message;

  // Set success message from location state
  React.useEffect(() => {
    if (message) {
      setSuccess(message);
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
        try {

          await loginWithGoogle(tokenResponse.access_token);
          navigate(from, { replace: true });
        } catch (err) {
            setError('Failed to login with Google');
        }
    },
    onError: () => {
        setError('Google login failed');
    },
    scope: import.meta.env.VITE_GOOGLE_SCOPES
});

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-64px)] bg-gradient-to-br from-secondary-50 via-white to-primary-50 dark:from-secondary-900 dark:via-secondary-800 dark:to-primary-900">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8"
        >
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-center text-4xl font-bold text-secondary-900 dark:text-white"
            >
              Welcome Back
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-center text-sm text-secondary-600 dark:text-secondary-300"
            >
              New to our platform?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors">
                Create an account
              </Link>
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
          >
            <div className="bg-white/90 dark:bg-secondary-800/90 py-8 px-4 shadow-xl shadow-secondary-200/20 dark:shadow-secondary-900/30 sm:rounded-2xl sm:px-10 backdrop-blur-md">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 bg-accent-100 dark:bg-accent-900/50 border border-accent-200 dark:border-accent-800 text-accent-800 dark:text-accent-200 px-4 py-3 rounded-lg flex items-center gap-2"
                >
                  <AlertCircle size={20} />
                  <p>{error}</p>
                </motion.div>
              )}
              
              {success && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 bg-success-100 dark:bg-success-900/50 border border-success-200 dark:border-success-800 text-success-800 dark:text-success-200 px-4 py-3 rounded-lg flex items-center gap-2"
                >
                  <CheckCircle size={20} />
                  <p>{success}</p>
                </motion.div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  label="Email address"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail size={20} className="text-secondary-400" />}
                />

                <Input
                  id="password"
                  name="password"
                  type="password"
                  label="Password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock size={20} className="text-secondary-400" />}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember_me"
                      name="remember_me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded transition-colors cursor-pointer"
                    />
                    <label htmlFor="remember_me" className="ml-2 block text-sm text-secondary-700 dark:text-secondary-300 cursor-pointer hover:text-secondary-900 dark:hover:text-secondary-100 transition-colors">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link 
                      to="/forgot-password" 
                      className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 hover:underline transition-all"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    type="submit"
                    fullWidth
                    isLoading={isLoading}
                    leftIcon={<LogIn size={20} />}
                    className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-primary-600/20 dark:shadow-primary-900/30 transition-all duration-300"
                  >
                    Sign in
                  </Button>
                </motion.div>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-secondary-200 dark:border-secondary-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-secondary-800 text-secondary-500 dark:text-secondary-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button
                      type="button"
                      variant="secondary"
                      fullWidth
                      onClick={() => handleGoogleLogin()}
                      className="bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white border border-secondary-200 dark:border-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-600 font-medium py-2.5 rounded-xl shadow-lg shadow-secondary-200/20 dark:shadow-secondary-900/30 transition-all duration-300"
                    >
                      <img 
                        src="https://developers.google.com/identity/images/g-logo.png" 
                        alt="Google" 
                        className="w-5 h-5 mr-2"
                      />
                      Sign in with Google
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Login;