#!/usr/bin/env python3
"""
Script to add missing website and mapsUrl fields to all venues in venues.ts
"""
import re
import urllib.parse

# Read the file
with open('src/data/venues.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Track changes
changes_made = 0
venue_count = 0

# Common chain websites
CHAIN_WEBSITES = {
    'スターバックス': 'https://www.starbucks.co.jp/',
    'ドトールコーヒー': 'https://www.doutor.co.jp/',
    'タリーズコーヒー': 'https://www.tullys.co.jp/',
    'コメダ珈琲': 'https://www.komeda.co.jp/',
    'カフェ・ド・クリエ': 'https://www.pokkacreate.co.jp/cafe/',
    'ガスト': 'https://www.skylark.co.jp/gusto/',
    '牛角': 'https://www.gyukaku.ne.jp/',
    'みんみん': 'https://www.minmin.co.jp/',
    'タイムズ': 'https://times-info.net/',
}

def get_website_for_name(name):
    """Get website URL for chain stores"""
    for chain, url in CHAIN_WEBSITES.items():
        if chain in name:
            return url
    return None

def create_maps_url(name, location=""):
    """Create Google Maps search URL"""
    search = f"{name} {location}".strip()
    return f"https://www.google.com/maps/search/{urllib.parse.quote(search)}"

def process_entry(i, lines):
    """Process a single entry and add missing links"""
    global changes_made
    
    # Get the current line and next few lines for context
    current = lines[i].strip()
    
    # Check if this is an entry that might need links
    if not (current.startswith('name:') or current.startswith('location:')):
        return
    
    # Find the closing brace for this entry
    entry_end = i
    brace_count = 0
    for j in range(i, min(i + 20, len(lines))):
        if '{' in lines[j]:
            brace_count += 1
        if '}' in lines[j]:
            brace_count -= 1
            if brace_count == 0:
                entry_end = j
                break
    
    # Get full entry text
    entry_text = ''.join(lines[i:entry_end+1])
    
    # Skip if already has website or mapsUrl
    if 'website:' in entry_text or 'mapsUrl:' in entry_text:
        return
    
    # Extract name or location
    name_match = re.search(r"(?:name|location): '([^']+)'", entry_text)
    if not name_match:
        return
    
    name = name_match.group(1)
    
    # Prepare additions
    additions = []
    
    # Add website for chains
    if 'name:' in current:
        website = get_website_for_name(name)
        if website:
            additions.append(f"        website: '{website}'")
    
    # Add mapsUrl
    maps_url = create_maps_url(name)
    additions.append(f"        mapsUrl: '{maps_url}'")
    
    # Find where to insert (before the closing brace)
    if additions:
        # Insert before the closing }
        if '}' in lines[entry_end]:
            for addition in reversed(additions):
                lines.insert(entry_end, addition + ',\n')
                changes_made += 1

# Process file
i = 0
while i < len(lines):
    if 'id: ' in lines[i] and 'name: ' in lines[i]:
        venue_count += 1
    
    # Look for entries in arrays
    if any(x in lines[i] for x in ['nearbyRestaurants:', 'coinLockers:', 'cafes:', 'parkingOptions:']):
        # Process entries in this array
        j = i + 1
        while j < len(lines) and not lines[j].strip().startswith(']'):
            if lines[j].strip().startswith('name:') or lines[j].strip().startswith('location:'):
                process_entry(j, lines)
            j += 1
    
    i += 1

# Write back
with open('src/data/venues.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f"✓ Added {changes_made} missing links across {venue_count} venues")
print(f"✓ File updated: src/data/venues.ts")
