import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Refresh,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { StockHolding, portfolioService } from '../services/portfolio';

const StockTracker: React.FC = () => {
  const [stocks, setStocks] = useState<StockHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<StockHolding | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    symbol: '',
    shares: '',
    average_cost: '',
    broker: '',
  });

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const data = await portfolioService.getStockHoldings();
      setStocks(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch stock holdings');
      console.error('Error fetching stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshPrices = async () => {
    try {
      setRefreshing(true);
      await portfolioService.refreshStockPrices();
      await fetchStocks();
      setError(null);
    } catch (err) {
      setError('Failed to refresh stock prices');
      console.error('Error refreshing prices:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        symbol: formData.symbol.toUpperCase(),
        shares: parseFloat(formData.shares),
        average_cost: parseFloat(formData.average_cost),
        broker: formData.broker,
      };

      if (editingStock) {
        await portfolioService.updateStockHolding(editingStock.id, data);
      } else {
        await portfolioService.createStockHolding(data);
      }

      await fetchStocks();
      handleCloseDialog();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save stock holding');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this stock holding?')) {
      try {
        await portfolioService.deleteStockHolding(id);
        await fetchStocks();
        setError(null);
      } catch (err) {
        setError('Failed to delete stock holding');
      }
    }
  };

  const handleEdit = (stock: StockHolding) => {
    setEditingStock(stock);
    setFormData({
      symbol: stock.symbol,
      shares: stock.shares.toString(),
      average_cost: stock.average_cost.toString(),
      broker: stock.broker,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStock(null);
    setFormData({ symbol: '', shares: '', average_cost: '', broker: '' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateGainLoss = (shares: number, avgCost: number, currentPrice: number) => {
    const costBasis = shares * avgCost;
    const currentValue = shares * currentPrice;
    const gainLoss = currentValue - costBasis;
    const gainLossPercent = (gainLoss / costBasis) * 100;
    return { gainLoss, gainLossPercent };
  };

  const totalValue = stocks.reduce((sum, stock) => sum + stock.total_value, 0);
  const totalCostBasis = stocks.reduce((sum, stock) => sum + (stock.shares * stock.average_cost), 0);
  const totalGainLoss = totalValue - totalCostBasis;
  const totalGainLossPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Loading stock holdings...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Stock Portfolio</Typography>
          <Box>
            <Button
              startIcon={<Refresh />}
              onClick={handleRefreshPrices}
              disabled={refreshing}
              sx={{ mr: 1 }}
            >
              {refreshing ? 'Refreshing...' : 'Refresh Prices'}
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setDialogOpen(true)}
            >
              Add Stock
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Portfolio Summary */}
        <Box mb={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{formatCurrency(totalValue)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Value
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">{formatCurrency(totalCostBasis)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Cost Basis
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Box display="flex" alignItems="center" justifyContent="center">
                  <Typography
                    variant="h6"
                    color={totalGainLoss >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatCurrency(totalGainLoss)}
                  </Typography>
                  {totalGainLoss >= 0 ? (
                    <TrendingUp color="success" sx={{ ml: 1 }} />
                  ) : (
                    <TrendingDown color="error" sx={{ ml: 1 }} />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Gain/Loss ({totalGainLossPercent.toFixed(2)}%)
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                <TableCell>Company</TableCell>
                <TableCell align="right">Shares</TableCell>
                <TableCell align="right">Avg Cost</TableCell>
                <TableCell align="right">Current Price</TableCell>
                <TableCell align="right">Total Value</TableCell>
                <TableCell align="right">Gain/Loss</TableCell>
                <TableCell>Broker</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stocks.map((stock) => {
                const { gainLoss, gainLossPercent } = calculateGainLoss(
                  stock.shares,
                  stock.average_cost,
                  stock.current_price
                );

                return (
                  <TableRow key={stock.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {stock.symbol}
                        </Typography>
                        <Chip
                          label={stock.sector}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{stock.company_name}</TableCell>
                    <TableCell align="right">{stock.shares}</TableCell>
                    <TableCell align="right">{formatCurrency(stock.average_cost)}</TableCell>
                    <TableCell align="right">
                      <Box>
                        {formatCurrency(stock.current_price)}
                        <Typography variant="caption" display="block" color="text.secondary">
                          Updated: {new Date(stock.last_price_update).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">{formatCurrency(stock.total_value)}</TableCell>
                    <TableCell align="right">
                      <Box>
                        <Typography
                          color={gainLoss >= 0 ? 'success.main' : 'error.main'}
                          fontWeight="bold"
                        >
                          {formatCurrency(gainLoss)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color={gainLoss >= 0 ? 'success.main' : 'error.main'}
                        >
                          ({gainLossPercent.toFixed(2)}%)
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{stock.broker}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleEdit(stock)} size="small">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(stock.id)} size="small">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {stocks.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              No stock holdings found. Add your first stock to get started.
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingStock ? 'Edit Stock Holding' : 'Add Stock Holding'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock Symbol"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                placeholder="e.g., AAPL"
                disabled={!!editingStock}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Shares"
                type="number"
                value={formData.shares}
                onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Average Cost per Share"
                type="number"
                value={formData.average_cost}
                onChange={(e) => setFormData({ ...formData, average_cost: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Broker"
                value={formData.broker}
                onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                placeholder="e.g., Robinhood, Fidelity"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.symbol || !formData.shares || !formData.average_cost}
          >
            {editingStock ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default StockTracker;