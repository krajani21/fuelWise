import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Button 
      onClick={handleLogout} 
      variant="danger"
      size="sm"
      className="position-fixed"
      style={{ top: '20px', right: '20px', zIndex: 1000 }}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
