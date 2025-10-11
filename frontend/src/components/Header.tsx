import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Chip,
} from '@mui/material';
import {
  AccountCircle,
  Refresh,
  Notifications,
} from '@mui/icons-material';
import { useAuth } from './AuthContext';
import { portfolioService } from '../services/portfolio';

interface HeaderProps {
  onRefreshData: () => void;
  isRefreshing: boolean;
}

const Header: React.FC<HeaderProps> = ({ onRefreshData, isRefreshing }) => {
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Portfolio Tracker
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label="Live Data" 
            color="success" 
            variant="outlined" 
            size="small"
            sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)' }}
          />
          
          <IconButton
            color="inherit"
            onClick={onRefreshData}
            disabled={isRefreshing}
            title="Refresh all data"
          >
            <Refresh sx={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>

          <IconButton color="inherit">
            <Notifications />
          </IconButton>

          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleClose}>Settings</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
      
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </AppBar>
  );
};

export default Header;