import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

const LandingPage = () => (
  <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center px-3">
    <Row className="w-100 justify-content-center">
      <Col xs={12} sm={10} md={8} lg={6} xl={4}>
        <Card className="bg-glass border-0 shadow-lg text-center">
          <Card.Body className="p-4 p-md-5">
            <h1 className="text-white fw-bold mb-3">Welcome to FuelWise 🚗⛽</h1>
            <p className="text-white-50 mb-4 fs-5">
              Find the most cost-effective gas station based on distance or fuel volume.
            </p>
            <div className="d-grid gap-3">
              <Button as={Link} to="/login" variant="primary" size="lg" className="fw-semibold">
                Login
              </Button>
              <Button as={Link} to="/signup" variant="outline-light" size="lg" className="fw-semibold">
                Sign Up
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default LandingPage;
