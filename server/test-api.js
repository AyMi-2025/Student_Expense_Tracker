const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');

// We will test directly against the logic and DB to ensure unit test speed and reliability
const db = require('./db');
const { hashPassword, verifyPassword, generateToken } = require('./auth');

console.log('🧪 Starting backend automated tests...\n');

try {
  // Test 1: Password hashing and verification
  console.log('Test 1: Password Hashing & Verification');
  const testPassword = 'collegeStudent@123';
  const hashed = hashPassword(testPassword);
  assert.strictEqual(verifyPassword(testPassword, hashed), true, 'Password verification failed for correct password');
  assert.strictEqual(verifyPassword('wrongPassword', hashed), false, 'Password verification should fail for wrong password');
  console.log('  ✅ Password hashing & scrypt verification passed');

  // Test 2: Database User creation
  console.log('\nTest 2: Database User Creation');
  const testEmail = `test_${Date.now()}@college.edu`;
  db.prepare(`
    INSERT INTO users (email, password_hash, name, college, monthly_budget, currency)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(testEmail, hashed, 'Ayan Maiti', 'Engineering College', 6000, '₹');

  const createdUser = db.prepare('SELECT * FROM users WHERE email = ?').get(testEmail);
  assert.ok(createdUser, 'User should be found in database');
  assert.strictEqual(createdUser.monthly_budget, 6000);
  assert.strictEqual(createdUser.currency, '₹');
  console.log(`  ✅ User created successfully (ID: ${createdUser.id})`);

  // Test 3: JWT Token generation
  console.log('\nTest 3: Token Generation');
  const token = generateToken(createdUser);
  assert.ok(token && typeof token === 'string', 'Token should be a non-empty string');
  console.log('  ✅ JWT token generated');

  // Test 4: Categories check
  console.log('\nTest 4: Default Categories Check');
  const categories = db.prepare('SELECT * FROM categories').all();
  assert.ok(categories.length >= 8, 'Default student categories should be seeded');
  console.log(`  ✅ ${categories.length} student categories available (e.g. ${categories.map(c => c.name).slice(0, 3).join(', ')}...)`);

  // Test 5: Adding Expenses
  console.log('\nTest 5: Expense Creation & Querying');
  const today = new Date().toISOString().split('T')[0];
  
  const insertExpense = db.prepare(`
    INSERT INTO expenses (user_id, amount, category, description, date, payment_mode, split_with)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertExpense.run(createdUser.id, 80, 'Chai & Snacks', 'Evening samosa with friends', today, 'UPI', 'Rahul');
  insertExpense.run(createdUser.id, 150, 'Food & Mess', 'Lunch at cafeteria', today, 'UPI', '');
  insertExpense.run(createdUser.id, 45, 'Books & Xerox', 'Lab manual printouts', today, 'Cash', '');

  const userExpenses = db.prepare('SELECT * FROM expenses WHERE user_id = ?').all(createdUser.id);
  assert.strictEqual(userExpenses.length, 3, 'User should have 3 expenses');
  console.log(`  ✅ 3 expenses recorded successfully`);

  // Test 6: Stats & Budget Remaining
  console.log('\nTest 6: Safe Daily Spend & Budget Calculation');
  const totalSpent = userExpenses.reduce((sum, e) => sum + e.amount, 0);
  assert.strictEqual(totalSpent, 275, 'Total spent should equal 275');

  const remaining = createdUser.monthly_budget - totalSpent;
  assert.strictEqual(remaining, 5725, 'Remaining budget should equal 5725');
  console.log(`  ✅ Budget calculation verified: Total Spent = ₹${totalSpent}, Remaining = ₹${remaining}`);

  // Test 7: Cleanup test user
  console.log('\nTest 7: Cascade Deletion');
  db.prepare('DELETE FROM users WHERE id = ?').run(createdUser.id);
  const remainingExp = db.prepare('SELECT COUNT(*) as count FROM expenses WHERE user_id = ?').get(createdUser.id).count;
  assert.strictEqual(remainingExp, 0, 'Expenses should be cascade-deleted with user');
  console.log('  ✅ Cascade deletion verified');

  console.log('\n=============================================');
  console.log('🎉 ALL BACKEND UNIT TESTS PASSED SUCCESSFULLY!');
  console.log('=============================================\n');
} catch (err) {
  console.error('❌ Test failed:', err);
  process.exit(1);
}
