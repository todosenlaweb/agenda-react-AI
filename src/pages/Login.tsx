
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios
import { useAuth } from '../context/AuthContext';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const { login, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) { // Check if profile is not null
      if (profile === 'Admin') {
        navigate('/admin/dashboard');
      } else if (profile === 'Model') {
        navigate('/model/dashboard');
      } else if (profile === 'Assist') {
        navigate('/assist/dashboard');
      }
    }
  }, [profile, navigate]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const apiUrl = `${apiBaseUrl}/api/login`;

    // Use axios instead of fetch
    axios.post(apiUrl, {
      email: email,
      password: password,
    })
    .then(response => {
      // On success (status 200-299)
      console.log('Login successful:', response.data);
      login(response.data.token, response.data.profile);
      // Navigation will be handled by the useEffect hook
    })
    .catch(error => {
      // On error
      if (error.response) {
        console.error('Login failed:', error.response.data);
        setModalTitle('Login Failed');
        setModalMessage(error.response.data.message || 'An error occurred during login.');
      } else {
        console.error('Login failed:', error.message);
        setModalTitle('Login Failed');
        setModalMessage('Could not connect to the server.');
      }
      setIsModalOpen(true);
      setEmail(''); // Reset inputs on failure
      setPassword('');
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Iniciar sesión</h2>
      <form onSubmit={handleSubmit} className="col-md-6 offset-md-3">
        <div className="mb-3">
          <label htmlFor="emailInput" className="form-label">Correo Electrónico</label>
          <input
            type="email"
            className="form-control"
            id="emailInput"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="passwordInput" className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-control"
            id="passwordInput"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Iniciar sesión</button>
      </form>

      {isModalOpen && (
        <div className="modal show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalTitle}</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <p>{modalMessage}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
