const db = require('./db.cjs');

const seedRawMaterials = [
  { name: 'Besan (Gram Flour)', unit: 'kg', quantity: 50, minQuantity: 10, costPerUnit: 80 },
  { name: 'Cooking Oil', unit: 'liters', quantity: 20, minQuantity: 5, costPerUnit: 150 },
  { name: 'Spices Mix', unit: 'kg', quantity: 5, minQuantity: 2, costPerUnit: 500 },
  { name: 'Cardboard Boxes', unit: 'pkts', quantity: 50, minQuantity: 20, costPerUnit: 5 }
];

const seedProducts = [
  { name: 'Masala Sev', sellingPrice: 45, productionCost: 30, stock: 25 },
  { name: 'Ganthiya', sellingPrice: 50, productionCost: 35, stock: 15 }
];

db.serialize(() => {
  db.get("SELECT COUNT(*) as count FROM raw_materials", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO raw_materials (name, unit, quantity, minQuantity, costPerUnit) VALUES (?, ?, ?, ?, ?)");
      seedRawMaterials.forEach(m => stmt.run(m.name, m.unit, m.quantity, m.minQuantity, m.costPerUnit));
      stmt.finalize();
      console.log('Seeded raw materials');
    }
  });

  db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO products (name, sellingPrice, productionCost, stock) VALUES (?, ?, ?, ?)");
      seedProducts.forEach(p => stmt.run(p.name, p.sellingPrice, p.productionCost, p.stock));
      stmt.finalize();
      console.log('Seeded products');
    }
  });
});
