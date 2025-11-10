from flask import Flask, jsonify, request
from config.config import create_app
from routes.feedback_routes import feedback_bp
from routes.incidents_routes import incidents_bp
from routes.enrichment_routes import enrichment_bp
from routes.escape_routes import escape_routes_bp
from auth_utils import verify_jwt_from_request
from flask_cors import CORS
from dotenv import load_dotenv
import os
load_dotenv()

# =====================================
# 🔍 Verify External API Dependencies
# =====================================
def verify_enrichment_dependencies():
    """
    Verifies that all required libraries for the enrichment feature are installed
    and that environment variables are configured.
    """
    dependencies_status = {
        "praw": False,
        "feedparser": False,
        "requests": False
    }
    
    env_vars_status = {
        "REDDIT_CLIENT_ID": False,
        "REDDIT_CLIENT_SECRET": False,
        "REDDIT_USER_AGENT": False,
        "OPENWEATHERMAP_API_KEY": False,
        "RSS_FEED_URL": False
    }
    
    # Check library imports
    try:
        import praw
        dependencies_status["praw"] = True
    except ImportError:
        print("⚠️  WARNING: praw library not installed. Run: pip install praw")
    
    try:
        import feedparser
        dependencies_status["feedparser"] = True
    except ImportError:
        print("⚠️  WARNING: feedparser library not installed. Run: pip install feedparser")

    try:
        import requests
        dependencies_status["requests"] = True
    except ImportError:
        print("⚠️  WARNING: requests library not installed. Run: pip install requests")
    
    # Check environment variables
    if os.getenv("REDDIT_CLIENT_ID"):
        env_vars_status["REDDIT_CLIENT_ID"] = True
    else:
        print("⚠️  WARNING: REDDIT_CLIENT_ID not configured in .env")

    if os.getenv("REDDIT_CLIENT_SECRET"):
        env_vars_status["REDDIT_CLIENT_SECRET"] = True
    else:
        print("⚠️  WARNING: REDDIT_CLIENT_SECRET not configured in .env")

    if os.getenv("REDDIT_USER_AGENT"):
        env_vars_status["REDDIT_USER_AGENT"] = True
    else:
        print("⚠️  WARNING: REDDIT_USER_AGENT not configured in .env")
    
    if os.getenv("OPENWEATHERMAP_API_KEY"):
        env_vars_status["OPENWEATHERMAP_API_KEY"] = True
    else:
        print("⚠️  WARNING: OPENWEATHERMAP_API_KEY not configured in .env")
    
    rss_url = os.getenv("RSS_FEED_URL")
    if rss_url and "example.com" not in rss_url: # Check it's not a placeholder
        env_vars_status["RSS_FEED_URL"] = True
    else:
        print("⚠️  WARNING: RSS_FEED_URL not configured in .env")
    
    # Print summary
    all_deps_ok = all(dependencies_status.values())
    all_env_ok = all(env_vars_status.values())
    
    if all_deps_ok and all_env_ok:
        print("✅  All enrichment dependencies and environment variables verified")
    elif all_deps_ok:
        print("✅  All enrichment libraries installed")
        print("⚠️  Some environment variables need configuration")
    else:
        print("⚠️  Some enrichment dependencies missing - enrichment feature may not work")
    
    return dependencies_status, env_vars_status


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
app.register_blueprint(enrichment_bp)
app.register_blueprint(escape_routes_bp)

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
    
    # Verify enrichment dependencies on startup
    print("🔍  Verifying enrichment feature dependencies...")
    verify_enrichment_dependencies()
    print()

    app.run(host="localhost", debug=True, port=5000)