// src/components/ComplaintForm.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon paths for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

/* Mapping of main categories to their subcategories */
const CATEGORY_OPTIONS = {
  'Network Issue': [
    'No 5G/4G Coverage',
    'Internet Speed/Dysconnectivity',
    'Gaming Issue',
    'Streaming Issue',
  ],
  'Fiber Issue': [
    'No Fiber Coverage',
    'Internet Speed/Dysconnectivity',
    'Gaming Issue',
    'Streaming Issue',
  ],
  'Call Issue': [
    'Call Drop/Quality Issue',
    "Can't Receive or Make Calls",
    "Can't Activate/Cancel Forward Addons",
    "Can't Make a Reference Calls",
    'Other',
  ],
  'Roaming Issue': ['Activation/Cancelation', 'Other'],
  'Website/App Issue': [
    'Freezing/Logging Issue',
    'Missing Services',
    'Payment Issue',
    'Billing Issue',
    'Product Missing Information',
    'Other',
  ],
  Shops: [
    'Agent Behavior/Knowledge',
    'Shop Closed During Open-hours',
    'Problem Not Solved',
    'Too Long Waiting Time',
    'Broken/Not Appealing Furniture',
    'Other',
  ],
  'Innovative Ideas/Recommendations': [], // No subcategories
};

/* A small component that lets the user click on the map to select a location */
function LocationPicker({ initialPos, onSelect }) {
  // initialPos: [lat, lng] or null
  // onSelect: called with { latitude, longitude } on map click

  const [pos, setPos] = useState(initialPos || [24.7136, 46.6753]); // default to Riyadh

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPos([lat, lng]);
        onSelect({ latitude: lat, longitude: lng });
      },
    });
    return pos ? <Marker position={pos} /> : null;
  }

  return (
    <MapContainer
      center={pos}
      zoom={initialPos ? 13 : 5}
      style={{ height: '250px', width: '100%', borderRadius: '0.75rem' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <MapClickHandler />
    </MapContainer>
  );
}

export default function ComplaintForm() {
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [details, setDetails] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState(null); // { latitude, longitude }
  const [images, setImages] = useState([]);
  const [phone, setPhone] = useState(''); // only the 9-digit portion
  const [confirmation, setConfirmation] = useState(null);
  const [geoError, setGeoError] = useState(false); // track geolocation failure

  /* Generate a short alphanumeric ID (8 characters) */
  const generateShortId = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  /* When “Select Location” is clicked:
     - Attempt geolocation
     - On success: set location & show map
     - On error (e.g., denied): show map without pre-set marker and display an error message */
  const handleLocation = () => {
    setGeoError(false);
    if (!navigator.geolocation) {
      // Browser doesn’t support geolocation, just open the map for manual pick
      setShowMap(true);
      setGeoError(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        setShowMap(true);
      },
      (err) => {
        console.error('Geolocation error:', err);
        // Permission denied or other error: open map for manual pick
        setShowMap(true);
        setGeoError(true);
      }
    );
  };

  /* Handle up to 3 images and generate previews */
  const handleImageUpload = (e) => {
    const fileList = Array.from(e.target.files);
    const firstThree = fileList.slice(0, 3);
    const withPreviews = firstThree.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(withPreviews);
  };

  /* Cleanup object URLs when images change or component unmounts */
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [images]);

  /* Handle details textarea with 250-character max */
  const handleDetailsChange = (e) => {
    const text = e.target.value;
    if (text.length <= 250) {
      setDetails(text);
    } else {
      setDetails(text.substring(0, 250));
    }
  };

  /* Handle phone input: only digits, max length 9, must start with '5' */
  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); // strip non-digits
    if (val.length === 0) {
      setPhone('');
      return;
    }
    // Enforce first digit '5'
    if (val.length === 1) {
      if (val[0] === '5') {
        setPhone(val);
      } else {
        return;
      }
    } else {
      if (val.length <= 9 && val[0] === '5') {
        setPhone(val);
      } else if (val.length > 9) {
        setPhone(val.substring(0, 9));
      }
    }
  };

  /* Handle form submission */
  const handleSubmit = (e) => {
    e.preventDefault();
    // Require location before submitting
    if (!location) {
      alert('Please select your location on the map before submitting.');
      return;
    }
    // Require phone to be exactly 9 digits (all start with '5')
    if (phone.length !== 9) {
      alert('Please enter a valid 9-digit Saudi mobile number (starting with 5).');
      return;
    }

    // Generate a short, unique complaint ID
    const shortId = generateShortId();
    setConfirmation({
      message: 'Complaint submitted successfully!',
      id: shortId,
    });

    // (Optional) Send { category, subcategory, details, location, images[].file, phone: '+966' + phone } to backend

    // Reset the form fields
    setCategory('');
    setSubcategory('');
    setDetails('');
    setLocation(null);
    setImages([]);
    setPhone('');
    setShowMap(false);
    setGeoError(false);
  };

  /* Copy ID to clipboard */
  const copyToClipboard = () => {
    if (confirmation && navigator.clipboard) {
      navigator.clipboard
        .writeText(confirmation.id)
        .then(() => {
          alert('Complaint ID copied to clipboard');
        })
        .catch((err) => {
          console.error('Could not copy text: ', err);
        });
    }
  };

  /* Get the subcategories for the currently selected category */
  const subcategories = category ? CATEGORY_OPTIONS[category] : [];

  /* Character count in details */
  const charCount = details.length;

  /* If confirmation exists, show only the clean confirmation message */
  if (confirmation) {
    return (
      <div className="app-container">
        <div className="form-card">
          <div className="confirmation">
            <p>{confirmation.message}</p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
              }}
            >
              <span style={{ fontWeight: 600 }}>{confirmation.id}</span>
              <button
                type="button"
                onClick={copyToClipboard}
                className="button-base button-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}
              >
                Copy ID
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Otherwise, render the form */
  return (
    <div className="app-container">
      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Alemna</h2>

        {/* 1. Complaint Category */}
        <label className="form-label" htmlFor="category">
          Complaint Category
        </label>
        <select
          id="category"
          className="form-select"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setSubcategory('');
          }}
          required
        >
          <option value="">Select Category</option>
          {Object.keys(CATEGORY_OPTIONS).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* 2. Issue Type */}
        {subcategory !== null && subcategories.length > 0 && (
          <>
            <label className="form-label" htmlFor="subcategory">
              Issue Type
            </label>
            <select
              id="subcategory"
              className="form-select"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              required
            >
              <option value="">Select Issue Type</option>
              {subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </>
        )}

        {/* 3. Tell Us More */}
        <label className="form-label" htmlFor="details">
          Tell Us More
        </label>
        <textarea
          id="details"
          className="form-textarea"
          value={details}
          onChange={handleDetailsChange}
          rows="4"
          placeholder="Describe the issue in detail..."
          required
        />
        <div className="char-count">{charCount}/250 characters</div>

        {/* 4. The Location (opens map; manual or current if allowed) */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            className="button-base button-secondary"
            onClick={handleLocation}
          >
            📍 Select Location *
          </button>
          {geoError && (
            <div
              style={{
                color: '#d9534f',
                fontSize: '0.9rem',
                marginTop: '0.25rem',
              }}
            >
              We couldn’t determine your location. Please select it on the map.
            </div>
          )}
          {location && !geoError && (
            <div className="location-text">
              Chosen: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}{' '}
              <a
                href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: '0.5rem', color: 'var(--color-zain)' }}
              >
                View on Google Maps
              </a>
            </div>
          )}
        </div>
        {showMap && (
          <div style={{ marginBottom: '1rem' }}>
            <LocationPicker
              initialPos={location ? [location.latitude, location.longitude] : null}
              onSelect={(pos) => {
                setLocation(pos);
                setShowMap(false);
                setGeoError(false);
              }}
            />
          </div>
        )}

        {/* 5. Upload Photos */}
        <label className="form-label" htmlFor="photos">
          Upload Photos (up to 3)
        </label>
        <input
          id="photos"
          type="file"
          accept="image/*"
          multiple
          className="form-file"
          onChange={handleImageUpload}
        />
        {images.length > 0 && (
          <div className="image-previews">
            {images.map((imgObj, idx) => (
              <img key={idx} src={imgObj.preview} alt={`Preview ${idx + 1}`} />
            ))}
          </div>
        )}

        {/* 6. Contact Phone Number */}
        <label className="form-label" htmlFor="phone">
          Contact Phone Number
        </label>
        <div className="phone-input-container">
          <span className="phone-prefix">+966</span>
          <input
            id="phone"
            type="tel"
            className="phone-input"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="5xxxxxxxx"
            required
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="button-base button-primary">
          🚀 Submit Complaint
        </button>
      </form>
    </div>
  );
}
