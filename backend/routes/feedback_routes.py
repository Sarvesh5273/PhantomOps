from flask import Blueprint, jsonify, request
from config.supabase_client import supabase

feedback_bp = Blueprint("feedback", __name__)

# ✅ GET all feedback
@feedback_bp.route("/api/feedback", methods=["GET"])
def get_feedback():
    try:
        response = supabase.table("feedback").select("*").order("created_at", desc=True).execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ POST new feedback
@feedback_bp.route("/api/feedback", methods=["POST"])
def add_feedback():
    data = request.get_json()
    try:
        name = data.get("name")
        email = data.get("email")
        rating = data.get("rating")
        message = data.get("message")

        if not all([name, email, rating, message]):
            return jsonify({"error": "All fields are required"}), 400

        supabase.table("feedback").insert({
            "name": name,
            "email": email,
            "rating": rating,
            "message": message
        }).execute()

        return jsonify({"message": "Feedback added successfully ✅"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
