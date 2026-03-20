import React, { useState } from 'react'
import { InventoryProvider } from './context/InventoryContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Inventory from './components/Inventory'
import Financials from './components/Financials'
import Account from './components/Account'
import Login from './components/Login'
import Register from './components/Register'
import ForgotPassword from './components/ForgotPassword'
import './index.css'

function AppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authState, setAuthState] = useState('login'); // login, register, forgot

  if (!user) {
    if (authState === 'register') return <Register onSwitchToLogin={() => setAuthState('login')} />;
    if (authState === 'forgot') return <ForgotPassword onSwitchToLogin={() => setAuthState('login')} />;
    return (
      <Login 
        onSwitchToRegister={() => setAuthState('register')} 
        onSwitchToForgot={() => setAuthState('forgot')} 
      />
    );
  }

  return (
    <InventoryProvider>
      <div className="app-container">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="main-content">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'inventory' && <Inventory />}
          {activeTab === 'invoicing' && <Financials />}
          {activeTab === 'account' && <Account />}
        </main>
      </div>
    </InventoryProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
