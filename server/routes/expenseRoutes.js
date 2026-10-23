const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../auth');

// All expense routes require authentication
router.use(authenticateToken);

// Get available categories
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY id ASC').all();
    res.json({ categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// List expenses with flexible filters
router.get('/', (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year, category, payment_mode, search, start_date, end_date } = req.query;

    let query = 'SELECT * FROM expenses WHERE user_id = ?';
    const params = [userId];

    if (month && year) {
      const formattedMonth = String(month).padStart(2, '0');
      query += ` AND strftime('%Y-%m', date) = ?`;
      params.push(`${year}-${formattedMonth}`);
    } else if (year) {
      query += ` AND strftime('%Y', date) = ?`;
      params.push(String(year));
    }

    if (start_date && end_date) {
      query += ` AND date BETWEEN ? AND ?`;
      params.push(start_date, end_date);
    } else if (start_date) {
      query += ` AND date >= ?`;
      params.push(start_date);
    } else if (end_date) {
      query += ` AND date <= ?`;
      params.push(end_date);
    }

    if (category && category !== 'All') {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (payment_mode && payment_mode !== 'All') {
      query += ` AND payment_mode = ?`;
      params.push(payment_mode);
    }

    if (search && search.trim()) {
      query += ` AND (description LIKE ? OR split_with LIKE ? OR category LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY date DESC, id DESC';

    const expenses = db.prepare(query).all(...params);
    res.json({ expenses, count: expenses.length });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
});

// Add a new expense
router.post('/', (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, category, description, date, payment_mode, split_with } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Valid expense amount greater than 0 is required.' });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ error: 'Expense category is required.' });
    }

    const expenseDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) 
      ? date 
      : new Date().toISOString().split('T')[0];

    const mode = payment_mode ? payment_mode.trim() : 'UPI';
    const desc = description ? description.trim() : '';
    const split = split_with ? split_with.trim() : '';

    const stmt = db.prepare(`
      INSERT INTO expenses (user_id, amount, category, description, date, payment_mode, split_with)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(userId, parsedAmount, category.trim(), desc, expenseDate, mode, split);
    
    // Get inserted expense
    const newExpense = db.prepare('SELECT * FROM expenses WHERE user_id = ? ORDER BY id DESC LIMIT 1').get(userId);

    res.status(201).json({
      message: 'Expense added successfully!',
      expense: newExpense
    });
  } catch (err) {
    console.error('Error creating expense:', err);
    res.status(500).json({ error: 'Failed to record expense.' });
  }
});

// Update an existing expense
router.put('/:id', (req, res) => {
  try {
    const userId = req.user.id;
    const expenseId = parseInt(req.params.id, 10);
    const { amount, category, description, date, payment_mode, split_with } = req.body;

    const existing = db.prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?').get(expenseId, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Expense not found or unauthorized.' });
    }

    const updatedAmount = amount !== undefined ? parseFloat(amount) : existing.amount;
    if (isNaN(updatedAmount) || updatedAmount <= 0) {
      return res.status(400).json({ error: 'Valid amount greater than 0 required.' });
    }

    const updatedCategory = category !== undefined ? category.trim() : existing.category;
    const updatedDesc = description !== undefined ? description.trim() : existing.description;
    const updatedDate = date !== undefined ? date : existing.date;
    const updatedMode = payment_mode !== undefined ? payment_mode.trim() : existing.payment_mode;
    const updatedSplit = split_with !== undefined ? split_with.trim() : existing.split_with;

    db.prepare(`
      UPDATE expenses
      SET amount = ?, category = ?, description = ?, date = ?, payment_mode = ?, split_with = ?
      WHERE id = ? AND user_id = ?
    `).run(updatedAmount, updatedCategory, updatedDesc, updatedDate, updatedMode, updatedSplit, expenseId, userId);

    const updatedExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(expenseId);
    res.json({
      message: 'Expense updated successfully!',
      expense: updatedExpense
    });
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).json({ error: 'Failed to update expense.' });
  }
});

// Delete an expense
router.delete('/:id', (req, res) => {
  try {
    const userId = req.user.id;
    const expenseId = parseInt(req.params.id, 10);

    const existing = db.prepare('SELECT id FROM expenses WHERE id = ? AND user_id = ?').get(expenseId, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Expense not found or unauthorized.' });
    }

    db.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?').run(expenseId, userId);
    res.json({ message: 'Expense deleted successfully.', id: expenseId });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ error: 'Failed to delete expense.' });
  }
});

// Export all user expenses as CSV
router.get('/export/csv', (req, res) => {
  try {
    const userId = req.user.id;
    const expenses = db.prepare(`
      SELECT date, category, amount, payment_mode, description, split_with, created_at 
      FROM expenses 
      WHERE user_id = ? 
      ORDER BY date DESC
    `).all(userId);

    const headers = ['Date', 'Category', 'Amount', 'Payment Mode', 'Description', 'Split With Note', 'Recorded At'];
    const rows = expenses.map(e => [
      `"${e.date}"`,
      `"${e.category}"`,
      e.amount,
      `"${e.payment_mode || ''}"`,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      `"${(e.split_with || '').replace(/"/g, '""')}"`,
      `"${e.created_at}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="student_expenses.csv"');
    res.status(200).send(csvContent);
  } catch (err) {
    console.error('Error exporting expenses:', err);
    res.status(500).json({ error: 'Failed to export expenses.' });
  }
});

module.exports = router;
