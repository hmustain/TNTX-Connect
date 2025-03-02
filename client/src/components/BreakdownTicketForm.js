// src/components/BreakdownTicketForm.js
import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const BreakdownTicketForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    driverPhone: '',
    email: '',
    company: '',
    complaint: '', // selected from drop down
    breakdownDescription: '', // detailed description
    truckNumber: '',
    make: '',
    model: '',
    vinLast8: '',
    trailerNumber: '',
    unitAffected: '', // e.g., tractor or trailer
    loadStatus: '', // "loaded" or "empty"
    loadNumber: '',
    currentLocation: '',
    locationName: '',
    address: '',
    city: '',
    state: '',
    tireRelated: 'no', // "yes" or "no"
    tireSize: '',
    tirePosition: '',
    tireBrand: '',
    damageDescription: '',
    photos: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Handler to update form data
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const formPayload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'photos' && formData.photos) {
          for (let i = 0; i < formData.photos.length; i++) {
            formPayload.append('photos', formData.photos[i]);
          }
        } else {
          formPayload.append(key, formData[key]);
        }
      });

      // Retrieve the token from localStorage
      const token = localStorage.getItem('authToken');

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formPayload,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }
      setSuccess('Breakdown ticket submitted successfully!');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container style={{ maxWidth: '600px', marginTop: '30px' }}>
      <h2>Submit a Breakdown Ticket</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col>
            <Form.Group controlId="firstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="lastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group controlId="driverPhone">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="text"
                name="driverPhone"
                value={formData.driverPhone}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="email">
              <Form.Label>Email (if applicable)</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group controlId="company" className="mb-3">
          <Form.Label>Company</Form.Label>
          <Form.Control
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Row className="mb-3">
          <Col>
            <Form.Group controlId="unitAffected">
              <Form.Label>Unit Affected</Form.Label>
              <Form.Control
                type="text"
                name="unitAffected"
                value={formData.unitAffected}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="complaint">
              <Form.Label>Complaint</Form.Label>
              <Form.Control
                as="select"
                name="complaint"
                value={formData.complaint}
                onChange={handleChange}
                required
              >
                <option value="">Select Complaint</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Tires">Tires</option>
                <option value="Brakes">Brakes</option>
                <option value="Jumpstart">Jumpstart</option>
                <option value="Lockout">Lockout</option>
                <option value="DOT">DOT</option>
                <option value="PM Service">PM Service</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group controlId="breakdownDescription" className="mb-3">
          <Form.Label>Breakdown Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="breakdownDescription"
            value={formData.breakdownDescription}
            onChange={handleChange}
            placeholder="Provide more details about the breakdown..."
            required
          />
        </Form.Group>

        <Row className="mb-3">
          <Col>
            <Form.Group controlId="truckNumber">
              <Form.Label>Tractor #</Form.Label>
              <Form.Control
                type="text"
                name="truckNumber"
                value={formData.truckNumber}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="make">
              <Form.Label>Make</Form.Label>
              <Form.Control
                type="text"
                name="make"
                value={formData.make}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="model">
              <Form.Label>Model</Form.Label>
              <Form.Control
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group controlId="vinLast8">
              <Form.Label>Last 8 of VIN</Form.Label>
              <Form.Control
                type="text"
                name="vinLast8"
                value={formData.vinLast8}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="trailerNumber">
              <Form.Label>Trailer #</Form.Label>
              <Form.Control
                type="text"
                name="trailerNumber"
                value={formData.trailerNumber}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group controlId="loadStatus">
              <Form.Label>Loaded or Empty</Form.Label>
              <Form.Control
                as="select"
                name="loadStatus"
                value={formData.loadStatus}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="loaded">Loaded</option>
                <option value="empty">Empty</option>
              </Form.Control>
            </Form.Group>
          </Col>
          {formData.loadStatus === "loaded" && (
            <Col>
              <Form.Group controlId="loadNumber">
                <Form.Label>Load Number</Form.Label>
                <Form.Control
                  type="text"
                  name="loadNumber"
                  value={formData.loadNumber}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          )}
        </Row>

        <Form.Group controlId="currentLocation" className="mb-3">
          <Form.Label>Location</Form.Label>
          <Form.Control
            type="text"
            name="currentLocation"
            value={formData.currentLocation}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Row className="mb-3">
          <Col>
            <Form.Group controlId="locationName">
              <Form.Label>Location Name</Form.Label>
              <Form.Control
                type="text"
                name="locationName"
                value={formData.locationName}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="address">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group controlId="city">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="state">
              <Form.Label>State</Form.Label>
              <Form.Control
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group controlId="tireRelated" className="mb-3">
          <Form.Label>Tire Related?</Form.Label>
          <Form.Control
            as="select"
            name="tireRelated"
            value={formData.tireRelated}
            onChange={handleChange}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </Form.Control>
        </Form.Group>
        {formData.tireRelated === "yes" && (
          <>
            <Row className="mb-3">
              <Col>
                <Form.Group controlId="tireSize">
                  <Form.Label>Tire Size</Form.Label>
                  <Form.Control
                    type="text"
                    name="tireSize"
                    value={formData.tireSize}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="tirePosition">
                  <Form.Label>Tire Position</Form.Label>
                  <Form.Control
                    type="text"
                    name="tirePosition"
                    value={formData.tirePosition}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Group controlId="tireBrand">
                  <Form.Label>Tire Brand</Form.Label>
                  <Form.Control
                    type="text"
                    name="tireBrand"
                    value={formData.tireBrand}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="damageDescription">
                  <Form.Label>Any other damage? (e.g., mudflap, bracket, rim)</Form.Label>
                  <Form.Control
                    type="text"
                    name="damageDescription"
                    value={formData.damageDescription}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </>
        )}

        <Form.Group controlId="photos" className="mb-3">
          <Form.Label>Photos (if applicable)</Form.Label>
          <Form.Control
            type="file"
            name="photos"
            onChange={handleChange}
            accept="image/*"
            multiple
          />
        </Form.Group>

        <Button variant="dark" type="submit" className="w-100" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Ticket"}
        </Button>
      </Form>
    </Container>
  );
};

export default BreakdownTicketForm;
