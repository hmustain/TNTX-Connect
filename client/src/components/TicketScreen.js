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
  const { id } = useParams(); // Trimble OrderID
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

  const handleEmojiClick = (emojiData) => {
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

  // Helper function to render a single RO card
  const renderROCard = (ro, isMainOrder = false) => {
    return (
      <Card className="mb-3" key={ro.orderId}>
        <Card.Header as="h5" className="d-flex justify-content-between">
          {isMainOrder ? (
            <>
              <span>Ticket Info</span>
              <span>
                Road Call:{" "}
                {ro.roadCallLink ? (
                  <a
                    href={ro.roadCallLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {ro.roadCallNum}
                  </a>
                ) : (
                  ro.roadCallNum || "N/A"
                )}
              </span>
            </>
          ) : (
            <>Repair Order {ro.orderNumber}</>
          )}
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p>
                <strong>Repair Order #:</strong> {ro.orderNumber}
              </p>
              <p>
                <strong>Status:</strong> {ro.status || "Pending"}
              </p>
              <p>
                <strong>Opened:</strong>{" "}
                {new Date(ro.openedDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Closed:</strong>{" "}
                {ro.closedDate && ro.closedDate !== "0001-01-01T00:00:00"
                  ? new Date(ro.closedDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Vendor:</strong> {ro.vendor?.name}
              </p>
              <p>
                <strong>Vendor Phone:</strong> {ro.vendor?.phone}
              </p>
              <p>
                <strong>Vendor Location:</strong>{" "}
                {ro.vendor?.city}, {ro.vendor?.state}
              </p>
              <p>
                <strong>Customer:</strong> {ro.customer?.NAME}
              </p>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col md={6}>
              <p>
                <strong>Component Code:</strong>{" "}
                {ro.componentCode || "N/A"}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Component Description:</strong>{" "}
                {ro.componentDescription || "N/A"}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  // Destructure the main order fields + repOrders
  const { repOrders, ...mainOrder } = ticket;

  return (
    <Container className="my-4">
      {/* Top Navigation */}
      <div className="d-flex justify-content-between mb-3">
        <Button variant="secondary" onClick={() => navigate("/")}>
          Back to Tickets
        </Button>
        <Button
          variant="outline-primary"
          onClick={() =>
            window.open(
              `https://ttx.tmwcloud.com/AMSApp/Orders/RepairCreate.aspx?OrderId=${mainOrder.orderId}`,
              "_blank"
            )
          }
        >
          View in Trimble
        </Button>
      </div>

      {/* ROW 1: Ticket Info & Unit Details */}
      <Row className="align-items-stretch mb-4">
        <Col md={9}>
          {/* Render the main order card with all details */}
          {renderROCard(mainOrder, true)}

          {/* Render each additional RO as a full card */}
          {repOrders && repOrders.length > 0 && (
            repOrders.map((ro) => renderROCard(ro, false))
          )}
        </Col>

        {/* UNIT DETAILS */}
        <Col md={3}>
          <Card>
            <Card.Header as="h5">Unit Details</Card.Header>
            <Card.Body>
              <p>
                <strong>Unit Number:</strong> {mainOrder.unitNumber?.value}
              </p>
              <p>
                <strong>Unit Type:</strong>{" "}
                {mainOrder.unitNumber?.details?.UnitType || "N/A"}
              </p>
              <p>
                <strong>Make:</strong>{" "}
                {mainOrder.unitNumber?.details?.Make || "N/A"}
              </p>
              <p>
                <strong>Model:</strong>{" "}
                {mainOrder.unitNumber?.details?.Model || "N/A"}
              </p>
              <p>
                <strong>Year:</strong>{" "}
                {mainOrder.unitNumber?.details?.ModelYear || "N/A"}
              </p>
              <p>
                <strong>Serial No:</strong>{" "}
                {mainOrder.unitNumber?.details?.SerialNo || "N/A"}
              </p>
              <p>
                <strong>Customer Name:</strong>{" "}
                {mainOrder.unitNumber?.details?.NameCustomer || "N/A"}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ROW 2: Chat & Driver Info */}
      <Row>
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
        <Col md={3}>
          <Card>
            <Card.Header as="h5">Driver Info</Card.Header>
            <Card.Body>
              <p>
                <strong>Name:</strong> {mainOrder.customer?.NAME}
              </p>
              <p>
                <strong>Phone:</strong> {mainOrder.customer?.MAINPHONE}
              </p>
              <p>
                <strong>Email:</strong> N/A
              </p>
              <p>
                <strong>Company:</strong> {mainOrder.customer?.NAME}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TicketScreen;
