import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Alert,
  Snackbar,
} from '@mui/material';
import Header from '../components/Header';
import PortfolioOverview from '../components/PortfolioOverview';
import StockTracker from '../components/StockTracker';
import { PortfolioSummary, portfolioService } from '../services/portfolio';

const Dashboard: React.FC = () => {
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const summary = await portfolioService.getPortfolioSummary();
      setPortfolioSummary(summary);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch portfolio data');
      console.error('Error fetching portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = async () => {
    try {
      setRefreshing(true);
      await portfolioService.refreshPortfolioData();
      await fetchPortfolioData();
      setSuccessMessage('Portfolio data refreshed successfully');
      setError(null);
    } catch (err: any) {
      setError('Failed to refresh portfolio data');
      console.error('Error refreshing data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
    setError(null);
  };

  return (
    <Box>
      <Header onRefreshData={handleRefreshData} isRefreshing={refreshing} />
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Your Portfolio Dashboard
        </Typography>
        
        <Grid container spacing={3}>
          {/* Portfolio Overview */}
          <Grid item xs={12}>
            <PortfolioOverview 
              summary={portfolioSummary} 
              isLoading={loading} 
            />
          </Grid>

          {/* Stock Tracker */}
          <Grid item xs={12}>
            <StockTracker />
          </Grid>

          {/* Placeholder for other components */}
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                p: 3, 
                border: '2px dashed #ccc', 
                borderRadius: 2, 
                textAlign: 'center',
                backgroundColor: '#f5f5f5'
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Cryptocurrency Tracker
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Coming soon - Track your crypto holdings with live price feeds
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                p: 3, 
                border: '2px dashed #ccc', 
                borderRadius: 2, 
                textAlign: 'center',
                backgroundColor: '#f5f5f5'
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Bank Accounts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Coming soon - Connect your bank accounts for live balance tracking
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                p: 3, 
                border: '2px dashed #ccc', 
                borderRadius: 2, 
                textAlign: 'center',
                backgroundColor: '#f5f5f5'
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Property Portfolio
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Coming soon - Manage your real estate investments
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                p: 3, 
                border: '2px dashed #ccc', 
                borderRadius: 2, 
                textAlign: 'center',
                backgroundColor: '#f5f5f5'
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Vehicle Assets
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Coming soon - Track your vehicle values and loans
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={!!successMessage || !!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {successMessage ? (
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        ) : (
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default Dashboard;