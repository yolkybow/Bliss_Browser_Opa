const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const axios = require('axios');
const cron = require('node-cron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Database setup
const db = new sqlite3.Database('./portfolio.db');

// Initialize database tables
db.serialize(() => {
  // Properties table
  db.run(`CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    purchase_price REAL,
    current_value REAL,
    purchase_date TEXT,
    property_type TEXT,
    notes TEXT
  )`);

  // Vehicles table
  db.run(`CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER,
    purchase_price REAL,
    current_value REAL,
    purchase_date TEXT,
    mileage INTEGER,
    condition TEXT,
    notes TEXT
  )`);

  // Stocks table
  db.run(`CREATE TABLE IF NOT EXISTS stocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    quantity REAL,
    purchase_price REAL,
    purchase_date TEXT,
    notes TEXT
  )`);

  // Crypto table
  db.run(`CREATE TABLE IF NOT EXISTS crypto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    quantity REAL,
    purchase_price REAL,
    purchase_date TEXT,
    notes TEXT
  )`);

  // Bank accounts table
  db.run(`CREATE TABLE IF NOT EXISTS bank_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bank_name TEXT NOT NULL,
    account_type TEXT,
    account_number TEXT,
    current_balance REAL,
    last_updated TEXT,
    notes TEXT
  )`);
});

// Live data tracking
let liveData = {
  stocks: {},
  crypto: {},
  bankBalances: {}
};

// Stock price API (using Alpha Vantage - free tier)
const getStockPrice = async (symbol) => {
  try {
    const response = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=demo`);
    const data = response.data['Global Quote'];
    if (data && data['05. price']) {
      return parseFloat(data['05. price']);
    }
    return null;
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error.message);
    return null;
  }
};

// Crypto price API (using CoinGecko - free tier)
const getCryptoPrice = async (symbol) => {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`);
    const data = response.data[symbol];
    if (data && data.usd) {
      return data.usd;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching crypto price for ${symbol}:`, error.message);
    return null;
  }
};

// Mock bank balance API (in real app, this would integrate with banking APIs)
const getBankBalance = async (accountId) => {
  // Simulate bank API call
  return Math.random() * 100000 + 10000; // Random balance between 10k-110k
};

// Update live data
const updateLiveData = async () => {
  try {
    // Update stock prices
    const stockSymbols = await new Promise((resolve, reject) => {
      db.all("SELECT DISTINCT symbol FROM stocks", (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.symbol));
      });
    });

    for (const symbol of stockSymbols) {
      const price = await getStockPrice(symbol);
      if (price) {
        liveData.stocks[symbol] = price;
      }
    }

    // Update crypto prices
    const cryptoSymbols = await new Promise((resolve, reject) => {
      db.all("SELECT DISTINCT symbol FROM crypto", (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.symbol));
      });
    });

    for (const symbol of cryptoSymbols) {
      const price = await getCryptoPrice(symbol);
      if (price) {
        liveData.crypto[symbol] = price;
      }
    }

    // Update bank balances
    const bankAccounts = await new Promise((resolve, reject) => {
      db.all("SELECT id FROM bank_accounts", (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.id));
      });
    });

    for (const accountId of bankAccounts) {
      const balance = await getBankBalance(accountId);
      liveData.bankBalances[accountId] = balance;
    }

    // Broadcast updates to connected clients
    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'liveDataUpdate',
            data: liveData
          }));
        }
      });
    }
  } catch (error) {
    console.error('Error updating live data:', error);
  }
};

// Schedule live data updates every 30 seconds
cron.schedule('*/30 * * * * *', updateLiveData);

// WebSocket server
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send current live data to new client
  ws.send(JSON.stringify({
    type: 'liveDataUpdate',
    data: liveData
  }));

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// API Routes

// Properties
app.get('/api/properties', (req, res) => {
  db.all("SELECT * FROM properties", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/properties', (req, res) => {
  const { name, address, purchase_price, current_value, purchase_date, property_type, notes } = req.body;
  db.run(
    "INSERT INTO properties (name, address, purchase_price, current_value, purchase_date, property_type, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, address, purchase_price, current_value, purchase_date, property_type, notes],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

app.put('/api/properties/:id', (req, res) => {
  const { name, address, purchase_price, current_value, purchase_date, property_type, notes } = req.body;
  db.run(
    "UPDATE properties SET name = ?, address = ?, purchase_price = ?, current_value = ?, purchase_date = ?, property_type = ?, notes = ? WHERE id = ?",
    [name, address, purchase_price, current_value, purchase_date, property_type, notes, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    }
  );
});

app.delete('/api/properties/:id', (req, res) => {
  db.run("DELETE FROM properties WHERE id = ?", [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Vehicles
app.get('/api/vehicles', (req, res) => {
  db.all("SELECT * FROM vehicles", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/vehicles', (req, res) => {
  const { make, model, year, purchase_price, current_value, purchase_date, mileage, condition, notes } = req.body;
  db.run(
    "INSERT INTO vehicles (make, model, year, purchase_price, current_value, purchase_date, mileage, condition, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [make, model, year, purchase_price, current_value, purchase_date, mileage, condition, notes],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

app.put('/api/vehicles/:id', (req, res) => {
  const { make, model, year, purchase_price, current_value, purchase_date, mileage, condition, notes } = req.body;
  db.run(
    "UPDATE vehicles SET make = ?, model = ?, year = ?, purchase_price = ?, current_value = ?, purchase_date = ?, mileage = ?, condition = ?, notes = ? WHERE id = ?",
    [make, model, year, purchase_price, current_value, purchase_date, mileage, condition, notes, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    }
  );
});

app.delete('/api/vehicles/:id', (req, res) => {
  db.run("DELETE FROM vehicles WHERE id = ?", [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Stocks
app.get('/api/stocks', (req, res) => {
  db.all("SELECT * FROM stocks", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Add current prices to stock data
    const stocksWithPrices = rows.map(stock => ({
      ...stock,
      current_price: liveData.stocks[stock.symbol] || 0,
      current_value: (liveData.stocks[stock.symbol] || 0) * stock.quantity,
      gain_loss: ((liveData.stocks[stock.symbol] || 0) - stock.purchase_price) * stock.quantity,
      gain_loss_percent: stock.purchase_price > 0 ? (((liveData.stocks[stock.symbol] || 0) - stock.purchase_price) / stock.purchase_price) * 100 : 0
    }));
    res.json(stocksWithPrices);
  });
});

app.post('/api/stocks', (req, res) => {
  const { symbol, quantity, purchase_price, purchase_date, notes } = req.body;
  db.run(
    "INSERT INTO stocks (symbol, quantity, purchase_price, purchase_date, notes) VALUES (?, ?, ?, ?, ?)",
    [symbol, quantity, purchase_price, purchase_date, notes],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

app.delete('/api/stocks/:id', (req, res) => {
  db.run("DELETE FROM stocks WHERE id = ?", [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Crypto
app.get('/api/crypto', (req, res) => {
  db.all("SELECT * FROM crypto", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Add current prices to crypto data
    const cryptoWithPrices = rows.map(crypto => ({
      ...crypto,
      current_price: liveData.crypto[crypto.symbol] || 0,
      current_value: (liveData.crypto[crypto.symbol] || 0) * crypto.quantity,
      gain_loss: ((liveData.crypto[crypto.symbol] || 0) - crypto.purchase_price) * crypto.quantity,
      gain_loss_percent: crypto.purchase_price > 0 ? (((liveData.crypto[crypto.symbol] || 0) - crypto.purchase_price) / crypto.purchase_price) * 100 : 0
    }));
    res.json(cryptoWithPrices);
  });
});

app.post('/api/crypto', (req, res) => {
  const { symbol, quantity, purchase_price, purchase_date, notes } = req.body;
  db.run(
    "INSERT INTO crypto (symbol, quantity, purchase_price, purchase_date, notes) VALUES (?, ?, ?, ?, ?)",
    [symbol, quantity, purchase_price, purchase_date, notes],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

app.delete('/api/crypto/:id', (req, res) => {
  db.run("DELETE FROM crypto WHERE id = ?", [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Bank Accounts
app.get('/api/bank-accounts', (req, res) => {
  db.all("SELECT * FROM bank_accounts", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Add current balances
    const accountsWithBalances = rows.map(account => ({
      ...account,
      current_balance: liveData.bankBalances[account.id] || account.current_balance || 0
    }));
    res.json(accountsWithBalances);
  });
});

app.post('/api/bank-accounts', (req, res) => {
  const { bank_name, account_type, account_number, current_balance, notes } = req.body;
  db.run(
    "INSERT INTO bank_accounts (bank_name, account_type, account_number, current_balance, last_updated, notes) VALUES (?, ?, ?, ?, ?, ?)",
    [bank_name, account_type, account_number, current_balance, new Date().toISOString(), notes],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

app.delete('/api/bank-accounts/:id', (req, res) => {
  db.run("DELETE FROM bank_accounts WHERE id = ?", [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Portfolio summary
app.get('/api/portfolio/summary', (req, res) => {
  const summary = {};
  
  // Get total property value
  db.get("SELECT SUM(current_value) as total FROM properties", (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    summary.properties = row.total || 0;
    
    // Get total vehicle value
    db.get("SELECT SUM(current_value) as total FROM vehicles", (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      summary.vehicles = row.total || 0;
      
      // Get total stock value
      db.all("SELECT * FROM stocks", (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        const stockTotal = rows.reduce((sum, stock) => {
          return sum + ((liveData.stocks[stock.symbol] || 0) * stock.quantity);
        }, 0);
        summary.stocks = stockTotal;
        
        // Get total crypto value
        db.all("SELECT * FROM crypto", (err, rows) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          const cryptoTotal = rows.reduce((sum, crypto) => {
            return sum + ((liveData.crypto[crypto.symbol] || 0) * crypto.quantity);
          }, 0);
          summary.crypto = cryptoTotal;
          
          // Get total bank balance
          db.all("SELECT * FROM bank_accounts", (err, rows) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            const bankTotal = rows.reduce((sum, account) => {
              return sum + (liveData.bankBalances[account.id] || account.current_balance || 0);
            }, 0);
            summary.bank = bankTotal;
            
            // Calculate total portfolio value
            summary.total = summary.properties + summary.vehicles + summary.stocks + summary.crypto + summary.bank;
            
            res.json(summary);
          });
        });
      });
    });
  });
});

// Serve the main page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server running on port ${PORT}`);
  
  // Initial data update
  updateLiveData();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close();
  server.close();
  process.exit(0);
});