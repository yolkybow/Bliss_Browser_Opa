const express = require('express');
const axios = require('axios');
const { readDb } = require('../storage/jsonDb');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const base = `${req.protocol}://${req.get('host')}`;
    const [stocks, crypto, bank] = await Promise.all([
      axios.get(`${base}/api/stocks/value`).then(r => r.data).catch(() => ({ totalUsd: 0, breakdown: [] })),
      axios.get(`${base}/api/crypto/value`).then(r => r.data).catch(() => ({ totalUsd: 0, breakdown: [] })),
      axios.get(`${base}/api/bank/balances`).then(r => r.data).catch(() => ({ accounts: [] })),
    ]);

    const bankTotal = (bank.accounts || []).reduce((sum, a) => sum + (a.available ?? a.current ?? 0), 0);
    const db = readDb();
    const propertiesTotal = (db.properties || []).reduce((sum, p) => sum + (Number(p.valueUsd) || 0), 0);
    const vehiclesTotal = (db.vehicles || []).reduce((sum, v) => sum + (Number(v.valueUsd) || 0), 0);

    res.json({
      totals: {
        stocksUsd: stocks.totalUsd || 0,
        cryptoUsd: crypto.totalUsd || 0,
        bankUsd: bankTotal,
        propertiesUsd: propertiesTotal,
        vehiclesUsd: vehiclesTotal,
        netWorthUsd:
          (stocks.totalUsd || 0) +
          (crypto.totalUsd || 0) +
          bankTotal +
          propertiesTotal +
          vehiclesTotal,
      },
      stocks,
      crypto,
      bank,
      properties: db.properties || [],
      vehicles: db.vehicles || [],
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to aggregate portfolio', details: err.message });
  }
});

module.exports = router;
