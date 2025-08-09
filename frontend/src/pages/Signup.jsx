import React, { useContext, useState } from "react";
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token);
        navigate("/distance");
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server error");
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center px-3">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className="bg-glass border-0 shadow-lg">
            <Card.Body className="p-4 p-md-5">
              <h2 className="text-center text-white fw-bold mb-4">Create an Account</h2>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white-50">Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Choose a username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    className="bg-glass border-0"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="text-white-50">Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="bg-glass border-0"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="text-white-50">Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="bg-glass border-0"
                  />
                </Form.Group>

                {error && (
                  <Alert variant="danger" className="text-center mb-3">
                    {error}
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100 fw-semibold mb-3"
                >
                  Sign Up
                </Button>

                <div className="text-center">
                  <a href="/login" className="text-info text-decoration-none">
                    Already have an account?
                  </a>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Signup;
