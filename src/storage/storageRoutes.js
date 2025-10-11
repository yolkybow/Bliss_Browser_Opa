const express = require('express');
const { nanoid } = require('nanoid');
const { readDb, writeDb } = require('./jsonDb');

const router = express.Router();

// Properties CRUD
router.get('/properties', (_req, res) => {
  const db = readDb();
  res.json(db.properties);
});

router.post('/properties', (req, res) => {
  const db = readDb();
  const newItem = { id: nanoid(), ...req.body };
  db.properties.push(newItem);
  writeDb(db);
  res.status(201).json(newItem);
});

router.put('/properties/:id', (req, res) => {
  const db = readDb();
  const idx = db.properties.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.properties[idx] = { ...db.properties[idx], ...req.body };
  writeDb(db);
  res.json(db.properties[idx]);
});

router.delete('/properties/:id', (req, res) => {
  const db = readDb();
  const before = db.properties.length;
  db.properties = db.properties.filter(p => p.id !== req.params.id);
  if (db.properties.length === before) return res.status(404).json({ error: 'Not found' });
  writeDb(db);
  res.status(204).end();
});

// Vehicles CRUD
router.get('/vehicles', (_req, res) => {
  const db = readDb();
  res.json(db.vehicles);
});

router.post('/vehicles', (req, res) => {
  const db = readDb();
  const newItem = { id: nanoid(), ...req.body };
  db.vehicles.push(newItem);
  writeDb(db);
  res.status(201).json(newItem);
});

router.put('/vehicles/:id', (req, res) => {
  const db = readDb();
  const idx = db.vehicles.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.vehicles[idx] = { ...db.vehicles[idx], ...req.body };
  writeDb(db);
  res.json(db.vehicles[idx]);
});

router.delete('/vehicles/:id', (req, res) => {
  const db = readDb();
  const before = db.vehicles.length;
  db.vehicles = db.vehicles.filter(p => p.id !== req.params.id);
  if (db.vehicles.length === before) return res.status(404).json({ error: 'Not found' });
  writeDb(db);
  res.status(204).end();
});

// Holdings CRUD (stocks, crypto)
router.get('/holdings', (_req, res) => {
  const db = readDb();
  res.json(db.holdings);
});

router.post('/holdings/:type', (req, res) => {
  const { type } = req.params; // 'stocks' | 'crypto'
  const db = readDb();
  if (!db.holdings[type]) return res.status(400).json({ error: 'Invalid holding type' });
  const newItem = { id: nanoid(), ...req.body };
  db.holdings[type].push(newItem);
  writeDb(db);
  res.status(201).json(newItem);
});

router.put('/holdings/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const db = readDb();
  if (!db.holdings[type]) return res.status(400).json({ error: 'Invalid holding type' });
  const idx = db.holdings[type].findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.holdings[type][idx] = { ...db.holdings[type][idx], ...req.body };
  writeDb(db);
  res.json(db.holdings[type][idx]);
});

router.delete('/holdings/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const db = readDb();
  if (!db.holdings[type]) return res.status(400).json({ error: 'Invalid holding type' });
  const before = db.holdings[type].length;
  db.holdings[type] = db.holdings[type].filter(p => p.id !== id);
  if (db.holdings[type].length === before) return res.status(404).json({ error: 'Not found' });
  writeDb(db);
  res.status(204).end();
});

module.exports = router;
