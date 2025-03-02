import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form
} from "react-bootstrap";

const TicketScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`/api/tickets/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Unauthorized or Ticket not found");
        const data = await res.json();
        if (data.success) {
          setTicket(data.data);
        }
      } catch (err) {
        console.error("Error fetching ticket:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id, token]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setChatLoading(true);
        const res = await fetch(`/api/chats?ticketId=${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Unauthorized or Chat not found");
        const data = await res.json();
        if (data.success) {
          setChats(data.data);
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
      } finally {
        setChatLoading(false);
      }
    };
    fetchChats();
  }, [id, token]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticket: id, message: chatMessage }),
      });
      if (!res.ok) throw new Error("Error sending message");
      const data = await res.json();
      if (data.success) {
        setChats((prev) => [...prev, data.data]);
        setChatMessage("");
      }
    } catch (err) {
      console.error("Error sending chat message:", err);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <h3>Loading ticket...</h3>
      </Container>
    );
  }

  if (!ticket) {
    return (
      <Container className="py-5 text-center">
        <h3>Ticket not found</h3>
      </Container>
    );
  }

  // Destructure fields for easier usage
  const {
    ticketNumber,
    status,
    complaint,
    currentLocation,
    createdAt,
    company,
    user,
    unitAffected,
    truckNumber,
    trailerNumber,
    vinLast8,
    mileage,
    loadStatus,
    breakdownDescription,
    city,
    state,
  } = ticket;

  return (
    <Container className="my-4">
      {/* Top Navigation / CTA */}
      <div className="d-flex justify-content-between mb-3">
        <Button variant="secondary" onClick={() => navigate("/")}>
          Back to Tickets
        </Button>
        {/* Optionally replicate CTA buttons here (e.g. Print, etc.) */}
      </div>

      {/* Row 1: Left (Ticket Info & Breakdown) - Right (Unit Details) */}
      <Row>
        {/* Left column (md=9) */}
        <Col md={9}>
          {/* Ticket Info Card */}
          <Card className="mb-3">
            <Card.Header as="h5">Ticket Info</Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Ticket #:</strong> {ticketNumber}</p>
                  <p><strong>Status:</strong> {status || "Pending"}</p>
                  <p><strong>Complaint:</strong> {complaint}</p>
                  <p><strong>Location:</strong> 
                    {" "}
                    {city ? `${city}, ${state}` : currentLocation}
                  </p>
                  <p><strong>Date Created:</strong> {new Date(createdAt).toLocaleDateString()}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Company:</strong> {company?.name || "N/A"}</p>
                  <p><strong>Driver Name:</strong> {user?.name || "N/A"}</p>
                  {/* Example vendor info placeholders */}
                  <p><strong>Vendor Name:</strong> Default Vendor</p>
                  <p><strong>Vendor Phone #:</strong> 555-555-5555</p>
                  <p><strong>Vendor Email:</strong> vendor@example.com</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Breakdown Description Card */}
          <Card className="mb-3">
            <Card.Header as="h5">Breakdown Description</Card.Header>
            <Card.Body>
              <p>
                <strong>Breakdown Description:</strong>{" "}
                {breakdownDescription || "No Description Provided"}
              </p>
            </Card.Body>
          </Card>
        </Col>

        {/* Right column (md=3) - Unit Details */}
        <Col md={3}>
          <Card className="mb-3">
            <Card.Header as="h5">Unit Details</Card.Header>
            <Card.Body>
              <p><strong>Unit Type:</strong> {unitAffected}</p>
              <p><strong>Make:</strong> Default</p>
              <p><strong>Model:</strong> Default</p>
              <p><strong>Tractor #:</strong> {truckNumber}</p>
              <p><strong>Trailer #:</strong> {trailerNumber}</p>
              <p><strong>VIN Last 8:</strong> {vinLast8}</p>
              <p><strong>Mileage:</strong> {mileage}</p>
              <p><strong>Load Status:</strong> {loadStatus}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Row 2: Left (Chat) - Right (Driver Info) */}
      <Row>
        {/* Chat section (md=9) */}
        <Col md={9}>
          <Card className="mb-3">
            <Card.Header as="h5">Chat</Card.Header>
            <Card.Body>
              {chatLoading ? (
                <p>Loading chats...</p>
              ) : (
                <div
                  style={{
                    maxHeight: "300px",
                    overflowY: "auto",
                    marginBottom: "1rem",
                    border: "1px solid #ddd",
                    padding: "0.5rem",
                    borderRadius: "4px",
                  }}
                >
                  {chats.length === 0 ? (
                    <p>No chat messages yet.</p>
                  ) : (
                    chats.map((chat) => (
                      <div
                        key={chat._id}
                        style={{
                          marginBottom: "0.5rem",
                          borderBottom: "1px solid #ccc",
                          paddingBottom: "0.5rem",
                        }}
                      >
                        <p style={{ margin: 0 }}>
                          <strong>{chat.sender?.name || "System"}</strong>:{" "}
                          {chat.message}
                        </p>
                        <small>
                          {new Date(chat.createdAt).toLocaleString()}
                        </small>
                      </div>
                    ))
                  )}
                </div>
              )}

              <Form onSubmit={handleSendChat}>
                <Form.Group controlId="chatMessage">
                  <Form.Control
                    type="text"
                    placeholder="Type your message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-2">
                  Send
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Driver Info (md=3) */}
        <Col md={3}>
          <Card>
            <Card.Header as="h5">Driver Info</Card.Header>
            <Card.Body>
              <p><strong>Name:</strong> {user?.name || "N/A"}</p>
              <p><strong>Phone:</strong> {user?.phone || "N/A"}</p>
              <p><strong>Email:</strong> {user?.email || "N/A"}</p>
              <p><strong>Company:</strong> {company?.name || "N/A"}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TicketScreen;
