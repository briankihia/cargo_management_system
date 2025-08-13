import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './RegistrationForm.css';

function Registrationform() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/accounts/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to register. Please try again.');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token); // Save JWT token
      alert('Registration successful!');
      navigate('/'); // Redirect to login page
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Sign up</h2>
      {error && <p className="error-message">{error}</p>}
      <form className="signup-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="firstName">First name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <label htmlFor="lastName">Last name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="create-account-button">CREATE ACCOUNT</button>
      </form>
      <div className="login-link">
        <a href="/login">Login</a>
      </div>
    </div>
  );
}

export default Registrationform;