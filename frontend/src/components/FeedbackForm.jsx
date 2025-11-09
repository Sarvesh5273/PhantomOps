import { useState } from "react";
import Swal from "sweetalert2";
import { apiClient } from "../utils/apiClient";

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: "",
    message: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await apiClient.post("/api/feedback", formData);
      Swal.fire({
        icon: "success",
        title: "✅ Feedback Submitted!",
        text: "Thanks for helping improve PhantomOps 💬",
        background: "#111827",
        color: "#fff",
      });
      setFormData({ name: "", email: "", rating: "", message: "" });
      console.log("Feedback response:", res.data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err.response?.data?.error || err.message,
        background: "#111827",
        color: "#fff",
      });
    }
  };

  return (
    <div
      style={{
        background: "#1e293b",
        padding: "1.5rem",
        borderRadius: "1rem",
        marginTop: "1.5rem",
        maxWidth: "400px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Send Feedback</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
      >
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="rating"
          placeholder="Rating (1-5)"
          min="1"
          max="5"
          value={formData.rating}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          style={{
            background: "#3b82f6",
            color: "white",
            border: "none",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
}
