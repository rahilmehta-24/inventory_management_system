import React from 'react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="sidebar">
      <div className="logo">
        <span style={{ fontSize: '2rem' }}>🥣</span>
        <span>MNT IMS</span>
      </div>
      
      <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Logged in as:</p>
        <p style={{ fontWeight: 600, color: 'var(--accent)' }}>@{user?.username}</p>
      </div>

      <div className="nav-links">
        <div 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </div>
        <div 
          className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
        </div>
        <div 
          className={`nav-item ${activeTab === 'invoicing' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoicing')}
        >
          Generate Invoice
        </div>
        <div 
          className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          Account
        </div>
      </div>
      
      <div style={{ marginTop: 'auto' }}>
        <button 
          onClick={logout}
          style={{ 
            width: '100%', 
            padding: '1rem', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: 'none', 
            borderRadius: '12px',
            color: '#ef4444',
            cursor: 'pointer',
            fontWeight: 600,
            marginBottom: '1rem'
          }}
        >
          Logout
        </button>
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '15px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>v1.0.0 Stable</p>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
