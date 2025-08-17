import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { fetchVolumeBased } from '../api/volumeBased';
import {calculateDollarSavings} from '../utils/savings';
import '../styles/FuelList.css';

const FuelListVolume = ({ userLocation }) => {
  const [stations, setStations] = useState([]);
  const [fuelAmount, setFuelAmount] = useState("");
  const [efficiency, setEfficiency] = useState("");
  const [radius, setRadius] = useState("");
  const [submittedAmount, setSubmittedAmount] = useState(null);
  const [submittedEfficiency, setSubmittedEfficiency] = useState(null);

  useEffect(() => {
    if (userLocation && submittedAmount !== null && submittedEfficiency !== null) {
      const radiusValue = radius ? parseFloat(radius) * 1000 : undefined;
      fetchVolumeBased(userLocation, submittedAmount, submittedEfficiency, radiusValue)
        .then((data) => {
          const filtered = data.filter(station => station.fuel_volume !== null);
          const sorted = [...filtered].sort((a, b) => b.fuel_volume - a.fuel_volume);
          const nearest = filtered.reduce((a, b) => a.distance < b.distance ? a: b);

          const refPrice = nearest.price;

          const updated = sorted.map((station) => {
            const savings = calculateDollarSavings(refPrice, station.price, station.fuel_volume);
            const isReference = station.address === nearest.address;
            return { ...station, savings, isReference };
          });

          setStations(updated);
        })
        .catch((err) => {
          console.error("Failed to fetch volume-based data:", err);
        });
    }
  }, [userLocation, submittedAmount, submittedEfficiency, radius]);

  const handleSubmit = () => {
    setSubmittedAmount(parseFloat(fuelAmount));
    setSubmittedEfficiency(parseFloat(efficiency));
  };

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
          <h1 className="text-center text-white fw-bold mb-4">Fuel Stations by Max Volume (Budget-based)</h1>
        </Col>
      </Row>

      {userLocation && (
        <Row className="mb-4">
          <Col xs={12} md={8} lg={6} className="mx-auto">
            <Card className="bg-glass border-0 shadow-sm">
              <Card.Body className="p-4">
                <Row>
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="text-white-50">$ Amount</Form.Label>
                      <Form.Control
                        type="number"
                        value={fuelAmount}
                        onChange={(e) => setFuelAmount(e.target.value)}
                        placeholder="e.g. 40"
                        className="bg-glass border-0"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="text-white-50">Efficiency (L/100km)</Form.Label>
                      <Form.Control
                        type="number"
                        value={efficiency}
                        onChange={(e) => setEfficiency(e.target.value)}
                        placeholder="e.g. 8.5"
                        className="bg-glass border-0"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6} className="mb-3">
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
                  </Col>
                </Row>
                <div className="text-center">
                  <Button variant="primary" onClick={handleSubmit} className="px-4">
                    Submit
                  </Button>
                </div>
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
                  
                  <p className="text-info fw-semibold small mb-2">
                    <i className="bi bi-fuel-pump me-2"></i>
                    Max Volume: {station.fuel_volume.toFixed(2)} L
                  </p>

                  {station.isReference && (
                    <p className="text-warning fw-semibold small mb-3">
                      <i className="bi bi-star me-2"></i>
                      Nearest station used for comparison
                    </p>
                  )}

                  {station.savings && !station.isReference && (
                    <p className="text-success fw-semibold small mb-3">
                      <i className="bi bi-arrow-down-circle me-2"></i>
                      Save ${station.savings} compared to nearest station
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

export default FuelListVolume;
