import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form } from 'react-bootstrap';
import { fetchDistanceOnly } from '../api/distanceOnly';
import '../styles/FuelList.css';
import { getNearestStation, calculateCentDifference } from '../utils/savings';

const FuelListDistance = ({ userLocation }) => {
  const [stations, setStations] = useState([]);
  const [radius, setRadius] = useState("");

  useEffect(() => {
    if (userLocation) {
      const radiusValue = radius ? parseFloat(radius) * 1000 : undefined;
      fetchDistanceOnly(userLocation, radiusValue)
        .then((data) => {
          const filtered = data.filter(station => station.distance !== null);
          const sorted = [...filtered].sort((a, b) => a.distance - b.distance);
          const nearest = getNearestStation(filtered);
          const refPrice = nearest.price;

          const updated = sorted.map((station) => {
            const centsSaved = calculateCentDifference(refPrice, station.price);
            return { ...station, centsSaved };
          });

          setStations(updated);
        })
        .catch((err) => {
          console.error("Failed to fetch distances:", err);
        });
    }
  }, [userLocation, radius]);

  const handleGetDirections = (lat, lng) => {
    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destination = `${lat},${lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <Container fluid className="px-3">
      <Row className="mb-4">
        <Col xs={12}>
          <h1 className="text-center text-white fw-bold mb-4">Fuel Stations Sorted by Distance</h1>
        </Col>
      </Row>

      {userLocation && (
        <Row className="mb-4">
          <Col xs={12} md={6} lg={4} className="mx-auto">
            <Card className="bg-glass border-0 shadow-sm">
              <Card.Body className="p-4">
                <Form.Group>
                  <Form.Label className="text-white-50">Search Radius (km)</Form.Label>
                  <Form.Control
                    type="number"
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    placeholder="optional"
                    className="bg-glass border-0"
                  />
                  <Form.Text className="text-white-50 small">
                    Leave empty for default 5km radius
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row>
        {stations.map((station, index) => (
          <Col key={index} xs={12} md={6} lg={4} className="mb-3">
            <Card className="bg-glass border-0 shadow-sm h-100">
              <Card.Body className="p-3 p-md-4">
                <Card.Title className="text-white fw-bold mb-3">
                  {station.station_name}
                </Card.Title>
                
                <div className="mb-3">
                  <p className="text-white-50 mb-2 small">
                    <i className="bi bi-geo-alt me-2"></i>
                    {station.address}
                  </p>
                  
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Badge bg="success" className="fs-6">
                      ${station.price.toFixed(2)}
                    </Badge>
                    <span className="text-white-50 small">
                      {station.distance_text}
                    </span>
                  </div>
                  
                  <p className="text-white-50 small mb-2">
                    <i className="bi bi-clock me-2"></i>
                    {station.duration_text}
                  </p>
                  
                  {station.centsSaved && (
                    <p className="text-success fw-semibold small mb-3">
                      <i className="bi bi-arrow-down-circle me-2"></i>
                      {station.centsSaved} than the closest petrol station
                    </p>
                  )}
                </div>
                
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleGetDirections(station.lat, station.lng)}
                  className="w-100"
                >
                  <i className="bi bi-map me-2"></i>
                  Get Directions
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default FuelListDistance;
