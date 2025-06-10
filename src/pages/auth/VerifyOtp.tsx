import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Lock, AlertCircle } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Layout from '../../components/layout/Layout';
import authService from '../../services/modules/auth.service';

const VerifyOtp: React.FC = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Email not found. Please try registering again.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            await authService.verifyOtp({ 
                email, 
                verifyOtp: otp 
            });
            
            // Navigate to complete registration form
            navigate('/complete-register', { 
                state: { email } 
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to verify OTP');
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <Layout>
                <div className="flex min-h-[calc(100vh-64px)] bg-secondary-50 dark:bg-secondary-900">
                    <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
                        <div className="max-w-md w-full space-y-8 mx-auto">
                            <div className="text-center">
                                <AlertCircle className="mx-auto h-12 w-12 text-accent-500" />
                                <h2 className="mt-6 text-3xl font-extrabold text-secondary-900 dark:text-white">
                                    Error
                                </h2>
                                <p className="mt-2 text-sm text-accent-600 dark:text-accent-400">
                                    Email not found. Please try registering again.
                                </p>
                                <Button
                                    onClick={() => navigate('/register')}
                                    className="mt-4"
                                >
                                    Back to Register
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex min-h-[calc(100vh-64px)] bg-secondary-50 dark:bg-secondary-900">
                <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-md">
                        <div className="text-center">
                            <CheckCircle2 className="mx-auto h-12 w-12 text-primary-500" />
                            <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900 dark:text-white">
                                Verify Your Email
                            </h2>
                            <p className="mt-2 text-center text-sm text-secondary-600 dark:text-secondary-400">
                                Enter the OTP sent to {email}
                            </p>
                        </div>
                        
                        <div className="mt-8 bg-white dark:bg-secondary-800 py-8 px-4 shadow-card sm:rounded-lg sm:px-10">
                            {error && (
                                <div className="mb-4 bg-accent-100 dark:bg-accent-900 border border-accent-200 dark:border-accent-800 text-accent-800 dark:text-accent-200 px-4 py-3 rounded-md">
                                    <p>{error}</p>
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={handleVerifyOtp}>
                                <Input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    label="Verification Code"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter your OTP"
                                    leftIcon={<Lock size={20} className="text-secondary-400" />}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    isLoading={loading}
                                >
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </Button>
                            </form>

                            <div className="mt-6 flex items-center justify-center">
                                <button 
                                    onClick={async () => {
                                        try {
                                            setLoading(true);
                                            await authService.sendOtpRegister({ email });
                                            setError('New OTP code has been sent to your email');
                                        } catch (err: any) {
                                            setError(err.response?.data?.message || 'Failed to resend OTP');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                    className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                                >
                                    Resend verification code
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default VerifyOtp;
