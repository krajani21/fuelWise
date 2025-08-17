import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Nav, Navbar } from 'react-bootstrap';
import FuelListVolume from './pages/FuelListVolume';
import FuelListDistance from './pages/FuelListDistance';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LogoutButton from './components/LogoutButton';
import LandingPage from './pages/LandingPage';
import PrivateRoute from './routes/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import './styles/global.css';

const AppContent = ({ userLocation, setUserLocation }) => {
  const location = useLocation();
  const [navbarExpanded, setNavbarExpanded] = useState(false);

  const handleGetLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        sessionStorage.setItem('userLocation', JSON.stringify(coords));
        console.log("user location: ", coords);
      },
      (error) => {
        console.error("Error getting location: ", error);
        alert("Unable to retrieve your location. Please allow location access in your browser settings.");
      }
    );
  };

  // Define routes where LogoutButton should NOT appear
  const publicRoutes = ['/', '/login', '/signup'];
  const hideLogout = publicRoutes.includes(location.pathname);

  return (
    <div>
      {!hideLogout && <LogoutButton />}

      <Container fluid className="px-3 py-4">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/distance"
            element={
              <PrivateRoute>
                <div>
                  {!userLocation && (
                    <Row className="mb-4">
                      <Col xs={12} className="d-flex justify-content-center">
                        <Button 
                          variant="outline-light" 
                          onClick={handleGetLocation}
                          className="me-3"
                        >
                          Get Location
                        </Button>
                      </Col>
                    </Row>
                  )}
                  
                  <Navbar 
                    expand="lg" 
                    className="bg-glass mb-4 rounded"
                    expanded={navbarExpanded}
                    onToggle={() => setNavbarExpanded(!navbarExpanded)}
                  >
                    <Container fluid>
                      <Navbar.Brand className="text-white fw-bold">FuelWise</Navbar.Brand>
                      <Navbar.Toggle aria-controls="basic-navbar-nav" />
                      <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto" onSelect={() => setNavbarExpanded(false)}>
                          <Nav.Item>
                            <Nav.Link as={Link} to="/distance" className="text-white">
                              Sort by Distance
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item>
                            <Nav.Link as={Link} to="/volume" className="text-white">
                              Sort by Max Volume
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Navbar.Collapse>
                    </Container>
                  </Navbar>
                  
                  <FuelListDistance userLocation={userLocation} />
                </div>
              </PrivateRoute>
            }
          />

          <Route
            path="/volume"
            element={
              <PrivateRoute>
                <div>
                  {!userLocation && (
                    <Row className="mb-4">
                      <Col xs={12} className="d-flex justify-content-center">
                        <Button 
                          variant="outline-light" 
                          onClick={handleGetLocation}
                          className="me-3"
                        >
                          Get Location
                        </Button>
                      </Col>
                    </Row>
                  )}
                  
                  <Navbar 
                    expand="lg" 
                    className="bg-glass mb-4 rounded"
                    expanded={navbarExpanded}
                    onToggle={() => setNavbarExpanded(!navbarExpanded)}
                  >
                    <Container fluid>
                      <Navbar.Brand className="text-white fw-bold">FuelWise</Navbar.Brand>
                      <Navbar.Toggle aria-controls="basic-navbar-nav" />
                      <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto" onSelect={() => setNavbarExpanded(false)}>
                          <Nav.Item>
                            <Nav.Link as={Link} to="/distance" className="text-white">
                              Sort by Distance
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item>
                            <Nav.Link as={Link} to="/volume" className="text-white">
                              Sort by Max Volume
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Navbar.Collapse>
                    </Container>
                  </Navbar>
                  
                  <FuelListVolume userLocation={userLocation} />
                </div>
              </PrivateRoute>
            }
          />
        </Routes>
      </Container>
    </div>
  );
};

function App() {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const savedLocation = sessionStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        setUserLocation(JSON.parse(savedLocation));
      } catch (error) {
        console.error('Error parsing saved location:', error);
        sessionStorage.removeItem('userLocation');
      }
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppContent userLocation={userLocation} setUserLocation={setUserLocation} />
      </Router>
    </AuthProvider>
  );
}

export default App;
