#!/usr/bin/env python3
"""
Script to add missing website and mapsUrl fields to venues.ts
"""
import re
import urllib.parse

def create_google_maps_url(name, location=""):
    """Create a Google Maps search URL"""
    search_term = f"{name} {location}".strip()
    encoded = urllib.parse.quote(search_term)
    return f"https://www.google.com/maps/search/{encoded}"

def get_chain_website(name):
    """Return website URLs for known chain stores"""
    chains = {
        'スターバックス': 'https://www.starbucks.co.jp/',
        'ドトールコーヒー': 'https://www.doutor.co.jp/',
        'タリーズコーヒー': 'https://www.tullys.co.jp/',
        'コメダ珈琲': 'https://www.komeda.co.jp/',
        'カフェ・ド・クリエ': 'https://www.pokkacreate.co.jp/cafe/',
        'ガスト': 'https://www.skylark.co.jp/gusto/',
        '牛角': 'https://www.gyukaku.ne.jp/',
        'みんみん': 'https://www.minmin.co.jp/',
        'タイムズ': 'https://times-info.net/',
        'JR': 'https://www.jreast.co.jp/estation/coin_locker/',
    }
    
    for chain, url in chains.items():
        if chain in name:
            return url
    return None

# Read the file
with open('src/data/venues.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Count entries without links
restaurants_pattern = r"name: '([^']+)',\s+cuisine: '([^']+)',\s+description: '([^']+)',\s+distance: '([^']+)',\s+(?:openTime: '[^']+',\s+)?price: '([^']+)'\s+}"
cafes_pattern = r"name: '([^']+)',\s+description: '([^']+)',\s+distance: '([^']+)',\s+openTime: '([^']+)',\s+wifi: (true|false)\s+}"
lockers_pattern = r"location: '([^']+)',\s+description: '([^']+)',\s+price: '([^']+)',\s+distance: '([^']+)'\s+}"
parking_pattern = r"name: '([^']+)',\s+description: '([^']+)',\s+price: '([^']+)',\s+distance: '([^']+)'(?:,\s+address: '([^']+)')?\s+}"

# Count matches without website or mapsUrl
restaurants_no_url = len(re.findall(r"name: '[^']+',\s+cuisine: '[^']+',\s+description: '[^']+',\s+distance: '[^']+',\s+(?:openTime: '[^']+',\s+)?price: '[^']+'\s+}(?!\s*,\s*(?:website|mapsUrl))", content))
cafes_no_url = len(re.findall(r"name: '[^']+',\s+description: '[^']+',\s+distance: '[^']+',\s+openTime: '[^']+',\s+wifi: (?:true|false)\s+}(?!\s*,\s*(?:website|mapsUrl))", content))
lockers_no_url = len(re.findall(r"location: '[^']+',\s+description: '[^']+',\s+price: '[^']+',\s+distance: '[^']+'\s+}(?!\s*,\s*(?:website|mapsUrl))", content))
parking_no_url = len(re.findall(r"name: '[^']+',\s+description: '[^']+',\s+price: '[^']+',\s+distance: '[^']+'\s+}(?!\s*,\s*(?:website|mapsUrl|address))", content))

print("=== Venue Links Analysis ===")
print(f"Restaurants without URL: {restaurants_no_url}")
print(f"Cafes without URL: {cafes_no_url}")
print(f"Coin Lockers without URL: {lockers_no_url}")
print(f"Parking without URL: {parking_no_url}")
print(f"Total entries needing updates: {restaurants_no_url + cafes_no_url + lockers_no_url + parking_no_url}")

# Count total venues
venues_count = len(re.findall(r"id: '[^']+',\s+name: '[^']+',\s+date:", content))
print(f"\nTotal venues: {venues_count}")
