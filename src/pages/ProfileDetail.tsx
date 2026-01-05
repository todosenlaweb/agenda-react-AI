// Note: This component uses Font Awesome icons. Ensure that the Font Awesome library is included in your project's HTML file (e.g., using a CDN link in index.html) for the icons to display correctly.
// Example: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface Profile {
  id: number;
  nombre: string;
  about: string;
  horario: string;
  tarifa: string;
  whatsapp: string;
  telegram: string;
  mapa: string;
  tags: {
    tipo: string;
    valor: string;
    id?: number;
  }[];
  media: { file_path: string, type: string }[];
  contacto?: string;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const ProfileDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/people/${id}`);
        const data = await response.json();
        setProfile(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  const openModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="container mt-4">
      {loading ? (
        <p>Loading profile...</p>
      ) : profile ? (
        <div>
          {/* Section 1: Name and Contact */}
          <div className="row">
            <div className="col text-center">
              <h2 className="text-center">{profile.nombre}</h2>
              {profile.contacto && <p>Contacto: {profile.contacto}</p>}
              {profile.whatsapp && (
                <a href={`https://wa.me/${profile.whatsapp}`} className="btn btn-success m-1 d-inline-flex align-items-center" target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-whatsapp" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                  </svg>
                </a>
              )}
              {profile.telegram && (
                <a href={`https://t.me/${profile.telegram}`} className="btn btn-primary m-1 d-inline-flex align-items-center" target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-telegram" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09" />
                  </svg>
                </a>
              )}
            </div>
          </div>
          {/* Section 2: Photo and Tags */}
          <div className="row mt-4">
            <div className="col-md-4">
              {/* Profile Photo */}
              {profile.media && profile.media.length > 0 && profile.media[0] && profile.media[0].file_path ? (
                <img
                  src={`${apiBaseUrl}/${profile.media[0].file_path}`}
                  alt={profile.nombre}
                  className="img-fluid" // Make image responsive
                />
              ) : (
                <p>No photo available.</p>
              )}
            </div>
            <div className="col-md-8">
              <div className='col-md-12'>
                {profile.tags && profile.tags.length > 0 && (
                  <div className="d-flex flex-wrap mb-3">
                    <p>
                      {profile.tags
                        .filter(
                          (tag) => ![
                            'Virtuales',
                            'Métodos de Pago',
                            'Fantasias',
                            'Masajes',
                            'Oral',
                            'Adicionales',
                            'views',
                          ].includes(tag.tipo)
                        ).map((tag, index) => (
                          <span
                            key={index}
                            className="badge bg-secondary me-1 mb-1"
                          >
                            {tag.tipo}:{tag.valor}
                          </span>
                        ))}
                    </p>
                  </div>
                )}
              </div>
              <div className='col-md-12'>
                {profile.about && (
                  <>
                    <div className="row mt-3">
                      <div className="col">
                        <h4>Descripción:</h4>
                        <p>{profile.about}</p>
                      </div>
                    </div>
                  </>
                )}
                {profile.horario && (
                  <div className="row mt-3">
                    <div className="col">
                      <h4>Horario Disponible:</h4>
                      <p>{profile.horario}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="my-4" />

          {/* Section 3: Gallery */}
          <div className="row">
            <div className="col">
              <h3>Galeria</h3>
              <div className="row">
                {profile.media && profile.media.length > 0 ? (
                  profile.media.map((mediaItem, index) => (
                    <div
                      key={index}
                      className="col-6 col-md-4 col-lg-3 mb-4"
                      style={{ cursor: 'pointer' }}
                      onClick={() => openModal(`${apiBaseUrl}/${mediaItem.file_path}`)}
                    >
                      {mediaItem.type === 'image' ? (
                        <img
                          src={`${apiBaseUrl}/${mediaItem.file_path}`}
                          alt={`Gallery item ${index + 1}`}
                          className="img-fluid gallery-thumbnail"
                        />
                      ) : mediaItem.type === 'video' ? (
                        <video
                          src={`${apiBaseUrl}/${mediaItem.file_path}`}
                          controls
                          className="img-fluid gallery-thumbnail"
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p>No hay elementos en la galería.</p>
                )}
              </div>
            </div>
          </div>

          {/* Modal for expanded media */}
          {isModalOpen && (
            <div className="modal-overlay" onClick={closeModal} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050, padding: '20px' }}>
              <div className="modal-content" style={{ overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px auto', width: 'auto', height: 'auto' }}>
                {selectedImage && selectedImage.match(/\.(jpeg|jpg|gif|png)$/) ? (
                  <img src={selectedImage} alt="Expanded" className="modal-image" style={{
                    objectFit: 'contain', maxHeight: '100vh', maxWidth: '100%'
                  }}/>
                ) : selectedImage && selectedImage.match(/\.(mp4|webm|ogg)$/) ? (
                  <video src={selectedImage} controls className="modal-video" style={{ objectFit: 'contain', maxHeight: '100vh', maxWidth: '100%' }}>
                    Your browser does not support the video tag.
                  </video>
                ) : null}
              </div>
            </div>
          )}

          <hr className="my-4" />

          {/* Section 4: Servicios Ofrecidos */}
          <div className="row">
            <div className="col">
              <h3 className="text-center">Servicios Ofrecidos</h3>
              {profile.tags && profile.tags.length > 0 ? (
                <div>
                  {profile.tags.filter(tag => tag.tipo === 'Adicionales').length > 0 && (
                    <>
                      <h3>Adicionales:</h3>
                      <div className="d-flex flex-wrap justify-content-center">
                        {profile.tags
                          .filter(tag => tag.tipo === 'Adicionales')
                          .map((tag, index) => (
                            <span key={index} className="badge bg-info text-dark me-1 mb-1">
                              {tag.valor}
                            </span>
                          ))}
                      </div>
                    </>
                  )}

                  {profile.tags.filter(tag => tag.tipo === 'Virtuales').length > 0 && (
                    <>
                      <h4>Virtuales:</h4>
                      <div className="d-flex flex-wrap justify-content-center">
                        {profile.tags
                          .filter(tag => tag.tipo === 'Virtuales')
                          .map((tag, index) => (
                            <span key={index} className="badge bg-info text-dark me-1 mb-1">
                              {tag.valor}
                            </span>
                          ))}
                      </div>
                    </>
                  )}

                  {profile.tags.filter(tag => tag.tipo === 'Métodos de Pago').length > 0 && (
                    <>
                      <h4>Métodos de Pago:</h4>
                      <div className="d-flex flex-wrap justify-content-center">
                        {profile.tags
                          .filter(tag => tag.tipo === 'Métodos de Pago')
                          .map((tag, index) => (
                            <span key={index} className="badge bg-info text-dark me-1 mb-1">
                              {tag.valor}
                            </span>
                          ))}
                      </div>
                    </>
                  )}

                  {profile.tags.filter(tag => tag.tipo === 'Fantasias').length > 0 && (
                    <>
                      <h4>Fantasias:</h4>
                      <div className="d-flex flex-wrap justify-content-center">
                        {profile.tags
                          .filter(tag => tag.tipo === 'Fantasias')
                          .map((tag, index) => (
                            <span key={index} className="badge bg-info text-dark me-1 mb-1">
                              {tag.valor}
                            </span>
                          ))}
                      </div>
                    </>
                  )}

                  {profile.tags.filter(tag => tag.tipo === 'Masajes').length > 0 && (
                    <>
                      <h4>Masajes:</h4>
                      <div className="d-flex flex-wrap justify-content-center">
                        {profile.tags
                          .filter(tag => tag.tipo === 'Masajes')
                          .map((tag, index) => (
                            <span key={index} className="badge bg-info text-dark me-1 mb-1">
                              {tag.valor}
                            </span>
                          ))}
                      </div>
                    </>
                  )}

                  {profile.tags.filter(tag => tag.tipo === 'Oral').length > 0 && (
                    <>
                      <h4>Oral:</h4>
                      <div className="d-flex flex-wrap justify-content-center">
                        {profile.tags
                          .filter(tag => tag.tipo === 'Oral')
                          .map((tag, index) => (
                            <span key={index} className="badge bg-info text-dark me-1 mb-1">
                              {tag.valor}
                            </span>
                          ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p>No se ofrecen servicios.</p>
              )}
            </div>
          </div>

          <hr className="my-4" />

        </div>
      ) : (
        <p>Profile not found.</p>
      )}
    </div>
  );
};

export default ProfileDetail;