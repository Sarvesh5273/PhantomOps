from flask import Flask, jsonify, request
from config.config import create_app
from routes.feedback_routes import feedback_bp
from routes.incidents_routes import incidents_bp
from auth_utils import verify_jwt_from_request
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv()


# =====================================
# 🚀 Initialize Flask App
# =====================================
app = create_app()

# ✅ Enable CORS for React frontend
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173"]}})

# =====================================
# 🔗 Register Blueprints
# =====================================
app.register_blueprint(feedback_bp)
app.register_blueprint(incidents_bp)

# =====================================
# 🔐 Global Auth Test Route
# =====================================
@app.route('/api/test-auth', methods=['GET'])
def test_auth():
    """
    Validates JWT sent by frontend (via Supabase session token).
    Returns decoded user info if valid.
    """
    decoded, err, code = verify_jwt_from_request()
    if err:
        return err, code

    return jsonify({
        "message": "✅ Authenticated successfully",
        "user": {
            "id": decoded.get("sub"),
            "email": decoded.get("email"),
            "role": decoded.get("role", "user")
        }
    }), 200


# =====================================
# 🌍 Root Route
# =====================================
@app.route('/')
def home():
    return jsonify({"message": "🚀 PhantomOps backend is live and operational!"}), 200


# =====================================
# ⚠️ Global Error Handlers
# =====================================
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Route not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500


# =====================================
# 🛡 Security Headers (No CSP during Dev)
# =====================================
@app.after_request
def apply_security_headers(response):
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
    return response


# =====================================
# 🧠 Run Server (Dev Mode)
# =====================================
if __name__ == "__main__":
    print("\n============================")
    print("🔥  PhantomOps Backend Started")
    print("🔐  JWT Auth Enabled")
    print("🛡  Security Headers Active")
    print("📡  Listening on http://localhost:5000")
    print("============================\n")

    app.run(host="localhost", debug=True, port=5000)
