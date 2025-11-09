import os
from supabase import create_client
from dotenv import load_dotenv

# ✅ Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

# Get credentials from environment
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")  # ✅ Fix here

# Safety check for missing values
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Missing Supabase credentials in environment variables! Please check your .env file.")

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
print("✅ Supabase client initialized successfully")
