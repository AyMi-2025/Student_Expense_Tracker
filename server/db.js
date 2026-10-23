const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const dbPath = path.join(__dirname, 'expenses.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for performance and integrity
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    college TEXT DEFAULT '',
    monthly_budget REAL DEFAULT 5000,
    currency TEXT DEFAULT '₹',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT DEFAULT '',
    date TEXT NOT NULL,
    payment_mode TEXT DEFAULT 'UPI',
    split_with TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date);
`);

// Seed default categories if empty
const countCat = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
if (countCat === 0) {
  const insertCat = db.prepare('INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)');
  const defaultCategories = [
    ['Food & Mess', 'Utensils', '#f97316'],
    ['Chai & Snacks', 'Coffee', '#eab308'],
    ['Books & Xerox', 'BookOpen', '#3b82f6'],
    ['Hostel & Rent', 'Home', '#8b5cf6'],
    ['Commute & Travel', 'Bus', '#06b6d4'],
    ['Recharge & WiFi', 'Wifi', '#10b981'],
    ['Outings & Movies', 'Film', '#ec4899'],
    ['Personal & Laundry', 'ShoppingBag', '#6366f1'],
    ['Medical & Health', 'Activity', '#ef4444'],
    ['Miscellaneous', 'MoreHorizontal', '#64748b']
  ];
  for (const [name, icon, color] of defaultCategories) {
    insertCat.run(name, icon, color);
  }
}

module.exports = db;
