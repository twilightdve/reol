#!/usr/bin/env python3
"""
Fix venues.ts syntax errors and add venue images.
This script:
1. Fixes the longDistanceAccess object closures
2. Adds venueImage data to each venue from venue_images_data.json
"""

import re
import json

# Read the venues.ts file
with open('/Users/pochi/sources/github.com/twilightdve/reol/src/data/venues.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Read the images data
with open('/Users/pochi/sources/github.com/twilightdve/reol/venue_images_data.json', 'r', encoding='utf-8') as f:
    images_data = json.load(f)

# Fix pattern: Find where longDistanceAccess's fromAirport/fromExpressBus/fromShinkansen arrays
# are not properly closed before parkingOptions starts
# Pattern to match: }, followed immediately by parkingOptions: [ without proper closure

# We need to find each venue object and fix the structure
# Strategy: Find each parkingOptions occurrence that comes right after a longDistanceAccess field
# and ensure proper closure

def fix_long_distance_access(content):
    """
    Fix longDistanceAccess objects that are not properly closed.
    The pattern is:
    - fromAirport: [ {...}, {...}, ] OR fromExpressBus: [...] OR fromShinkansen: [...]
    - Missing: ]  (if array) then } (close longDistanceAccess) then ,
    - Then: parkingOptions: [
    """
    # Pattern 1: Find longDistanceAccess with fromAirport that's not closed properly
    # Look for: fromAirport or fromExpressBus or fromShinkansen array items, then },\n    parkingOptions
    
    # More robust approach: Find the pattern where we have a closing brace-comma }, 
    # followed directly by parkingOptions without longDistanceAccess being closed
    
    # Pattern: recommendations: [...]\n    },\n    parkingOptions:
    # Should be: recommendations: [...]\n    },\n  },\n  parkingOptions:
    
    # Let's fix by finding the specific pattern
    pattern = r'(recommendations: \[[^\]]*\]\s*},)\s*\n\s*(parkingOptions:)'
    replacement = r'\1\n  },\n  \2'
    
    content = re.sub(pattern, replacement, content)
    
    # Also handle case where there's no recommendations but still fromAirport/fromExpressBus/fromShinkansen
    # Pattern: from(Airport|ExpressBus|Shinkansen): [...], (or last array) then }, then parkingOptions
    # This means longDistanceAccess's last property array ended but object not closed
    
    # Look for pattern where after a transportation array, we have },\n    parkingOptions
    # but should have ],\n  },\n  parkingOptions
    
    # Pattern for fromAirport/etc being the last item in longDistanceAccess
    pattern2 = r'(from(?:Airport|ExpressBus|Shinkansen): \[[^\]]+\],?)\s*\n\s*},\s*\n\s*(parkingOptions:)'
    
    def replacement_func(match):
        transport_line = match.group(1).rstrip(',')  # Remove trailing comma if exists
        next_prop = match.group(2)
        return f"{transport_line}\n  }},\n  {next_prop}"
    
    content = re.sub(pattern2, replacement_func, content)
    
    return content

# Apply the fix
content = fix_long_distance_access(content)

# Now add venueImage data to each venue
# Find each venue object and add venueImage after mapEmbedUrl

def add_venue_image(match):
    """Add venueImage to a venue object."""
    venue_id = match.group(1)
    venue_object = match.group(2)
    
    if venue_id in images_data:
        image_data = images_data[venue_id]
        
        # Find mapEmbedUrl and add venueImage after it
        if 'mapEmbedUrl:' in venue_object:
            # Build the venueImage object
            venue_image_lines = [
                "  venueImage: {",
                f"    url: '{image_data['url']}',",
            ]
            
            if 'thumbnail' in image_data:
                venue_image_lines.append(f"    thumbnail: '{image_data['thumbnail']}',")
            
            venue_image_lines.append(f"    source: '{image_data['source']}',")
            
            if 'photographer' in image_data:
                venue_image_lines.append(f"    photographer: '{image_data['photographer']}',")
            
            if 'photographerUrl' in image_data:
                venue_image_lines.append(f"    photographerUrl: '{image_data['photographerUrl']}',")
            
            venue_image_lines.append(f"    alt: '{image_data['alt']}',")
            
            if 'description' in image_data:
                # Escape single quotes in description
                desc = image_data['description'].replace("'", "\\'")
                venue_image_lines.append(f"    description: '{desc}',")
            
            venue_image_lines.append("  },")
            
            venue_image_str = '\n'.join(venue_image_lines)
            
            # Find mapEmbedUrl line and add venueImage after it
            venue_object = re.sub(
                r"(mapEmbedUrl: '[^']*',)\s*\n",
                r"\1\n" + venue_image_str + "\n",
                venue_object,
                count=1
            )
    
    return f"{venue_id}: {{\n{venue_object}}}"

# Pattern to match each venue object
# venue_id: { ... },
pattern = r"([a-z_]+): \{\n([\s\S]*?)\n\},"

# This is complex, let's use a different approach
# We'll search for mapEmbedUrl and insert venueImage right after it for each venue

for venue_id, image_data in images_data.items():
    # Find the venue section
    # Look for: venue_id: {
    # Then find: mapEmbedUrl: '...',
    # Insert venueImage after it
    
    # Build the venueImage object
    venue_image_lines = [
        "  venueImage: {",
        f"    url: '{image_data['url']}',",
    ]
    
    if 'thumbnail' in image_data:
        venue_image_lines.append(f"    thumbnail: '{image_data['thumbnail']}',")
    
    venue_image_lines.append(f"    source: '{image_data['source']}',")
    
    if 'photographer' in image_data:
        venue_image_lines.append(f"    photographer: '{image_data['photographer']}',")
    
    if 'photographerUrl' in image_data:
        venue_image_lines.append(f"    photographerUrl: '{image_data['photographerUrl']}',")
    
    venue_image_lines.append(f"    alt: '{image_data['alt']}',")
    
    if 'description' in image_data:
        # Escape single quotes in description
        desc = image_data['description'].replace("'", "\\'")
        venue_image_lines.append(f"    description: '{desc}',")
    
    venue_image_lines.append("  },")
    
    venue_image_str = '\n'.join(venue_image_lines)
    
    # Find this specific venue's mapEmbedUrl
    # Pattern: venue_id: { ... mapEmbedUrl: '...', ... }
    # We need to be careful to only match this specific venue
    
    # Use a regex that captures the venue block
    pattern = rf"({venue_id}: \{{\s*\n[\s\S]*?mapEmbedUrl: '[^']*',)\s*\n([\s\S]*?\n\s*}},)"
    
    def replace_func(match):
        before_map = match.group(1)
        after_map = match.group(2)
        # Check if venueImage already exists
        if 'venueImage:' not in after_map:
            return f"{before_map}\n{venue_image_str}\n{after_map}"
        return match.group(0)
    
    content = re.sub(pattern, replace_func, content, count=1)
    
print("Fixing syntax errors and adding venue images...")

# Write the fixed content
with open('/Users/pochi/sources/github.com/twilightdve/reol/src/data/venues.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ venues.ts has been fixed and venue images have been added!")
print(f"✅ Added images for {len(images_data)} venues")
