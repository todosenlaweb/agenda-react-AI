import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate(); // Initialize navigate

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const apiUrl = `${apiBaseUrl}/api/register`;

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
        password_confirmation: passwordConfirmation,
      }),
    })
      .then(async response => {
        const data = await response.json();
        if (response.status === 201) {
          setModalTitle('Registration Successful');
          setModalMessage(data.message || 'User registered successfully. You will be redirected to login.');
        } else {
          setModalTitle('Registration Failed');
          if (data.errors) {
            const errorMessages = Object.entries(data.errors)
              .map(([, messages]) => (messages as string[]).join(', '))
              .join('\n');
            setModalMessage(errorMessages);
          } else {
            setModalMessage(data.message || 'An error occurred during registration.');
          }
        }
        setIsModalOpen(true);
      })
      .catch(error => {
        console.error('Registration fetch error:', error);
        setModalTitle('Registration Failed');
        setModalMessage('Could not connect to the server.');
        setIsModalOpen(true);
      });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    navigate('/'); // Redirect to login page on modal close
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Registrarse</h2>
      <form onSubmit={handleSubmit} className="col-md-6 offset-md-3">
        <div className="mb-3">
          <label htmlFor="nameInput" className="form-label">Nombre</label>
          <input
            type="text"
            className="form-control"
            id="nameInput"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
        <div className="mb-3">
          <label htmlFor="passwordConfirmationInput" className="form-label">Confirmar Contraseña</label>
          <input
            type="password"
            className="form-control"
            id="passwordConfirmationInput"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-success">Registrarse</button>
      </form>

      {isModalOpen && (
        <div className="modal show d-block" tabIndex={-1} role="dialog" onClick={closeModal}>
          <div className="modal-dialog" role="document" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalTitle}</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                {/* Use pre-wrap to respect newline characters in the error message */}
                <p style={{ whiteSpace: 'pre-wrap' }}>{modalMessage}</p>
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

export default Register;