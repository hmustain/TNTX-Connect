import React from "react";
import useTickets from "../hooks/useTickets";
import useCurrentUser from "../hooks/useCurrentUser";
import { Container, Row, Col, Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const LandingScreen = () => {
  const { user, loading: userLoading } = useCurrentUser();
  const isAuthenticated = Boolean(user);
  const { tickets, loading: ticketsLoading } = useTickets(user);
  const navigate = useNavigate();

  return (
    <Container className="my-4">
      {userLoading ? (
        <div className="text-center">Loading user data...</div>
      ) : isAuthenticated ? (
        <>
          {/* Authenticated view with tickets */}
          <Row className="mb-3">
            <Col>
              <Button variant="secondary" className="me-2 mb-2">
                Active Tickets
              </Button>
              <Button variant="secondary" className="me-2 mb-2">
                Historical Tickets
              </Button>
              <Button variant="secondary" className="me-2 mb-2">
                Chat with an Agent
              </Button>
              <Button variant="secondary" className="me-2 mb-2">
                Submit a Breakdown Ticket
              </Button>
            </Col>
          </Row>
          <Row className="align-items-center mb-3">
            <Col>
              <Button variant="outline-primary" className="me-2">
                Action Needed Work Orders
              </Button>
              <Button variant="outline-primary">
                All Active Work Orders
              </Button>
            </Col>
            <Col className="text-end">
              <Button variant="outline-secondary">Filter</Button>
            </Col>
          </Row>
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
              {ticketsLoading ? (
                <tr>
                  <td colSpan="11" className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center">
                    No work orders available.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td>{ticket.ticketNumber}</td>
                    <td>{ticket.unitAffected}</td>
                    <td>{ticket.truckNumber}</td>
                    <td>{ticket.trailerNumber}</td>
                    <td>{ticket.complaint}</td>
                    <td>{ticket.currentLocation}</td>
                    <td>{"John Doe"}</td>
                    <td>{"AUTH-1234"}</td>
                    <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td>{"2 hrs ago"}</td>
                    <td>{"Pending"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </>
      ) : (
        // Minimal logged-out view with welcome message and CTA
        <div className="text-center py-5">
          <h4>Welcome to TNTX Connect</h4>
          <p>We handle all of your breakdown solutions.</p>
          <p>Please login or register an account to see tickets.</p>
          <Button variant="dark" className="mt-3" onClick={() => navigate("/login")}>
            Login / Register
          </Button>
        </div>
      )}
    </Container>
  );
};

export default LandingScreen;
