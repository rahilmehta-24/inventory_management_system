import React, { createContext, useContext, useState, useEffect } from 'react';

const InventoryContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rawRes, prodRes, salesRes, invRes] = await Promise.all([
          fetch(`${API_URL}/raw-materials`),
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/sales`),
          fetch(`${API_URL}/invoices`)
        ]);
        
        const rawData = await rawRes.json();
        const prodData = await prodRes.json();
        const salesData = await salesRes.json();
        const invData = await invRes.json();
        
        setRawMaterials(rawData);
        setProducts(prodData);
        setSales(salesData);
        setInvoices(invData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addRawMaterial = async (material) => {
    try {
      const res = await fetch(`${API_URL}/raw-materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(material)
      });
      const data = await res.json();
      setRawMaterials(prev => [...prev, { ...material, id: data.id }]);
    } catch (err) {
      console.error(err);
    }
  };

  const updateRawMaterial = async (id, updatedMaterial) => {
    try {
      await fetch(`${API_URL}/raw-materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedMaterial, id })
      });
      setRawMaterials(prev => prev.map(item => item.id === id ? { ...updatedMaterial, id } : item));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRawMaterial = async (id) => {
    try {
      await fetch(`${API_URL}/raw-materials/${id}`, { method: 'DELETE' });
      setRawMaterials(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const updateRawMaterialStock = async (id, amount) => {
    const material = rawMaterials.find(m => m.id === id);
    if (material) {
      const newQuantity = material.quantity + amount;
      await updateRawMaterial(id, { ...material, quantity: newQuantity });
    }
  };

  const addProduct = async (product) => {
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      const data = await res.json();
      setProducts(prev => [...prev, { ...product, id: data.id }]);
    } catch (err) {
      console.error(err);
    }
  };

  const updateProduct = async (id, updatedProduct) => {
    try {
      await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedProduct, id })
      });
      setProducts(prev => prev.map(item => item.id === id ? { ...updatedProduct, id } : item));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const recordSale = async (invoiceData) => {
    try {
      const res = await fetch(`${API_URL}/sales`, { // Assuming /sales endpoint now handles invoice creation
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });
      const data = await res.json();
      const newInvoice = { ...invoiceData, id: data.id };
      setInvoices(prev => [newInvoice, ...prev]);

      // Update product stock based on items in the invoice
      invoiceData.items.forEach(item => {
        setProducts(prev => prev.map(p =>
          p.id === item.productId ? { ...p, stock: p.stock - item.quantity } : p
        ));
      });

      return data.id;
    } catch (err) {
      console.error('Error recording sale:', err);
      return null;
    }
  };

  const getInvoiceItems = async (invoiceId) => {
    try {
      const res = await fetch(`${API_URL}/invoices/${invoiceId}/items`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.error('Error fetching invoice items:', err);
      return [];
    }
  };

  const getFilteredMetrics = (period) => {
    const now = new Date();
    const filteredInvoices = invoices.filter(invoice => {
      const saleDate = new Date(invoice.date);
      if (period === 'today') return saleDate.toDateString() === now.toDateString();
      if (period === 'week') return (now - saleDate) / (1000 * 60 * 60 * 24) <= 7;
      if (period === 'month') return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      return true;
    });
    
    const revenue = filteredInvoices.reduce((acc, inv) => acc + inv.totalRevenue, 0);
    const profit = filteredInvoices.reduce((acc, inv) => acc + inv.totalProfit, 0);
    const count = filteredInvoices.length;
    const avgOrder = count > 0 ? revenue / count : 0;

    return {
      revenue,
      profit,
      count,
      avgOrder,
      totalInventoryValue: rawMaterials.reduce((acc, item) => acc + (item.quantity * item.costPerUnit), 0),
      lowStockItems: rawMaterials.filter(item => item.quantity <= item.minQuantity)
    };
  };

  const bulkInsert = async (type, items) => {
    try {
      const res = await fetch(`${API_URL}/bulk-insert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, items })
      });
      const data = await res.json();
      if (res.ok) {
        const refreshRes = await fetch(`${API_URL}/${type === 'raw' ? 'raw-materials' : 'products'}`);
        const refreshData = await refreshRes.json();
        type === 'raw' ? setRawMaterials(refreshData) : setProducts(refreshData);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <InventoryContext.Provider value={{ 
      rawMaterials, 
      products, 
      invoices, 
      addRawMaterial, 
      updateRawMaterial,
      deleteRawMaterial,
      updateRawMaterialStock, 
      addProduct, 
      updateProduct,
      deleteProduct,
      recordSale,
      getInvoiceItems,
      getFilteredMetrics,
      bulkInsert,
      loading
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
