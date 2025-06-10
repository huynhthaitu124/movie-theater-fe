import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
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

  // Demo credentials
  const demoCredentials = [
    { role: 'Admin', email: 'admin@cinema.com', password: 'admin123' },
    { role: 'Staff', email: 'staff@cinema.com', password: 'staff123' },
    { role: 'User', email: 'user@cinema.com', password: 'user123' },
  ];

  const setDemoUser = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-64px)] bg-secondary-50 dark:bg-secondary-900">
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900 dark:text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-secondary-600 dark:text-secondary-300">
              Or{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                create a new account
              </Link>
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white dark:bg-secondary-800 py-8 px-4 shadow-card sm:rounded-lg sm:px-10">
              {error && (
                <div className="mb-4 bg-accent-100 dark:bg-accent-900 border border-accent-200 dark:border-accent-800 text-accent-800 dark:text-accent-200 px-4 py-3 rounded-md">
                  <p>{error}</p>
                </div>
              )}
              
              {success && (
                <div className="mb-4 bg-success-100 dark:bg-success-900 border border-success-200 dark:border-success-800 text-success-800 dark:text-success-200 px-4 py-3 rounded-md">
                  <p>{success}</p>
                </div>
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
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <label htmlFor="remember_me" className="ml-2 block text-sm text-secondary-700 dark:text-secondary-300">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                      Forgot your password?
                    </a>
                  </div>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  isLoading={isLoading}
                  leftIcon={<LogIn size={20} />}
                >
                  Sign in
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-secondary-300 dark:border-secondary-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-secondary-800 text-secondary-500 dark:text-secondary-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    onClick={() => handleGoogleLogin()}
                  >
                    <img src="https://developers.google.com/identity/images/g-logo.png" 
                         alt="Google" 
                         className="w-6 h-6 mr-2" />
                    Sign in with Google
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-secondary-300 dark:border-secondary-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-secondary-800 text-secondary-500 dark:text-secondary-400">
                      Demo accounts
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  {demoCredentials.map((cred, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setDemoUser(cred.email, cred.password)}
                      className="py-2 px-4 text-sm font-medium rounded-md border border-secondary-300 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 bg-white dark:bg-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-700"
                    >
                      Use {cred.role} account
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;