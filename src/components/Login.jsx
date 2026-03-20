import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = ({ onSwitchToRegister, onSwitchToForgot }) => {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(username, password);
    if (!result.success) setError(result.error);
  };

  return (
    <div className="auth-container animate-fade">
      <div className="auth-card card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '3rem' }}>🥣</span>
          <h1 style={{ marginTop: '1rem', color: '#E67E22' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)' }}>Login to MNT IMS</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              placeholder="Enter your username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <p>
            <button className="btn-link" onClick={onSwitchToForgot}>Forgot Password?</button>
          </p>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
            Don't have an account? <button className="btn-link" onClick={onSwitchToRegister}>Create Account</button>
          </p>
        </div>
      </div>

      <style>{`
        .auth-container {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #0f172a;
          background-image: radial-gradient(circle at top right, rgba(230, 126, 34, 0.1), transparent),
                            radial-gradient(circle at bottom left, rgba(15, 23, 42, 0.1), transparent);
        }
        .auth-card {
          width: 400px;
          padding: 3rem !important;
        }
        .btn-link {
          background: none;
          border: none;
          color: var(--accent);
          cursor: pointer;
          font-weight: 600;
          padding: 0;
        }
        .btn-link:hover { text-decoration: underline; }
        .alert-danger {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default Login;
