// LandingScreen.js
import React, { useState } from "react";
import useRepairOrders from "../hooks/useRepairOrders";
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
  const isAuthenticated = Boolean(user);
  const { orders, loading: ordersLoading, error } = useRepairOrders();
  const navigate = useNavigate();

  // Toggle between active and historical views
  const [ticketView, setTicketView] = useState("active"); // "active" or "historical"

  // Manage filter modal state and filter criteria
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filter, setFilter] = useState({
    status: "",
    unitType: "",
  });

  // Filter orders using the criteria from the filter modal
  const filteredOrders = orders.filter((order) => {
    if (filter.status && order.status !== filter.status) return false;
    if (
      filter.unitType &&
      order.unitNumber?.details?.UnitType !== filter.unitType
    )
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

  // Group displayed orders by RC.
  // We assume all orders have a roadCallId.
  // In case an order doesn't have one, we group it by its orderId.
  const groupedOrders = displayedOrders.reduce((groups, order) => {
    // Use roadCallNum as the key
    const key = order.roadCallNum || order.orderId;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(order);
    return groups;
  }, {});
  

  return (
    <Container className="my-4 text-center">
      {userLoading ? (
        <div className="text-center">Loading user data...</div>
      ) : isAuthenticated ? (
        <>
          {/* Action Buttons */}
          <Row className="mb-3 text-start">
            <Col>
              <Button
                variant="secondary"
                className="me-2 mb-2"
                onClick={() => setTicketView("active")}
              >
                Active Tickets
              </Button>
              <Button
                variant="secondary"
                className="me-2 mb-2"
                onClick={() => setTicketView("historical")}
              >
                Historical Tickets
              </Button>
              <Button
                variant="secondary"
                className="me-2 mb-2"
                onClick={() => navigate("/breakdown")}
              >
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
              <Button
                variant="outline-secondary"
                onClick={() => setShowFilterModal(true)}
              >
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

          {/* Table displaying the Trimble data */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <Table bordered hover responsive className="text-center">
  <thead className="table-dark">
    <tr style={{ verticalAlign: "middle" }}>
      <th>RC #</th>
      <th>RO #</th>
      <th>Unit Type</th>
      <th>Company</th>
      <th>Unit #</th>
      <th>Complaint</th>
      <th>Location</th>
      <th>Driver Name</th>
      <th>Date</th>
      <th>Time Elapsed</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
  {ordersLoading ? (
    <tr style={{ verticalAlign: "middle" }}>
      <td colSpan="11" className="text-center">
        Loading...
      </td>
    </tr>
  ) : Object.keys(groupedOrders).length === 0 ? (
    <tr style={{ verticalAlign: "middle" }}>
      <td colSpan="11" className="text-center">
        No {ticketView} orders available.
      </td>
    </tr>
  ) : (
    Object.entries(groupedOrders).map(([groupKey, groupOrders], groupIndex) => {
      // Make the difference more obvious for testing
      const backgroundColor = groupIndex % 2 === 0 ? "#ffffcc" : "#ffffff";

      return groupOrders.map((order, index) => (
        <tr
          key={order.orderId}
          style={{
            backgroundColor,
            verticalAlign: "middle",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/ticket/${order.orderId}`)}
        >
          {/* Only show the RC cell once per group */}
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
            <UnitIcon
              unitType={order.unitNumber?.details?.UnitType}
              size={48}
              color="#000"
            />
          </td>
          <td>{order.customer?.NAME || "None"}</td>
          <td>{order.unitNumber?.value}</td>
          <td>{order.componentDescription}</td>
          <td>
            <input
              type="text"
              placeholder="Enter Location"
              defaultValue={order.location || ""}
            />
          </td>
          <td>
            <input
              type="text"
              placeholder="Enter Driver Name"
              defaultValue={order.driverName || ""}
            />
          </td>
          <td>{new Date(order.openedDate).toLocaleDateString()}</td>
          <td>{renderElapsedTimeExtended(order.openedDate)}</td>
          <td>{order.status}</td>
        </tr>
      ));
    })
  )}
</tbody>

</Table>
          </div>
        </>
      ) : (
        // Logged out view
        <div className="text-center py-5">
          <h4>Welcome to TNTX Connect</h4>
          <p>We handle all of your breakdown solutions.</p>
          <p>Please login or register an account to see orders.</p>
          <Button
            variant="dark"
            className="mt-3"
            onClick={() => navigate("/login")}
          >
            Login / Register
          </Button>
        </div>
      )}
    </Container>
  );
};

export default LandingScreen;
