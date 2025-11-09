from flask import Blueprint, request, jsonify
from config.supabase_client import supabase
from datetime import datetime

incidents_bp = Blueprint('incidents_bp', __name__)

# 🧾 Report a new incident
@incidents_bp.route('/api/incidents', methods=['POST'])
def report_incident():
    try:
        data = request.get_json(force=True)

        # Explicit mapping for safety
        incident_data = {
            "user_id": data.get("user_id"),
            "name": data.get("name"),
            "type": data.get("type", "other"),
            "description": data.get("description"),
            "latitude": data.get("latitude"),
            "longitude": data.get("longitude"),
            "severity": data.get("severity", 3),
            "status": data.get("status", "active"),
            "created_at": datetime.utcnow().isoformat()
        }

        # Validation for critical fields
        if not incident_data["user_id"] or not incident_data["name"] or not incident_data["description"]:
            return jsonify({"error": "Missing required fields (user_id, name, or description)."}), 400

        # Insert into Supabase
        response = supabase.table("incidents").insert(incident_data).execute()

        return jsonify({
            "message": "✅ Incident reported successfully!",
            "data": response.data
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 📡 Get all incidents
@incidents_bp.route('/api/incidents', methods=['GET'])
def get_incidents():
    try:
        response = supabase.table("incidents").select("*").order("created_at", desc=True).execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ Mark an incident as resolved
@incidents_bp.route("/api/incidents/<int:incident_id>/resolve", methods=["PATCH"])
def resolve_incident(incident_id):
    try:
        response = supabase.table("incidents") \
            .update({"status": "resolved"}) \
            .eq("id", incident_id) \
            .execute()

        if not response.data:
            return jsonify({"error": "Incident not found"}), 404

        return jsonify({
            "message": "✅ Incident marked as resolved",
            "data": response.data
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

