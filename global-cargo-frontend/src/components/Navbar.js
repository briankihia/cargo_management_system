import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('session'));
    if (session?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${session.token}`;
      setUser(session.user);
    } else {
      alert('You must be logged in to view this page');
      window.location.href = '/login';
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('session');
    navigate('/');
  };

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  // Menu open/close handlers
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Common menu items
  const menuItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Crew', path: '/crew' },
    { label: 'Ports', path: '/ports' },
    { label: 'Ships', path: '/ships' },
    { label: 'Cargo', path: '/cargo' },
    { label: 'Shipments', path: '/shipments' },
    { label: 'Clients', path: '/clients' },
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Cargo Management System
        </Typography>

        {/* Mobile & Tablet View */}
        {isMobileOrTablet ? (
          <>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {menuItems.map((item) => (
                <MenuItem
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    handleMenuClose();
                  }}
                >
                  {item.label}
                </MenuItem>
              ))}
              {isAdmin && (
                <>
                  {/* Uncomment if you want admin-only menu items */}
                  {/* <MenuItem onClick={() => navigate('/admin-dashboard')}>Admin Dashboard</MenuItem> */}
                  {/* <MenuItem onClick={() => navigate('/users')}>Manage Users</MenuItem> */}
                </>
              )}
              <MenuItem
                onClick={() => {
                  logout();
                  handleMenuClose();
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          /* Desktop View */
          <>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </Button>
            ))}
            {isAdmin && (
              <>
                {/* <Button color="inherit" onClick={() => navigate('/admin-dashboard')}>Admin Dashboard</Button> */}
                {/* <Button color="inherit" onClick={() => navigate('/users')}>Manage Users</Button> */}
              </>
            )}
            <Button color="inherit" onClick={logout}>Logout</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
