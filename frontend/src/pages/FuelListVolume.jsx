import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form } from 'react-bootstrap';
import { fetchVolumeBased } from '../api/volumeBased';
import '../styles/FuelList.css';

const FuelListVolume = ({ userLocation }) => {
  const [stations, setStations] = useState([]);
  const [fuelAmount, setFuelAmount] = useState("");
  const [efficiency, setEfficiency] = useState("");
  const [radius, setRadius] = useState("");
  const [submittedAmount, setSubmittedAmount] = useState(null);
  const [submittedEfficiency, setSubmittedEfficiency] = useState(null);
  const [sortBy, setSortBy] = useState('value');

  useEffect(() => {
    if (userLocation && submittedAmount !== null && submittedEfficiency !== null) {
      const radiusValue = radius ? parseFloat(radius) * 1000 : undefined;
      fetchVolumeBased(userLocation, submittedAmount, submittedEfficiency, radiusValue)
        .then((data) => {
          const filtered = data.filter(station => station.fuel_volume !== null);
          const sorted = sortStations(filtered, sortBy);
          setStations(sorted);
        })
        .catch((err) => {
          console.error("Failed to fetch volume-based data:", err);
        });
    }
  }, [userLocation, submittedAmount, submittedEfficiency, radius, sortBy]);

  const sortStations = (stations, sortBy) => {
    const sorted = [...stations];
    switch(sortBy) {
      case 'value':
        return sorted.sort((a, b) => b.value_score - a.value_score);
      case 'savings':
        return sorted.sort((a, b) => b.savings_vs_average - a.savings_vs_average);
      case 'distance':
        return sorted.sort((a, b) => a.distance - b.distance);
      case 'volume':
        return sorted.sort((a, b) => b.fuel_volume - a.fuel_volume);
      case 'totalCost':
        return sorted.sort((a, b) => a.total_cost - b.total_cost);
      default:
        return sorted;
    }
  };

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

  const getValueBadge = (valueScore) => {
    if (valueScore >= 80) return <Badge bg="success">Best Value</Badge>;
    if (valueScore >= 60) return <Badge bg="warning">Good Value</Badge>;
    if (valueScore >= 40) return <Badge bg="info">Fair Value</Badge>;
    return <Badge bg="secondary">Poor Value</Badge>;
  };

  const getReferenceBadge = (station) => {
    if (station.price === station.area_stats?.max_price) {
      return <Badge bg="danger" className="ms-2">Most Expensive</Badge>;
    }
    return null;
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
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="text-white-50">Sort By</Form.Label>
                      <Form.Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-glass border-0"
                      >
                        <option value="value">Best Value</option>
                        <option value="savings">Most Savings</option>
                        <option value="distance">Nearest</option>
                        <option value="volume">Most Fuel</option>
                        <option value="totalCost">Lowest Total Cost</option>
                      </Form.Select>
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

      {stations.length > 0 && (
        <Row className="mb-3">
          <Col xs={12}>
            <Card className="bg-glass border-0 shadow-sm">
              <Card.Body className="p-3">
                <h6 className="text-white mb-2">Area Price Statistics:</h6>
                <div className="d-flex justify-content-around text-white-50 small">
                  <span>Average: ${stations[0]?.area_stats?.avg_price?.toFixed(2)}/L</span>
                  <span>Lowest: ${stations[0]?.area_stats?.min_price?.toFixed(2)}/L</span>
                  <span>Highest: ${stations[0]?.area_stats?.max_price?.toFixed(2)}/L</span>
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
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <Card.Title className="text-white fw-bold mb-0">
                    {station.station_name}
                  </Card.Title>
                  {getValueBadge(station.value_score)}
                  {getReferenceBadge(station)}
                </div>
                
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
                  
                  <div className="cost-breakdown mb-3 p-2 bg-dark bg-opacity-25 rounded">
                    <h6 className="text-white mb-2">Cost Breakdown:</h6>
                    <div className="text-white-50 small">
                      <p className="mb-1">Travel Cost: ${station.travel_cost.toFixed(2)}</p>
                      <p className="mb-1">Fuel Cost: ${station.fuel_cost.toFixed(2)}</p>
                      <p className="mb-1 fw-semibold text-white">Total Cost: ${station.total_cost.toFixed(2)}</p>
                      <p className="mb-0">Cost per L (including travel): ${station.cost_per_liter_including_travel.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <p className="text-info fw-semibold small mb-2">
                    <i className="bi bi-fuel-pump me-2"></i>
                    Max Volume: {station.fuel_volume.toFixed(2)} L
                  </p>

                  <div className="savings-info mb-3">
                    {station.savings_vs_average > 0 && (
                      <p className="text-success fw-semibold small mb-1">
                        <i className="bi bi-arrow-down-circle me-2"></i>
                        Save ${station.savings_vs_average.toFixed(2)} vs average area price
                      </p>
                    )}
                    {station.savings_vs_most_expensive > 0 && (
                      <p className="text-success fw-semibold small mb-1">
                        <i className="bi bi-arrow-down-circle me-2"></i>
                        Save ${station.savings_vs_most_expensive.toFixed(2)} vs most expensive
                      </p>
                    )}
                  </div>
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
