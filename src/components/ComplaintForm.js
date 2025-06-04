// src/components/ComplaintForm.js
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function ComplaintForm() {
  const [complaintType, setComplaintType] = useState('');
  const [networkIssue, setNetworkIssue] = useState('');
  const [location, setLocation] = useState(null);
  const [images, setImages] = useState([]);
  const [confirmation, setConfirmation] = useState(null);

  // Trigger browser geolocation
  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          console.error('Geolocation error:', err);
          alert('Unable to fetch location. Make sure location services are enabled.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Handle up to 3 image files
  const handleImageUpload = (e) => {
    const fileList = Array.from(e.target.files);
    const firstThree = fileList.slice(0, 3);
    setImages(firstThree);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Generate a unique complaint ID
    const complaintID = uuidv4();
    setConfirmation({
      message: 'Complaint submitted successfully!',
      id: complaintID,
    });

    // (Optional) Here you would send "complaintType", "networkIssue", "location", and "images"
    // to your backend via fetch or Axios. This is just UI+demo logic.

    // Reset form fields
    setComplaintType('');
    setNetworkIssue('');
    setLocation(null);
    setImages([]);
  };

  return (
    <div className="app-container">
      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Zain Customer Complaint Form</h2>

        {/* Complaint Type */}
        <label className="form-label" htmlFor="complaintType">
          Complaint Type
        </label>
        <select
          id="complaintType"
          className="form-select"
          value={complaintType}
          onChange={(e) => setComplaintType(e.target.value)}
          required
        >
          <option value="">Select Type</option>
          <option value="Network">Network Complaint</option>
          <option value="Shop">Shop Complaint</option>
        </select>

        {/* Network Sub-Category (only if Network is chosen) */}
        {complaintType === 'Network' && (
          <>
            <label className="form-label" htmlFor="networkIssue">
              Network Issue
            </label>
            <select
              id="networkIssue"
              className="form-select"
              value={networkIssue}
              onChange={(e) => setNetworkIssue(e.target.value)}
              required
            >
              <option value="">Select Issue</option>
              <option value="Internet Connectivity">Internet Connectivity</option>
              <option value="5G Coverage Issue">5G Coverage Issue</option>
              <option value="Fiber Issue">Fiber Issue</option>
            </select>
          </>
        )}

        {/* Location Capture */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            className="location-button"
            onClick={handleLocation}
          >
            Get Current Location
          </button>
          {location && (
            <div className="location-text">
              Latitude: {location.latitude.toFixed(5)}, Longitude:{' '}
              {location.longitude.toFixed(5)}
            </div>
          )}
        </div>

        {/* Image Upload */}
        <label className="form-label" htmlFor="photos">
          Upload Photos (up to 3)
        </label>
        <input
          id="photos"
          className="form-file"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
        />
        {images.length > 0 && (
          <div className="location-text">{images.length} file(s) selected</div>
        )}

        {/* Submit Button */}
        <button type="submit" className="form-button">
          Submit Complaint
        </button>

        {/* Confirmation Message */}
        {confirmation && (
          <div className="confirmation">
            <p>{confirmation.message}</p>
            <p>Complaint ID: {confirmation.id}</p>
          </div>
        )}
      </form>
    </div>
  );
}
