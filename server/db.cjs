const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'inventory.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Raw Materials Table
  db.run(`CREATE TABLE IF NOT EXISTS raw_materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    quantity REAL DEFAULT 0,
    minQuantity REAL DEFAULT 0,
    costPerUnit REAL DEFAULT 0
  )`);

  // Products Table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sellingPrice REAL NOT NULL,
    productionCost REAL NOT NULL,
    stock INTEGER DEFAULT 0,
    unit TEXT,
    size TEXT,
    weight TEXT
  )`, () => {
    // Migration: Add columns if they don't exist
    db.run("ALTER TABLE products ADD COLUMN unit TEXT", () => {});
    db.run("ALTER TABLE products ADD COLUMN size TEXT", () => {});
    db.run("ALTER TABLE products ADD COLUMN weight TEXT", () => {});
  });

  // Sales Table
  db.run(`CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER,
    productName TEXT,
    quantity INTEGER,
    revenue REAL,
    profit REAL,
    date TEXT,
    pricePerUnit REAL,
    customerMobile TEXT,
    customerName TEXT,
    customerAddress TEXT,
    FOREIGN KEY(productId) REFERENCES products(id)
  )`, () => {
    db.run("ALTER TABLE sales ADD COLUMN customerMobile TEXT", () => {});
    db.run("ALTER TABLE sales ADD COLUMN customerName TEXT", () => {});
    db.run("ALTER TABLE sales ADD COLUMN customerAddress TEXT", () => {});
  });

  // Invoices Table (Header)
  db.run(`CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT,
    customerMobile TEXT,
    customerAddress TEXT,
    totalRevenue REAL,
    totalProfit REAL,
    date TEXT
  )`);

  // Invoice Items Table (Line Items)
  db.run(`CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoiceId INTEGER,
    productId INTEGER,
    productName TEXT,
    quantity INTEGER,
    pricePerUnit REAL,
    revenue REAL,
    profit REAL,
    FOREIGN KEY(invoiceId) REFERENCES invoices(id),
    FOREIGN KEY(productId) REFERENCES products(id)
  )`);

  // Users Table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    mobile TEXT NOT NULL
  )`, () => {
    db.run("ALTER TABLE users ADD COLUMN fullName TEXT", () => {});
    db.run("ALTER TABLE users ADD COLUMN address TEXT", () => {});
  });

  // OTPs Table
  db.run(`CREATE TABLE IF NOT EXISTS otps (
    mobile TEXT PRIMARY KEY,
    otp TEXT NOT NULL,
    expiry INTEGER NOT NULL
  )`);
});

module.exports = db;
