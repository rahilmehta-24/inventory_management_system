import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';

const Dashboard = () => {
  const { getFilteredMetrics, loading } = useInventory();
  const [period, setPeriod] = useState('month');

  const metrics = useMemo(() => getFilteredMetrics(period), [period, getFilteredMetrics, loading]);

  if (loading) return <div className="animate-fade" style={{ padding: '2rem' }}>Loading analytics...</div>;

  return (
    <div className="animate-fade">
      <header className="header">
        <h1>Analytics Overview</h1>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface)', padding: '0.4rem', borderRadius: '12px' }}>
          <button 
            className={`btn ${period === 'today' ? 'btn-primary' : ''}`}
            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
            onClick={() => setPeriod('today')}
          >
            Today
          </button>
          <button 
            className={`btn ${period === 'week' ? 'btn-primary' : ''}`}
            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
            onClick={() => setPeriod('week')}
          >
            This Week
          </button>
          <button 
            className={`btn ${period === 'month' ? 'btn-primary' : ''}`}
            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
            onClick={() => setPeriod('month')}
          >
            This Month
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="card">
          <div className="card-title">Revenue ({period.toUpperCase()})</div>
          <div className="card-value">₹{metrics.revenue.toLocaleString()}</div>
          <div style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Total Sales: {metrics.count}</div>
        </div>
        <div className="card">
          <div className="card-title">Net Profit</div>
          <div className="card-value" style={{ color: 'var(--accent)' }}>₹{metrics.profit.toLocaleString()}</div>
          <div style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Margin: {metrics.revenue > 0 ? ((metrics.profit / metrics.revenue) * 100).toFixed(1) : 0}%</div>
        </div>
        <div className="card">
          <div className="card-title">Avg Order Value</div>
          <div className="card-value">₹{metrics.avgOrder.toFixed(0)}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Per transaction</div>
        </div>
        <div className="card">
          <div className="card-title">Top Product</div>
          <div className="card-value" style={{ fontSize: '1.2rem' }}>{metrics.topProduct}</div>
          <div style={{ color: 'var(--primary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Best Seller</div>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        <div className="card">
          <h3>Inventory Performance</h3>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--text-muted)' }}>Total Stock Value</p>
              <h2 style={{ color: 'var(--primary)', marginTop: '0.5rem' }}>₹{metrics.totalInventoryValue.toLocaleString()}</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: 'var(--text-muted)' }}>Active Alerts</p>
              <h2 style={{ color: metrics.lowStockItems.length > 0 ? 'var(--danger)' : 'var(--accent)', marginTop: '0.5rem' }}>{metrics.lowStockItems.length}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
