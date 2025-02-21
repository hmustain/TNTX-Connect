import React from 'react';
import { Navbar, Container, Nav, Button, Row, Col, Table } from 'react-bootstrap';

const LandingScreen = () => {
  // Simulate authentication status and user data
  const isAuthenticated = true;
  const user = {
    name: "John Doe",
    company: "TNTX Inc.",
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header */}
      <Navbar bg="dark" variant="dark" expand="lg" className="py-3">
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center w-100">
            {/* Left side: Logo and Portal Title */}
            <div className="d-flex align-items-center">
              <img
                alt="TNTX Logo"
                src="/images/TNTX-SOLUTIONS-LOGO.png"
                style={{ width: "150px", height: "auto", marginRight: "10px" }}
              />
              <span className="text-white" style={{ fontSize: "1.5rem", fontWeight: "bold", lineHeight: "1.2" }}>
                TNTX Connect Portal
              </span>
            </div>
            {/* Right side: User Info or Login/Register */}
            <div>
              {isAuthenticated ? (
                <div className="text-end text-white">
                  <div>Hello, {user.name}</div>
                  <div className="small">{user.company}</div>
                  <Button variant="link" className="p-0 text-white hover-underline">
                    View Profile
                  </Button>
                  <br />
                  <Button variant="link" className="p-0 text-white hover-underline">
                    Log Out
                  </Button>
                </div>
              ) : (
                <Nav.Item>
                  <Button variant="outline-light">Login / Register</Button>
                </Nav.Item>
              )}
            </div>
          </div>
        </Container>
      </Navbar>

      {/* Main Content */}
      <main className="flex-grow-1">
        <Container className="my-4">
          {isAuthenticated ? (
            <>
              {/* Primary Call-to-Action Buttons Row */}
              <Row className="mb-3">
                <Col>
                  <Button variant="secondary" className="me-2 mb-2">Active Tickets</Button>
                  <Button variant="secondary" className="me-2 mb-2">Historical Tickets</Button>
                  <Button variant="secondary" className="me-2 mb-2">Chat with an Agent</Button>
                  <Button variant="secondary" className="me-2 mb-2">Submit a Breakdown Ticket</Button>
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

              {/* Work Orders Table */}
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
                  {/* Replace with dynamic rows */}
                  <tr>
                    <td colSpan="11" className="text-center">No work orders available.</td>
                  </tr>
                </tbody>
              </Table>
            </>
          ) : (
            // Logged-out view: only instructions to log in/register
            <div className="text-center py-5">
              <h4>Please log in to view work orders.</h4>
              <p>Login or register an account to access and manage your work orders.</p>
              <Button variant="dark" className="mt-3">Login / Register</Button>
            </div>
          )}
        </Container>
      </main>

      {/* Footer */}
      <footer className="bg-dark text-light py-4 text-center mt-auto">
        <Container>
          <p className="mb-0">© 2025 TNTX Connect. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
};

export default LandingScreen;
