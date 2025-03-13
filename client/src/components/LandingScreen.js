// LandingScreen.js
import React, { useState } from "react";
import useFilteredTickets from "../hooks/useFilteredTickets";
import useCurrentUser from "../hooks/useCurrentUser";
import { Container, Row, Col, Button, Table, Spinner } from "react-bootstrap";
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

const renderElapsedTimeExtended = (openedDate) => {
  const totalMinutes = differenceInMinutes(new Date(), new Date(openedDate));
  const days = Math.floor(totalMinutes / (60 * 24));
  const remainderMinutes = totalMinutes % (60 * 24);
  const hours = Math.floor(remainderMinutes / 60);
  const minutes = remainderMinutes % 60;
  if (days > 0) {
    return `${days.toString().padStart(2, "0")}:${hours
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

const LandingScreen = () => {
  const { user, loading: userLoading } = useCurrentUser();
  const { tickets, loading: ordersLoading, error } = useFilteredTickets(user);
  const navigate = useNavigate();

  // For debugging: log user and orders
  console.log("User in LandingScreen:", user);
  console.log("Tickets in LandingScreen:", tickets);

  // Toggle between active and historical views
  const [ticketView, setTicketView] = useState("active"); // "active" or "historical"

  // Manage filter modal state and filter criteria
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filter, setFilter] = useState({
    status: "",
    unitType: "",
  });

  // Filtering logic (keep as is, or temporarily bypass for debugging)
  const filteredOrders = (tickets || []).filter((order) => {
    if (filter.status && order.status !== filter.status) return false;
    if (filter.unitType && order.unitNumber?.details?.UnitType !== filter.unitType)
      return false;
    return true;
  });

  // Further filter orders based on active vs. historical view
  const displayedOrders = filteredOrders.filter((order) => {
    if (ticketView === "active") {
      return order.status !== "Closed";
    } else {
      return order.status === "Closed";
    }
  });

  // Group orders by roadCallNum or orderId
  const groupedOrders = displayedOrders.reduce((groups, order) => {
    const key = order.roadCallNum || order.orderId;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(order);
    return groups;
  }, {});

  // If user or orders are still loading, show spinner with message
  if (userLoading || ordersLoading) {
    return (
      <Container className="my-4 text-center">
        <div className="d-flex flex-column justify-content-center align-items-center py-4">
          <Spinner animation="border" role="status" className="mb-2">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <div>Loading tickets...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="my-4 text-center">
      {user ? (
        <>
          {/* Action Buttons */}
          <Row className="mb-3 text-start">
            <Col>
              <Button variant="secondary" className="me-2 mb-2" onClick={() => setTicketView("active")}>
                Active Tickets
              </Button>
              <Button variant="secondary" className="me-2 mb-2" onClick={() => setTicketView("historical")}>
                Historical Tickets
              </Button>
              <Button variant="secondary" className="me-2 mb-2" onClick={() => navigate("/breakdown")}>
                Submit a Breakdown Ticket
              </Button>
            </Col>
          </Row>
          <Row className="align-items-center mb-3">
            <Col className="text-start">
              <Button variant="outline-primary" className="me-2">
                Action Needed Work Orders
              </Button>
              <Button variant="outline-primary">All Active Work Orders</Button>
            </Col>
            <Col className="text-end">
              <Button variant="outline-secondary" onClick={() => setShowFilterModal(true)}>
                Filter
              </Button>
            </Col>
          </Row>

          <FilterModal
            show={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            filter={filter}
            setFilter={setFilter}
          />

          {/* Table displaying the grouped orders */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
            {Object.keys(groupedOrders).length === 0 ? (
              <div>No {ticketView} orders available.</div>
            ) : (
              <Table bordered hover responsive className="text-center">
                <thead className="table-dark">
                  <tr style={{ verticalAlign: "middle" }}>
                    <th>RC #</th>
                    <th>RO #</th>
                    <th>Unit Type</th>
                    <th>Company</th>
                    <th>Unit #</th>
                    <th>Complaint</th>
                    {/* Commenting out Driver Name column for now */}
                    {/* <th>Driver Name</th> */}
                    <th>Date</th>
                    <th>Time Elapsed</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedOrders).map(([groupKey, groupOrders], groupIndex) => {
                    const backgroundColor = groupIndex % 2 === 0 ? "#ffffcc" : "#ffffff";
                    return groupOrders.map((order, index) => (
                      <tr
                        key={order.orderId}
                        style={{ backgroundColor, verticalAlign: "middle", cursor: "pointer" }}
                        onClick={() => navigate(`/ticket/${order.orderId}`)}
                      >
                        {index === 0 && (
                          <td rowSpan={groupOrders.length}>
                            {order.roadCallLink ? (
                              <a
                                href={order.roadCallLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {order.roadCallNum}
                              </a>
                            ) : (
                              order.roadCallNum || "N/A"
                            )}
                          </td>
                        )}
                        <td>
                          <a
                            href={`https://ttx.tmwcloud.com/AMSApp/Orders/RepairCreate.aspx?OrderId=${order.orderId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {order.orderNumber}
                          </a>
                        </td>
                        <td>
                          <UnitIcon unitType={order.unitNumber?.details?.UnitType} size={48} color="#000" />
                        </td>
                        <td>{order.customer?.NAME || "None"}</td>
                        <td>{order.unitNumber?.value}</td>
                        <td>{order.componentDescription}</td>
                        {/* Driver Name column is commented out */}
                        <td>{new Date(order.openedDate).toLocaleDateString()}</td>
                        <td>{renderElapsedTimeExtended(order.openedDate)}</td>
                        <td>{order.status}</td>
                      </tr>
                    ));
                  })}
                </tbody>
              </Table>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-5">
          <h4>Welcome to TNTX Connect</h4>
          <p>We handle all of your breakdown solutions.</p>
          <p>Please login or register an account to see orders.</p>
          <Button variant="dark" className="mt-3" onClick={() => navigate("/login")}>
            Login / Register
          </Button>
        </div>
      )}
    </Container>
  );
};

export default LandingScreen;
