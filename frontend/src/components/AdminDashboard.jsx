import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { apiClient } from "../utils/apiClient";
import LogoutButton from "./LogoutButton";

const AdminDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [filters, setFilters] = useState({
    type: "all",
    severity: "all",
    status: "all",
  });
  const [loading, setLoading] = useState(true); // ✅ Added loading state

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
    <div style={{ background: "#0f172a", color: "#fff", minHeight: "100vh", padding: "2rem" }}>
      {/* 🔐 Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1 style={{ fontSize: "1.6rem", fontWeight: "600" }}>🧠 PhantomOps Admin Dashboard</h1>
        <LogoutButton />
      </div>

      {/* 🎛️ Filters */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="all">All Types</option>
          <option value="fire">Fire</option>
          <option value="medical">Medical</option>
          <option value="harassment">Harassment</option>
          <option value="accident">Accident</option>
          <option value="other">Other</option>
        </select>

        <select
          value={filters.severity}
          onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
        >
          <option value="all">All Severity</option>
          {[1, 2, 3, 4, 5].map((s) => (
            <option key={s} value={s}>
              Severity {s}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* 📋 Incident Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#1e293b",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <thead>
          <tr style={{ background: "#334155" }}>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ padding: "1rem", textAlign: "center", color: "#94a3b8" }}>
                No incidents found.
              </td>
            </tr>
          ) : (
            filtered.map((i) => (
              <tr
                key={i.id}
                style={{ textAlign: "center", borderBottom: "1px solid #475569" }}
              >
                <td>{i.id}</td>
                <td>{i.name}</td>
                <td>{i.type}</td>
                <td>{i.severity}</td>
                <td style={{ color: i.status === "resolved" ? "#22c55e" : "#f59e0b" }}>
                  {i.status}
                </td>
                <td>
                  {i.status !== "resolved" && (
                    <button
                      onClick={() => resolveIncident(i.id)}
                      style={{
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        padding: "5px 10px",
                        cursor: "pointer",
                      }}
                    >
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
