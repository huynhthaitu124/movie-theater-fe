import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    }
  };

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-64px)] bg-secondary-50 dark:bg-secondary-900">
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900 dark:text-white">
              Create a new account
            </h2>
            <p className="mt-2 text-center text-sm text-secondary-600 dark:text-secondary-300">
              Or{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                sign in to your existing account
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

              <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  label="Full name"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<UserIcon size={20} className="text-secondary-400" />}
                />
                
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock size={20} className="text-secondary-400" />}
                />

                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  label="Confirm password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock size={20} className="text-secondary-400" />}
                />

                <div className="flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-secondary-700 dark:text-secondary-300">
                    I agree to the{' '}
                    <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  isLoading={isLoading}
                  leftIcon={<UserPlus size={20} />}
                >
                  Create account
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;