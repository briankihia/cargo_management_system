import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Cargo Management System
        </Typography>

        {/* Common Links */}
        <Button color="inherit" onClick={() => navigate('/dashboard')}>Dashboard</Button>
        <Button color="inherit" onClick={() => navigate('/crew')}>Crew</Button>
        <Button color="inherit" onClick={() => navigate('/ports')}>Ports</Button>
        <Button color="inherit" onClick={() => navigate('/ships')}>Ships</Button>
        <Button color="inherit" onClick={() => navigate('/cargo')}>Cargo</Button>
        <Button color="inherit" onClick={() => navigate('/shipments')}>Shipments</Button>
        <Button color="inherit" onClick={() => navigate('/clients')}>Clients</Button>

        {/* Admin-only Links */}
        {isAdmin && (
          <>
            {/* <Button color="inherit" onClick={() => navigate('/admin-dashboard')}>Admin Dashboard</Button> */}
            {/* <Button color="inherit" onClick={() => navigate('/users')}>Manage Users</Button> */}
          </>
        )}

        {/* Logout */}
        <Button color="inherit" onClick={logout}>Logout</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
