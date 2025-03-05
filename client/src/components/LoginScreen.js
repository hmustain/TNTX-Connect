import React, { useState, useContext } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const LoginScreen = () => {
  const { setAuthData } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      
      const data = await response.json();
      
      // Save token and user data in AuthContext
      localStorage.setItem('authToken', data.token);
      setAuthData({
        token: data.token,
        user: data.data,
      });
      
      // Redirect to home after successful login
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container style={{ maxWidth: '400px', marginTop: '50px' }}>
      <h2>Login</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formEmail" className="mb-3">
          <Form.Label>Email address</Form.Label>
          <Form.Control 
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formPassword" className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control 
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button variant="dark" type="submit" className='w-100'>
          Login
        </Button>
      </Form>
      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <small>
          Don't have an account? <Link to="/register">Click here to register</Link>
        </small>
      </div>
    </Container>
  );
};

export default LoginScreen;
