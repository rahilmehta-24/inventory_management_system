import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';

const Inventory = () => {
  const { 
    rawMaterials, products, addRawMaterial, updateRawMaterial, deleteRawMaterial,
    addProduct, updateProduct, deleteProduct, updateRawMaterialStock, bulkInsert, loading 
  } = useInventory();
  
  const [activeSubTab, setActiveSubTab] = useState('raw');
  const [showForm, setShowForm] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  if (loading) return <div className="animate-fade" style={{ padding: '2rem' }}>Loading inventory...</div>;

  // Form State
  const [formData, setFormData] = useState({
    name: '', unit: '', quantity: 0, minQuantity: 0, costPerUnit: 0, 
    sellingPrice: 0, productionCost: 0, stock: 0, size: '', weight: ''
  });

  const [bulkData, setBulkData] = useState('');

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      type === 'raw' ? deleteRawMaterial(id) : deleteProduct(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeSubTab === 'raw') {
      const data = { 
        name: formData.name, unit: formData.unit, 
        quantity: Number(formData.quantity), minQuantity: Number(formData.minQuantity), 
        costPerUnit: Number(formData.costPerUnit) 
      };
      editingItem ? updateRawMaterial(editingItem.id, data) : addRawMaterial(data);
    } else {
      const data = { 
        name: formData.name, unit: formData.unit, 
        stock: Number(formData.stock), sellingPrice: Number(formData.sellingPrice), 
        productionCost: Number(formData.productionCost),
        size: formData.size, weight: formData.weight
      };
      editingItem ? updateProduct(editingItem.id, data) : addProduct(data);
    }
    setShowForm(false);
    setEditingItem(null);
    setFormData({ name: '', unit: '', quantity: 0, minQuantity: 0, costPerUnit: 0, sellingPrice: 0, productionCost: 0, stock: 0, size: '', weight: '' });
  };

  const handleBulkSubmit = async () => {
    // Basic CSV/TSV parser (Name, Unit, Qty/Stock, Cost/Price, [Size, Weight])
    const rows = bulkData.split('\n').filter(row => row.trim());
    const items = rows.map(row => {
      const cols = row.split(',').map(c => c.trim());
      if (activeSubTab === 'raw') {
        return { name: cols[0], unit: cols[1], quantity: Number(cols[2]), costPerUnit: Number(cols[3]), minQuantity: Number(cols[4] || 10) };
      } else {
        return { name: cols[0], sellingPrice: Number(cols[1]), productionCost: Number(cols[2]), stock: Number(cols[3]), unit: cols[4] || 'pkts', size: cols[5], weight: cols[6] };
      }
    });

    const result = await bulkInsert(activeSubTab, items);
    if (result.success) {
      setShowBulkModal(false);
      setBulkData('');
      alert('Bulk insert successful!');
    } else {
      alert('Error: ' + result.error);
    }
  };

  const lowStockItems = rawMaterials.filter(item => item.quantity <= item.minQuantity);

  return (
    <div className="animate-fade">
      <header className="header">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1>Inventory Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage raw stock purchases and finished inventory</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="tab-switcher" style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '0.4rem', borderRadius: '12px' }}>
            <button 
              className={`tab-btn ${activeSubTab === 'raw' ? 'active' : ''}`}
              onClick={() => { setActiveSubTab('raw'); setShowForm(false); }}
            >
              Stock Bought (Raw)
            </button>
            <button 
              className={`tab-btn ${activeSubTab === 'products' ? 'active' : ''}`}
              onClick={() => { setActiveSubTab('products'); setShowForm(false); }}
            >
              Stock in Inventory (Finished)
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : `+ Add ${activeSubTab === 'raw' ? 'Material' : 'Product'}`}
          </button>
          <button className="btn" style={{ background: 'rgba(37, 211, 102, 0.1)', color: '#25D366' }} onClick={() => setShowBulkModal(true)}>
            Bulk Add
          </button>
        </div>
      </header>

      {lowStockItems.length > 0 && activeSubTab === 'raw' && (
        <div className="card animate-fade" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚠️ Low Stock Alert ({lowStockItems.length} items)
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            {lowStockItems.map(item => (
              <div key={item.id} className="badge badge-danger">
                {item.name}: {item.quantity} {item.unit} left
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="card animate-fade" style={{ marginBottom: '2rem' }}>
          <h3>{editingItem ? 'Edit' : 'Add New'} {activeSubTab === 'raw' ? 'Material' : 'Product'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label>Name</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Unit (kg, liters, pkts)</label>
              <input value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} required />
            </div>
            {activeSubTab === 'raw' ? (
              <>
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Min Quantity (Alert)</label>
                  <input type="number" value={formData.minQuantity} onChange={e => setFormData({...formData, minQuantity: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Cost per Unit (₹)</label>
                  <input type="number" value={formData.costPerUnit} onChange={e => setFormData({...formData, costPerUnit: e.target.value})} />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Size (e.g. Small, Medium)</label>
                  <input value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} placeholder="e.g. Medium" />
                </div>
                <div className="form-group">
                  <label>Weight (e.g. 500g, 1kg)</label>
                  <input value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="e.g. 500g" />
                </div>
                <div className="form-group">
                  <label>Initial Stock</label>
                  <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Selling Price (₹)</label>
                  <input type="number" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Production Cost (₹)</label>
                  <input type="number" value={formData.productionCost} onChange={e => setFormData({...formData, productionCost: e.target.value})} />
                </div>
              </>
            )}
            <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              {editingItem ? 'Update' : 'Save'} {activeSubTab === 'raw' ? 'Material' : 'Product'}
            </button>
          </form>
        </div>
      )}

      {activeSubTab === 'raw' ? (
        <div className="table-container card">
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Cost/Unit</th>
                <th>Total Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rawMaterials.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td style={{ fontWeight: 600, color: item.quantity <= item.minQuantity ? 'var(--danger)' : 'var(--accent)' }}>
                    {item.quantity}
                  </td>
                  <td>{item.unit}</td>
                  <td>₹{item.costPerUnit}</td>
                  <td>₹{(item.quantity * item.costPerUnit).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-sm" onClick={() => handleEdit(item)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id, 'raw')}>Delete</button>
                      <button className="btn btn-sm btn-ghost" onClick={() => updateRawMaterialStock(item.id, 10)}>+10</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-container card">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Size/Weight</th>
                <th>Available Stock</th>
                <th>Selling Price</th>
                <th>Production Cost</th>
                <th>Profit/Unit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td style={{ fontWeight: 600 }}>{product.name}</td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      {product.size} {product.weight ? `(${product.weight})` : ''}
                    </span>
                  </td>
                  <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{product.stock} {product.unit}</td>
                  <td>₹{product.sellingPrice}</td>
                  <td>₹{product.productionCost}</td>
                  <td style={{ color: '#25D366', fontWeight: 600 }}>
                    ₹{product.sellingPrice - product.productionCost}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-sm" onClick={() => handleEdit(product)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(product.id, 'product')}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showBulkModal && (
        <div className="modal-overlay animate-fade">
          <div className="modal card" style={{ maxWidth: '600px', width: '100%' }}>
            <h2>Bulk Add {activeSubTab === 'raw' ? 'Materials' : 'Products'}</h2>
            <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
              Paste comma-separated data. Format:<br/>
              {activeSubTab === 'raw' 
                ? 'Name, Unit, Qty, CostPerUnit, [MinQty]' 
                : 'Name, Price, Cost, Stock, Unit, Size, Weight'}
            </p>
            <textarea 
              style={{ width: '100%', height: '200px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace' }}
              placeholder={activeSubTab === 'raw' ? 'Sugar, kg, 50, 40, 10\nFlour, kg, 100, 35, 20' : 'Masala Sev, 60, 45, 100, pkts, Small, 200g'}
              value={bulkData}
              onChange={e => setBulkData(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleBulkSubmit}>Insert Items</button>
              <button className="btn" style={{ flex: 1 }} onClick={() => setShowBulkModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .tab-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .tab-btn.active {
          background: var(--accent);
          color: white;
          box-shadow: 0 4px 15px rgba(230, 126, 34, 0.3);
        }
        .btn-sm { padding: 0.3rem 0.6rem; font-size: 0.8rem; }
        .btn-danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
        .btn-ghost { background: rgba(255,255,255,0.05); }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
      `}</style>
    </div>
  );
};

export default Inventory;
