import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Nav, Navbar, NavbarBrand, NavbarToggle, Collapse, NavItem, NavLink } from 'react-bootstrap';
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
                  
                  <Navbar 
                    expand="lg" 
                    className="bg-glass mb-4 rounded"
                    expanded={navbarExpanded}
                    onToggle={() => setNavbarExpanded(!navbarExpanded)}
                  >
                    <Container fluid>
                      <NavbarBrand className="text-white fw-bold">FuelWise</NavbarBrand>
                      <NavbarToggle aria-controls="basic-navbar-nav" />
                      <Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                          <NavItem>
                            <NavLink as={Link} to="/distance" className="text-white">
                              Sort by Distance
                            </NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink as={Link} to="/volume" className="text-white">
                              Sort by Max Volume
                            </NavLink>
                          </NavItem>
                        </Nav>
                      </Collapse>
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
                  
                  <Navbar 
                    expand="lg" 
                    className="bg-glass mb-4 rounded"
                    expanded={navbarExpanded}
                    onToggle={() => setNavbarExpanded(!navbarExpanded)}
                  >
                    <Container fluid>
                      <NavbarBrand className="text-white fw-bold">FuelWise</NavbarBrand>
                      <NavbarToggle aria-controls="basic-navbar-nav" />
                      <Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                          <NavItem>
                            <NavLink as={Link} to="/distance" className="text-white">
                              Sort by Distance
                            </NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink as={Link} to="/volume" className="text-white">
                              Sort by Max Volume
                            </NavLink>
                          </NavItem>
                        </Nav>
                      </Collapse>
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

  return (
    <AuthProvider>
      <Router>
        <AppContent userLocation={userLocation} setUserLocation={setUserLocation} />
      </Router>
    </AuthProvider>
  );
}

export default App;
