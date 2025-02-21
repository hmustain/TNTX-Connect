import React from 'react';
import { Navbar, Container, Nav, Button, Row, Col, Card } from 'react-bootstrap';

const LandingScreen = () => {
  return (
    <>
      {/* Navigation */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#">TNTX Connect</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#">Home</Nav.Link>
              <Nav.Link href="#">Features</Nav.Link>
              <Nav.Link href="#">Pricing</Nav.Link>
              <Nav.Link href="#">Contact</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <section className="hero text-center py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <Container>
          <h1 className="display-4">Welcome to TNTX Connect</h1>
          <p className="lead">
            Connecting ideas, empowering connections. Experience a seamless platform for digital engagement.
          </p>
          <Button variant="primary" size="lg">Get Started</Button>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features py-5">
        <Container>
          <Row>
            <Col md={4} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Feature One</Card.Title>
                  <Card.Text>
                    Brief description of Feature One goes here.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Feature Two</Card.Title>
                  <Card.Text>
                    Brief description of Feature Two goes here.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Feature Three</Card.Title>
                  <Card.Text>
                    Brief description of Feature Three goes here.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-light py-4 text-center">
        <Container>
          <p className="mb-0">© 2025 TNTX Connect. All rights reserved.</p>
        </Container>
      </footer>
    </>
  );
};

export default LandingScreen;
