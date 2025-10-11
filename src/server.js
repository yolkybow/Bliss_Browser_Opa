require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
const portfolioRouter = require('./services/portfolio');
const cryptoRouter = require('./services/crypto');
const stocksRouter = require('./services/stocks');
const bankRouter = require('./services/bank');
const storageRouter = require('./storage/storageRoutes');

app.use('/api/portfolio', portfolioRouter);
app.use('/api/crypto', cryptoRouter);
app.use('/api/stocks', stocksRouter);
app.use('/api/bank', bankRouter);
app.use('/api/storage', storageRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Resilient port binding: use PORT if provided; if busy, fall back to a random free port.
const desiredPort = Number(process.env.PORT) || 3000;

function listenOn(portToUse) {
  const server = app.listen(portToUse, '0.0.0.0', () => {
    const actualPort = server.address().port;
    console.log(`Server listening on http://localhost:${actualPort}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE' && portToUse !== 0) {
      console.warn(`Port ${portToUse} in use, retrying on a random free port...`);
      listenOn(0);
    } else {
      throw err;
    }
  });
}

listenOn(desiredPort);
