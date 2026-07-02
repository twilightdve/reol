#!/usr/bin/env python3
"""
Split venues.ts into individual venue files
"""

import re
import os
import json

# Read the venues.ts file
with open('/Users/pochi/sources/github.com/twilightdve/reol/src/data/venues.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find where VENUES_2026 array starts
match = re.search(r'export const VENUES_2026: Venue\[\] = \[(.*)', content, re.DOTALL)
if not match:
    print("❌ Could not find VENUES_2026 array")
    exit(1)

venues_content = match.group(1)

# Split by venue objects - look for pattern: {id: 'venue_id',
venues = []
current_venue = []
brace_depth = 0
in_venue = False

lines = venues_content.split('\n')
for line in lines:
    # Check if we're starting a new venue (looking for id: 'something')
    if re.search(r"^\s*\{\s*$", line) and not in_venue:
        in_venue = True
        brace_depth = 1
        current_venue = [line]
        continue
    
    if in_venue:
        current_venue.append(line)
        brace_depth += line.count('{') - line.count('}')
        
        # Check if we've closed the venue object
        if brace_depth == 0:
            venues.append('\n'.join(current_venue))
            current_venue = []
            in_venue = False

print(f"Found {len(venues)} venues")

# Create venues directory
os.makedirs('/Users/pochi/sources/github.com/twilightdve/reol/src/data/venues/data', exist_ok=True)

# Process each venue
for i, venue_str in enumerate(venues):
    # Extract venue ID
    id_match = re.search(r"id:\s*'([^']+)'", venue_str)
    if not id_match:
        print(f"⚠️ Could not extract ID for venue {i+1}")
        continue
    
    venue_id = id_match.group(1)
    print(f"Processing {venue_id}...")
    
    # Create individual venue file
    venue_file_content = f"""import {{ Venue }} from '../types'

export const {venue_id}: Venue = {venue_str.strip()}

export default {venue_id}
"""
    
    file_path = f'/Users/pochi/sources/github.com/twilightdve/reol/src/data/venues/data/{venue_id}.ts'
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(venue_file_content)
    
    print(f"✅ Created {venue_id}.ts")

print(f"\n✅ Split {len(venues)} venues into individual files")
