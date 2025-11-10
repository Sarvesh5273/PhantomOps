from flask import Blueprint, request, jsonify
from config.supabase_client import supabase
from auth_utils import verify_jwt_from_request
from datetime import datetime
import os
from supabase import create_client, Client

incidents_bp = Blueprint('incidents_bp', __name__)

def get_supabase_with_jwt():
    """Create a Supabase client with the user's JWT token for RLS"""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        jwt_token = auth_header.split(" ")[1]
        # Create a new client with custom headers including JWT
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_ANON_KEY")
        
        # Create client and manually set auth header
        client: Client = create_client(url, key)
        # Override the postgrest client headers to include JWT
        client.postgrest.auth(jwt_token)
        return client
    return supabase  # Fallback to default client

# 🧾 Report a new incident
@incidents_bp.route('/api/incidents', methods=['POST'])
def report_incident():
    # Verify JWT first
    decoded, err, code = verify_jwt_from_request()
    if err:
        return err, code
    
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

        # Use Supabase client with JWT token for RLS
        supabase_with_jwt = get_supabase_with_jwt()
        response = supabase_with_jwt.table("incidents").insert(incident_data).execute()

        return jsonify({
            "message": "✅ Incident reported successfully!",
            "data": response.data
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 📡 Get all incidents
@incidents_bp.route('/api/incidents', methods=['GET'])
def get_incidents():
    # Verify JWT first
    decoded, err, code = verify_jwt_from_request()
    if err:
        return err, code
    
    try:
        # Use Supabase client with JWT token for RLS
        supabase_with_jwt = get_supabase_with_jwt()
        response = supabase_with_jwt.table("incidents").select("*").order("created_at", desc=True).execute()
        return jsonify({"incidents": response.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ Mark an incident as resolved
@incidents_bp.route("/api/incidents/<int:incident_id>/resolve", methods=["PATCH"])
def resolve_incident(incident_id):
    # Verify JWT first
    decoded, err, code = verify_jwt_from_request()
    if err:
        return err, code
    
    try:
        # Use Supabase client with JWT token for RLS
        supabase_with_jwt = get_supabase_with_jwt()
        response = supabase_with_jwt.table("incidents") \
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

