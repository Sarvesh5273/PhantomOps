import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { apiClient } from "../utils/apiClient";
import LogoutButton from "./LogoutButton";
import EnrichmentPanel from "./EnrichmentPanel";
import "../styles/halloween.css";

const AdminDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [filters, setFilters] = useState({
    type: "all",
    severity: "all",
    status: "all",
  });
  const [loading, setLoading] = useState(true); // ✅ Added loading state
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showEnrichmentPanel, setShowEnrichmentPanel] = useState(false);

  // ✅ Fetch incidents from Flask backend
  const fetchIncidents = async () => {
    try {
      const res = await apiClient.get("/api/incidents");
      setIncidents(res.data.incidents || []);
    } catch (err) {
      console.error("❌ Error fetching incidents:", err.response?.data || err.message);
    }
  };

  // ✅ Resolve incident via Flask route
  const resolveIncident = async (id) => {
    const confirm = await Swal.fire({
      title: "Mark as Resolved?",
      text: "Are you sure you want to mark this incident as resolved?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#ef4444",
      background: "#0f172a",
      color: "#fff",
    });

    if (confirm.isConfirmed) {
      try {
        await apiClient.patch(`/api/incidents/${id}/resolve`);
        Swal.fire("✅ Resolved!", "Incident marked as resolved.", "success");
        fetchIncidents();
      } catch (err) {
        Swal.fire("❌ Error", err.response?.data?.error || "Failed to resolve.", "error");
      }
    }
  };

  // ✅ Handle incident click to open enrichment panel
  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident);
    setShowEnrichmentPanel(true);
  };

  // ✅ Handle enrichment panel close
  const handleCloseEnrichment = () => {
    setSelectedIncident(null);
    setShowEnrichmentPanel(false);
  };

  // ✅ Load incidents on mount
  useEffect(() => {
    const fetchData = async () => {
      await fetchIncidents();
      setLoading(false);
    };
    fetchData();
  }, []);

  // ✅ Show loading message until data is fetched
  if (loading) {
    return (
      <div
        style={{
          color: "#fff",
          textAlign: "center",
          padding: "2rem",
          background: "#0f172a",
          minHeight: "100vh",
        }}
      >
        ⏳ Loading incidents...
      </div>
    );
  }

  // 🎛️ Apply filters
  const filtered = incidents.filter((i) => {
    return (
      (filters.type === "all" || i.type === filters.type) &&
      (filters.severity === "all" || i.severity === parseInt(filters.severity)) &&
      (filters.status === "all" || i.status === filters.status)
    );
  });

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", position: "relative" }}>
      {/* Floating Decorations */}
      <div className="floating-ghost" style={{ top: "5%", left: "5%" }}>👻</div>
      <div className="floating-ghost" style={{ top: "10%", right: "8%", animationDelay: "2s" }}>🦇</div>
      <div className="pumpkin-decoration" style={{ bottom: "5%", left: "3%" }}>🎃</div>
      <div className="pumpkin-decoration" style={{ bottom: "10%", right: "5%", animationDelay: "1s" }}>💀</div>
      
      {/* 🔐 Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <h1 className="halloween-section-header spooky-text" style={{ 
          fontSize: "2.5rem",
          margin: 0
        }}>
          👻 Phantom Command Center 🎃
        </h1>
        <LogoutButton />
      </div>

      {/* 🎛️ Filters */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="halloween-select"
        >
          <option value="all">🔮 All Types</option>
          <option value="fire">🔥 Fire</option>
          <option value="medical">⚕️ Medical</option>
          <option value="harassment">⚠️ Harassment</option>
          <option value="accident">💥 Accident</option>
          <option value="other">❓ Other</option>
        </select>

        <select
          value={filters.severity}
          onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
          className="halloween-select"
        >
          <option value="all">⚡ All Severity</option>
          {[1, 2, 3, 4, 5].map((s) => (
            <option key={s} value={s}>
              {"💀".repeat(s)} Level {s}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="halloween-select"
        >
          <option value="all">👁️ All Status</option>
          <option value="active">🔴 Active</option>
          <option value="acknowledged">🟡 Acknowledged</option>
          <option value="resolved">🟢 Resolved</option>
        </select>
      </div>

      {/* 📋 Incident Table */}
      <div className="halloween-table" style={{ position: "relative" }}>
        <div className="cobweb-corner" />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>🆔 ID</th>
              <th>👤 Name</th>
              <th>📍 Type</th>
              <th>💀 Severity</th>
              <th>🎯 Status</th>
              <th>⚡ Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: "3rem", textAlign: "center" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👻</div>
                  <div style={{ color: "var(--halloween-orange)" }}>
                    No spirits detected... yet
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((i) => (
                <tr
                  key={i.id}
                  onClick={() => handleIncidentClick(i)}
                  className="ghost-hover"
                >
                  <td style={{ textAlign: "center" }}>#{i.id}</td>
                  <td style={{ textAlign: "center" }}>{i.name}</td>
                  <td style={{ textAlign: "center" }}>
                    {i.type === "fire" && "🔥"}
                    {i.type === "medical" && "⚕️"}
                    {i.type === "harassment" && "⚠️"}
                    {i.type === "accident" && "💥"}
                    {i.type === "other" && "❓"}
                    {" "}{i.type}
                  </td>
                  <td style={{ textAlign: "center" }} className={`severity-${i.severity}`}>
                    {"💀".repeat(i.severity)}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className={`halloween-badge halloween-badge-${i.status}`}>
                      {i.status === "active" && "🔴"}
                      {i.status === "acknowledged" && "🟡"}
                      {i.status === "resolved" && "🟢"}
                      {" "}{i.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {i.status !== "resolved" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resolveIncident(i.id);
                        }}
                        className="halloween-button-danger"
                        style={{ padding: "8px 16px" }}
                      >
                        ✅ Banish
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🔍 Enrichment Panel Modal */}
      {showEnrichmentPanel && selectedIncident && (
        <EnrichmentPanel
          incidentId={selectedIncident.id}
          incidentData={selectedIncident}
          onClose={handleCloseEnrichment}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
