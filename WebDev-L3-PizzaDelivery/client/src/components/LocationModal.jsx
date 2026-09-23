import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Search,
  Crosshair,
  X,
  Check,
  Building,
  Navigation,
  Loader2,
} from 'lucide-react';
import { Modal } from './Modal';
import { useToast } from '../context/ToastContext';

const POPULAR_CITIES = [
  'Mumbai, Maharashtra',
  'Delhi NCR',
  'Bengaluru, Karnataka',
  'Hyderabad, Telangana',
  'Pune, Maharashtra',
  'Chennai, Tamil Nadu',
  'Kolkata, West Bengal',
  'Ahmedabad, Gujarat',
  'Chandigarh',
];

export const LocationModal = ({ isOpen, onClose, onSelectLocation, currentLocation }) => {
  const [searchInput, setSearchInput] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [detecting, setDetecting] = useState(false);
  const [autocompleteService, setAutocompleteService] = useState(null);
  const [placesService, setPlacesService] = useState(null);
  const inputRef = useRef(null);

  const { success, error, info } = useToast();

  // Initialize Google Maps Places Autocomplete Service
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      try {
        const auto = new window.google.maps.places.AutocompleteService();
        setAutocompleteService(auto);

        const dummyElem = document.createElement('div');
        const places = new window.google.maps.places.PlacesService(dummyElem);
        setPlacesService(places);
      } catch (err) {
        console.warn('Google Places service init notice:', err);
      }
    }
  }, [isOpen]);

  // Handle Autocomplete Suggestions when user types
  useEffect(() => {
    if (!searchInput.trim()) {
      setPredictions([]);
      return;
    }

    const timer = setTimeout(async () => {
      // 1. Try Google Places Autocomplete
      if (autocompleteService) {
        try {
          autocompleteService.getPlacePredictions(
            {
              input: searchInput,
              componentRestrictions: { country: ['in', 'us', 'gb', 'ca', 'au', 'ae'] },
            },
            (results, status) => {
              if (status === window.google?.maps?.places?.PlacesServiceStatus?.OK && results && results.length > 0) {
                setPredictions(results);
              } else {
                fetchNominatimFallback(searchInput);
              }
            }
          );
          return;
        } catch (e) {
          console.warn('Google Places prediction notice:', e);
        }
      }

      // 2. Nominatim / Local Fallback
      fetchNominatimFallback(searchInput);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchInput, autocompleteService]);

  const fetchNominatimFallback = async (query) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setPredictions(data.map((item) => ({
            description: item.display_name,
            place_id: item.place_id,
          })));
          return;
        }
      }
    } catch (err) {
      console.warn('Nominatim search notice:', err);
    }

    // Local static fallback
    const filtered = POPULAR_CITIES.filter((city) =>
      city.toLowerCase().includes(query.toLowerCase())
    ).map((description) => ({ description, place_id: description }));
    setPredictions(filtered);
  };

  // GPS Current Location Detection (with multi-tier fallback & strict 5s safety timeout)
  const handleDetectCurrentLocation = async () => {
    setDetecting(true);
    info('Detecting your location...');

    let resolved = false;
    const safetyTimer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        setDetecting(false);
        // Fallback to default active city
        const fallbackCity = 'Mumbai, Maharashtra';
        onSelectLocation(fallbackCity);
        success(`Location set to ${fallbackCity}`);
        onClose();
      }
    }, 5000);

    const finishSuccess = (addressStr) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(safetyTimer);
      setDetecting(false);
      onSelectLocation(addressStr);
      success(`Location set to: ${addressStr.substring(0, 35)}...`);
      onClose();
    };

    // Fast IP-based geolocation fallback
    const tryIpLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data.city && data.region) {
            finishSuccess(`${data.city}, ${data.region}`);
            return true;
          }
        }
      } catch (e) {
        console.warn('IP location notice:', e);
      }
      return false;
    };

    // Try browser navigator geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // 1. Try Google Reverse Geocoder
          if (window.google && window.google.maps) {
            try {
              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode(
                { location: { lat: latitude, lng: longitude } },
                (results, status) => {
                  if (status === 'OK' && results && results[0]) {
                    finishSuccess(results[0].formatted_address);
                    return;
                  }
                }
              );
            } catch (e) {
              console.warn('Google geocoder notice:', e);
            }
          }

          // 2. Try Nominatim Reverse Geocoder
          try {
            const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            if (nomRes.ok) {
              const nomData = await nomRes.json();
              if (nomData && nomData.display_name) {
                const parts = nomData.display_name.split(', ');
                const cleanAddress = parts.slice(0, 3).join(', ');
                finishSuccess(cleanAddress || nomData.display_name);
                return;
              }
            }
          } catch (e) {
            console.warn('Nominatim reverse geocode notice:', e);
          }

          // 3. Fallback coordinates
          finishSuccess(`GPS Location (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`);
        },
        async (err) => {
          console.warn('Browser GPS permission/timeout notice:', err);
          const ipOk = await tryIpLocation();
          if (!ipOk) {
            finishSuccess('Mumbai, Maharashtra');
          }
        },
        { timeout: 3500, enableHighAccuracy: false, maximumAge: 60000 }
      );
    } else {
      const ipOk = await tryIpLocation();
      if (!ipOk) {
        finishSuccess('Mumbai, Maharashtra');
      }
    }
  };

  const handleSelectPrediction = (prediction) => {
    const address = prediction.description;
    onSelectLocation(address);
    success(`Delivery address set to ${address.split(',')[0]}!`);
    onClose();
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSelectLocation(searchInput.trim());
      success(`Delivery location set to: ${searchInput.trim()}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose Delivery Location" maxWidth="520px">
      <div style={{ padding: '0.25rem 0' }}>
        {/* Search Form */}
        <form onSubmit={handleCustomSubmit} style={{ marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              color="#9CA3AF"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search city, area, street, landmark, or pincode..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '42px',
                paddingRight: '70px',
                height: '46px',
                fontSize: '0.92rem',
                borderRadius: 'var(--radius-md)',
              }}
              autoFocus
            />
            {searchInput && (
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#1E3F20',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                }}
              >
                Set
              </button>
            )}
          </div>
        </form>

        {/* Live Predictions Dropdown */}
        {predictions.length > 0 && (
          <div
            style={{
              maxHeight: '220px',
              overflowY: 'auto',
              border: '1.5px solid #E5E7EB',
              borderRadius: 'var(--radius-md)',
              background: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
              marginBottom: '1.25rem',
            }}
          >
            {predictions.map((pred, idx) => (
              <div
                key={pred.place_id || idx}
                onClick={() => handleSelectPrediction(pred)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderBottom: idx < predictions.length - 1 ? '1px solid #F3F4F6' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#FFF0F2')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#FFFFFF')}
              >
                <MapPin size={16} color="#C8102E" style={{ marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.88rem', fontWeight: '700', color: '#1F2937', lineHeight: 1.3 }}>
                    {pred.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GPS Auto-Detect Button */}
        <button
          onClick={handleDetectCurrentLocation}
          disabled={detecting}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1rem',
            background: '#F0FDF4',
            border: '1.5px solid #BBF7D0',
            color: '#16A34A',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            fontSize: '0.88rem',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#DCFCE7')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#F0FDF4')}
        >
          {detecting ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              <span>Detecting Current Location...</span>
            </>
          ) : (
            <>
              <Crosshair size={17} />
              <span>Use My Current Location (GPS)</span>
            </>
          )}
        </button>

        {/* Popular Cities */}
        <div>
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: '800',
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '0.75rem',
            }}
          >
            Popular Cities
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {POPULAR_CITIES.map((city) => {
              const isSelected = currentLocation === city;
              return (
                <button
                  key={city}
                  onClick={() => {
                    onSelectLocation(city);
                    onClose();
                  }}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.82rem',
                    fontWeight: isSelected ? '800' : '600',
                    border: '1px solid',
                    borderColor: isSelected ? '#C8102E' : '#E5E7EB',
                    background: isSelected ? '#FFF0F2' : '#FFFFFF',
                    color: isSelected ? '#C8102E' : '#4B5563',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#C8102E';
                      e.currentTarget.style.color = '#C8102E';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.color = '#4B5563';
                    }
                  }}
                >
                  <Building size={13} />
                  <span>{city}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
