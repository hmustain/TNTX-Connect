import React, { useState } from "react";
import useTickets from "../hooks/useTickets";
import useCurrentUser from "../hooks/useCurrentUser";
import { Container, Row, Col, Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { differenceInMinutes } from "date-fns";
import { PiTruckTrailerFill } from "react-icons/pi";
import { FaTrailer } from "react-icons/fa6";
import FilterModal from "./FilterModal";

const UnitIcon = ({ unitType, size = 48, color = "#000" }) => {
  if (unitType === "tractor") {
    return <PiTruckTrailerFill size={size} color={color} />;
  } else if (unitType === "trailer") {
    return <FaTrailer size={size} color={color} />;
  } else {
    return null;
  }
};

const renderElapsedTimeExtended = (createdAt) => {
  const totalMinutes = differenceInMinutes(new Date(), new Date(createdAt));
  const days = Math.floor(totalMinutes / (60 * 24));
  const remainderMinutes = totalMinutes % (60 * 24);
  const hours = Math.floor(remainderMinutes / 60);
  const minutes = remainderMinutes % 60;

  if (days > 0) {
    return `${days.toString().padStart(2, "0")}:${hours
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

const LandingScreen = () => {
  const { user, loading: userLoading } = useCurrentUser();
  const isAuthenticated = Boolean(user);
  const { tickets, loading: ticketsLoading } = useTickets(user);
  const navigate = useNavigate();

  // Filter state & modal visibility
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filter, setFilter] = useState({
    status: "",
    unitType: "",
    // Add more fields as needed
  });

  // Filter tickets based on selected criteria
  const filteredTickets = tickets.filter((ticket) => {
    if (filter.status && ticket.status !== filter.status) return false;
    if (filter.unitType && ticket.unitAffected !== filter.unitType) return false;
    return true;
  });

  return (
    <Container className="my-4 text-center">
      {userLoading ? (
        <div className="text-center">Loading user data...</div>
      ) : isAuthenticated ? (
        <>
          {/* CTA Buttons Row (left-justified) */}
          <Row className="mb-3 text-start">
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
            <Col className="text-start">
              <Button variant="outline-primary" className="me-2">
                Action Needed Work Orders
              </Button>
              <Button variant="outline-primary">
                All Active Work Orders
              </Button>
            </Col>
            <Col className="text-end">
              <Button variant="outline-secondary" onClick={() => setShowFilterModal(true)}>
                Filter
              </Button>
            </Col>
          </Row>

          {/* Filter Modal */}
          <FilterModal
            show={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            filter={filter}
            setFilter={setFilter}
          />

          {/* Centered Table Container */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <Table striped bordered hover responsive className="text-center">
              <thead className="table-dark">
                <tr style={{ verticalAlign: "middle" }}>
                  <th>Ticket #</th>
                  <th>Unit Type</th>
                  <th>Company</th>
                  <th>Tractor #</th>
                  <th>Trailer #</th>
                  <th>Complaint</th>
                  <th>Location</th>
                  <th>Driver Name</th>
                  <th>Auth #</th>
                  <th>Date</th>
                  <th>Time Elapsed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ticketsLoading ? (
                  <tr style={{ verticalAlign: "middle" }}>
                    <td colSpan="12" className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr style={{ verticalAlign: "middle" }}>
                    <td colSpan="12" className="text-center">
                      No work orders available.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr
                      key={ticket._id}
                      style={{ verticalAlign: "middle", cursor: "pointer" }}
                      onClick={() => navigate(`/ticket/${ticket._id}`)}
                    >
                      <td>{ticket.ticketNumber}</td>
                      <td>
                        <UnitIcon unitType={ticket.unitAffected} size={48} color="#000" />
                      </td>
                      <td>
                        {ticket.company && ticket.company.name ? ticket.company.name : "None"}
                      </td>
                      <td>{ticket.truckNumber}</td>
                      <td>{ticket.trailerNumber}</td>
                      <td>{ticket.complaint}</td>
                      <td>{ticket.currentLocation}</td>
                      <td>{ticket.user && ticket.user.name}</td>
                      <td>{"AUTH-1234"}</td>
                      <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                      <td>{renderElapsedTimeExtended(ticket.createdAt)}</td>
                      <td>{ticket.status || "Pending"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </>
      ) : (
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
