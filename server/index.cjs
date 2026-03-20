const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db.cjs');

const app = express();
const PORT = 5001;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `invoice-${Date.now()}.pdf`)
});
const upload = multer({ storage });

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// --- Auth API ---
app.post('/api/auth/register', (req, res) => {
  const { username, password, mobile } = req.body;
  db.run(
    'INSERT INTO users (username, password, mobile, fullName, address) VALUES (?, ?, ?, ?, ?)',
    [username, password, mobile, '', ''],
    function(err) {
      if (err) return res.status(500).json({ error: 'Username already exists' });
      res.json({ id: this.lastID, username, mobile, fullName: '', address: '' });
    }
  );
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  db.get(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      res.json({ id: user.id, username: user.username, mobile: user.mobile, fullName: user.fullName || '', address: user.address || '' });
    }
  );
});

app.post('/api/auth/request-otp', (req, res) => {
  const { mobile } = req.body;
  db.get('SELECT * FROM users WHERE mobile = ?', [mobile], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'Mobile number not registered' });
    
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 mins
    
    db.run(
      'INSERT OR REPLACE INTO otps (mobile, otp, expiry) VALUES (?, ?, ?)',
      [mobile, otp, expiry],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        console.log(`[AUTH] OTP for ${mobile}: ${otp}`); // SIMULATED SMS
        res.json({ message: 'OTP sent successfully (Simulated)' });
      }
    );
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { mobile, otp, newPassword } = req.body;
  db.get('SELECT * FROM otps WHERE mobile = ?', [mobile], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row || row.otp !== otp || row.expiry < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    
    db.run(
      'UPDATE users SET password = ? WHERE mobile = ?',
      [newPassword, mobile],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        db.run('DELETE FROM otps WHERE mobile = ?', [mobile]);
        res.json({ message: 'Password reset successful' });
      }
    );
  });
});

app.post('/api/auth/update', (req, res) => {
  const { id, fullName, address, mobile } = req.body;
  db.run(
    'UPDATE users SET fullName = ?, address = ?, mobile = ? WHERE id = ?',
    [fullName, address, mobile, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Profile updated successfully', fullName, address, mobile });
    }
  );
});

// --- Raw Materials API ---
app.get('/api/raw-materials', (req, res) => {
  db.all('SELECT * FROM raw_materials', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/raw-materials', (req, res) => {
  const { name, unit, quantity, minQuantity, costPerUnit, id } = req.body;
  if (id) {
    db.run(
      'UPDATE raw_materials SET name=?, unit=?, quantity=?, minQuantity=?, costPerUnit=? WHERE id=?',
      [name, unit, quantity, minQuantity, costPerUnit, id],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Updated', id });
      }
    );
  } else {
    db.run(
      'INSERT INTO raw_materials (name, unit, quantity, minQuantity, costPerUnit) VALUES (?, ?, ?, ?, ?)',
      [name, unit, quantity, minQuantity, costPerUnit],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      }
    );
  }
});

app.delete('/api/raw-materials/:id', (req, res) => {
  db.run('DELETE FROM raw_materials WHERE id=?', req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted' });
  });
});

// --- Products API ---
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/products', (req, res) => {
  const { name, sellingPrice, productionCost, stock, id, unit, size, weight } = req.body;
  if (id) {
    db.run(
      'UPDATE products SET name=?, sellingPrice=?, productionCost=?, stock=?, unit=?, size=?, weight=? WHERE id=?',
      [name, sellingPrice, productionCost, stock, unit, size, weight, id],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Updated', id });
      }
    );
  } else {
    db.run(
      'INSERT INTO products (name, sellingPrice, productionCost, stock, unit, size, weight) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, sellingPrice, productionCost, stock, unit, size, weight],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      }
    );
  }
});

app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id=?', req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted' });
  });
});

// --- Bulk API ---
app.post('/api/bulk-insert', (req, res) => {
  const { type, items } = req.body; // type: 'raw' or 'product'
  if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Items must be an array' });

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    const stmt = type === 'raw' 
      ? db.prepare('INSERT INTO raw_materials (name, unit, quantity, minQuantity, costPerUnit) VALUES (?, ?, ?, ?, ?)')
      : db.prepare('INSERT INTO products (name, sellingPrice, productionCost, stock, unit, size, weight) VALUES (?, ?, ?, ?, ?, ?, ?)');

    try {
      items.forEach(item => {
        if (type === 'raw') {
          stmt.run([item.name, item.unit, item.quantity, item.minQuantity, item.costPerUnit]);
        } else {
          stmt.run([item.name, item.sellingPrice, item.productionCost, item.stock, item.unit, item.size, item.weight]);
        }
      });
      stmt.finalize();
      db.run('COMMIT');
      res.json({ message: `Successfully inserted ${items.length} items` });
    } catch (err) {
      db.run('ROLLBACK');
      res.status(500).json({ error: err.message });
    }
  });
});

// --- Sales API ---
app.get('/api/sales', (req, res) => {
  db.all('SELECT * FROM sales ORDER BY date DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/sales', (req, res) => {
  const { items, customerName, customerMobile, customerAddress, totalRevenue, totalProfit, date } = req.body;
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // 1. Insert Invoice Header
    db.run(
      'INSERT INTO invoices (customerName, customerMobile, customerAddress, totalRevenue, totalProfit, date) VALUES (?, ?, ?, ?, ?, ?)',
      [customerName, customerMobile, customerAddress, totalRevenue, totalProfit, date],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }
        const invoiceId = this.lastID;
        
        // 2. Insert Line Items and Update Stock
        let completed = 0;
        let hasError = false;
        
        items.forEach(item => {
          if (hasError) return;
          
          db.run(
            'INSERT INTO invoice_items (invoiceId, productId, productName, quantity, pricePerUnit, revenue, profit) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [invoiceId, item.productId, item.productName, item.quantity, item.pricePerUnit, item.revenue, item.profit],
            (err) => {
              if (err) {
                hasError = true;
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
              }
              
              // Update product stock
              db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.productId], (err) => {
                if (err) {
                  hasError = true;
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: err.message });
                }
                
                completed++;
                if (completed === items.length) {
                  db.run('COMMIT');
                  res.json({ id: invoiceId });
                }
              });
            }
          );
        });
      }
    );
  });
});

app.get('/api/invoices', (req, res) => {
  db.all('SELECT * FROM invoices ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/invoices/:id/items', (req, res) => {
  db.all('SELECT * FROM invoice_items WHERE invoiceId = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/invoices/upload', upload.single('invoice'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// --- Serve React Frontend ---
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      next();
    }
  });
}

// --- Health Check ---
app.get('/api/health', (req, res) => {
  db.get('SELECT 1', [], (err) => {
    if (err) return res.status(500).json({ status: 'unhealthy', db: 'disconnected' });
    res.json({ status: 'healthy', db: 'connected', timestamp: new Date().toISOString() });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
