
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import * as Yup from 'yup';
import CitySelector from './CitySelector'; 
import LocationMap from './LocationMap';

// --- Configuration & Data ---
const countryCodes = [
  { code: '+57', country: 'Colombia' }, { code: '+52', country: 'Mexico' }, { code: '+54', country: 'Argentina' },
  { code: '+34', country: 'Spain' }, { code: '+1', country: 'USA' }, { code: '+58', country: 'Venezuela' },
  { code: '+56', country: 'Chile' }, { code: '+51', country: 'Peru' }, { code: '+593', country: 'Ecuador' },
];
const sortedCountryCodes = [...countryCodes].sort((a, b) => b.code.length - a.code.length);
const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const dayShortNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const TOTAL_STEPS = 3;

// --- Types ---
interface ScheduleData { days: Record<string, boolean>; startTime: string; endTime: string; }
interface FormData {
  nombre: string; about: string; tarifaValue: string; tarifaCurrency: string;
  whatsappCode: string; whatsappNumber: string; telegram: string; mapa: string;
}
interface ModelProfileFormProps { onAuthenticationError: () => void; }
interface LocationData { lat: number; lng: number; name: string; }

// --- Validation Schemas ---
const step1Schema = Yup.object({ nombre: Yup.string().required('El nombre es obligatorio'), about: Yup.string().required('La sección "about" es obligatoria') });
const step2Schema = Yup.object({ whatsapp: Yup.string().matches(/^[\+]?[1-9][0-9]{9,14}$/, 'Formato de número inválido').required('WhatsApp es obligatorio') });
const step3Schema = Yup.object({
   tarifaValue: Yup.number().typeError('La tarifa debe ser un número').required('El valor de la tarifa es obligatorio'), 
   tarifaCurrency: Yup.string().required('La moneda es obligatoria'),
   mapa: Yup.string().required('Debes seleccionar tu ciudad de trabajo')
});
const allSchemas = [step1Schema, step2Schema, step3Schema];

// --- Helper Functions ---
const formatTimeTo12Hour = (time24: string) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'pm' : 'am';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const formatTimeTo24Hour = (time12: string) => {
    if (!time12) return '';
    const [time, modifier] = time12.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '0';
    if (modifier.toLowerCase() === 'pm') hours = (parseInt(hours, 10) + 12).toString();
    return `${hours.padStart(2, '0')}:${minutes}`;
};

const formatScheduleString = (schedule: ScheduleData) => {
    const selectedDays = dayNames.filter(day => schedule.days[day]);
    if (selectedDays.length === 0 || !schedule.startTime || !schedule.endTime) return '';
    let dayString;
    if (selectedDays.length === 7) dayString = `${dayShortNames[0]} - ${dayShortNames[6]}`;
    else if (selectedDays.length > 2 && selectedDays.every((d, i, arr) => i === 0 || dayNames.indexOf(d) === dayNames.indexOf(arr[i-1]) + 1)) {
        dayString = `${dayShortNames[dayNames.indexOf(selectedDays[0])]} - ${dayShortNames[dayNames.indexOf(selectedDays[selectedDays.length - 1])]}`;
    } else {
        dayString = selectedDays.map(d => dayShortNames[dayNames.indexOf(d)]).join(', ');
    }
    return `Horario Disponible\n${dayString} ${formatTimeTo12Hour(schedule.startTime)} - ${formatTimeTo12Hour(schedule.endTime)}`;
};

const parseScheduleString = (scheduleStr: string): ScheduleData => {
    const defaultSchedule = { days: dayNames.reduce((acc, day) => ({...acc, [day]: false}), {}), startTime: '09:00', endTime: '17:00' };
    if (!scheduleStr || !scheduleStr.startsWith('Horario Disponible')) return defaultSchedule;

    const lines = scheduleStr.split('\n');
    if (lines.length < 2) return defaultSchedule;

    const scheduleParts = lines[1].match(/(.*) (\d{1,2}:\d{2} [ap]m) - (\d{1,2}:\d{2} [ap]m)/);
    if (!scheduleParts || scheduleParts.length < 4) return defaultSchedule;

    const [, dayPart, startTime12, endTime12] = scheduleParts;
    
    const newDays: Record<string, boolean> = { ...defaultSchedule.days };
    if (dayPart.includes('-')) {
        const [startDay, endDay] = dayPart.split(' - ');
        const startIndex = dayShortNames.indexOf(startDay);
        const endIndex = dayShortNames.indexOf(endDay);
        if(startIndex !== -1 && endIndex !== -1){
            for(let i = startIndex; i <= endIndex; i++) newDays[dayNames[i]] = true;
        }
    } else {
        const selectedShortDays = dayPart.split(', ');
        selectedShortDays.forEach(shortDay => {
            const dayIndex = dayShortNames.indexOf(shortDay);
            if (dayIndex !== -1) newDays[dayNames[dayIndex]] = true;
        });
    }

    return {
        days: newDays,
        startTime: formatTimeTo24Hour(startTime12),
        endTime: formatTimeTo24Hour(endTime12),
    };
};

const parseWhatsapp = (fullNumber: string) => {
    if (!fullNumber) return { code: '+57', number: '' };
    const foundCountry = sortedCountryCodes.find(c => fullNumber.startsWith(c.code));
    return foundCountry ? { code: foundCountry.code, number: fullNumber.substring(foundCountry.code.length) } : { code: '+57', number: fullNumber.replace(/\+/g, '') };
};

// --- Main Component ---
const ModelProfileForm: React.FC<ModelProfileFormProps> = ({ onAuthenticationError }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({ nombre: '', about: '', tarifaValue: '', tarifaCurrency: 'USD', whatsappCode: '+57', whatsappNumber: '', telegram: '', mapa: '' });
  const [schedule, setSchedule] = useState<ScheduleData>(() => parseScheduleString(''));
  const [originalFormData, setOriginalFormData] = useState<FormData | null>(null);
  const [originalSchedule, setOriginalSchedule] = useState<ScheduleData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const { token } = useAuth();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!token) return;
    axios.get(`${apiBaseUrl}/api/me`, { params: { token } })
      .then(response => {
        const { data } = response;
        if (data.Persona) {
          const { code: whatsappCode, number: whatsappNumber } = parseWhatsapp(data.Persona.whatsapp || '');
          const initialData = {
            nombre: data.Persona.nombre || '', about: data.Persona.about || '',
            tarifaValue: (data.Persona.tarifa || '').split(' ')[0] || '', tarifaCurrency: (data.Persona.tarifa || '').split(' ')[1] || 'USD',
            whatsappCode, whatsappNumber, telegram: data.Persona.telegram || '', mapa: data.Persona.mapa || '',
          };
          setFormData(initialData);
          setOriginalFormData(initialData);

          const initialSchedule = parseScheduleString(data.Persona.horario);
          setSchedule(initialSchedule);
          setOriginalSchedule(initialSchedule);

          if (data.Persona.mapa) {
            try {
                const [lat, lng, ...nameParts] = data.Persona.mapa.split(',');
                setSelectedLocation({ lat: parseFloat(lat), lng: parseFloat(lng), name: nameParts.join(',').trim() });
            } catch (e) { console.error("Could not parse initial location data"); }
          }
        }
      })
      .catch(error => { if (error.response?.status === 401) onAuthenticationError?.(); });
  }, [apiBaseUrl, token, onAuthenticationError]);

  const fullWhatsappNumber = useMemo(() => `${formData.whatsappCode}${formData.whatsappNumber}`, [formData.whatsappCode, formData.whatsappNumber]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, field: keyof Omit<FormData, 'horario' | 'mapa'>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field] || errors.whatsapp) setErrors(prev => ({ ...prev, [field]: '', whatsapp: '' }));
  };
  
  const handleDayToggle = (day: string) => setSchedule(prev => ({ ...prev, days: { ...prev.days, [day]: !prev.days[day] } }));
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'startTime' | 'endTime') => setSchedule(prev => ({ ...prev, [field]: e.target.value }));
  
  const handleLocationSelect = (location: LocationData) => {
    const locationString = `${location.lat},${location.lng},${location.name}`;
    setFormData(prev => ({ ...prev, mapa: locationString}));
    setSelectedLocation(location);
    if (errors.mapa) setErrors(prev => ({ ...prev, mapa: '' }));
  };

  const validateStep = async (stepToValidate: number) => {
    const currentSchema = allSchemas[stepToValidate - 1];
    let dataToValidate:any = {};
    if (stepToValidate === 1) dataToValidate = { nombre: formData.nombre, about: formData.about };
    if (stepToValidate === 2) dataToValidate = { whatsapp: fullWhatsappNumber };
    if (stepToValidate === 3) dataToValidate = { tarifaValue: formData.tarifaValue, tarifaCurrency: formData.tarifaCurrency, mapa: formData.mapa };

    try {
      await currentSchema.validate(dataToValidate, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const newErrors = err.inner.reduce((acc, error) => { if (error.path) acc[error.path] = error.message; return acc; }, {} as Record<string, string>);
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleNext = async () => { if (await validateStep(step)) { if (step < TOTAL_STEPS) setStep(s => s + 1); } };
  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!(await validateStep(step))) return;

    const hasFormChanged = originalFormData ? JSON.stringify(formData) !== JSON.stringify(originalFormData) : true;
    const hasScheduleChanged = originalSchedule ? JSON.stringify(schedule) !== JSON.stringify(originalSchedule) : true;

    if (!hasFormChanged && !hasScheduleChanged) {
        setModalTitle("Sin Cambios");
        setModalMessage("No has realizado ninguna modificación para guardar.");
        setIsModalOpen(true);
        return;
    }

    const finalDataForApi = {
      nombre: formData.nombre,
      about: formData.about,
      tarifa: `${formData.tarifaValue} ${formData.tarifaCurrency}`,
      whatsapp: fullWhatsappNumber,
      telegram: formData.telegram,
      mapa: formData.mapa,
      horario: formatScheduleString(schedule),
    };

    try {
      await axios.post(`${apiBaseUrl}/api/create?token=${token}`, finalDataForApi);
      setOriginalFormData(formData);
      setOriginalSchedule(schedule);
      setModalTitle("Éxito");
      setModalMessage("Perfil actualizado con éxito!");
      setIsModalOpen(true);
    } catch (err: any) {
        if (axios.isAxiosError(err)) {
            if (err.response?.status === 401) onAuthenticationError?.();
            setModalTitle("Error");
            setModalMessage(err.response?.data?.message || "Ocurrió un error inesperado.");
            setIsModalOpen(true);
        }
    }
  };
  
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="model-profile-form p-4 rounded-3 shadow-sm">
        <div className="progress mb-4" style={{ height: '25px' }}>
            <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} aria-valuenow={step} aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
                <span className="fw-bold">Paso {step} de {TOTAL_STEPS}</span>
            </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
            {step === 1 && (
                 <section>
                    <h3 className="mb-3 border-bottom pb-2">Información Básica</h3>
                    <div className='mb-3'>
                        <label htmlFor="nombre" className="form-label">Nombre Público:</label>
                        <input type="text" id="nombre" value={formData.nombre} onChange={(e) => handleChange(e, 'nombre')} className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} />
                        {errors.nombre && <div className="invalid-feedback d-block">{errors.nombre}</div>}
                    </div>
                    <div className='mb-3'>
                        <label htmlFor="about" className="form-label">Sobre mí (About):</label>
                        <textarea id="about" value={formData.about} onChange={(e) => handleChange(e, 'about')} className={`form-control ${errors.about ? 'is-invalid' : ''}`} rows={5}></textarea>
                        {errors.about && <div className="invalid-feedback d-block">{errors.about}</div>}
                    </div>
                </section>
            )}

            {step === 2 && (
                <section>
                    <h3 className="mb-3 border-bottom pb-2">Disponibilidad y Contacto</h3>
                     <div className="mb-3 p-3 border rounded-3">
                        <label className="form-label d-block mb-2">Horario Disponible:</label>
                        <div className="btn-group w-100 mb-2" role="group">
                            {dayNames.map(day => (<button type="button" key={day} className={`btn btn-sm ${schedule.days[day] ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => handleDayToggle(day)}>{dayShortNames[dayNames.indexOf(day)]}</button>))}
                        </div>
                        <div className="row g-2 align-items-center">
                            <div className="col"><input type="time" value={schedule.startTime} onChange={(e) => handleTimeChange(e, 'startTime')} className="form-control" /></div>
                            <div className="col-auto">-</div>
                            <div className="col"><input type="time" value={schedule.endTime} onChange={(e) => handleTimeChange(e, 'endTime')} className="form-control" /></div>
                        </div>
                    </div>
                    <div className='mb-3'>
                        <label htmlFor="whatsappNumber" className="form-label">WhatsApp:</label>
                        <div className="input-group">
                            <select value={formData.whatsappCode} onChange={(e) => handleChange(e, 'whatsappCode')} className="form-select" style={{ flex: '0 0 140px' }}>
                                {countryCodes.map(c => <option key={c.code} value={c.code}>{c.country} ({c.code})</option>)}
                            </select>
                            <input type="tel" id="whatsappNumber" value={formData.whatsappNumber} onChange={(e) => handleChange(e, 'whatsappNumber')} className={`form-control ${errors.whatsapp ? 'is-invalid' : ''}`} placeholder='3001234567' />
                        </div>
                        {errors.whatsapp && <div className="invalid-feedback d-block">{errors.whatsapp}</div>}
                    </div>
                    <div className='mb-3'>
                      <label htmlFor="telegram" className="form-label">Telegram (Opcional):</label>
                      <input type="text" id="telegram" value={formData.telegram} onChange={(e) => handleChange(e, 'telegram')} className="form-control" />
                    </div>
                </section>
            )}

            {step === 3 && (
                <section>
                    <h3 className="mb-3 border-bottom pb-2">Detalles Comerciales</h3>
                    <div className="mb-3">
                        <label className="form-label">Tu Tarifa:</label>
                        <div className="input-group">
                            <input type="text" inputMode="decimal" value={formData.tarifaValue} onChange={(e) => handleChange(e, 'tarifaValue')} className={`form-control ${errors.tarifaValue ? 'is-invalid' : ''}`} placeholder="Ej: 100" />
                            <select value={formData.tarifaCurrency} onChange={(e) => handleChange(e, 'tarifaCurrency')} className={`form-select ${errors.tarifaCurrency ? 'is-invalid' : ''}`} style={{ maxWidth: '120px' }}>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="COP">COP</option>
                            </select>
                        </div>
                        {errors.tarifaValue && <div className="d-block invalid-feedback">{errors.tarifaValue}</div>}
                        {errors.tarifaCurrency && <div className="d-block invalid-feedback">{errors.tarifaCurrency}</div>}
                    </div>
                    <div className='mb-3'>
                        <CitySelector onCitySelect={handleLocationSelect} currentLocationName={selectedLocation?.name} />
                         {errors.mapa && <div className="invalid-feedback d-block">{errors.mapa}</div>}
                    </div>
                    {selectedLocation && (<div className='mb-3'><LocationMap key={`${selectedLocation.lat}-${selectedLocation.lng}`} lat={selectedLocation.lat} lng={selectedLocation.lng} cityName={selectedLocation.name}/></div>)}
                </section>
            )}

            <div className="d-flex justify-content-between mt-4">
                {step > 1 && <button type="button" className="btn btn-secondary" onClick={handlePrev}>Anterior</button>}
                {step < TOTAL_STEPS ? <button type="button" className="btn btn-primary ms-auto" onClick={handleNext}>Siguiente</button> : <button type="submit" className="btn btn-success ms-auto">Guardar Cambios</button>}
            </div>
        </form>

      {isModalOpen && (
        <div className="modal show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">{modalTitle}</h5><button type="button" className="btn-close" onClick={closeModal}></button></div>
              <div className="modal-body"><p>{modalMessage}</p></div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={closeModal}>Cerrar</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelProfileForm;
