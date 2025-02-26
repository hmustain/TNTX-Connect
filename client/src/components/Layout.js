import React, { useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import AuthContext from '../context/AuthContext';

const Layout = () => {
  const { authData } = useContext(AuthContext);
  const isAuthenticated = Boolean(authData?.user);
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header */}
      <Navbar bg="dark" variant="dark" expand="lg" className="py-3">
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="d-flex align-items-center">
              <img
                alt="TNTX Logo"
                src="/images/UPDATED-TNTX-SOLUTIONS-LOGO.png"
                style={{ width: "150px", height: "auto", marginRight: "10px" }}
              />
              <span
                className="text-white"
                style={{ fontSize: "1.5rem", fontWeight: "bold", lineHeight: "1.2" }}
              >
                TNTX Connect Portal
              </span>
            </div>
            <div>
              {isAuthenticated ? (
                <div className="text-end text-white">
                  <div>Hello, {authData.user.name}</div>
                  <div className="small">
                    {authData.user.company && authData.user.company.name
                      ? authData.user.company.name
                      : 'No Company'}
                  </div>
                  <Button variant="link" className="p-0 text-white hover-underline" onClick={() => navigate("/profile")}>
                    View Profile
                  </Button>
                  <br />
                  <Button
                    variant="link"
                    className="p-0 text-white hover-underline"
                    onClick={() => {
                      localStorage.removeItem('authToken');
                      window.location.reload();
                    }}
                  >
                    Log Out
                  </Button>
                </div>
              ) : (
                <Nav.Item>
                  <Button variant="outline-light" onClick={() => navigate("/login")}>
                    Login / Register
                  </Button>
                </Nav.Item>
              )}
            </div>
          </div>
        </Container>
      </Navbar>

      <main className="flex-grow-1">
        <Outlet />
      </main>

      <footer className="bg-dark text-light py-4 text-center">
        <Container>
          <p className="mb-0">© 2025 TNTX Connect. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
};

export default Layout;
