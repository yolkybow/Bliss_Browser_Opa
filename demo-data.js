const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./portfolio.db');

// Sample data
const sampleData = {
  properties: [
    {
      name: 'Downtown Condo',
      address: '123 Main St, New York, NY 10001',
      purchase_price: 450000,
      current_value: 520000,
      purchase_date: '2020-03-15',
      property_type: 'condo',
      notes: 'Great location, recently renovated'
    },
    {
      name: 'Rental House',
      address: '456 Oak Ave, Austin, TX 78701',
      purchase_price: 280000,
      current_value: 320000,
      purchase_date: '2019-08-22',
      property_type: 'house',
      notes: 'Rental property, good cash flow'
    }
  ],
  vehicles: [
    {
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      purchase_price: 25000,
      current_value: 18000,
      purchase_date: '2020-01-10',
      mileage: 45000,
      condition: 'good',
      notes: 'Reliable daily driver'
    },
    {
      make: 'BMW',
      model: 'X5',
      year: 2019,
      purchase_price: 55000,
      current_value: 42000,
      purchase_date: '2019-06-05',
      mileage: 38000,
      condition: 'excellent',
      notes: 'Luxury SUV, well maintained'
    }
  ],
  stocks: [
    {
      symbol: 'AAPL',
      quantity: 50,
      purchase_price: 150.00,
      purchase_date: '2023-01-15',
      notes: 'Apple Inc. - Tech growth stock'
    },
    {
      symbol: 'MSFT',
      quantity: 30,
      purchase_price: 280.00,
      purchase_date: '2023-02-20',
      notes: 'Microsoft Corp. - Cloud computing leader'
    },
    {
      symbol: 'GOOGL',
      quantity: 20,
      purchase_price: 95.00,
      purchase_date: '2023-03-10',
      notes: 'Alphabet Inc. - Search and advertising'
    }
  ],
  crypto: [
    {
      symbol: 'bitcoin',
      quantity: 0.5,
      purchase_price: 45000.00,
      purchase_date: '2023-04-01',
      notes: 'Bitcoin - Digital gold'
    },
    {
      symbol: 'ethereum',
      quantity: 5.0,
      purchase_price: 2800.00,
      purchase_date: '2023-05-15',
      notes: 'Ethereum - Smart contract platform'
    },
    {
      symbol: 'cardano',
      quantity: 1000,
      purchase_price: 0.45,
      purchase_date: '2023-06-01',
      notes: 'Cardano - Proof of stake blockchain'
    }
  ],
  bankAccounts: [
    {
      bank_name: 'Chase Bank',
      account_type: 'checking',
      account_number: '1234',
      current_balance: 15000.00,
      notes: 'Primary checking account'
    },
    {
      bank_name: 'Wells Fargo',
      account_type: 'savings',
      account_number: '5678',
      current_balance: 25000.00,
      notes: 'High-yield savings account'
    },
    {
      bank_name: 'Fidelity',
      account_type: 'investment',
      account_number: '9012',
      current_balance: 75000.00,
      notes: 'Investment account for retirement'
    }
  ]
};

// Insert sample data
function insertSampleData() {
  console.log('Inserting sample data...');
  
  // Insert properties
  sampleData.properties.forEach(property => {
    db.run(
      "INSERT INTO properties (name, address, purchase_price, current_value, purchase_date, property_type, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [property.name, property.address, property.purchase_price, property.current_value, property.purchase_date, property.property_type, property.notes]
    );
  });
  
  // Insert vehicles
  sampleData.vehicles.forEach(vehicle => {
    db.run(
      "INSERT INTO vehicles (make, model, year, purchase_price, current_value, purchase_date, mileage, condition, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [vehicle.make, vehicle.model, vehicle.year, vehicle.purchase_price, vehicle.current_value, vehicle.purchase_date, vehicle.mileage, vehicle.condition, vehicle.notes]
    );
  });
  
  // Insert stocks
  sampleData.stocks.forEach(stock => {
    db.run(
      "INSERT INTO stocks (symbol, quantity, purchase_price, purchase_date, notes) VALUES (?, ?, ?, ?, ?)",
      [stock.symbol, stock.quantity, stock.purchase_price, stock.purchase_date, stock.notes]
    );
  });
  
  // Insert crypto
  sampleData.crypto.forEach(crypto => {
    db.run(
      "INSERT INTO crypto (symbol, quantity, purchase_price, purchase_date, notes) VALUES (?, ?, ?, ?, ?)",
      [crypto.symbol, crypto.quantity, crypto.purchase_price, crypto.purchase_date, crypto.notes]
    );
  });
  
  // Insert bank accounts
  sampleData.bankAccounts.forEach(account => {
    db.run(
      "INSERT INTO bank_accounts (bank_name, account_type, account_number, current_balance, last_updated, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [account.bank_name, account.account_type, account.account_number, account.current_balance, new Date().toISOString(), account.notes]
    );
  });
  
  console.log('Sample data inserted successfully!');
  console.log('You can now start the server with: npm start');
  console.log('Then visit: http://localhost:3001');
}

// Check if data already exists
db.get("SELECT COUNT(*) as count FROM properties", (err, row) => {
  if (err) {
    console.error('Error checking existing data:', err);
    return;
  }
  
  if (row.count > 0) {
    console.log('Database already contains data. Skipping sample data insertion.');
    console.log('To reset the database, delete portfolio.db and run this script again.');
  } else {
    insertSampleData();
  }
  
  db.close();
});