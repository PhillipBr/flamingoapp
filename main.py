import requests
from bs4 import BeautifulSoup
import json
import os

# Define the structure to store the tracks from different platforms
daily_tracks = {
    "Spotify": {},
    "YouTube": {"global": [], "trends": []},
    "YouTube Insights": {},
    "iTunes": [],
    "Apple Music": [],
    "Shazam": [],
    "Deezer": [],
    "Billboard": []
}

# Directory where JSON files will be saved
DATABASE_DIR = "DATABASES"
os.makedirs(DATABASE_DIR, exist_ok=True)

# Function to fetch YouTube data
def get_top_youtube_videos():
    url = 'https://kworb.net/youtube/'
    response = requests.get(url)
    if response.status_code != 200:
        return

    response.encoding = 'utf-8'
    soup = BeautifulSoup(response.text, 'html.parser')

    table = soup.find('table', {'id': 'youtuberealtime'})
    rows = table.find_all('tr') if table else []

    videos = []

    for row in rows[:51]:
        cols = row.find_all('td')
        if len(cols) > 2:
            position = cols[0].text.strip()
            youtube_name = cols[2].text.strip()
            link_tag = cols[2].find('a', href=True)
            youtube_url = ''
            if link_tag:
                href = link_tag['href']
                if 'youtube.com/watch?v=' in href:
                    youtube_url = href
                elif href.startswith('video/'):
                    video_id = href.split('/')[-1].replace('.html', '')
                    youtube_url = f'https://www.youtube.com/watch?v={video_id}'
            videos.append({
                "Position": position,
                "Title": youtube_name,
                "youtube_url": youtube_url
            })

    daily_tracks["YouTube"]["global"] = videos

# Function to fetch Billboard data
def get_top_billboard_tracks():
    url = 'https://www.billboard.com/charts/hot-100/'
    response = requests.get(url)
    if response.status_code != 200:
        return

    response.encoding = 'utf-8'
    soup = BeautifulSoup(response.text, 'html.parser')

    titles = soup.select("li ul h3")
    artistname = soup.select("li ul li span.c-label")

    billboard_tracks = []
    num_tracks = min(len(titles), len(artistname) // 7)

    for i in range(min(51, num_tracks)):
        title = titles[i].text.strip()
        artist_name = artistname[i * 7].text.strip().split("\n")[0]
        position = str(i + 1)
        billboard_tracks.append({
            "Position": position,
            "Title": title,
            "Artist": artist_name
        })

    daily_tracks["Billboard"] = billboard_tracks

# General function to fetch data from iTunes, Apple Music, Shazam, and Deezer
def fetch_data(platform, url):
    response = requests.get(url)
    if response.status_code != 200:
        return

    response.encoding = 'utf-8'
    soup = BeautifulSoup(response.text, 'html.parser')
    rows = soup.find_all('tr')
    data = []

    for row in rows[:51]:
        columns = row.find_all('td')
        if len(columns) >= 3:
            position = columns[0].text.strip()
            title_artist = columns[2].text.strip()

            # Swapping Title and Artist as requested
            if ' - ' in title_artist:
                artist, title = title_artist.split(' - ', 1)  # Swap title and artist
            else:
                title, artist = title_artist, "Unknown Artist"

            data.append({
                "Position": position,
                "Title": title,
                "Artist": artist
            })

    daily_tracks[platform] = data

# Function to fetch Spotify data
def get_top_spotify_tracks(url, country_code):
    response = requests.get(url)
    if response.status_code != 200:
        return
    response.encoding = 'utf-8'
    soup = BeautifulSoup(response.text, "html.parser")
    rows = soup.select("table tbody tr")
    tracks = []

    for row in rows[:5]:
        columns = row.find_all('td')
        if len(columns) > 0:
            position = columns[0].text.strip()
            links = columns[2].find_all('a')
            if len(links) >= 2:
                artist = links[0].text.strip()
                title = links[1].text.strip()
                href = links[1].get('href')
                if 'track' in href:
                    track_id = href.split('/')[-1].replace('.html', '')
                    spotify_url = f"https://open.spotify.com/track/{track_id}"
                    tracks.append({
                        "Position": position,
                        "Title": title,
                        "Artist": artist,
                        "spotify_url": spotify_url
                    })

    daily_tracks["Spotify"][country_code] = tracks

# Function to fetch YouTube Insights data
def get_youtube_insights(country_code):
    url = f'https://kworb.net/youtube/insights/{country_code}_daily.html'
    response = requests.get(url)
    if response.status_code != 200:
        return
    response.encoding = 'utf-8'
    soup = BeautifulSoup(response.text, 'html.parser')
    rows = soup.find_all('tr')
    insights = []

    for row in rows[:5]:
        cols = row.find_all('td')
        if len(cols) > 2:
            position = cols[0].text.strip()
            youtube_name = cols[2].text.strip()
            insights.append({
                "Position": position,
                "Title": youtube_name
            })

    daily_tracks["YouTube Insights"][country_code] = insights

if __name__ == "__main__":
    # Spotify data for various countries
    spotify_urls = {
        'global': 'https://kworb.net/spotify/country/global_daily.html',
        'us': 'https://kworb.net/spotify/country/us_daily.html',
        'gb': 'https://kworb.net/spotify/country/gb_daily.html',
        'ca': 'https://kworb.net/spotify/country/ca_daily.html',
        'br': 'https://kworb.net/spotify/country/br_daily.html',
        'in': 'https://kworb.net/spotify/country/in_daily.html'
    }

    for country_code, url in spotify_urls.items():
        get_top_spotify_tracks(url, country_code)

    get_top_youtube_videos()
    get_top_billboard_tracks()

    # Fetch data from other platforms
    fetch_data("iTunes", "https://kworb.net/charts/itunes/")
    fetch_data("Apple Music", "https://kworb.net/charts/apple_s/")
    fetch_data("Shazam", "https://kworb.net/charts/shazam/")
    fetch_data("Deezer", "https://kworb.net/charts/deezer/")

    # Save daily_banner.json and daily_table.json to the DATABASES folder
    banner_path = os.path.join(DATABASE_DIR, "daily_banner.json")
    table_path = os.path.join(DATABASE_DIR, "daily_table.json")

    with open(banner_path, "w", encoding="utf-8") as json_file:
        json.dump(daily_tracks, json_file, ensure_ascii=False, indent=4)

    with open(table_path, "w", encoding="utf-8") as json_file:
        json.dump(daily_tracks, json_file, ensure_ascii=False, indent=4)

    print(json.dumps(daily_tracks, indent=4, ensure_ascii=False))
