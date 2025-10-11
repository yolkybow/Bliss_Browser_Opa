const express = require('express');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const router = express.Router();

function getPlaidClient() {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  const envName = (process.env.PLAID_ENV || 'sandbox').toLowerCase();
  if (!clientId || !secret) return null;
  const configuration = new Configuration({
    basePath: PlaidEnvironments[envName] || PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': clientId,
        'PLAID-SECRET': secret,
      },
    },
  });
  return new PlaidApi(configuration);
}

router.get('/balances', async (_req, res) => {
  try {
    const client = getPlaidClient();
    if (!client) {
      return res.status(200).json({
        warning: 'Plaid not configured. Provide PLAID_CLIENT_ID and PLAID_SECRET to enable live bank balances.',
        accounts: [],
      });
    }
    // In a real app, we'd store access_token per user. For demo, read from env.
    const accessToken = process.env.PLAID_ACCESS_TOKEN;
    if (!accessToken) {
      return res.status(200).json({
        warning: 'PLAID_ACCESS_TOKEN missing. Link an account to fetch balances.',
        accounts: [],
      });
    }
    const response = await client.accountsBalanceGet({ access_token: accessToken });
    const accounts = response.data.accounts.map(a => ({
      name: a.name,
      mask: a.mask,
      type: a.type,
      subtype: a.subtype,
      current: a.balances.current,
      available: a.balances.available,
      isoCurrencyCode: a.balances.iso_currency_code,
    }));
    res.json({ accounts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bank balances', details: err.message });
  }
});

module.exports = router;
