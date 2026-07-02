#!/usr/bin/env python3
"""
Remove duplicate properties from venues.ts
"""

import re

# Read the file
with open('/Users/pochi/sources/github.com/twilightdve/reol/src/data/venues.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Track venue IDs and their property occurrences
lines = content.split('\n')
result_lines = []
current_venue_id = None
venue_properties = {}
skip_until_line = -1
brace_depth = 0
in_property_to_remove = False
property_start_line = -1

for i, line in enumerate(lines):
    # Skip lines if we're removing a property
    if i < skip_until_line:
        continue
    
    # Detect venue ID (e.g., "tochigi_heavens_rock: {")
    venue_match = re.match(r'^\s+([a-z_]+):\s*\{', line)
    if venue_match:
        current_venue_id = venue_match.group(1)
        venue_properties = {}
        result_lines.append(line)
        continue
    
    # Detect property names
    prop_match = re.match(r'^\s+(longDistanceAccess|parkingOptions|coinLockers|cafes|nearbyRestaurants|nearbyAttractions):\s*(\{|\[)', line)
    if prop_match:
        prop_name = prop_match.group(1)
        
        # Check if this property was already seen in this venue
        if prop_name in venue_properties:
            print(f"Found duplicate {prop_name} at line {i+1} in venue {current_venue_id}, removing...")
            
            # Find the end of this property (matching braces/brackets)
            is_array = prop_match.group(2) == '['
            depth = 1
            j = i + 1
            
            while j < len(lines) and depth > 0:
                check_line = lines[j]
                
                if is_array:
                    depth += check_line.count('[') - check_line.count(']')
                else:
                    # For objects, count braces
                    depth += check_line.count('{') - check_line.count('}')
                
                j += 1
            
            # Skip all lines from i to j (inclusive of the property definition)
            skip_until_line = j
            continue
        else:
            venue_properties[prop_name] = i + 1
            result_lines.append(line)
            continue
    
    result_lines.append(line)

# Write back
with open('/Users/pochi/sources/github.com/twilightdve/reol/src/data/venues.ts', 'w', encoding='utf-8') as f:
    f.write('\n'.join(result_lines))

print("✅ Removed all duplicate properties")
