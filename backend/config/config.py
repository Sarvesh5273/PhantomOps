import os
from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)

    # 🔧 Load environment variables
    app.config['SUPABASE_URL'] = os.getenv("SUPABASE_URL")
    app.config['SUPABASE_KEY'] = os.getenv("SUPABASE_ANON_KEY")  # ✅ use anon key name

    # Enable CORS (for frontend access)
    CORS(app, resources={r"/*": {"origins": "*"}})

    return app
