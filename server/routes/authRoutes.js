const express = require('express');
const router = express.Router();
const db = require('../db');
const { hashPassword, verifyPassword, generateToken, authenticateToken } = require('../auth');

// Register a new student account
router.post('/register', (req, res) => {
  try {
    const { email, password, name, college, monthly_budget, currency } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = hashPassword(password);
    const budgetVal = monthly_budget ? parseFloat(monthly_budget) : 5000;
    const currencyVal = currency || '₹';
    const collegeVal = college ? college.trim() : '';

    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, name, college, monthly_budget, currency)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(normalizedEmail, passwordHash, name.trim(), collegeVal, budgetVal, currencyVal);
    const user = db.prepare('SELECT id, email, name, college, monthly_budget, currency, created_at FROM users WHERE email = ?').get(normalizedEmail);

    const token = generateToken(user);
    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      college: user.college,
      monthly_budget: user.monthly_budget,
      currency: user.currency,
      created_at: user.created_at
    };

    const token = generateToken(safeUser);
    res.json({
      message: 'Logged in successfully!',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Get current logged-in user profile
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, name, college, monthly_budget, currency, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// Update profile / budget settings
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name, college, monthly_budget, currency, current_password, new_password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let updatedPasswordHash = user.password_hash;
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error: 'Current password is required to set a new password.' });
      }
      if (!verifyPassword(current_password, user.password_hash)) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }
      if (new_password.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      }
      updatedPasswordHash = hashPassword(new_password);
    }

    const updatedName = name !== undefined ? name.trim() : user.name;
    const updatedCollege = college !== undefined ? college.trim() : user.college;
    const updatedBudget = monthly_budget !== undefined ? parseFloat(monthly_budget) : user.monthly_budget;
    const updatedCurrency = currency !== undefined ? currency.trim() : user.currency;

    db.prepare(`
      UPDATE users 
      SET name = ?, college = ?, monthly_budget = ?, currency = ?, password_hash = ?
      WHERE id = ?
    `).run(updatedName, updatedCollege, updatedBudget, updatedCurrency, updatedPasswordHash, user.id);

    const safeUser = {
      id: user.id,
      email: user.email,
      name: updatedName,
      college: updatedCollege,
      monthly_budget: updatedBudget,
      currency: updatedCurrency,
      created_at: user.created_at
    };

    res.json({
      message: 'Profile updated successfully!',
      user: safeUser
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

module.exports = router;
