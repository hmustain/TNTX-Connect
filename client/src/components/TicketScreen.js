// src/components/TicketScreen.js
import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col, Button, Form } from "react-bootstrap";
import { useParams } from "react-router-dom";

const TicketScreen = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Get token from localStorage (or use AuthContext if you prefer)
  const token = localStorage.getItem("authToken");

  // Fetch ticket details
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`/api/tickets/${id}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
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

  // Fetch chat messages for the ticket
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setChatLoading(true);
        const res = await fetch(`/api/chats?ticketId=${id}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
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

  // Post a new chat message
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ ticket: id, message: chatMessage }),
      });
      if (!res.ok) throw new Error("Error sending message");
      const data = await res.json();
      if (data.success) {
        setChats((prevChats) => [...prevChats, data.data]);
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

  return (
    <Container className="my-4">
      {/* Ticket Details */}
      <Card className="mb-4">
        <Card.Header as="h5">Ticket Details</Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Ticket #:</strong> {ticket.ticketNumber}</p>
              <p><strong>Unit Type:</strong> {ticket.unitAffected}</p>
              <p>
                <strong>Company:</strong>{" "}
                {ticket.company && ticket.company.name ? ticket.company.name : "None"}
              </p>
              <p><strong>Tractor #:</strong> {ticket.truckNumber}</p>
              <p><strong>Trailer #:</strong> {ticket.trailerNumber}</p>
            </Col>
            <Col md={6}>
              <p><strong>Complaint:</strong> {ticket.complaint}</p>
              <p><strong>Location:</strong> {ticket.currentLocation}</p>
              <p><strong>Driver Name:</strong> {ticket.user && ticket.user.name}</p>
              <p><strong>Date:</strong> {new Date(ticket.createdAt).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {ticket.status || "Pending"}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Chat Section */}
      <Card>
        <Card.Header as="h5">Chat</Card.Header>
        <Card.Body>
          {chatLoading ? (
            <p>Loading chats...</p>
          ) : (
            <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "1rem" }}>
              {chats.length === 0 ? (
                <p>No chat messages yet.</p>
              ) : (
                chats.map((chat) => (
                  <div key={chat._id} style={{ marginBottom: "0.5rem", borderBottom: "1px solid #ccc", paddingBottom: "0.5rem" }}>
                    <p style={{ margin: 0 }}>
                      <strong>{chat.sender && chat.sender.name}</strong>: {chat.message}
                    </p>
                    <small>{new Date(chat.createdAt).toLocaleString()}</small>
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
    </Container>
  );
};

export default TicketScreen;
