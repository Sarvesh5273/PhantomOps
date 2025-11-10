from flask import Blueprint, jsonify
from auth_utils import verify_jwt_from_request
from config.supabase_client import supabase
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
import os

enrichment_bp = Blueprint('enrichment_bp', __name__)

# =====================================
# 🔗 External Service Integration Functions
# =====================================

def fetch_reddit_posts(latitude, longitude):
    """
    Fetch Reddit posts from location-based subreddits near incident coordinates.
    Returns list of up to 5 Reddit posts.
    """
    try:
        import praw
        
        # Get Reddit API credentials from environment
        client_id = os.getenv("REDDIT_CLIENT_ID")
        client_secret = os.getenv("REDDIT_CLIENT_SECRET")
        user_agent = os.getenv("REDDIT_USER_AGENT")
        
        # Check if credentials are configured
        if not client_id or not client_secret:
            print("⚠️  Reddit API credentials not configured")
            return []
        
        # Initialize Reddit API client
        reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent=user_agent
        )
        
        # Search for posts in relevant subreddits (news, local, emergency)
        # Since Reddit doesn't have geo-search, we search popular subreddits
        subreddits = ['news', 'worldnews', 'emergencies', 'PublicFreakout']
        search_terms = ['emergency', 'incident', 'fire', 'accident', 'breaking']
        
        reddit_posts = []
        
        for subreddit_name in subreddits:
            try:
                subreddit = reddit.subreddit(subreddit_name)
                # Search for recent posts
                for post in subreddit.search('emergency OR incident OR fire', time_filter='day', limit=2):
                    if len(reddit_posts) >= 5:
                        break
                    
                    reddit_post = {
                        "id": post.id,
                        "username": f"u/{post.author.name}" if post.author else "u/[deleted]",
                        "text": post.title,
                        "created_at": datetime.fromtimestamp(post.created_utc).isoformat(),
                        "subreddit": f"r/{subreddit_name}",
                        "url": f"https://reddit.com{post.permalink}"
                    }
                    reddit_posts.append(reddit_post)
                
                if len(reddit_posts) >= 5:
                    break
            except Exception as e:
                print(f"⚠️  Error fetching from r/{subreddit_name}: {str(e)}")
                continue
        
        print(f"✅  Fetched {len(reddit_posts)} Reddit posts")
        return reddit_posts
        
    except ImportError:
        print("⚠️  praw library not installed")
        return []
    except Exception as e:
        print(f"⚠️  Error fetching Reddit posts: {str(e)}")
        return []


def fetch_weather_data(latitude, longitude):
    """
    Fetch current weather data from OpenWeatherMap API.
    Returns weather data object with temperature, conditions, etc.
    """
    try:
        import requests
        
        # Get OpenWeatherMap API key from environment
        api_key = os.getenv("OPENWEATHERMAP_API_KEY")
        
        # Check if API key is configured
        if not api_key:
            print("⚠️  OpenWeatherMap API key not configured")
            return None
        
        # Build API URL
        base_url = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            "lat": latitude,
            "lon": longitude,
            "appid": api_key,
            "units": "metric"  # Use Celsius
        }
        
        # Make API request
        response = requests.get(base_url, params=params, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        
        # Extract relevant weather information
        weather_data = {
            "temperature": data["main"]["temp"],
            "feels_like": data["main"]["feels_like"],
            "humidity": data["main"]["humidity"],
            "pressure": data["main"]["pressure"],
            "description": data["weather"][0]["description"],
            "icon": data["weather"][0]["icon"],
            "wind_speed": data["wind"]["speed"],
            "clouds": data["clouds"]["all"],
            "location": data["name"]
        }
        
        print(f"✅  Fetched weather data for {data['name']}")
        return weather_data
        
    except ImportError:
        print("⚠️  requests library not installed")
        return None
    except Exception as e:
        print(f"⚠️  Error fetching weather data: {str(e)}")
        return None


def fetch_news_items():
    """
    Fetch and parse RSS feed for local news items.
    Returns list of up to 5 NewsItem objects.
    """
    try:
        import feedparser
        
        # Get RSS feed URL from environment
        rss_url = os.getenv("RSS_FEED_URL")
        
        # Check if RSS URL is configured
        if not rss_url or rss_url == "https://example.com/local-news-feed.rss":
            print("⚠️  RSS feed URL not configured")
            return []
        
        # Parse RSS feed
        feed = feedparser.parse(rss_url)
        
        # Check if feed was successfully parsed
        if feed.bozo:
            print(f"⚠️  RSS feed parsing error: {feed.bozo_exception}")
            return []
        
        # Extract news items
        news_items = []
        
        for entry in feed.entries[:5]:  # Limit to 5 items
            # Extract title
            title = entry.get('title', 'No title')
            
            # Extract link
            link = entry.get('link', '')
            
            # Extract published date (try multiple fields for compatibility)
            published = None
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                published = datetime(*entry.published_parsed[:6]).isoformat()
            elif hasattr(entry, 'published'):
                published = entry.published
            elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                published = datetime(*entry.updated_parsed[:6]).isoformat()
            elif hasattr(entry, 'updated'):
                published = entry.updated
            else:
                published = datetime.utcnow().isoformat()
            
            news_item = {
                "title": title,
                "link": link,
                "published": published
            }
            news_items.append(news_item)
        
        print(f"✅  Fetched {len(news_items)} news items from RSS feed")
        return news_items
        
    except ImportError:
        print("⚠️  feedparser library not installed")
        return []
    except Exception as e:
        print(f"⚠️  Error fetching RSS feed: {str(e)}")
        return []


# =====================================
# 🎯 Main Enrichment Endpoint
# =====================================

@enrichment_bp.route('/api/incidents/<int:incident_id>/enrich', methods=['GET'])
def enrich_incident(incident_id):
    """
    Main enrichment endpoint that aggregates data from Twitter, Google Maps, and RSS feeds.
    Protected with JWT authentication.
    """
    # Verify JWT authentication
    decoded, err, code = verify_jwt_from_request()
    if err:
        return err, code
    
    try:
        # Fetch incident record from Supabase to get latitude/longitude
        response = supabase.table("incidents").select("*").eq("id", incident_id).execute()
        
        if not response.data or len(response.data) == 0:
            return jsonify({"error": "Incident not found"}), 404
        
        incident = response.data[0]
        latitude = incident.get("latitude")
        longitude = incident.get("longitude")
        
        # Validate coordinates
        if latitude is None or longitude is None:
            return jsonify({"error": "Incident missing geolocation data"}), 400
        
        # Execute all three external service calls in parallel using ThreadPoolExecutor
        errors = {
            "twitter": None,
            "traffic": None,
            "news": None
        }
        
        twitter_posts = []
        traffic_map_url = None
        news_items = []
        
        with ThreadPoolExecutor(max_workers=3) as executor:
            # Submit all tasks
            reddit_future = executor.submit(fetch_reddit_posts, latitude, longitude)
            weather_future = executor.submit(fetch_weather_data, latitude, longitude)
            news_future = executor.submit(fetch_news_items)
            
            # Collect results with error handling
            try:
                reddit_posts = reddit_future.result(timeout=10)
            except Exception as e:
                errors["reddit"] = str(e)
                print(f"⚠️  Reddit service failed: {str(e)}")
            
            try:
                weather_data = weather_future.result(timeout=10)
            except Exception as e:
                errors["weather"] = str(e)
                print(f"⚠️  Weather service failed: {str(e)}")
            
            try:
                news_items = news_future.result(timeout=10)
            except Exception as e:
                errors["news"] = str(e)
                print(f"⚠️  News service failed: {str(e)}")
        
        # Clean up errors object (remove None values)
        errors = {k: v for k, v in errors.items() if v is not None}
        
        # Build response with partial data
        response_data = {
            "incident_id": incident_id,
            "reddit_posts": reddit_posts,
            "weather_data": weather_data,
            "news_items": news_items,
            "errors": errors if errors else {}
        }
        
        print(f"✅  Enrichment completed for incident {incident_id}")
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"❌  Enrichment endpoint error: {str(e)}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500
