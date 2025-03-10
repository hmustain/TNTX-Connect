// src/components/TicketScreen.js
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
  const { id } = useParams(); // id represents the Trimble OrderID
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
        // Now fetching from the Trimble endpoint for repair orders by OrderID
        const res = await fetch(`/api/trimble/repair-orders/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Unauthorized or Ticket not found");
        const data = await res.json();
        setTicket(data);
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
        // You may want to update this endpoint if chats are tied to a repair order
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

  // Auto-scroll chat container to bottom when chats update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chats]);

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

  // Destructure the fields from the Trimble repair order
  const {
    orderId,
    orderNumber,
    status,
    openedDate,
    closedDate,
    vendor,
    unitNumber,
    customer,
    componentCode,
    componentDescription,
  } = ticket;

  return (
    <Container className="my-4">
      {/* Top Navigation */}
      <div className="d-flex justify-content-between mb-3">
        <Button variant="secondary" onClick={() => navigate("/")}>
          Back to Tickets
        </Button>
        {/* Button to view the repair order in Trimble */}
        <Button
          variant="outline-primary"
          onClick={() =>
            window.open(
              `https://ttx.tmwcloud.com/AMSApp/Orders/RepairCreate.aspx?OrderId=${orderId}`,
              "_blank"
            )
          }
        >
          View in Trimble
        </Button>
      </div>

      {/* ROW 1: Ticket Info & Component Details */}
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
                      <strong>Repair Order #:</strong> {orderNumber}
                    </p>
                    <p>
                      <strong>Status:</strong> {status || "Pending"}
                    </p>
                    <p>
                      <strong>Opened:</strong>{" "}
                      {new Date(openedDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Closed:</strong>{" "}
                      {closedDate !== "0001-01-01T00:00:00" ? new Date(closedDate).toLocaleDateString() : "N/A"}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Vendor:</strong> {vendor.name}
                    </p>
                    <p>
                      <strong>Vendor Phone:</strong> {vendor.phone}
                    </p>
                    <p>
                      <strong>Vendor Location:</strong> {vendor.city}, {vendor.state}
                    </p>
                    <p>
                      <strong>Customer:</strong> {customer.NAME}
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="h-100">
              <Card.Header as="h5">Component Details</Card.Header>
              <Card.Body>
                <p>
                  <strong>Component Code:</strong> {componentCode || "N/A"}
                </p>
                <p>
                  <strong>Component Description:</strong> {componentDescription || "N/A"}
                </p>
              </Card.Body>
            </Card>
          </div>
        </Col>

        {/* ROW 1: RIGHT - Unit Details */}
        <Col md={3}>
          <Card>
            <Card.Header as="h5">Unit Details</Card.Header>
            <Card.Body>
              <p>
                <strong>Unit Number:</strong> {unitNumber.value}
              </p>
              <p>
                <strong>Unit Type:</strong> {unitNumber.details?.UnitType || "N/A"}
              </p>
              <p>
                <strong>Make:</strong> {unitNumber.details?.Make || "N/A"}
              </p>
              <p>
                <strong>Model:</strong> {unitNumber.details?.Model || "N/A"}
              </p>
              <p>
                <strong>Year:</strong> {unitNumber.details?.ModelYear || "N/A"}
              </p>
              <p>
                <strong>Serial No:</strong> {unitNumber.details?.SerialNo || "N/A"}
              </p>
              <p>
                <strong>Customer Name:</strong> {unitNumber.details?.NameCustomer || "N/A"}
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
                          className={`chat-bubble ${isCurrentUser ? "sender" : "receiver"}`}
                        >
                          <p style={{ margin: 0 }}>
                            <strong>{chat.sender?.name || "System"}</strong>: {chat.message}
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
                        e.preventDefault();
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

              {showEmojiPicker && (
                <div style={{ position: "absolute", bottom: "150px", zIndex: 10 }}>
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
              <p><strong>Name:</strong> {customer.NAME}</p>
              <p><strong>Phone:</strong> {customer.MAINPHONE}</p>
              <p><strong>Email:</strong> N/A</p>
              <p><strong>Company:</strong> {customer.NAME}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TicketScreen;
