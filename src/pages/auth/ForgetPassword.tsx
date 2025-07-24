import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/modules/auth.service';

const ForgetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await authService.sendResetPasswordOtp(email);
      if ((res && res.success) || res.status === 200) {
        setOtpSent(true);
        setStep(2);
        setMessage('OTP sent to your email. Please check your inbox.');
      } else {
        setError(res?.message || 'Failed to send OTP.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    if (!otp) {
      setError('Please enter the OTP sent to your email.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
    setError('Password must be at least 6 characters.');
    setLoading(false);
    return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    try {
      const res = await authService.changePassword({
        email,
        password,
        confirmPassword,
      });
      if ((res && res.success) || res.status === 200) {
        setMessage('Password changed successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(res?.message || 'Failed to change password.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-secondary-900 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Forgot Password</h2>
        {message && <div className="mb-4 text-green-400 text-center">{message}</div>}
        {error && <div className="mb-4 text-red-400 text-center">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-secondary-200 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded-lg bg-secondary-800 text-white border border-secondary-700 focus:outline-none"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold transition"
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-secondary-200 mb-1">OTP</label>
              <input
                name="otp"
                type="text"
                className="w-full px-4 py-2 rounded-lg bg-secondary-800 text-white border border-secondary-700 focus:outline-none"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-secondary-200 mb-1">New Password</label>
              <input
                name="newPassword"
                type="password"
                className="w-full px-4 py-2 rounded-lg bg-secondary-800 text-white border border-secondary-700 focus:outline-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-secondary-200 mb-1">Confirm New Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 rounded-lg bg-secondary-800 text-white border border-secondary-700 focus:outline-none"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold transition"
              disabled={loading}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;