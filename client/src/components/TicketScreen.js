import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
} from "react-bootstrap";
import EmojiPicker from "emoji-picker-react";
import AuthContext from "../context/AuthContext";
import "../ChatScreen.css";

const TicketScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authData } = useContext(AuthContext);
  const currentUserId = authData?.user?._id;

  const [ticket, setTicket] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const token = localStorage.getItem("authToken");
  const chatContainerRef = useRef(null);

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
        const res = await fetch(`/api/chats/ticket/${id}`, {
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

  // Auto-scroll to the bottom when chats update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chats]);

  // Updated callback: parameters are (emojiData, event)
  const handleEmojiClick = (emojiData, event) => {
    setChatMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

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
      {/* Top Navigation */}
      <div className="d-flex justify-content-between mb-3">
        <Button variant="secondary" onClick={() => navigate("/")}>
          Back to Tickets
        </Button>
      </div>

      {/* ROW 1: Ticket Info & Breakdown */}
      <Row className="align-items-stretch mb-4">
        <Col md={9}>
          <div
            className="d-grid"
            style={{
              gridTemplateRows: "auto 1fr",
              height: "100%",
              gap: "1rem",
            }}
          >
            <Card>
              <Card.Header as="h5">Ticket Info</Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p>
                      <strong>Ticket #:</strong> {ticketNumber}
                    </p>
                    <p>
                      <strong>Status:</strong> {status || "Pending"}
                    </p>
                    <p>
                      <strong>Complaint:</strong> {complaint}
                    </p>
                    <p>
                      <strong>Location:</strong>{" "}
                      {city ? `${city}, ${state}` : currentLocation}
                    </p>
                    <p>
                      <strong>Date Created:</strong>{" "}
                      {new Date(createdAt).toLocaleDateString()}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Company:</strong> {company?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Driver Name:</strong> {user?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Vendor Name:</strong> Default Vendor
                    </p>
                    <p>
                      <strong>Vendor Phone #:</strong> 555-555-5555
                    </p>
                    <p>
                      <strong>Vendor Email:</strong> vendor@example.com
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="h-100">
              <Card.Header as="h5">Breakdown Description</Card.Header>
              <Card.Body>
                <p>
                  <strong>Breakdown Description:</strong>{" "}
                  {breakdownDescription || "No Description Provided"}
                </p>
              </Card.Body>
            </Card>
          </div>
        </Col>

        {/* ROW 1: RIGHT - Attachments & Unit Details */}
        <Col md={3}>
          <Card className="mb-3">
            <Card.Header as="h5">Attachments</Card.Header>
            <Card.Body>
              {ticket.attachments && ticket.attachments.length > 0 ? (
                <ul>
                  {ticket.attachments.map((file, idx) => (
                    <li key={idx}>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.filename}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No attachments available.</p>
              )}
            </Card.Body>
          </Card>
          <Card>
            <Card.Header as="h5">Unit Details</Card.Header>
            <Card.Body>
              <p>
                <strong>Unit Type:</strong> {unitAffected}
              </p>
              <p>
                <strong>Make:</strong> Default
              </p>
              <p>
                <strong>Model:</strong> Default
              </p>
              <p>
                <strong>Tractor #:</strong> {truckNumber}
              </p>
              <p>
                <strong>Trailer #:</strong> {trailerNumber}
              </p>
              <p>
                <strong>VIN Last 8:</strong> {vinLast8}
              </p>
              <p>
                <strong>Mileage:</strong> {mileage}
              </p>
              <p>
                <strong>Load Status:</strong> {loadStatus}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ROW 2: Chat & Driver Info */}
      <Row>
        {/* LEFT: Chat Section */}
        <Col md={9}>
          <Card className="mb-3">
            <Card.Header as="h5">Chat</Card.Header>
            <Card.Body>
              {chatLoading ? (
                <p>Loading chats...</p>
              ) : (
                <div className="chat-container" ref={chatContainerRef}>
                  {chats.length === 0 ? (
                    <p>No chat messages yet.</p>
                  ) : (
                    chats.map((chat) => {
                      const isCurrentUser =
                        chat.sender && chat.sender._id === currentUserId;
                      return (
                        <div
                          key={chat._id}
                          className={`chat-bubble ${
                            isCurrentUser ? "sender" : "receiver"
                          }`}
                        >
                          <p style={{ margin: 0 }}>
                            <strong>{chat.sender?.name || "System"}</strong>:{" "}
                            {chat.message}
                          </p>
                          <small className="chat-timestamp">
                            {new Date(chat.createdAt).toLocaleString()}
                          </small>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Chat Input Section with Emoji Picker and Up Arrow */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                  position: "relative",
                }}
              >
                <Button
                  variant="link"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  style={{ fontSize: "1.5rem", marginRight: "0.5rem" }}
                >
                  😀
                </Button>
                <InputGroup style={{ flexGrow: 1 }}>
                  <Form.Control
                    type="text"
                    placeholder="Type your message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && chatMessage.trim() !== "") {
                        e.preventDefault(); // prevent a newline if needed
                        handleSendChat(e);
                      }
                    }}
                  />
                  {chatMessage.trim() !== "" && (
                    <Button
                      variant="dark"
                      type="submit"
                      onClick={handleSendChat}
                      style={{ marginLeft: "5px" }}
                    >
                      ↑
                    </Button>
                  )}
                </InputGroup>
              </div>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div
                  style={{ position: "absolute", bottom: "150px", zIndex: 10 }}
                >
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT: Driver Info */}
        <Col md={3}>
          <Card>
            <Card.Header as="h5">Driver Info</Card.Header>
            <Card.Body>
              <p>
                <strong>Name:</strong> {user?.name || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {user?.phone || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {user?.email || "N/A"}
              </p>
              <p>
                <strong>Company:</strong> {company?.name || "N/A"}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TicketScreen;
