import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { apiClient } from "../utils/apiClient";
import Swal from "sweetalert2";
import LogoutButton from "./LogoutButton";
import EscapeRoutes from "./EscapeRoutes";
import "../styles/balanced-halloween.css";

const UserDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "other",
    description: "",
    latitude: "",
    longitude: "",
    severity: 3,
  });
  
  // Escape routes state management
  const [escapeRoutesLocation, setEscapeRoutesLocation] = useState({
    latitude: "",
    longitude: ""
  });
  const [triggerEscapeSearch, setTriggerEscapeSearch] = useState(false);

  // Get current user
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  };

  // Fetch user's own incidents
  const fetchMyIncidents = async () => {
    try {
      const user = await getCurrentUser();
      const res = await apiClient.get("/api/incidents");
      // Filter to show only user's own incidents
      const myIncidents = res.data.incidents?.filter(i => i.user_id === user.id) || [];
      setIncidents(myIncidents);
    } catch (err) {
      console.error("Error fetching incidents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyIncidents();
  }, []);

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lon = position.coords.longitude.toFixed(6);
          
          // Update incident form
          setFormData({
            ...formData,
            latitude: lat,
            longitude: lon,
          });
          
          // Update escape routes and trigger search
          setEscapeRoutesLocation({ latitude: lat, longitude: lon });
          setTriggerEscapeSearch(true);
          
          Swal.fire({
            icon: "success",
            title: "Location Captured",
            text: "Your current location has been added to the report.",
            background: "#1a1f2e",
            color: "#e5e7eb",
            confirmButtonColor: "#ff6b35",
            timer: 2000,
            showConfirmButton: false,
          });
        },
        (error) => {
          // Handle GPS errors gracefully with specific error messages
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
      Swal.fire({
        icon: "error",
        title: "Not Supported",
        text: "Geolocation is not supported by your browser. Please enter coordinates manually.",
        background: "#1a1f2e",
        color: "#e5e7eb",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // Submit incident report
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const user = await getCurrentUser();
      
      const incidentData = {
        user_id: user.id,
        name: formData.name,
        type: formData.type,
        description: formData.description,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        severity: parseInt(formData.severity),
        status: "active",
      };

      await apiClient.post("/api/incidents", incidentData);

      Swal.fire({
        icon: "success",
        title: "Incident Reported",
        text: "Your incident has been reported successfully!",
        background: "#1a1f2e",
        color: "#e5e7eb",
        confirmButtonColor: "#10b981",
      });

      // Reset form and refresh incidents
      setFormData({
        name: "",
        type: "other",
        description: "",
        latitude: "",
        longitude: "",
        severity: 3,
      });
      setShowReportForm(false);
      fetchMyIncidents();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Report Failed",
        text: err.response?.data?.error || "Failed to submit incident report.",
        background: "#1a1f2e",
        color: "#e5e7eb",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", position: "relative" }}>
      {/* Subtle decoration */}
      <div className="subtle-decoration" style={{ top: "5%", right: "5%" }}>🎃</div>
      
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "2rem",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <h1 className="page-header">
          <span className="accent">Phantom</span>Ops User Portal
        </h1>
        <LogoutButton />
      </div>

      {/* Report Incident Button */}
      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={() => {
            if (showReportForm) {
              // Reset escape routes data when form is cancelled
              setEscapeRoutesLocation({ latitude: "", longitude: "" });
              setTriggerEscapeSearch(false);
            }
            setShowReportForm(!showReportForm);
          }}
          className="btn-primary"
        >
          {showReportForm ? "✕ Cancel" : "🚨 Report New Incident"}
        </button>
      </div>

      {/* Report Form */}
      {showReportForm && (
        <div className="professional-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
          <h2 className="section-header">Report Safety Incident</h2>
          
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#d1d5db", fontSize: "0.9rem" }}>
                Your Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="input-field"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#d1d5db", fontSize: "0.9rem" }}>
                Incident Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
                className="select-field"
                style={{ width: "100%" }}
              >
                <option value="fire">🔥 Fire</option>
                <option value="medical">⚕️ Medical Emergency</option>
                <option value="accident">💥 Accident</option>
                <option value="harassment">⚠️ Harassment</option>
                <option value="other">❓ Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#d1d5db", fontSize: "0.9rem" }}>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="input-field"
                placeholder="Describe what happened..."
                rows="4"
                style={{ resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "1rem", alignItems: "end" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#d1d5db", fontSize: "0.9rem" }}>
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  required
                  className="input-field"
                  placeholder="40.7128"
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#d1d5db", fontSize: "0.9rem" }}>
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  required
                  className="input-field"
                  placeholder="-74.0060"
                />
              </div>

              <button
                type="button"
                onClick={getCurrentLocation}
                className="btn-success"
                style={{ whiteSpace: "nowrap" }}
              >
                📍 Use My Location
              </button>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#d1d5db", fontSize: "0.9rem" }}>
                Severity: {formData.severity}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                style={{ width: "100%" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.5rem" }}>
                <span>1 - Minor</span>
                <span>3 - Moderate</span>
                <span>5 - Critical</span>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: "0.5rem" }}>
              Submit Report
            </button>
          </form>
        </div>
      )}

      {/* Escape Routes Component */}
      {showReportForm && (
        <EscapeRoutes 
          initialLocation={escapeRoutesLocation}
          autoSearch={triggerEscapeSearch}
        />
      )}

      {/* My Incidents */}
      <div className="professional-card" style={{ padding: "2rem" }}>
        <h2 className="section-header">My Incident Reports</h2>
        
        {incidents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
            <p>No incidents reported yet.</p>
            <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
              Click "Report New Incident" to submit your first report.
            </p>
          </div>
        ) : (
          <div className="data-table">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.id}>
                    <td>#{incident.id}</td>
                    <td>
                      {incident.type === "fire" && "🔥"}
                      {incident.type === "medical" && "⚕️"}
                      {incident.type === "accident" && "💥"}
                      {incident.type === "harassment" && "⚠️"}
                      {incident.type === "other" && "❓"}
                      {" "}{incident.type}
                    </td>
                    <td style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {incident.description}
                    </td>
                    <td>
                      <span className={`severity-indicator severity-${incident.severity}`}>
                        Level {incident.severity}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${incident.status}`}>
                        {incident.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                      {new Date(incident.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
