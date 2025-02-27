import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const FilterModal = ({ show, onClose, filter, setFilter }) => {
  // Create a local copy of the filter so the user can cancel or apply
  const [localFilter, setLocalFilter] = useState({
    status: filter.status || '',
    unitType: filter.unitType || '',
    complaintType: filter.complaintType || '',
    companyName: filter.companyName || '',
    location: filter.location || '',
    dateFrom: filter.dateFrom || '',
    dateTo: filter.dateTo || '',
  });

  const handleChange = (e) => {
    setLocalFilter({
      ...localFilter,
      [e.target.name]: e.target.value,
    });
  };

  const handleApply = () => {
    // Update the parent filter
    setFilter(localFilter);
    // Close modal
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>Filter Tickets</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="filterStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={localFilter.status}
                  onChange={handleChange}
                >
                  <option value="">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Resolved">Resolved</option>
                  {/* Add other statuses if needed */}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="filterUnitType">
                <Form.Label>Unit Type</Form.Label>
                <Form.Select
                  name="unitType"
                  value={localFilter.unitType}
                  onChange={handleChange}
                >
                  <option value="">All</option>
                  <option value="tractor">Tractor</option>
                  <option value="trailer">Trailer</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Form.Group controlId="filterComplaintType">
                <Form.Label>Complaint Type</Form.Label>
                <Form.Control
                  type="text"
                  name="complaintType"
                  placeholder="e.g., Brakes, Engine"
                  value={localFilter.complaintType}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="filterCompanyName">
                <Form.Label>Company Name</Form.Label>
                <Form.Control
                  type="text"
                  name="companyName"
                  placeholder="e.g., TNTX Solutions"
                  value={localFilter.companyName}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Form.Group controlId="filterLocation">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  placeholder="e.g., Dallas, TX"
                  value={localFilter.location}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group controlId="filterDateFrom">
                <Form.Label>From Date</Form.Label>
                <Form.Control
                  type="date"
                  name="dateFrom"
                  value={localFilter.dateFrom}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="filterDateTo">
                <Form.Label>To Date</Form.Label>
                <Form.Control
                  type="date"
                  name="dateTo"
                  value={localFilter.dateTo}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="dark" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="dark" onClick={handleApply}>
          Apply
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FilterModal;
