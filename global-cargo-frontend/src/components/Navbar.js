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
          Contact Directory
        </Typography>
        <Button color="inherit" onClick={() => navigate('/organizations')}>Organizations</Button>
        <Button color="inherit" onClick={() => navigate('/contacts')}>Contacts</Button>

        {/* Admin-only Industries button */}
        {isAdmin && (
          <Button color="inherit" onClick={() => navigate('/industries')}>Industries</Button>
        )}

        <Button color="inherit" onClick={logout}>Logout</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;