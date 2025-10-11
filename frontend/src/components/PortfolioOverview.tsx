import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Home,
  DirectionsCar,
  CurrencyBitcoin,
  ShowChart,
} from '@mui/icons-material';
import { PortfolioSummary } from '../services/portfolio';

interface PortfolioOverviewProps {
  summary: PortfolioSummary | null;
  isLoading: boolean;
}

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ summary, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Portfolio Overview
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Portfolio Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const assetCategories = [
    {
      name: 'Cash & Bank Accounts',
      value: summary.breakdown.cash,
      icon: <AccountBalance />,
      color: '#4CAF50',
    },
    {
      name: 'Stocks',
      value: summary.breakdown.stocks,
      icon: <ShowChart />,
      color: '#2196F3',
    },
    {
      name: 'Cryptocurrency',
      value: summary.breakdown.crypto,
      icon: <CurrencyBitcoin />,
      color: '#FF9800',
    },
    {
      name: 'Real Estate',
      value: summary.breakdown.property,
      icon: <Home />,
      color: '#9C27B0',
    },
    {
      name: 'Vehicles',
      value: summary.breakdown.vehicles,
      icon: <DirectionsCar />,
      color: '#607D8B',
    },
  ];

  const totalAssetsValue = summary.total_assets;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Portfolio Overview
        </Typography>
        
        <Grid container spacing={3}>
          {/* Net Worth */}
          <Grid item xs={12} md={4}>
            <Box textAlign="center" p={2}>
              <Typography variant="h4" color="primary" gutterBottom>
                {formatCurrency(summary.net_worth)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Net Worth
              </Typography>
              <Box display="flex" justifyContent="center" alignItems="center" mt={1}>
                {summary.net_worth >= 0 ? (
                  <Chip 
                    icon={<TrendingUp />} 
                    label="Positive" 
                    color="success" 
                    size="small"
                  />
                ) : (
                  <Chip 
                    icon={<TrendingDown />} 
                    label="Negative" 
                    color="error" 
                    size="small"
                  />
                )}
              </Box>
            </Box>
          </Grid>

          {/* Total Assets */}
          <Grid item xs={12} md={4}>
            <Box textAlign="center" p={2}>
              <Typography variant="h4" color="success.main" gutterBottom>
                {formatCurrency(summary.total_assets)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Assets
              </Typography>
            </Box>
          </Grid>

          {/* Total Liabilities */}
          <Grid item xs={12} md={4}>
            <Box textAlign="center" p={2}>
              <Typography variant="h4" color="error.main" gutterBottom>
                {formatCurrency(summary.total_liabilities)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Liabilities
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Asset Breakdown */}
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Asset Allocation
          </Typography>
          <Grid container spacing={2}>
            {assetCategories.map((category) => {
              const percentage = totalAssetsValue > 0 ? (category.value / totalAssetsValue) * 100 : 0;
              
              return (
                <Grid item xs={12} sm={6} md={2.4} key={category.name}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Box 
                        sx={{ 
                          color: category.color,
                          display: 'flex',
                          justifyContent: 'center',
                          mb: 1
                        }}
                      >
                        {category.icon}
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {category.name}
                      </Typography>
                      <Typography variant="h6" gutterBottom>
                        {formatCurrency(category.value)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {percentage.toFixed(1)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          mt: 1,
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: category.color,
                          },
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        <Box mt={2} textAlign="center">
          <Typography variant="caption" color="text.secondary">
            Last updated: {new Date(summary.last_updated).toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PortfolioOverview;