import { useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";
import Swal from "sweetalert2";
import "../styles/balanced-halloween.css";

const EscapeRoutes = ({ initialLocation, autoSearch }) => {
  const [escapeData, setEscapeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ latitude: "", longitude: "" });
  const [error, setError] = useState(null);

  // Sync location state with props and trigger automatic search
  useEffect(() => {
    if (initialLocation?.latitude && initialLocation?.longitude) {
      setLocation({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude
      });
      
      if (autoSearch) {
        fetchEscapeRoutes(initialLocation.latitude, initialLocation.longitude);
      }
    }
  }, [initialLocation, autoSearch]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocation({ latitude: lat, longitude: lon });
          fetchEscapeRoutes(lat, lon);
        },
        (error) => {
          let errorMessage = "Could not get your location. Please enter manually.";
          let errorTitle = "Location Error";
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorTitle = "Permission Denied";
              errorMessage = "Location access was denied. Please enable location permissions in your browser settings and try again.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorTitle = "Location Unavailable";
              errorMessage = "Your location information is unavailable. Please check your device settings or enter coordinates manually.";
              break;
            case error.TIMEOUT:
              errorTitle = "Request Timeout";
              errorMessage = "Location request timed out. Please try again or enter coordinates manually.";
              break;
            default:
              errorMessage = "An unknown error occurred while getting your location. Please enter coordinates manually.";
          }
          
          setError(errorMessage);
          Swal.fire({
            icon: "error",
            title: errorTitle,
            text: errorMessage,
            background: "#1a1f2e",
            color: "#e5e7eb",
            confirmButtonColor: "#ef4444",
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      const errorMsg = "Geolocation is not supported by your browser. Please enter coordinates manually.";
      setError(errorMsg);
      Swal.fire({
        icon: "error",
        title: "Not Supported",
        text: errorMsg,
        background: "#1a1f2e",
        color: "#e5e7eb",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // Validate coordinates
  const validateCoordinates = (lat, lon) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return { valid: false, message: "Please enter valid numeric coordinates." };
    }
    
    if (latitude < -90 || latitude > 90) {
      return { valid: false, message: "Latitude must be between -90 and 90 degrees." };
    }
    
    if (longitude < -180 || longitude > 180) {
      return { valid: false, message: "Longitude must be between -180 and 180 degrees." };
    }
    
    return { valid: true };
  };

  const fetchEscapeRoutes = async (lat, lon) => {
    // Validate coordinates before making API call
    const validation = validateCoordinates(lat, lon);
    if (!validation.valid) {
      setError(validation.message);
      Swal.fire({
        icon: "warning",
        title: "Invalid Coordinates",
        text: validation.message,
        background: "#1a1f2e",
        color: "#e5e7eb",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/api/escape-routes?latitude=${lat}&longitude=${lon}`);
      setEscapeData(response.data);
      
      // Check if all categories are empty
      const hasResults = (
        (response.data.hospitals && response.data.hospitals.length > 0) ||
        (response.data.police_stations && response.data.police_stations.length > 0) ||
        (response.data.fire_stations && response.data.fire_stations.length > 0)
      );
      
      if (!hasResults) {
        setError("No safety resources found within 5km of this location. Try a different location or expand your search area.");
      }
    } catch (err) {
      let errorMessage = "Failed to fetch escape routes. Please try again.";
      let errorTitle = "Error";
      
      if (err.response) {
        // Server responded with error
        if (err.response.status === 400) {
          errorTitle = "Invalid Request";
          errorMessage = err.response.data?.error || "Invalid coordinates provided.";
        } else if (err.response.status === 401) {
          errorTitle = "Authentication Error";
          errorMessage = "Your session has expired. Please log in again.";
        } else if (err.response.status === 500) {
          errorTitle = "Server Error";
          errorMessage = "The server encountered an error. Please try again later.";
        } else if (err.response.status === 503) {
          errorTitle = "Service Unavailable";
          errorMessage = "The mapping service is temporarily unavailable. Please try again later.";
        } else {
          errorMessage = err.response.data?.error || errorMessage;
        }
      } else if (err.request) {
        // Request made but no response
        errorTitle = "Network Error";
        errorMessage = "Unable to reach the server. Please check your internet connection and try again.";
      } else {
        // Something else happened
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      Swal.fire({
        icon: "error",
        title: errorTitle,
        text: errorMessage,
        background: "#1a1f2e",
        color: "#e5e7eb",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = () => {
    if (!location.latitude || !location.longitude) {
      const errorMsg = "Please enter both latitude and longitude, or use the GPS button to get your current location.";
      setError(errorMsg);
      Swal.fire({
        icon: "warning",
        title: "Missing Location",
        text: errorMsg,
        background: "#1a1f2e",
        color: "#e5e7eb",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }
    
    fetchEscapeRoutes(location.latitude, location.longitude);
  };

  return (
    <div className="professional-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
      <h2 className="section-header">🗺️ Find Nearby Safety Resources</h2>
      
      <p style={{ color: "#9ca3af", marginBottom: "1.5rem" }}>
        Find nearby hospitals, police stations, and fire stations in case of emergency.
      </p>

      {/* Location Input */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input
          type="number"
          step="any"
          placeholder="Latitude (e.g., 40.7128)"
          value={location.latitude}
          onChange={(e) => {
            setLocation({ ...location, latitude: e.target.value });
            setError(null);
          }}
          className="input-field"
          style={{ flex: 1, minWidth: "150px" }}
          disabled={loading}
        />
        <input
          type="number"
          step="any"
          placeholder="Longitude (e.g., -74.0060)"
          value={location.longitude}
          onChange={(e) => {
            setLocation({ ...location, longitude: e.target.value });
            setError(null);
          }}
          className="input-field"
          style={{ flex: 1, minWidth: "150px" }}
          disabled={loading}
        />
        <button 
          onClick={getCurrentLocation} 
          className="btn-success" 
          style={{ whiteSpace: "nowrap" }}
          disabled={loading}
        >
          📍 Use My Location
        </button>
        <button 
          onClick={handleManualSearch} 
          className="btn-primary" 
          disabled={loading}
        >
          {loading ? "Searching..." : "🔍 Search"}
        </button>
      </div>

      {/* Error Display */}
      {error && !loading && (
        <div style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1.5rem",
          color: "#fca5a5",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <span style={{ fontSize: "1.2rem" }}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ 
          textAlign: "center", 
          padding: "3rem",
          background: "rgba(255, 107, 53, 0.05)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 107, 53, 0.2)"
        }}>
          <div className="loading-spinner" style={{ margin: "0 auto" }}></div>
          <p style={{ color: "#ff6b35", marginTop: "1rem", fontWeight: "500" }}>
            🔍 Searching for nearby safety resources...
          </p>
          <p style={{ color: "#9ca3af", marginTop: "0.5rem", fontSize: "0.9rem" }}>
            This may take a few seconds
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && escapeData && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {/* Hospitals */}
          <div className="professional-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ color: "#10b981", fontSize: "1.2rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              🏥 Hospitals
            </h3>
            {escapeData.hospitals && escapeData.hospitals.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {escapeData.hospitals.map((place, index) => (
                  <div
                    key={index}
                    style={{
                      background: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      borderRadius: "8px",
                      padding: "1rem",
                    }}
                  >
                    <div style={{ fontWeight: "600", color: "#6ee7b7", marginBottom: "0.5rem" }}>
                      {place.name}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                      📍 {place.distance_km} km away
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.9rem", color: "#10b981", textDecoration: "none", marginTop: "0.5rem", display: "inline-block" }}
                    >
                      Get Directions →
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: "center", 
                padding: "2rem", 
                color: "#64748b",
                background: "rgba(100, 116, 139, 0.05)",
                borderRadius: "8px"
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏥</div>
                <p style={{ fontWeight: "500" }}>No hospitals found</p>
                <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  No hospitals within 5km of this location
                </p>
              </div>
            )}
          </div>

          {/* Police Stations */}
          <div className="professional-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ color: "#3b82f6", fontSize: "1.2rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              🚔 Police Stations
            </h3>
            {escapeData.police_stations && escapeData.police_stations.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {escapeData.police_stations.map((place, index) => (
                  <div
                    key={index}
                    style={{
                      background: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      borderRadius: "8px",
                      padding: "1rem",
                    }}
                  >
                    <div style={{ fontWeight: "600", color: "#93c5fd", marginBottom: "0.5rem" }}>
                      {place.name}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                      📍 {place.distance_km} km away
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.9rem", color: "#3b82f6", textDecoration: "none", marginTop: "0.5rem", display: "inline-block" }}
                    >
                      Get Directions →
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: "center", 
                padding: "2rem", 
                color: "#64748b",
                background: "rgba(100, 116, 139, 0.05)",
                borderRadius: "8px"
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🚔</div>
                <p style={{ fontWeight: "500" }}>No police stations found</p>
                <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  No police stations within 5km of this location
                </p>
              </div>
            )}
          </div>

          {/* Fire Stations */}
          <div className="professional-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ color: "#ef4444", fontSize: "1.2rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              🚒 Fire Stations
            </h3>
            {escapeData.fire_stations && escapeData.fire_stations.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {escapeData.fire_stations.map((place, index) => (
                  <div
                    key={index}
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: "8px",
                      padding: "1rem",
                    }}
                  >
                    <div style={{ fontWeight: "600", color: "#fca5a5", marginBottom: "0.5rem" }}>
                      {place.name}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                      📍 {place.distance_km} km away
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.9rem", color: "#ef4444", textDecoration: "none", marginTop: "0.5rem", display: "inline-block" }}
                    >
                      Get Directions →
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: "center", 
                padding: "2rem", 
                color: "#64748b",
                background: "rgba(100, 116, 139, 0.05)",
                borderRadius: "8px"
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🚒</div>
                <p style={{ fontWeight: "500" }}>No fire stations found</p>
                <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  No fire stations within 5km of this location
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Initial State */}
      {!loading && !escapeData && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗺️</div>
          <p>Enter your location or use GPS to find nearby safety resources.</p>
        </div>
      )}
    </div>
  );
};

export default EscapeRoutes;
