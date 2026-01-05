
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../layouts/DashboardLayout';
import ModelProfileForm from '../components/ModelProfileForm';
import { useAuth } from '../context/AuthContext';

const ModelDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!token) {
      logout();
      navigate('/', { state: { message: 'Tu sesión ha caducado' } });
      return;
    }

    const checkProfileStatus = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/me`, { params: { token } });
        const persona = response.data?.Persona;

        // The profile is considered complete if it exists and has associated tags.
        if (persona && Array.isArray(persona.Tags) && persona.Tags.length > 0) {
          setIsProfileComplete(true);
        } else {
          setIsProfileComplete(false);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            logout();
            navigate('/', { state: { message: 'Tu sesión ha caducado' } });
        }
        // If there's an error, assume profile is incomplete to be safe
        setIsProfileComplete(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfileStatus();
  }, [token, apiBaseUrl, logout, navigate]);

  const handleAuthenticationError = () => {
    logout();
    navigate('/', { state: { message: 'Tu sesión ha caducado' } });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
        </div>
      )
    }

    if (isProfileComplete) {
      return (
        <div className="text-center">
          <h2>¡Bienvenida!</h2>
          <p>Tu perfil ya está completo. Pronto podrás gestionar tu actividad desde aquí.</p>
          {/* We can add more dashboard components here in the future */}
        </div>
      );
    }

    return (
        <div>
            <h2>Completa tu Perfil</h2>
            <p>Para empezar, necesitamos que completes tu información de perfil.</p>
            <ModelProfileForm onAuthenticationError={handleAuthenticationError} />
        </div>
    );
  };

  return (
    <DashboardLayout>
        {renderContent()}
    </DashboardLayout>
  );
};

export default ModelDashboard;
