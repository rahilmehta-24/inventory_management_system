import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Account = () => {
  const { user, updateProfile, loading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    address: user?.address || '',
    mobile: user?.mobile || ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    const result = await updateProfile(formData);
    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
    }
  };

  return (
    <div className="animate-fade">
      <div className="header">
        <h1>Account Settings</h1>
        <p>Update your business information for invoices</p>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>
          {message.text && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '1.5rem' }}>
              {message.text}
            </div>
          )}

          <div className="form-group">
            <label>Full Name / Business Name</label>
            <input 
              type="text" 
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. MNT Solutions"
              required
            />
          </div>

          <div className="form-group">
            <label>Contact Number</label>
            <input 
              type="text" 
              value={formData.mobile}
              onChange={e => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="e.g. +91 9876543210"
              required
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea 
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter complete business address"
              rows="4"
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Updating...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <style>{`
        .alert-success {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          padding: 0.75rem;
          border-radius: 4px;
          text-align: center;
        }
        .alert-danger {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 0.75rem;
          border-radius: 4px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default Account;
