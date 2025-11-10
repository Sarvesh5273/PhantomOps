from flask import Blueprint, jsonify, request
from auth_utils import verify_jwt_from_request
import os
import requests

escape_routes_bp = Blueprint('escape_routes_bp', __name__)

@escape_routes_bp.route('/api/escape-routes', methods=['GET'])
def get_escape_routes():
    """
    Get nearby hospitals, police stations, and fire stations.
    Uses OpenStreetMap Overpass API (free, no API key needed).
    """
    # Verify JWT authentication
    decoded, err, code = verify_jwt_from_request()
    if err:
        return err, code
    
    try:
        # Get coordinates from query parameters
        latitude = request.args.get('latitude', type=float)
        longitude = request.args.get('longitude', type=float)
        
        # Validate that parameters exist
        if latitude is None or longitude is None:
            return jsonify({"error": "Missing latitude or longitude parameters"}), 400
        
        # Validate coordinate ranges
        if not (-90 <= latitude <= 90):
            return jsonify({"error": "Latitude must be between -90 and 90 degrees"}), 400
        
        if not (-180 <= longitude <= 180):
            return jsonify({"error": "Longitude must be between -180 and 180 degrees"}), 400
        
        print(f"🔍 Searching for escape routes near ({latitude}, {longitude})")
        
        # Get nearby places using OpenStreetMap Overpass API (free, no key needed)
        escape_routes = {
            "hospitals": fetch_nearby_places(latitude, longitude, "hospital"),
            "police_stations": fetch_nearby_places(latitude, longitude, "police"),
            "fire_stations": fetch_nearby_places(latitude, longitude, "fire_station"),
        }
        
        # Log results
        total_results = (
            len(escape_routes["hospitals"]) + 
            len(escape_routes["police_stations"]) + 
            len(escape_routes["fire_stations"])
        )
        print(f"✅ Found {total_results} total safety resources")
        
        return jsonify(escape_routes), 200
        
    except requests.exceptions.Timeout:
        print(f"⏱️ Timeout fetching escape routes")
        return jsonify({"error": "Request timed out. The mapping service is taking too long to respond. Please try again."}), 503
    
    except requests.exceptions.ConnectionError:
        print(f"🔌 Connection error fetching escape routes")
        return jsonify({"error": "Unable to connect to the mapping service. Please check your internet connection and try again."}), 503
    
    except requests.exceptions.RequestException as e:
        print(f"🌐 Network error fetching escape routes: {str(e)}")
        return jsonify({"error": "Network error occurred while fetching escape routes. Please try again later."}), 503
    
    except ValueError as e:
        print(f"❌ Invalid input: {str(e)}")
        return jsonify({"error": f"Invalid coordinate values: {str(e)}"}), 400
    
    except Exception as e:
        print(f"❌ Unexpected error fetching escape routes: {str(e)}")
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500


def fetch_nearby_places(latitude, longitude, place_type):
    """
    Fetch nearby places using OpenStreetMap Overpass API (free, no API key needed).
    Returns list of up to 5 nearby places.
    """
    try:
        # Map place types to OSM tags
        osm_tags = {
            "hospital": "amenity=hospital",
            "police": "amenity=police",
            "fire_station": "amenity=fire_station"
        }
        
        tag = osm_tags.get(place_type, "amenity=hospital")
        
        # Build Overpass API query
        # Search within 5km radius
        radius = 5000  # meters
        overpass_url = "https://overpass-api.de/api/interpreter"
        
        query = f"""
        [out:json];
        (
          node[{tag}](around:{radius},{latitude},{longitude});
          way[{tag}](around:{radius},{latitude},{longitude});
        );
        out center 5;
        """
        
        response = requests.post(overpass_url, data={"data": query}, timeout=15)
        response.raise_for_status()
        
        data = response.json()
        
        # Check if response has valid structure
        if not isinstance(data, dict) or "elements" not in data:
            print(f"⚠️ Invalid response structure for {place_type}")
            return []
        
        places = []
        
        for element in data.get("elements", [])[:5]:
            try:
                # Get coordinates (center for ways, direct for nodes)
                if element["type"] == "way" and "center" in element:
                    place_lat = element["center"]["lat"]
                    place_lon = element["center"]["lon"]
                else:
                    place_lat = element.get("lat")
                    place_lon = element.get("lon")
                
                # Skip if coordinates are missing
                if place_lat is None or place_lon is None:
                    continue
                
                # Get name
                name = element.get("tags", {}).get("name", f"Unnamed {place_type.replace('_', ' ').title()}")
                
                # Calculate approximate distance
                distance = calculate_distance(latitude, longitude, place_lat, place_lon)
                
                place = {
                    "name": name,
                    "latitude": place_lat,
                    "longitude": place_lon,
                    "distance_km": round(distance, 2),
                    "type": place_type
                }
                places.append(place)
            
            except (KeyError, TypeError, ValueError) as e:
                print(f"⚠️ Error processing element for {place_type}: {str(e)}")
                continue
        
        # Sort by distance
        places.sort(key=lambda x: x["distance_km"])
        
        print(f"✅ Found {len(places)} {place_type}(s)")
        return places
    
    except requests.exceptions.Timeout:
        print(f"⏱️ Timeout fetching {place_type}")
        return []
    
    except requests.exceptions.RequestException as e:
        print(f"⚠️ Network error fetching {place_type}: {str(e)}")
        return []
    
    except Exception as e:
        print(f"⚠️ Unexpected error fetching {place_type}: {str(e)}")
        return []


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two coordinates using Haversine formula.
    Returns distance in kilometers.
    """
    from math import radians, sin, cos, sqrt, atan2
    
    # Earth radius in kilometers
    R = 6371.0
    
    # Convert to radians
    lat1_rad = radians(lat1)
    lon1_rad = radians(lon1)
    lat2_rad = radians(lat2)
    lon2_rad = radians(lon2)
    
    # Differences
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    # Haversine formula
    a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    
    distance = R * c
    return distance
