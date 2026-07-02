#!/usr/bin/env python3
"""
Remove duplicate properties from venues.ts by identifying and removing the second occurrence.
"""

import re

# Read the file
with open('/Users/pochi/sources/github.com/twilightdve/reol/src/data/venues.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Track which lines to keep
lines_to_remove = set()
current_venue_id = None
venue_properties = {}

i = 0
while i < len(lines):
    line = lines[i]
    
    # Detect venue ID (e.g., "  tochigi_heavens_rock: {")
    venue_match = re.match(r'^  ([a-z_]+):\s*\{', line)
    if venue_match:
        current_venue_id = venue_match.group(1)
        venue_properties = {}
        i += 1
        continue
    
    # Detect closing of venue object "  },"
    if re.match(r'^\s*\},\s*$', line) and current_venue_id:
        current_venue_id = None
        venue_properties = {}
        i += 1
        continue
    
    # Detect property names (longDistanceAccess, parkingOptions, etc.)
    prop_match = re.match(r'^    (longDistanceAccess|parkingOptions|coinLockers|cafes|nearbyRestaurants|nearbyAttractions):\s*(\{|\[)', line)
    if prop_match and current_venue_id:
        prop_name = prop_match.group(1)
        opening_bracket = prop_match.group(2)
        
        # Check if this property was already seen in this venue
        if prop_name in venue_properties:
            print(f"Line {i+1}: Found duplicate {prop_name} in venue {current_venue_id}, removing...")
            
            # Mark this line for removal
            lines_to_remove.add(i)
            
            # Find and mark all lines until the property closes
            is_array = (opening_bracket == '[')
            depth = 1
            i += 1
            
            while i < len(lines) and depth > 0:
                check_line = lines[i]
                lines_to_remove.add(i)
                
                # Count brackets/braces
                if is_array:
                    open_count = check_line.count('[')
                    close_count = check_line.count(']')
                else:
                    open_count = check_line.count('{')
                    close_count = check_line.count('}')
                
                depth += open_count - close_count
                i += 1
            
            # The loop ended when depth became 0, which means we've closed the property
            # Continue from current position
            continue
        else:
            # First occurrence of this property
            venue_properties[prop_name] = i + 1
    
    i += 1

# Write back only the lines we want to keep
with open('/Users/pochi/sources/github.com/twilightdve/reol/src/data/venues.ts', 'w', encoding='utf-8') as f:
    for i, line in enumerate(lines):
        if i not in lines_to_remove:
            f.write(line)

print(f"✅ Removed {len(lines_to_remove)} duplicate lines from {len(venue_properties)} properties")
