import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = ({ onSwitchToLogin }) => {
  const { requestOTP, resetPassword } = useAuth();
  const [step, setStep] = useState(1); // 1: Request, 2: Reset
  const [formData, setFormData] = useState({ mobile: '', otp: '', newPassword: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    const result = await requestOTP(formData.mobile);
    if (result.success) {
      setStep(2);
      setMessage('OTP sent! Check server console.');
    } else {
      setError(result.error);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    const result = await resetPassword(formData.mobile, formData.otp, formData.newPassword);
    if (result.success) {
      setMessage('Password reset successful! You can now login.');
      setTimeout(onSwitchToLogin, 2000);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-container animate-fade">
      <div className="auth-card card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#E67E22' }}>Reset Password</h1>
          <p style={{ color: 'var(--text-muted)' }}>Secure OTP verification</p>
        </div>

        {message && <div style={{ color: '#25D366', textAlign: 'center', marginBottom: '1rem' }}>{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP}>
            <div className="form-group">
              <label>Registered Mobile Number</label>
              <input 
                type="tel" 
                value={formData.mobile} 
                onChange={e => setFormData({...formData, mobile: e.target.value})} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Request OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label>Enter 4-Digit OTP</label>
              <input 
                type="text" 
                maxLength="4"
                value={formData.otp} 
                onChange={e => setFormData({...formData, otp: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                value={formData.newPassword} 
                onChange={e => setFormData({...formData, newPassword: e.target.value})} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Reset Password
            </button>
          </form>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <button className="btn-link" onClick={onSwitchToLogin}>Back to Login</button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
