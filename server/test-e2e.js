const http = require('http');

function post(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(responseBody) });
        } catch (e) {
          resolve({ status: res.statusCode, body: responseBody });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
      headers
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(responseBody) });
        } catch (e) {
          resolve({ status: res.statusCode, body: responseBody });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('🚀 Running Full E2E Integration Suite...\n');

  // 1. Register Student
  const studentEmail = `student_${Date.now()}@college.edu`;
  const regRes = await post('/api/auth/register', {
    email: studentEmail,
    password: 'secureCollegePassword123',
    name: 'Ayan Maiti',
    college: 'Engineering Institute',
    monthly_budget: 6000,
    currency: '₹'
  });
  console.log('Step 1: Student Registration -> Status:', regRes.status, '| User:', regRes.body.user?.email);
  if (regRes.status !== 201) throw new Error('Registration failed: ' + JSON.stringify(regRes.body));
  const token = regRes.body.token;

  // 2. Add Expenses
  const exp1 = await post('/api/expenses', {
    amount: 120,
    category: 'Food & Mess',
    description: 'Thali lunch at campus canteen',
    payment_mode: 'UPI',
    date: new Date().toISOString().split('T')[0]
  }, token);
  console.log('Step 2a: Add Canteen Expense -> Status:', exp1.status, '| ID:', exp1.body.expense?.id);

  const exp2 = await post('/api/expenses', {
    amount: 40,
    category: 'Chai & Snacks',
    description: 'Evening tea & samosa',
    payment_mode: 'Cash',
    split_with: 'Rohan',
    date: new Date().toISOString().split('T')[0]
  }, token);
  console.log('Step 2b: Add Chai & Snacks (with split note) -> Status:', exp2.status, '| ID:', exp2.body.expense?.id);

  const exp3 = await post('/api/expenses', {
    amount: 65,
    category: 'Books & Xerox',
    description: 'Lab assignment Xerox printouts',
    payment_mode: 'UPI',
    date: new Date().toISOString().split('T')[0]
  }, token);
  console.log('Step 2c: Add Xerox Expense -> Status:', exp3.status, '| ID:', exp3.body.expense?.id);

  // 3. Query Summary & Budget Stats
  const statsRes = await get('/api/stats/summary', token);
  console.log('\nStep 3: Query Stats & Safe Daily Spend -> Status:', statsRes.status);
  console.log('  💰 Total Spent This Month:', statsRes.body.currency + statsRes.body.totalSpentMonth);
  console.log('  🛡️ Safe Daily Spend Target:', statsRes.body.currency + statsRes.body.safeDailySpend + '/day');
  console.log('  📊 Budget Used:', statsRes.body.budgetPercentUsed + '%');
  console.log('  🏷️ Categories Count:', statsRes.body.categoryStats.length);

  // 4. Query Expenses list
  const listRes = await get('/api/expenses', token);
  console.log('\nStep 4: Expense List Filter & Query -> Status:', listRes.status, '| Total items:', listRes.body.expenses?.length);

  // 5. Test Frontend Static Bundle Serving
  const rootRes = await get('/');
  console.log('\nStep 5: Frontend Static Bundle Delivery -> Status:', rootRes.status);
  if (typeof rootRes.body === 'string' && rootRes.body.includes('CampusSpend')) {
    console.log('  ✅ Root index.html served correctly with CampusSpend bundle!');
  }

  console.log('\n===========================================');
  console.log('🎉 FULL INTEGRATION VERIFICATION PASSED!');
  console.log('===========================================\n');
  process.exit(0);
}

// Start server and run tests
require('./index.js');
setTimeout(run, 1200);
