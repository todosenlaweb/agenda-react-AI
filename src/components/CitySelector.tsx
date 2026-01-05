
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Country { countryCode: string; countryName: string; }
interface City { name: string; lat: string; lng: string; }
interface CitySelectorProps {
  onCitySelect: (location: { lat: number; lng: number; name: string }) => void;
  currentLocationName?: string;
}

const CitySelector: React.FC<CitySelectorProps> = ({ onCitySelect, currentLocationName }) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [initialCityName, setInitialCityName] = useState<string | null>(null);
  const isInitialLoad = useRef(true);

  const geonamesUser = 'demo';
  const baseApiUrl = 'https://secure.geonames.org';

  useEffect(() => {
    axios.get(`${baseApiUrl}/countryInfoJSON?username=${geonamesUser}`)
      .then(response => {
        if (response.data.geonames) {
            const sortedCountries = response.data.geonames.sort((a: Country, b: Country) => a.countryName.localeCompare(b.countryName));
            setCountries(sortedCountries);
        } else if (response.data.status) {
            const errorMsg = `Error de la API de GeoNames: ${response.data.status.message}`;
            console.error(errorMsg);
            setApiError('Se superó el límite de la API. Por favor, inténtalo más tarde.');
        } else { throw new Error('Respuesta inesperada de la API de países'); }
      })
      .catch(error => {
        console.error("Error fetching countries:", error);
        setApiError('No se pudieron cargar los países.');
      })
      .finally(() => { setIsLoadingCountries(false); });
  }, []);

  useEffect(() => {
    if (isInitialLoad.current && countries.length > 0 && currentLocationName) {
        const nameParts = currentLocationName.split(', ');
        if (nameParts.length >= 2) {
            const countryName = nameParts[nameParts.length - 1];
            const cityName = nameParts.slice(0, -1).join(', ');
            const foundCountry = countries.find(c => c.countryName.toLowerCase() === countryName.toLowerCase());
            if (foundCountry) {
                isInitialLoad.current = false;
                setInitialCityName(cityName);
                setSelectedCountry(foundCountry.countryCode);
            }
        }
    }
  }, [countries, currentLocationName]);

  useEffect(() => {
    if (selectedCountry) {
      setIsLoadingCities(true);
      setApiError(null);
      setCities([]);
      axios.get(`${baseApiUrl}/searchJSON?country=${selectedCountry}&featureClass=P&maxRows=1000&orderby=population&username=${geonamesUser}`)
        .then(response => {
          if (response.data.geonames) {
            const uniqueCitiesMap = new Map();
            response.data.geonames.forEach((c: any) => { if (!uniqueCitiesMap.has(c.name)) uniqueCitiesMap.set(c.name, c); });
            const sortedCities = Array.from(uniqueCitiesMap.values()).sort((a: any, b: any) => a.name.localeCompare(b.name));
            setCities(sortedCities);

            if (initialCityName) {
                const cityToSelect = sortedCities.find(c => c.name.toLowerCase() === initialCityName.toLowerCase());
                if (cityToSelect) setSelectedCity(cityToSelect.name);
                setInitialCityName(null);
            }
          } else if (response.data.status) {
            const errorMsg = `Error de la API de GeoNames: ${response.data.status.message}`;
            console.error(errorMsg);
            setApiError('Se superó el límite de la API. Por favor, inténtalo más tarde.');
          } else { throw new Error('Respuesta inesperada de la API de ciudades'); }
        })
        .catch(error => {
          console.error("Error fetching cities:", error);
          setApiError('No se pudieron cargar las ciudades.');
        })
        .finally(() => { setIsLoadingCities(false); });
    }
  }, [selectedCountry]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
    setSelectedCity(''); // Reset city when country changes
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value;
    setSelectedCity(cityName);
    if (cityName) {
      const cityData = cities.find(c => c.name === cityName);
      if (cityData) {
        const country = countries.find(c => c.countryCode === selectedCountry);
        onCitySelect({ lat: parseFloat(cityData.lat), lng: parseFloat(cityData.lng), name: `${cityData.name}, ${country?.countryName || ''}` });
      }
    }
  };

  return (
    <div className="city-selector border rounded-3 p-3">
      {currentLocationName && (
        <div className="mb-3">
            <p className='small text-muted mb-1'>Ubicación guardada actualmente:</p>
            <p className='fw-bold'>{currentLocationName}</p>
            <hr />
            <p className='form-label'>Para cambiarla, selecciona un nuevo país y ciudad:</p>
        </div>
      )}
      {!currentLocationName && <p className='form-label'>Selecciona tu país y ciudad de trabajo:</p>}

      <div className="row g-2">
        <div className="col-md-6">
          <select className="form-select" value={selectedCountry} onChange={handleCountryChange} disabled={isLoadingCountries || !!apiError}>
            <option value="">{isLoadingCountries ? 'Cargando países...' : '1. Selecciona un país'}</option>
            {countries.map(country => (<option key={country.countryCode} value={country.countryCode}>{country.countryName}</option>))}
          </select>
        </div>
        <div className="col-md-6">
          <select className="form-select" value={selectedCity} onChange={handleCityChange} disabled={!selectedCountry || isLoadingCities || !!apiError}>
            <option value="">{isLoadingCities ? 'Cargando ciudades...' : '2. Selecciona una ciudad'}</option>
            {cities.map(city => (<option key={`${city.name}-${city.lat}`} value={city.name}>{city.name}</option>))}
          </select>
        </div>
      </div>
       {apiError && <div className="alert alert-danger mt-3">{apiError}</div>}
    </div>
  );
};

export default CitySelector;
