from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import requests
import random

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

spotify_oauth = SpotifyOAuth(
    client_id=os.getenv("SPOTIFY_CLIENT_ID"),
    client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
    redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI"),
    scope="user-top-read user-library-read user-read-recently-played user-read-private",
)

# Helper function to get a random track from an artist's top tracks
def get_random_track_from_artist(sp, artist_id: str):
    try:
        top_tracks = sp.artist_top_tracks(artist_id)
        if top_tracks['tracks']:
            return random.choice(top_tracks['tracks'])
        else:
            return None
    except Exception as e:
        print(f"Error fetching top tracks for artist {artist_id}: {e}")
        return None

# 
def get_similar_artists_from_lastfm(artist_name: str, limit: int = 5):
    lastfm_url = "http://ws.audioscrobbler.com/2.0/"
    params = {
        'method': 'artist.getsimilar',
        'artist': artist_name,
        'api_key': os.getenv("LAST_FM_API_KEY"),
        'format': 'json',
        'limit': limit
    }
    
    try:
        response = requests.get(lastfm_url, params=params)
        data = response.json()
        if 'similarartists' in data and 'artist' in data['similarartists']:
            return [artist['name'] for artist in data['similarartists']['artist']]
        else:
            print(f"No similar artists found for {artist_name}")
            return []
    except Exception as e:
        print(f"Error fetching similar artists for {artist_name}: {e}")
        return []

def create_recommendation_object(spotify_artist, track):
    return {
        'artist_name': spotify_artist['name'],
        'artist_genres': spotify_artist['genres'],
        'artist_popularity': spotify_artist['popularity'],
        'track_name': track['name'],
        'track_preview_url': track['preview_url'],
        'track_external_url': track['external_urls']['spotify']
    }

def search_spotify_artist(sp, artist_name: str):
    try:
        results = sp.search(q=f"artist:{artist_name}", type='artist', limit=1)
        if results['artists']['items']:
            return results['artists']['items'][0]
        return None
    except Exception as e:
        print(f"Error searching for artist {artist_name}: {e}")
        return None

def is_niche_enough(artist_popularity: int, threshold: int = 50) -> bool:
    return artist_popularity <= threshold

def is_artist_novel(sp, artist_id: str, user_top_artists: list) -> bool:
    for artist in user_top_artists:
        if artist['id'] == artist_id:
            return False
    return True

@app.get("/")
def hello_sprout():
    print("hello sprout endpoint called")
    return {"message": "Hello, Sprout!"}

@app.get("/auth/spotify")
def spotify_login():
    auth_url = spotify_oauth.get_authorize_url()
    return {"auth_url": auth_url}

@app.get("/callback")
def spotify_callback(code: str):
    try: 
        token_info = spotify_oauth.get_access_token(code)
        access_token = token_info['access_token']
        nexturl = os.getenv("NEXT_PUBLIC_API_URL")
        
        frontend_url = f"{nexturl}/callback?token={access_token}"
        return RedirectResponse(url=frontend_url)
    except Exception as e:
        return RedirectResponse(url=f"{nexturl}/error=auth_failed")

@app.get("/user/top-artists")
def get_top_artists(access_token: str):
        try:
            sp = spotipy.Spotify(auth=access_token)
            top_artists = sp.current_user_top_artists(limit=20, time_range='short_term')
            artists = []
            for artist in top_artists["items"]:
                artists.append({
                    'name': artist['name'],
                    'genres': artist['genres'],
                    'popularity': artist['popularity'],
                    'followers': artist['followers']['total'],
                })
            return {"top_artists": top_artists['items']}
        except Exception as e:
            return {"error": str(e)}
        
@app.get("/user/taste-profile")
def get_taste_profile(access_token: str):
    try:
        sp = spotipy.Spotify(auth=access_token)
        
        top_tracks = sp.current_user_top_tracks(limit=50, time_range='short_term')
        track_ids = [track['id'] for track in top_tracks['items']]
        audio_features = sp.audio_features(track_ids)
        
        features = [f for f in audio_features if f is not None]
        total = len(features)
        profile = {
            "energy": sum(f['energy'] for f in features) / total,
            "valence": sum(f['valence'] for f in features) / total,
            "danceability": sum(f['danceability'] for f in features) / total
        }
        
        return {"taste_profile": {k: round(v, 3) for k, v in profile.items()}}
        
    except Exception as e:
        return {"error": str(e)}
    
@app.get("/recommendations")
def get_recommendations(access_token: str):
    try:
        seen_artists = set()
        sp = spotipy.Spotify(auth=access_token)
        
        seed_artists = sp.current_user_top_artists(limit=15, time_range='short_term')
        top_artists = sp.current_user_top_artists(limit=20, time_range='short_term')
        if not seed_artists['items']:
            return {"error": "No top artists found for user."}
        
        all_recommendations = []
        
        while len(all_recommendations) < 20:
            found_new_rec = False
            for artist in seed_artists['items']:
                if len(all_recommendations) >= 20:
                    break
                
                similar_artist_names = get_similar_artists_from_lastfm(artist['name'], limit=5)
                
                for artist_name in similar_artist_names:
                    if len(all_recommendations) >= 20:
                        break
                    spotify_artist = search_spotify_artist(sp, artist_name)
                    
                    if not spotify_artist:
                        continue
                    if spotify_artist['name'] in seen_artists:
                        continue
                    if not is_niche_enough(spotify_artist['popularity']):
                        continue
                    if not is_artist_novel(sp, spotify_artist['id'], top_artists['items']):
                        continue
                    
                    seen_artists.add(spotify_artist['name'])
                    
                    track = get_random_track_from_artist(sp, spotify_artist['id'])
                    if track:
                        recommendation = create_recommendation_object(spotify_artist, track)
                        all_recommendations.append(recommendation)
                        found_new_rec = True
            if not found_new_rec:
                break

        return {"recommendations": all_recommendations}
    except Exception as e:
        return {"error": str(e)}