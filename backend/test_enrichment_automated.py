"""
Automated test for enrichment endpoint.
This script tests the enrichment API without requiring manual JWT token entry.
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_enrichment_without_jwt():
    """Test that enrichment endpoint requires JWT authentication"""
    print("\n🧪 TEST 1: Enrichment endpoint without JWT (should return 401)")
    print("-" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/incidents/1/enrich", timeout=10)
        
        if response.status_code == 401:
            print("✅ PASS: Correctly rejected request without JWT (401)")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ FAIL: Expected 401, got {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_server_health():
    """Test that backend server is running"""
    print("\n🧪 TEST 0: Backend server health check")
    print("-" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        
        if response.status_code == 200:
            print("✅ PASS: Backend server is running")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ FAIL: Server returned {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ERROR: Cannot connect to backend server")
        print(f"   Make sure backend is running: python app.py")
        print(f"   Error: {str(e)}")
        return False

def test_enrichment_route_exists():
    """Test that enrichment route is registered"""
    print("\n🧪 TEST 2: Enrichment route registration")
    print("-" * 60)
    
    # Try with invalid incident ID but valid structure
    # Should get 401 (auth required) not 404 (route not found)
    try:
        response = requests.get(f"{BASE_URL}/api/incidents/999999/enrich", timeout=10)
        
        if response.status_code == 401:
            print("✅ PASS: Enrichment route is registered (got 401 auth error)")
            return True
        elif response.status_code == 404:
            error_data = response.json()
            if "Route not found" in error_data.get("error", ""):
                print("❌ FAIL: Enrichment route not registered (404 route not found)")
                return False
            else:
                print("✅ PASS: Enrichment route exists (got 404 for incident, not route)")
                return True
        else:
            print(f"⚠️  UNEXPECTED: Got status code {response.status_code}")
            return True  # Route exists, just unexpected response
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def check_dependencies():
    """Check that required libraries are installed"""
    print("\n🧪 TEST 3: Required dependencies check")
    print("-" * 60)
    
    all_ok = True
    
    try:
        import tweepy
        print("✅ tweepy is installed")
    except ImportError:
        print("❌ tweepy is NOT installed")
        all_ok = False
    
    try:
        import googlemaps
        print("✅ googlemaps is installed")
    except ImportError:
        print("❌ googlemaps is NOT installed")
        all_ok = False
    
    try:
        import feedparser
        print("✅ feedparser is installed")
    except ImportError:
        print("❌ feedparser is NOT installed")
        all_ok = False
    
    if all_ok:
        print("\n✅ PASS: All required dependencies are installed")
    else:
        print("\n❌ FAIL: Some dependencies are missing")
        print("   Run: pip install tweepy googlemaps feedparser")
    
    return all_ok

def main():
    """Run automated tests"""
    print("\n" + "=" * 60)
    print("🧪 AUTOMATED ENRICHMENT API TESTS")
    print("=" * 60)
    
    results = []
    
    # Test 0: Server health
    results.append(("Backend server health", test_server_health()))
    
    # Test 1: Auth required
    results.append(("JWT authentication required", test_enrichment_without_jwt()))
    
    # Test 2: Route registration
    results.append(("Enrichment route registered", test_enrichment_route_exists()))
    
    # Test 3: Dependencies
    results.append(("Required dependencies", check_dependencies()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n📈 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All automated tests passed!")
        print("\n📝 Next steps:")
        print("   1. Configure API credentials in backend/.env")
        print("   2. Login via frontend to get JWT token")
        print("   3. Test enrichment with real data using test_enrichment_manual.md")
    else:
        print("\n⚠️  Some tests failed. Review output above.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
