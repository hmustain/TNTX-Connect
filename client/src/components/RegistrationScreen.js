import React, { useState, useContext } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const RegistrationScreen = () => {
  const { setAuthData } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('driver'); // Default role is driver
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send role along with other fields
        body: JSON.stringify({ name, email, companyName, password, role }),
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Registration failed');
      }
      
      const data = await response.json();
      
      // Save token and user data in AuthContext
      localStorage.setItem('authToken', data.token);
      setAuthData({
        token: data.token,
        user: data.data,
      });
      
      // Redirect to home or dashboard after successful registration
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container style={{ maxWidth: '400px', marginTop: '50px' }}>
      <h2>Register</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formName" className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control 
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formEmail" className="mb-3">
          <Form.Label>Email address</Form.Label>
          <Form.Control 
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formCompany" className="mb-3">
          <Form.Label>Company Name</Form.Label>
          <Form.Control 
            type="text"
            placeholder="Enter company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formRole" className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="driver">Driver</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
            <option value="company_user">Company User</option>
          </Form.Select>
        </Form.Group>
        <Form.Group controlId="formPassword" className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control 
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button variant="dark" type="submit" className="w-100">
          Register
        </Button>
      </Form>
      <div style={{ marginBottom: '15px', textAlign: 'center'}}>
        <small>
          Already have an account? <Link to="/login">Click here to login</Link>
        </small>
      </div>
    </Container>
  );
};

export default RegistrationScreen;
