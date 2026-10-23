const express = require('express');
const cors = require('cors');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');

const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for cross-device access (laptop <-> phone)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/stats', statsRoutes);

// Helper function to get local LAN IP addresses (for phone access)
function getLocalNetworkAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      // Skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push({
          interface: name,
          ip: net.address,
          url: `http://${net.address}:${PORT}`
        });
      }
    }
  }
  return addresses;
}

// Endpoint to get server network info for easy mobile phone access
app.get('/api/network-ip', (req, res) => {
  const addresses = getLocalNetworkAddresses();
  res.json({
    port: PORT,
    addresses,
    primaryUrl: addresses.length > 0 ? addresses[0].url : `http://localhost:${PORT}`
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'student-expense-tracker', timestamp: new Date().toISOString() });
});

// Serve frontend build if exists
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Bind to 0.0.0.0 so phone on same Wi-Fi can connect
app.listen(PORT, '0.0.0.0', () => {
  const networkAddrs = getLocalNetworkAddresses();
  console.log(`\n======================================================`);
  console.log(`🎓 College Student Expense Tracker Server is running!`);
  console.log(`💻 Laptop Access:  http://localhost:${PORT}`);
  if (networkAddrs.length > 0) {
    console.log(`📱 Phone Access:   ${networkAddrs[0].url} (on same Wi-Fi)`);
  }
  console.log(`======================================================\n`);
});
