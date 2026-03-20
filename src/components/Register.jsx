import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Register = ({ onSwitchToLogin }) => {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '', mobile: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await register(formData.username, formData.password, formData.mobile);
    if (!result.success) setError(result.error);
  };

  return (
    <div className="auth-container animate-fade">
      <div className="auth-card card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#E67E22' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)' }}>Join MNT IMS</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={formData.username} 
              onChange={e => setFormData({...formData, username: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Mobile Number (for OTP)</label>
            <input 
              type="tel" 
              value={formData.mobile} 
              onChange={e => setFormData({...formData, mobile: e.target.value})} 
              required 
              placeholder="e.g. 9876543210"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            Already have an account? <button className="btn-link" onClick={onSwitchToLogin}>Login</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
