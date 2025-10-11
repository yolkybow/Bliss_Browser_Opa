const express = require('express');
const axios = require('axios');
const { readDb } = require('../storage/jsonDb');

const router = express.Router();

async function fetchCryptoPrices(symbols) {
  // Using CoinGecko simple price API (no key required for basic usage)
  // Map symbols to coingecko ids if needed; we'll accept common ids in holdings
  const ids = symbols.join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd`;
  const { data } = await axios.get(url, { timeout: 10000 });
  return data; // { bitcoin: { usd: 12345 }, ... }
}

router.get('/prices', async (req, res) => {
  try {
    const db = readDb();
    const symbols = Array.from(new Set(db.holdings.crypto.map(h => (h.coingeckoId || h.symbol || '').toLowerCase()).filter(Boolean)));
    if (symbols.length === 0) return res.json({});
    const prices = await fetchCryptoPrices(symbols);
    res.json(prices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch crypto prices', details: err.message });
  }
});

router.get('/value', async (_req, res) => {
  try {
    const db = readDb();
    const holdings = db.holdings.crypto;
    const symbols = Array.from(new Set(holdings.map(h => (h.coingeckoId || h.symbol || '').toLowerCase()).filter(Boolean)));
    if (symbols.length === 0) return res.json({ totalUsd: 0, breakdown: [] });
    const prices = await fetchCryptoPrices(symbols);
    let total = 0;
    const breakdown = holdings.map(h => {
      const key = (h.coingeckoId || h.symbol || '').toLowerCase();
      const price = prices[key]?.usd || 0;
      const value = (h.amount || 0) * price;
      total += value;
      return { id: h.id, key, amount: h.amount || 0, usd: price, valueUsd: value };
    });
    res.json({ totalUsd: total, breakdown });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute crypto value', details: err.message });
  }
});

module.exports = router;
