import React from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

const Sidebar: React.FC = () => { 
  const navigate = useNavigate();
  const { token, logout, profile } = useAuth(); // Get token, logout, and profile from context


  const handleNavLinkClick = (path: string) => {

    // Use a small delay to ensure the Offcanvas hide animation starts
    setTimeout(() => navigate(path), 300); // Adjust delay as needed
  };
  return (
    <div className="offcanvas offcanvas-end text-bg-dark" tabIndex={-1} id="sidebar" aria-labelledby="sidebarLabel">
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="sidebarLabel">Sidebar Title</h5>
        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body">
        <div className="d-grid gap-2 mb-3">
          {token ? (
            // If logged in, show Dashboard and Logout buttons
            <>
              <button
                className="btn btn-success" // Use a different style for dashboard
                data-bs-dismiss="offcanvas"
                onClick={() => {
                  // Navigate to the specific dashboard based on profile
                  let dashboardPath = '/'; // Default path or a generic user dashboard
                  switch (profile) {
                    case 'Admin':
                      dashboardPath = '/admin/dashboard';
                      break;
                    case 'Model':
                      dashboardPath = '/model/dashboard'; // Example path for Model
                      break;
                    case 'Assist':
                      dashboardPath = '/assist/dashboard'; // Example path for Assist
                      break;
                  }
                  handleNavLinkClick(dashboardPath);
                }}
              >Dashboard</button>


              <button
                className="btn btn-danger" // Use a different style for logout
                data-bs-dismiss="offcanvas"
                onClick={() => {
                  logout(); // Call the logout function
                  handleNavLinkClick("/"); // Navigate to home page after logout
                }}
              >Cerrar sesión</button>
            </>
          ) : (
            // If logged out, show Login and Register buttons
            <>
              <button className="btn btn-primary" data-bs-dismiss="offcanvas" onClick={() => handleNavLinkClick("/")}>Iniciar sesión</button>
              <button className="btn btn-secondary" data-bs-dismiss="offcanvas" onClick={() => handleNavLinkClick("/register")}>Registrarse</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;