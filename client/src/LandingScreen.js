import React from 'react';
import { Navbar, Container, Nav, Button, Row, Col, Table } from 'react-bootstrap';

const LandingScreen = () => {
  // Simulate authentication status and user data
  const isAuthenticated = false; // Change to true to simulate a logged-in user
  const user = {
    name: "John Doe",
    company: "TNTX Inc.",
  };

  return (
    <>
      {/* Header */}
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#">
            {/* Replace with your logo image if available */}
            <img
              alt="TNTX Logo"
              src="/path-to-your-logo.png"
              width="30"
              height="30"
              className="d-inline-block align-top me-2"
            />
            TNTX Connect Portal
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {isAuthenticated ? (
                <Nav.Item className="text-end">
                  <div>Hello, {user.name}</div>
                  <div className="small">{user.company}</div>
                  <Button variant="link" className="p-0">View Profile</Button>
                  <br />
                  <Button variant="link" className="p-0">Log Out</Button>
                </Nav.Item>
              ) : (
                <Nav.Item>
                  <Button variant="outline-light">Login / Register</Button>
                </Nav.Item>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Primary Call-to-Action Buttons Row */}
      <Container className="my-4">
        <Row className="mb-3">
          <Col>
            <Button variant="secondary" className="me-2 mb-2">Active Tickets</Button>
            <Button variant="secondary" className="me-2 mb-2">Historical Tickets</Button>
            <Button variant="secondary" className="me-2 mb-2">Chat with an Agent</Button>
            <Button variant="secondary" className="me-2 mb-2">Submit a Breakdown Ticket</Button>
            <Button variant="secondary" className="me-2 mb-2">Location Map</Button>
          </Col>
        </Row>

        {/* Additional Call-to-Action Row */}
        <Row className="align-items-center mb-3">
          <Col>
            <Button variant="outline-primary" className="me-2">Action Needed Work Orders</Button>
            <Button variant="outline-primary">All Active Work Orders</Button>
          </Col>
          <Col className="text-end">
            <Button variant="outline-secondary">Filter</Button>
          </Col>
        </Row>

        {/* Main Content: Work Orders Table or Login Prompt */}
        {isAuthenticated ? (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Work Order #</th>
                <th>Unit Type</th>
                <th>Tractor #</th>
                <th>Trailer #</th>
                <th>Complaint Type</th>
                <th>Location</th>
                <th>Fleet Rep</th>
                <th>Auth #</th>
                <th>Date</th>
                <th>Time Elapsed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Dynamic rows to be populated based on work order data */}
              <tr>
                <td colSpan="11" className="text-center">No work orders available.</td>
              </tr>
            </tbody>
          </Table>
        ) : (
          <div className="text-center py-5">
            <h4>Please log in to view work orders.</h4>
            <Button variant="primary" className="mt-3">Login</Button>
          </div>
        )}
      </Container>
    </>
  );
};

export default LandingScreen;
