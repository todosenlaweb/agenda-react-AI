import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface FormData {
  nombre: string;
  about: string;
  horario: string;
  tarifa: string;
  whatsapp: string;
  telegram: string;
  mapa: string;
  tarifaValue: string;
  tarifaCurrency: string;
  imageUrl: string; // To store the existing image URL
}

interface ModelProfileFormProps {
  onAuthenticationError: () => void;
}

const ModelProfileForm: React.FC<ModelProfileFormProps> = ({ onAuthenticationError }) => {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    about: '',
    horario: '',
    tarifa: '',
    whatsapp: '',
    telegram: '',
    mapa: '',
    tarifaValue: '',
    tarifaCurrency: '',
    imageUrl: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const { token } = useAuth();

  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof Omit<FormData, 'imageUrl'>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleTarifaValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, tarifaValue: e.target.value.replace(/[^0-9.]/g, '') });
  };

  const parseTarifa = (tarifaString: string) => {
    const parts = tarifaString.split(' ');
    return { value: parts[0] || '', currency: parts[1] || '' };
  };

  useEffect(() => {
    if (!token) return;

    const fetchProfileData = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/me?token=${token}`);
        if (response.status === 401) {
          if (onAuthenticationError) onAuthenticationError();
          return;
        }

        if (response.ok) {
          const data = await response.json();
          if (data.Persona) {
            const parsedTarifa = parseTarifa(data.Persona.tarifa || '');
            setFormData({
              nombre: data.Persona.nombre || '',
              about: data.Persona.about || '',
              horario: data.Persona.horario || '',
              tarifa: data.Persona.tarifa || '',
              whatsapp: data.Persona.whatsapp || '',
              telegram: data.Persona.telegram || '',
              mapa: data.Persona.mapa || '',
              tarifaValue: parsedTarifa.value,
              tarifaCurrency: parsedTarifa.currency,
              // Prepend apiBaseUrl if imageUrl is a relative path
              imageUrl: data.Persona.imageUrl ? `${apiBaseUrl}${data.Persona.imageUrl}` : '',
            });
          }
        } else {
          console.error('Failed to fetch profile data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    fetchProfileData();
  }, [apiBaseUrl, token, onAuthenticationError]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setIsSuccess(null);

    const dataToSend = { ...formData, token: token, tarifa: `${formData.tarifaValue} ${formData.tarifaCurrency}` };

    try {
      // Step 1: Create/Update profile text data
      const profileResponse = await fetch(`${apiBaseUrl}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const profileData = await profileResponse.json();

      if (profileResponse.status === 401) {
        setMessage('Your session has expired.');
        if (onAuthenticationError) onAuthenticationError();
        return;
      }

      if (!profileResponse.ok) {
        setMessage(`Error creating profile: ${profileData.message || 'Unknown error'}`);
        setIsSuccess(false);
        return;
      }
      
      setMessage('Profile updated successfully!');
      setIsSuccess(true);

      // Step 2: If a file is selected and profile was created, upload the image
      const personId = profileData.Persona?.id;
      if (selectedFile && personId) {
        const imageFormData = new FormData();
        imageFormData.append('file', selectedFile);

        const imageResponse = await fetch(`${apiBaseUrl}/upload/image/${personId}?token=${token}`, {
          method: 'POST',
          body: imageFormData,
          // No Content-Type header needed, browser sets it for FormData
        });

        if (imageResponse.ok) {
          const imageResult = await imageResponse.json();
          setMessage('Profile and image uploaded successfully!');
          // Update the image URL in the state to reflect the new image
          setFormData(prevData => ({
            ...prevData,
            imageUrl: imageResult.imageUrl ? `${apiBaseUrl}${imageResult.imageUrl}` : prevData.imageUrl,
          }));
          setImagePreview(null); // Clear preview after successful upload
        } else {
          const errorData = await imageResponse.json();
          setMessage(`Profile updated, but image upload failed: ${errorData.message || 'Unknown error'}`);
          setIsSuccess(false);
        }
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage('An unexpected error occurred.');
      setIsSuccess(false);
    }
  };

  return (
    <div className="model-profile-form">
      <h2 className="form-title">Create Model Profile</h2>

      {(imagePreview || formData.imageUrl) && (
        <div className="profile-image-preview mb-3">
          <img 
            src={imagePreview || formData.imageUrl} 
            alt="Profile Preview" 
            style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '50%' }} 
          />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="profileImage">Profile Image:</label>
          <input
            type="file"
            id="profileImage"
            name="profileImage"
            accept="image/jpeg, image/png, image/gif"
            onChange={handleFileChange}
            className="form-control"
          />
        </div>

        <div>
          <label htmlFor="nombre">Name:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={(e) => handleChange(e, 'nombre')}
            required
            className="form-control" />
        </div>
        <div>
          <label htmlFor="about">About:</label>
          <textarea
            id="about"
            name="about"
            value={formData.about}
            onChange={(e) => handleChange(e, 'about')}
            required
            className="form-control" />
        </div>
        <div>
          <label htmlFor="horario">Schedule:</label>
          <input
            type="text"
            id="horario"
            name="horario"
            className="form-control"
            value={formData.horario}
            onChange={(e) => handleChange(e, 'horario')}
          />
        </div>
        <div className="form-group">
          <label htmlFor="tarifaValue">Rate:</label>
          <div className='row align-items-center'>
            <div className='col-auto'>
              <input
                type="number"
                id="tarifaValue"
                name="tarifaValue"
                value={formData.tarifaValue}
                onChange={handleTarifaValueChange}
                required={!!formData.tarifaCurrency}
                placeholder="Value"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                className="form-control col-auto"
                style={{ flex: 1 }}
              />
            </div>
            <div className='col-auto'>
              <select
                id="tarifaCurrency"
                name="tarifaCurrency"
                value={formData.tarifaCurrency}
                onChange={(e) => setFormData({ ...formData, tarifaCurrency: e.target.value })}
                className="form-control col-auto"
                required={!!formData.tarifaValue}
              >
                <option value="" disabled>Select Currency</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="COP">COP</option>
              </select>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="whatsapp">WhatsApp:</label>
          <input
            type="text"
            id="whatsapp"
            name="whatsapp"
            className="form-control"
            value={formData.whatsapp}
            onChange={(e) => handleChange(e, 'whatsapp')}
          />
        </div>
        <div>
          <label htmlFor="telegram">Telegram:</label>
          <input
            type="text"
            id="telegram"
            name="telegram"
            className="form-control"
            value={formData.telegram}
            onChange={(e) => handleChange(e, 'telegram')}
          />
        </div>
        <div>
          <label htmlFor="mapa">Map/Location:</label>
          <input
            type="text"
            id="mapa"
            name="mapa"
            className="form-control"
            value={formData.mapa}
            onChange={(e) => handleChange(e, 'mapa')}
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3">Update Profile</button>
      </form>

      {message && (
        <div style={{ color: isSuccess ? 'green' : 'red', marginTop: '10px' }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ModelProfileForm;
