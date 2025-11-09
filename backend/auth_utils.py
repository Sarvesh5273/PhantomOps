import os
import jwt
from flask import request, jsonify
from dotenv import load_dotenv

# ======================================================
# ✅ Load environment variables from backend/.env safely
# ======================================================
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
SUPABASE_URL = os.getenv("SUPABASE_URL")

if not SUPABASE_JWT_SECRET:
    raise ValueError("❌ Missing SUPABASE_ANON_KEY in environment variables")
if not SUPABASE_URL:
    print("⚠️ Warning: SUPABASE_URL not set (used only for debugging/logging)")

print(f"🔑 Loaded SUPABASE_ANON_KEY: {SUPABASE_JWT_SECRET[:25]}...")

# ======================================================
# 🔐 JWT Verification Function
# ======================================================
def verify_jwt_from_request():
    """Verify Supabase JWT (HS256) from Authorization header"""
    auth_header = request.headers.get("Authorization", None)
    if not auth_header or not auth_header.startswith("Bearer "):
        return None, jsonify({"error": "Missing or invalid Authorization header"}), 401

    token = auth_header.split(" ")[1]

    try:
        decoded = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}  # Supabase tokens may omit 'aud'
        )

        print(f"✅ JWT verified for user: {decoded.get('email', 'unknown')}")
        return decoded, None, 200

    except jwt.ExpiredSignatureError:
        print("⚠️ Token expired")
        return None, jsonify({"error": "Token has expired"}), 401

    except jwt.InvalidTokenError as e:
        print(f"❌ JWT verification failed: {e}")
        return None, jsonify({"error": f"Invalid JWT: {str(e)}"}), 401
