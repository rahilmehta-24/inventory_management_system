import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import html2pdf from 'html2pdf.js';

const Invoice = ({ sale, onClose }) => {
  const { user } = useAuth();
  const [sharing, setSharing] = useState(false);

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleUploadAndShare = async () => {
    setSharing(true);
    try {
      const element = document.getElementById('invoice-to-print');
      const opt = {
        margin: 0,
        filename: `invoice-${sale.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      // Generate PDF as blob
      const pdfBlob = await html2pdf().from(element).set(opt).output('blob');
      
      // Upload to server
      const formData = new FormData();
      formData.append('invoice', pdfBlob, `invoice-${sale.id}.pdf`);

      const res = await fetch('http://localhost:5001/api/invoices/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.url) {
        // Share via WhatsApp
        const businessName = user?.fullName || 'MNT IMS';
        const message = encodeURIComponent(
          `*${businessName}*\n` +
          `--------------------------\n` +
          `*Invoice:* #INV-${sale.id.toString().slice(-4)}\n` +
          `*Date:* ${new Date(sale.date).toLocaleDateString()}\n` +
          `*Customer:* ${sale.customerName || 'Walking Customer'}\n` +
          `--------------------------\n` +
          `View/Download Invoice PDF:\n${data.url}\n` +
          `--------------------------\n` +
          `Thank you for shopping with us!`
        );
        const whatsappUrl = `https://wa.me/${sale.customerMobile ? sale.customerMobile.replace(/\D/g, '') : ''}?text=${message}`;
        window.open(whatsappUrl, '_blank');
      }
    } catch (err) {
      console.error('Error sharing invoice:', err);
      alert('Failed to generate sharing link');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="invoice-overlay animate-fade">
      <div className="invoice-modal">
        <div id="invoice-to-print">
          <header className="invoice-header">
            <div className="company-info">
              <h1 style={{ color: '#E67E22', margin: 0 }}>MNT IMS</h1>
              <p>{user?.fullName || 'Business Name'}</p>
              <p>{user?.address || '123 Artisanal Street, Heritage City'}</p>
              <p>Contact: {user?.mobile || '+91 98765 43210'}</p>
            </div>
            <div className="invoice-details" style={{ textAlign: 'right' }}>
              <h2>INVOICE</h2>
              <p>#INV-{sale.id ? sale.id.toString().slice(-4) : '---'}</p>
              <p>{new Date(sale.date).toLocaleDateString()}</p>
            </div>
          </header>

          <section className="customer-info" style={{ margin: '1.5rem 0', padding: '1rem', border: '1px dashed var(--glass-border)', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: 'var(--accent)' }}>Bill To:</h4>
            <p style={{ margin: '0.2rem 0', fontWeight: 600 }}>{sale.customerName || 'Walking Customer'}</p>
            {sale.customerMobile && <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}>📞 {sale.customerMobile}</p>}
            {sale.customerAddress && <p style={{ margin: '0.2rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>📍 {sale.customerAddress}</p>}
          </section>

          <table className="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {(sale.items || []).map((item, i) => (
                <tr key={i}>
                  <td>{item.productName}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.pricePerUnit}</td>
                  <td>₹{item.revenue}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                <td colSpan="3" style={{ textAlign: 'right', padding: '1rem' }}>Grand Total</td>
                <td style={{ color: 'var(--accent)' }}>₹{sale.totalRevenue}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <footer className="invoice-footer">
          <p>Thank you for supporting small businesses!</p>
          <div className="no-print" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={handlePrint}>Print Invoice</button>
            <button 
              className="btn" 
              style={{ background: '#25D366', color: 'white' }} 
              onClick={handleUploadAndShare}
              disabled={sharing}
            >
              {sharing ? 'Generating Link...' : 'Share via WhatsApp'}
            </button>
            <button className="btn" style={{ background: 'rgba(0,0,0,0.1)' }} onClick={onClose}>Close</button>
          </div>
        </footer>
      </div>

      <style>{`
        .invoice-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }
        .invoice-modal {
          background: white;
          color: #333;
          width: 800px;
          padding: 3rem;
          border-radius: 8px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #eee;
          padding-bottom: 2rem;
          margin-bottom: 2rem;
        }
        .invoice-meta { text-align: right; }
        .billing-info { margin-bottom: 2rem; }
        .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
        .invoice-table th { background: #f8f8f8; color: #333; padding: 1rem; border: 1px solid #eee; }
        .invoice-table td { padding: 1rem; border: 1px solid #eee; }
        .invoice-footer { text-align: center; border-top: 2px solid #eee; padding-top: 2rem; margin-top: 2rem; }
        
        @media print {
          body * { visibility: hidden; }
          .invoice-modal, .invoice-modal * { visibility: visible; }
          .invoice-modal { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; padding: 0; margin: 0; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Invoice;
