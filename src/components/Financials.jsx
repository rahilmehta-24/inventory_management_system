import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import Invoice from './Invoice';

const Financials = () => {
  const { invoices, recordSale, products, getFilteredMetrics, loading } = useInventory();
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mobileNumber, setMobileNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [activeInvoice, setActiveInvoice] = useState(null);

  if (loading) return <div className="animate-fade" style={{ padding: '2rem' }}>Loading invoices...</div>;

  const metrics = getFilteredMetrics('month');

  const addToCart = () => {
    if (!selectedProduct) return;
    const product = products.find(p => p.id === Number(selectedProduct));
    if (!product) return;
    
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + Number(quantity), revenue: (item.quantity + Number(quantity)) * item.pricePerUnit }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: Number(quantity),
        pricePerUnit: product.sellingPrice,
        revenue: product.sellingPrice * Number(quantity),
        profit: (product.sellingPrice - product.productionCost) * Number(quantity)
      }]);
    }
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert('Please add items to the invoice');

    const totalRevenue = cart.reduce((acc, item) => acc + item.revenue, 0);
    const totalProfit = cart.reduce((acc, item) => acc + item.profit, 0);
    
    const invoiceData = {
      items: cart,
      customerName,
      customerMobile: mobileNumber,
      customerAddress,
      totalRevenue,
      totalProfit,
      date: new Date().toISOString()
    };

    const invoiceId = await recordSale(invoiceData);
    if (invoiceId) {
      setActiveInvoice({ ...invoiceData, id: invoiceId });
      setCart([]);
      setMobileNumber('');
      setCustomerName('');
      setCustomerAddress('');
    }
  };

  return (
    <div className="animate-fade">
      <header className="header">
        <h1>Invoice Management</h1>
        <div className="card" style={{ padding: '0.5rem 1.5rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Month Profit: </span>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>₹{metrics.profit}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Month Revenue: </span>
            <span style={{ color: 'white', fontWeight: 700 }}>₹{metrics.revenue}</span>
          </div>
        </div>
      </header>

      {activeInvoice && <Invoice sale={activeInvoice} onClose={() => setActiveInvoice(null)} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>1. Add Items</h3>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Select Product</label>
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                <option value="">Select Product</option>
                {products.filter(p => p.stock > 0).map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Quantity</label>
                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
              <button type="button" className="btn btn-primary" onClick={addToCart}>Add to List</button>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>2. Customer Details</h3>
            <div className="form-group">
              <label>Customer Name</label>
              <input type="text" placeholder="Full Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Mobile (WhatsApp)</label>
              <input type="tel" placeholder="Mobile Number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Shipping Address</label>
              <textarea 
                value={customerAddress} 
                onChange={(e) => setCustomerAddress(e.target.value)}
                style={{ width: '100%', minHeight: '60px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.8rem', borderRadius: '8px' }}
              />
            </div>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1rem', background: '#25D366' }}
              onClick={handleFinalSubmit}
            >
              Confirm Sale & Generate Invoice
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ minHeight: '200px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Current Items ({cart.length})</h3>
            {cart.length > 0 ? (
              <table style={{ fontSize: '0.9rem' }}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, i) => (
                    <tr key={i}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.pricePerUnit}</td>
                      <td>₹{item.revenue}</td>
                      <td><button onClick={() => removeFromCart(i)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button></td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid var(--glass-border)', fontWeight: 700 }}>
                    <td colSpan="3">Grand Total</td>
                    <td colSpan="2">₹{cart.reduce((acc, item) => acc + item.revenue, 0)}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No items added yet</div>
            )}
          </div>

          <div className="table-container card">
            <h3 style={{ padding: '1rem' }}>Recent Invoices</h3>
            <table>
              <thead>
                <tr>
                  <th>Inv #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 5).map((inv, index) => (
                  <tr key={inv.id || index}>
                    <td>#{inv.id ? inv.id.toString().slice(-4) : '---'}</td>
                    <td>{inv.customerName || 'Walking Customer'}</td>
                    <td>{new Date(inv.date).toLocaleDateString()}</td>
                    <td>₹{inv.totalRevenue}</td>
                    <td>
                      <button className="btn btn-sm" onClick={() => setActiveInvoice(inv)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Financials;
