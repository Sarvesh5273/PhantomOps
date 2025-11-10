import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { apiClient } from "../utils/apiClient";
import "../styles/halloween.css";

const EnrichmentPanel = ({ incidentId, onClose, incidentData }) => {
  const [enrichmentData, setEnrichmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch enrichment data on mount
  useEffect(() => {
    fetchEnrichmentData();
    
    // Add escape key listener
    const handleEscape = (e) => {
      if (e.key === "Escape" && !loading) {
        handleClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [incidentId]);

  const fetchEnrichmentData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timeout after 30 seconds")), 30000)
      );
      
      // Race between API call and timeout
      const apiPromise = apiClient.get(`/api/incidents/${incidentId}/enrich`);
      const response = await Promise.race([apiPromise, timeoutPromise]);
      
      setEnrichmentData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching enrichment data:", err);
      setError(err.response?.data?.error || err.message || "Failed to load enrichment data");
      setLoading(false);
      
      // Show error notification
      Swal.fire({
        title: "Error",
        text: err.response?.data?.error || err.message || "Failed to load enrichment data",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEnrichmentData(null);
      setError(null);
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className="halloween-modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={handleOverlayClick}
    >
      <div
        className="halloween-modal pulse-glow"
        style={{
          maxWidth: "1200px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative"
        }}
      >
        {/* Header */}
        <div className="cobweb-corner" />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.5rem",
            borderBottom: "2px solid var(--halloween-orange)",
            position: "sticky",
            top: 0,
            background: "var(--spooky-gradient)",
            zIndex: 10,
          }}
        >
          <h2 className="text-glow-orange spooky-text" style={{ 
            fontSize: "1.8rem", 
            fontWeight: "600", 
            margin: 0 
          }}>
            👻 Phantom Intel: Incident #{incidentId} 🎃
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="halloween-button-danger"
            style={{
              fontSize: "1.2rem",
              padding: "0.5rem 1rem",
              opacity: loading ? 0.5 : 1
            }}
            title="Close"
          >
            ✕ Dismiss
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div
            style={{
              padding: "4rem 2rem",
              textAlign: "center",
            }}
          >
            <div className="halloween-loading" style={{ marginBottom: "1rem" }}>🎃</div>
            <div className="text-glow-orange" style={{ fontSize: "1.5rem" }}>
              Summoning phantom data... 👻
            </div>
            <div style={{ color: "var(--halloween-ghost-white)", opacity: 0.6, marginTop: "1rem" }}>
              Consulting the spirits... 🕸️
            </div>
          </div>
        )}

        {/* Content Grid */}
        {!loading && enrichmentData && (
          <div
            style={{
              padding: "1.5rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {/* Reddit Posts Section */}
            <div className="halloween-card" style={{ padding: "1.5rem" }}>
              <h3 className="text-glow-orange" style={{ 
                fontSize: "1.4rem", 
                fontWeight: "600", 
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                💬 Reddit Discussion
              </h3>
              {enrichmentData.reddit_posts && enrichmentData.reddit_posts.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {enrichmentData.reddit_posts.map((post, index) => (
                    <div
                      key={post.id || index}
                      style={{
                        background: "#0f172a",
                        borderRadius: "6px",
                        padding: "1rem",
                        borderLeft: "3px solid #ff4500",
                      }}
                    >
                      <div style={{ fontSize: "0.85rem", color: "#ff4500", marginBottom: "0.5rem" }}>
                        {post.subreddit} • {post.username}
                      </div>
                      <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#e2e8f0", marginBottom: "0.5rem" }}>
                        {post.text}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                        {new Date(post.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#64748b", fontSize: "0.95rem", textAlign: "center", padding: "2rem" }}>
                  No Reddit posts found
                </div>
              )}
            </div>

            {/* Weather Section */}
            <div className="halloween-card" style={{ padding: "1.5rem" }}>
              <h3 className="text-glow-green" style={{ 
                fontSize: "1.4rem", 
                fontWeight: "600", 
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                🌤️ Weather Conditions
              </h3>
              {enrichmentData.weather_data ? (
                <div style={{
                  background: "#0f172a",
                  borderRadius: "6px",
                  padding: "1.5rem",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                    {enrichmentData.weather_data.icon && (
                      <img 
                        src={`https://openweathermap.org/img/wn/${enrichmentData.weather_data.icon}@2x.png`}
                        alt="Weather icon"
                        style={{ width: "80px", height: "80px" }}
                      />
                    )}
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: "600", color: "#60a5fa", marginBottom: "0.5rem" }}>
                    {Math.round(enrichmentData.weather_data.temperature)}°C
                  </div>
                  <div style={{ fontSize: "1rem", color: "#e2e8f0", marginBottom: "1rem", textTransform: "capitalize" }}>
                    {enrichmentData.weather_data.description}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.9rem", color: "#94a3b8" }}>
                    <div>Feels like: {Math.round(enrichmentData.weather_data.feels_like)}°C</div>
                    <div>Humidity: {enrichmentData.weather_data.humidity}%</div>
                    <div>Wind: {enrichmentData.weather_data.wind_speed} m/s</div>
                    <div>Clouds: {enrichmentData.weather_data.clouds}%</div>
                  </div>
                  {enrichmentData.weather_data.location && (
                    <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#64748b" }}>
                      📍 {enrichmentData.weather_data.location}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: "#64748b", fontSize: "0.95rem", textAlign: "center", padding: "2rem" }}>
                  Weather data unavailable
                </div>
              )}
            </div>

            {/* News Section */}
            <div className="halloween-card" style={{ padding: "1.5rem" }}>
              <h3 className="text-glow-red" style={{ 
                fontSize: "1.4rem", 
                fontWeight: "600", 
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                📰 Graveyard Gazette (News)
              </h3>
              {enrichmentData.news_items && enrichmentData.news_items.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {enrichmentData.news_items.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        background: "#0f172a",
                        borderRadius: "6px",
                        padding: "1rem",
                        borderLeft: "3px solid #f59e0b",
                      }}
                    >
                      <div style={{ fontSize: "1rem", fontWeight: "600", color: "#fbbf24", marginBottom: "0.5rem" }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "0.5rem" }}>
                        {new Date(item.published).toLocaleString()}
                      </div>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "0.9rem",
                          color: "#60a5fa",
                          textDecoration: "none",
                        }}
                      >
                        Read more →
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#64748b", fontSize: "0.95rem", textAlign: "center", padding: "2rem" }}>
                  No news items found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrichmentPanel;
