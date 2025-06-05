// src/components/ComplaintForm.js
import React, { useState, useEffect } from 'react';

// Mapping of main categories to their subcategories
const CATEGORY_OPTIONS = {
  "Network Issue": [
    "No 5G/4G Coverage",
    "Internet Speed/Dysconnectivity",
    "Gaming Issue",
    "Streaming Issue",
  ],
  "Fiber Issue": [
    "No Fiber Coverage",
    "Internet Speed/Dysconnectivity",
    "Gaming Issue",
    "Streaming Issue",
  ],
  "Call Issue": [
    "Call Drop/Quality Issue",
    "Can't Receive or Make Calls",
    "Can't Activate/Cancel Forward Addons",
    "Can't Make a Reference Calls",
    "Other",
  ],
  "Roaming Issue": [
    "Activation/Cancelation",
    "Other",
  ],
  "Website/App Issue": [
    "Freezing/Logging Issue",
    "Missing Services",
    "Payment Issue",
    "Billing Issue",
    "Product Missing Information",
    "Other",
  ],
  Shops: [
    "Agent Behavior/Knowledge",
    "Shop Closed During Open-hours",
    "Problem Not Solved",
    "Too Long Waiting Time",
    "Broken/Not Appealing Furniture",
    "Other",
  ],
  "Innovative Ideas/Recommendations": [], // No subcategories
};

export default function ComplaintForm() {
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [phone, setPhone] = useState("");       // only the 9-digit portion
  const [details, setDetails] = useState("");
  const [location, setLocation] = useState(null);
  const [images, setImages] = useState([]);
  const [confirmation, setConfirmation] = useState(null);

  // Generate a short alphanumeric ID (8 characters)
  const generateShortId = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  // Fetch the user's current geolocation
  const handleLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Unable to fetch location. Make sure location services are enabled.");
      }
    );
  };

  // Handle up to 3 images and generate previews
  const handleImageUpload = (e) => {
    const fileList = Array.from(e.target.files);
    const firstThree = fileList.slice(0, 3);
    const withPreviews = firstThree.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(withPreviews);
  };

  // Cleanup object URLs when images change or component unmounts
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [images]);

  // Handle details textarea with 300-character max
  const handleDetailsChange = (e) => {
    const text = e.target.value;
    if (text.length <= 300) {
      setDetails(text);
    } else {
      setDetails(text.substring(0, 300));
    }
  };

  // Handle phone input: only digits, max length 9, must start with '5'
  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");        // strip non-digits
    if (val.length === 0) {
      setPhone("");
      return;
    }
    // Enforce first digit ‘5’
    if (val.length === 1) {
      if (val[0] === "5") {
        setPhone(val);
      } else {
        return;
      }
    } else {
      if (val.length <= 9 && val[0] === "5") {
        setPhone(val);
      } else if (val.length > 9) {
        setPhone(val.substring(0, 9));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Require location before submitting
    if (!location) {
      alert("Please capture your current location before submitting.");
      return;
    }
    // Require phone to be exactly 9 digits (all start with ‘5’)
    if (phone.length !== 9) {
      alert("Please enter a valid 9-digit Saudi mobile number (starting with 5).");
      return;
    }

    // Generate a short, unique complaint ID
    const shortId = generateShortId();
    setConfirmation({
      message: "Complaint submitted successfully!",
      id: shortId,
    });

    // (Optional) Send { category, subcategory, phone: '+966' + phone, details, location, images[].file } to your backend

    // Reset the form fields
    setCategory("");
    setSubcategory("");
    setPhone("");
    setDetails("");
    setLocation(null);
    setImages([]);
  };

  // Copy ID to clipboard
  const copyToClipboard = () => {
    if (confirmation && navigator.clipboard) {
      navigator.clipboard
        .writeText(confirmation.id)
        .then(() => {
          alert("Complaint ID copied to clipboard");
        })
        .catch((err) => {
          console.error("Could not copy text: ", err);
        });
    }
  };

  // Get the subcategories for the currently selected category
  const subcategories = category ? CATEGORY_OPTIONS[category] : [];

  // Character count in details
  const charCount = details.length;

  return (
    <div className="app-container">
      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Alemna</h2>
        {/* Main Category */}
        <label className="form-label" htmlFor="category">
          Complaint Category
        </label>
        <select
          id="category"
          className="form-select"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setSubcategory("");
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

        {/* Issue Type */}
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

        {/* Contact Phone Number (hard-coded +966 prefix) */}
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
            placeholder="5XXXXXXXX"
            required
          />
        </div>

        {/* Tell Us More */}
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
        <div
          className="location-text"
          style={{ textAlign: "right", marginBottom: "1rem" }}
        >
          {charCount}/300 characters
        </div>

        {/* Get Current Location (required) */}
        <div style={{ marginBottom: "1rem" }}>
          <button
            type="button"
            className="button-base button-secondary"
            onClick={handleLocation}
          >
            📍 Get Current Location *
          </button>
          {location && (
            <div className="location-text">
              Latitude: {location.latitude.toFixed(5)}, Longitude: {" "}
              {location.longitude.toFixed(5)} {" "}
              <a
                href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: "0.5rem", color: "var(--color-zain)" }}
              >
                View on Google Maps
              </a>
            </div>
          )}
        </div>

        {/* Upload up to 3 Photos */}
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

        {/* Submit Button */}
        <button type="submit" className="button-base button-primary">
          🚀 Submit Complaint
        </button>

        {/* Confirmation Message with Copy Feature */}
        {confirmation && (
          <div className="confirmation">
            <p>{confirmation.message}</p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "0.5rem",
              }}
            >
              <span style={{ fontWeight: 600 }}>{confirmation.id}</span>
              <button
                type="button"
                onClick={copyToClipboard}
                className="button-base button-secondary"
                style={{ padding: "0.3rem 0.6rem", fontSize: "0.85rem" }}
              >
                Copy ID
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}