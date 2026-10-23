const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../auth');

router.use(authenticateToken);

// Get comprehensive student expense statistics & budget analytics
router.get('/summary', (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentYearMonth = `${currentYear}-${currentMonth}`;
    const todayStr = now.toISOString().split('T')[0];

    // User's budget & currency
    const user = db.prepare('SELECT monthly_budget, currency FROM users WHERE id = ?').get(userId);
    const monthlyBudget = user ? user.monthly_budget : 5000;
    const currency = user ? user.currency : '₹';

    // Total spent this month
    const monthTotalRow = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM expenses 
      WHERE user_id = ? AND strftime('%Y-%m', date) = ?
    `).get(userId, currentYearMonth);
    const totalSpentMonth = monthTotalRow.total;

    // Total spent today
    const todayTotalRow = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM expenses 
      WHERE user_id = ? AND date = ?
    `).get(userId, todayStr);
    const totalSpentToday = todayTotalRow.total;

    // Remaining budget and percentage
    const remainingBudget = Math.max(0, monthlyBudget - totalSpentMonth);
    const budgetPercentUsed = monthlyBudget > 0 
      ? Math.min(100, Math.round((totalSpentMonth / monthlyBudget) * 100)) 
      : 0;

    // Calculate days remaining in current month for "Safe Daily Spend"
    const totalDaysInMonth = new Date(currentYear, now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const daysRemaining = Math.max(1, totalDaysInMonth - currentDay + 1);
    const safeDailySpend = Math.max(0, Math.round(remainingBudget / daysRemaining));

    // Category breakdown for current month
    const categoryStats = db.prepare(`
      SELECT category, COALESCE(SUM(amount), 0) as total, COUNT(*) as count
      FROM expenses
      WHERE user_id = ? AND strftime('%Y-%m', date) = ?
      GROUP BY category
      ORDER BY total DESC
    `).all(userId, currentYearMonth);

    // Payment mode breakdown (UPI, Cash, Card)
    const paymentModeStats = db.prepare(`
      SELECT payment_mode, COALESCE(SUM(amount), 0) as total, COUNT(*) as count
      FROM expenses
      WHERE user_id = ? AND strftime('%Y-%m', date) = ?
      GROUP BY payment_mode
      ORDER BY total DESC
    `).all(userId, currentYearMonth);

    // Daily spending for the last 14 days (or current month)
    const dailyHistory = db.prepare(`
      SELECT date, COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE user_id = ? AND date >= date('now', '-14 days')
      GROUP BY date
      ORDER BY date ASC
    `).all(userId);

    // Total expenses count all time
    const totalTransactions = db.prepare('SELECT COUNT(*) as count FROM expenses WHERE user_id = ?').get(userId).count;

    // Recent 5 expenses
    const recentExpenses = db.prepare(`
      SELECT * FROM expenses 
      WHERE user_id = ? 
      ORDER BY date DESC, id DESC 
      LIMIT 5
    `).all(userId);

    res.json({
      currency,
      monthlyBudget,
      totalSpentMonth,
      totalSpentToday,
      remainingBudget,
      budgetPercentUsed,
      daysRemaining,
      totalDaysInMonth,
      currentDay,
      safeDailySpend,
      categoryStats,
      paymentModeStats,
      dailyHistory,
      totalTransactions,
      recentExpenses
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to calculate stats.' });
  }
});

module.exports = router;
