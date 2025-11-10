"""
Test script for the Incident Enrichment API endpoint.
Tests all aspects of the enrichment feature including:
- JWT authentication
- Incident lookup
- External service integrations
- Error handling
- Partial data scenarios
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
BASE_URL = "http://localhost:5000"
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# Test credentials (you'll need to replace these with valid test user credentials)
TEST_EMAIL = "admin@test.com"
TEST_PASSWORD = "testpassword123"

class Colors:
    """ANSI color codes for terminal output"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_test(name):
    """Print test name"""
    print(f"\n{Colors.BLUE}🧪 TEST: {name}{Colors.END}")

def print_success(message):
    """Print success message"""
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message):
    """Print error message"""
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_warning(message):
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")

def get_jwt_token():
    """
    Get a valid JWT token by logging in via Supabase.
    Returns the access token or None if login fails.
    """
    print_test("Getting JWT Token")
    
    # Try to login via Supabase auth endpoint
    auth_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    try:
        response = requests.post(auth_url, headers=headers, json=payload)
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print_success(f"JWT token obtained")
            return token
        else:
            print_error(f"Failed to get JWT token: {response.status_code}")
            print_warning("Make sure TEST_EMAIL and TEST_PASSWORD are set correctly")
            return None
    except Exception as e:
        print_error(f"Error getting JWT token: {str(e)}")
        return None

def get_test_incident_id(token):
    """
    Get a test incident ID from the database.
    Returns the first incident ID or None if no incidents exist.
    """
    print_test("Getting Test Incident ID")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/api/incidents", headers=headers)
        if response.status_code == 200:
            data = response.json()
            incidents = data.get("incidents", [])
            if incidents:
                incident_id = incidents[0]["id"]
                print_success(f"Found test incident ID: {incident_id}")
                print(f"   Incident: {incidents[0].get('name', 'N/A')}")
                print(f"   Location: {incidents[0].get('latitude', 'N/A')}, {incidents[0].get('longitude', 'N/A')}")
                return incident_id
            else:
                print_warning("No incidents found in database")
                return None
        else:
            print_error(f"Failed to get incidents: {response.status_code}")
            return None
    except Exception as e:
        print_error(f"Error getting incidents: {str(e)}")
        return None

def test_enrichment_with_auth(token, incident_id):
    """Test enrichment endpoint with valid JWT token"""
    print_test("Enrichment Endpoint with Valid JWT")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/incidents/{incident_id}/enrich",
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Enrichment endpoint returned 200 OK")
            
            # Check response structure
            print(f"\n📊 Response Structure:")
            print(f"   - incident_id: {data.get('incident_id')}")
            print(f"   - twitter_posts: {len(data.get('twitter_posts', []))} posts")
            print(f"   - traffic_map_url: {'✓' if data.get('traffic_map_url') else '✗'}")
            print(f"   - news_items: {len(data.get('news_items', []))} items")
            print(f"   - errors: {data.get('errors', {})}")
            
            # Validate Twitter posts structure
            if data.get('twitter_posts'):
                print_success("Twitter posts returned")
                for i, post in enumerate(data['twitter_posts'][:2]):
                    print(f"   Tweet {i+1}: @{post.get('username', 'N/A')} - {post.get('text', 'N/A')[:50]}...")
            else:
                print_warning("No Twitter posts returned (may be due to missing API credentials)")
            
            # Validate traffic map URL
            if data.get('traffic_map_url'):
                print_success("Traffic map URL generated")
                print(f"   URL: {data['traffic_map_url'][:80]}...")
            else:
                print_warning("No traffic map URL returned (may be due to missing API key)")
            
            # Validate news items structure
            if data.get('news_items'):
                print_success("News items returned")
                for i, item in enumerate(data['news_items'][:2]):
                    print(f"   News {i+1}: {item.get('title', 'N/A')[:50]}...")
            else:
                print_warning("No news items returned (may be due to missing RSS feed)")
            
            return True
        else:
            print_error(f"Enrichment endpoint returned {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.Timeout:
        print_error("Request timed out after 30 seconds")
        return False
    except Exception as e:
        print_error(f"Error testing enrichment endpoint: {str(e)}")
        return False

def test_enrichment_without_auth(incident_id):
    """Test enrichment endpoint without JWT token (should fail)"""
    print_test("Enrichment Endpoint without JWT (should return 401)")
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/incidents/{incident_id}/enrich",
            timeout=10
        )
        
        if response.status_code == 401:
            print_success("Correctly rejected request without JWT token (401)")
            return True
        else:
            print_error(f"Expected 401, got {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Error testing without auth: {str(e)}")
        return False

def test_enrichment_invalid_incident(token):
    """Test enrichment endpoint with non-existent incident ID (should return 404)"""
    print_test("Enrichment Endpoint with Invalid Incident ID (should return 404)")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/incidents/999999/enrich",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 404:
            data = response.json()
            print_success("Correctly returned 404 for non-existent incident")
            print(f"   Error message: {data.get('error')}")
            return True
        else:
            print_error(f"Expected 404, got {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Error testing invalid incident: {str(e)}")
        return False

def test_api_credentials_status():
    """Check if external API credentials are configured"""
    print_test("External API Credentials Status")
    
    twitter_token = os.getenv("TWITTER_BEARER_TOKEN")
    google_key = os.getenv("GOOGLE_MAPS_API_KEY")
    rss_url = os.getenv("RSS_FEED_URL")
    
    twitter_ok = twitter_token and twitter_token != "your_twitter_bearer_token_here"
    google_ok = google_key and google_key != "your_google_maps_api_key_here"
    rss_ok = rss_url and rss_url != "https://example.com/local-news-feed.rss"
    
    if twitter_ok:
        print_success("Twitter API credentials configured")
    else:
        print_warning("Twitter API credentials NOT configured")
    
    if google_ok:
        print_success("Google Maps API key configured")
    else:
        print_warning("Google Maps API key NOT configured")
    
    if rss_ok:
        print_success("RSS feed URL configured")
    else:
        print_warning("RSS feed URL NOT configured")
    
    return twitter_ok, google_ok, rss_ok

def main():
    """Run all tests"""
    print(f"\n{Colors.BLUE}{'='*60}")
    print("🧪 INCIDENT ENRICHMENT API TEST SUITE")
    print(f"{'='*60}{Colors.END}\n")
    
    # Check API credentials
    twitter_ok, google_ok, rss_ok = test_api_credentials_status()
    
    if not (twitter_ok or google_ok or rss_ok):
        print_warning("\n⚠️  No external API credentials configured!")
        print_warning("Tests will run but external services will return empty data.")
        print_warning("To test with real data, configure API keys in backend/.env")
    
    # Get JWT token
    token = get_jwt_token()
    if not token:
        print_error("\n❌ Cannot proceed without JWT token")
        print_warning("Please ensure:")
        print_warning("1. Backend server is running (python app.py)")
        print_warning("2. TEST_EMAIL and TEST_PASSWORD are set correctly in this script")
        print_warning("3. User exists in Supabase database")
        return
    
    # Get test incident ID
    incident_id = get_test_incident_id(token)
    if not incident_id:
        print_error("\n❌ Cannot proceed without test incident")
        print_warning("Please create at least one incident in the database")
        return
    
    # Run tests
    print(f"\n{Colors.BLUE}{'='*60}")
    print("RUNNING TESTS")
    print(f"{'='*60}{Colors.END}")
    
    results = []
    
    # Test 1: Valid enrichment request
    results.append(("Valid enrichment request", test_enrichment_with_auth(token, incident_id)))
    
    # Test 2: Request without auth
    results.append(("Request without JWT", test_enrichment_without_auth(incident_id)))
    
    # Test 3: Invalid incident ID
    results.append(("Invalid incident ID", test_enrichment_invalid_incident(token)))
    
    # Print summary
    print(f"\n{Colors.BLUE}{'='*60}")
    print("TEST SUMMARY")
    print(f"{'='*60}{Colors.END}\n")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = f"{Colors.GREEN}✅ PASS{Colors.END}" if result else f"{Colors.RED}❌ FAIL{Colors.END}"
        print(f"{status} - {test_name}")
    
    print(f"\n{Colors.BLUE}Results: {passed}/{total} tests passed{Colors.END}")
    
    if passed == total:
        print(f"{Colors.GREEN}\n🎉 All tests passed!{Colors.END}")
    else:
        print(f"{Colors.YELLOW}\n⚠️  Some tests failed. Review output above.{Colors.END}")

if __name__ == "__main__":
    main()
