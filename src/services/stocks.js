const express = require('express');
const axios = require('axios');
const { readDb } = require('../storage/jsonDb');

const router = express.Router();

// Using Yahoo Finance unofficial rapid endpoint via rapidapi alternatives is rate-limited or key-required.
// We'll use Stooq as a free source for simple quotes, or Yahoo CSV fallback.
async function fetchStockQuotes(symbols) {
  const results = {};
  // Try Stooq CSV: https://stooq.com/q/l/?s=aapl,tsla&i=d
  const csvSymbols = symbols.map(s => s.toLowerCase()).join(',');
  const url = `https://stooq.com/q/l/?s=${encodeURIComponent(csvSymbols)}&f=sd2t2ohlcv&h&e=csv`;
  const { data } = await axios.get(url, { timeout: 10000 });
  // Parse CSV
  const lines = data.trim().split(/\r?\n/);
  const header = lines.shift();
  for (const line of lines) {
    const cols = line.split(',');
    const symbol = cols[0]?.toUpperCase();
    const close = parseFloat(cols[6]);
    if (symbol && !Number.isNaN(close)) {
      results[symbol] = { price: close };
    }
  }
  return results;
}

router.get('/quotes', async (_req, res) => {
  try {
    const db = readDb();
    const symbols = Array.from(new Set(db.holdings.stocks.map(h => (h.symbol || '').toUpperCase()).filter(Boolean)));
    if (symbols.length === 0) return res.json({});
    const quotes = await fetchStockQuotes(symbols);
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stock quotes', details: err.message });
  }
});

router.get('/value', async (_req, res) => {
  try {
    const db = readDb();
    const holdings = db.holdings.stocks;
    const symbols = Array.from(new Set(holdings.map(h => (h.symbol || '').toUpperCase()).filter(Boolean)));
    if (symbols.length === 0) return res.json({ totalUsd: 0, breakdown: [] });
    const quotes = await fetchStockQuotes(symbols);
    let total = 0;
    const breakdown = holdings.map(h => {
      const symbol = (h.symbol || '').toUpperCase();
      const price = quotes[symbol]?.price || 0;
      const value = (h.shares || 0) * price;
      total += value;
      return { id: h.id, symbol, shares: h.shares || 0, usd: price, valueUsd: value };
    });
    res.json({ totalUsd: total, breakdown });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute stock value', details: err.message });
  }
});

module.exports = router;
