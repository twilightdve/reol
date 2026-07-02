#!/usr/bin/env python3
"""
CSVから生成されたJSONデータをvenues.tsに統合するスクリプト
"""

import json
import re
from typing import Dict, List, Any


def load_json_data(json_path: str) -> Dict[str, Any]:
    """JSONファイルを読み込む"""
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def read_venues_ts(ts_path: str) -> str:
    """venues.tsファイルを読み込む"""
    with open(ts_path, 'r', encoding='utf-8') as f:
        return f.read()


def format_parking_options(parking_data: List[Dict[str, Any]]) -> str:
    """駐車場データをTypeScript形式に変換"""
    if not parking_data:
        return ""
    
    result = "    parkingOptions: [\n"
    for facility in parking_data:
        result += "      {\n"
        result += f"        name: '{facility['name']}',\n"
        result += f"        description: '{facility.get('description', facility['name'])}',\n"
        result += "        price: '料金要確認',\n"
        result += "        distance: '距離要確認',\n"
        
        if 'website' in facility:
            result += f"        website: '{facility['website']}',\n"
        
        if 'mapsUrl' in facility:
            result += f"        mapsUrl: '{facility['mapsUrl']}',\n"
        
        result += "      },\n"
    result += "    ],\n"
    return result


def format_coin_lockers(locker_data: List[Dict[str, Any]]) -> str:
    """コインロッカーデータをTypeScript形式に変換"""
    if not locker_data:
        return ""
    
    result = "    coinLockers: [\n"
    for facility in locker_data:
        result += "      {\n"
        result += f"        location: '{facility['name']}',\n"
        result += f"        description: '{facility.get('description', facility['name'])}',\n"
        result += "        price: '料金要確認',\n"
        result += "        distance: '距離要確認',\n"
        
        if 'website' in facility:
            result += f"        website: '{facility['website']}',\n"
        
        if 'mapsUrl' in facility:
            result += f"        mapsUrl: '{facility['mapsUrl']}',\n"
        
        result += "      },\n"
    result += "    ],\n"
    return result


def format_cafes(cafe_data: List[Dict[str, Any]]) -> str:
    """カフェデータをTypeScript形式に変換"""
    if not cafe_data:
        return ""
    
    result = "    cafes: [\n"
    for facility in cafe_data:
        result += "      {\n"
        result += f"        name: '{facility['name']}',\n"
        result += f"        description: '{facility.get('description', facility['name'])}',\n"
        result += "        distance: '距離要確認',\n"
        result += "        address: '住所要確認',\n"
        
        if 'website' in facility:
            result += f"        website: '{facility['website']}',\n"
        
        if 'mapsUrl' in facility:
            result += f"        mapsUrl: '{facility['mapsUrl']}',\n"
        
        result += "      },\n"
    result += "    ],\n"
    return result


def format_restaurants(restaurant_data: List[Dict[str, Any]]) -> str:
    """レストランデータをTypeScript形式に変換"""
    if not restaurant_data:
        return ""
    
    result = "    nearbyRestaurants: [\n"
    for facility in restaurant_data:
        result += "      {\n"
        result += f"        name: '{facility['name']}',\n"
        result += f"        description: '{facility.get('description', facility['name'])}',\n"
        result += f"        cuisine: '{facility.get('cuisine', '料理ジャンル要確認')}',\n"
        result += "        distance: '距離要確認',\n"
        result += "        address: '住所要確認',\n"
        
        if 'website' in facility:
            result += f"        website: '{facility['website']}',\n"
        
        if 'mapsUrl' in facility:
            result += f"        mapsUrl: '{facility['mapsUrl']}',\n"
        
        result += "      },\n"
    result += "    ],\n"
    return result


def format_holy_places(holy_place_data: List[Dict[str, Any]]) -> str:
    """聖地データをTypeScript形式に変換"""
    if not holy_place_data:
        return ""
    
    result = "    holyPlaces: [\n"
    for facility in holy_place_data:
        result += "      {\n"
        result += f"        name: '{facility['name']}',\n"
        result += f"        description: '{facility.get('description', facility['name'])}',\n"
        result += f"        type: '{facility.get('type', 'MV/作品関連')}',\n"
        result += "        distance: '距離要確認',\n"
        result += "        address: '住所要確認',\n"
        
        if 'website' in facility:
            result += f"        website: '{facility['website']}',\n"
        
        if 'mapsUrl' in facility:
            result += f"        mapsUrl: '{facility['mapsUrl']}',\n"
        
        result += "      },\n"
    result += "    ],\n"
    return result


def find_venue_in_ts(content: str, venue_id: str) -> tuple:
    """
    venues.ts内で指定されたvenue_idの会場定義を探す
    Returns: (start_pos, end_pos) または None
    """
    # idフィールドを含む行を探す
    pattern = rf"^\s*id:\s*['\"]({venue_id})['\"],"
    
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if re.search(pattern, line):
            # この会場の開始位置を見つける（{で始まる行）
            start_line = i
            while start_line > 0:
                if lines[start_line].strip().startswith('{'):
                    break
                start_line -= 1
            
            # この会場の終了位置を見つける（対応する}で終わる行）
            end_line = i
            brace_count = 0
            in_venue = False
            
            for j in range(start_line, len(lines)):
                line = lines[j]
                
                # 開き括弧をカウント
                brace_count += line.count('{')
                brace_count -= line.count('}')
                
                if brace_count == 0 and in_venue:
                    end_line = j
                    break
                    
                if brace_count > 0:
                    in_venue = True
            
            start_pos = sum(len(lines[k]) + 1 for k in range(start_line))
            end_pos = sum(len(lines[k]) + 1 for k in range(end_line + 1))
            
            return (start_pos, end_pos, start_line, end_line)
    
    return None


def insert_or_update_facilities(content: str, venue_id: str, facilities: Dict[str, List[Dict[str, Any]]]) -> str:
    """
    venues.tsに施設情報を挿入または更新
    """
    result = find_venue_in_ts(content, venue_id)
    if not result:
        print(f"⚠️  Warning: Could not find venue {venue_id} in venues.ts")
        return content
    
    start_pos, end_pos, start_line, end_line = result
    
    lines = content.split('\n')
    venue_content = '\n'.join(lines[start_line:end_line + 1])
    
    # 既存の施設情報を削除するパターン
    patterns_to_remove = [
        r'\s*parkingOptions:\s*\[[\s\S]*?\],\n',
        r'\s*coinLockers:\s*\[[\s\S]*?\],\n',
        r'\s*cafes:\s*\[[\s\S]*?\],\n',
        r'\s*nearbyRestaurants:\s*\[[\s\S]*?\],\n',
        r'\s*holyPlaces:\s*\[[\s\S]*?\],\n',
    ]
    
    for pattern in patterns_to_remove:
        venue_content = re.sub(pattern, '', venue_content)
    
    # 新しい施設情報を生成
    new_facilities = ""
    
    if facilities['parking']:
        new_facilities += format_parking_options(facilities['parking'])
    
    if facilities['coinLocker']:
        new_facilities += format_coin_lockers(facilities['coinLocker'])
    
    if facilities['cafe']:
        new_facilities += format_cafes(facilities['cafe'])
    
    if facilities['restaurant']:
        new_facilities += format_restaurants(facilities['restaurant'])
    
    if facilities['holyPlace']:
        new_facilities += format_holy_places(facilities['holyPlace'])
    
    # longDistanceAccessの後、}の前に挿入
    # まず longDistanceAccess セクションを探す（末尾の},を正確に含める）
    long_distance_pattern = r'(longDistanceAccess:\s*\{[\s\S]*?recommendations:[\s\S]*?\n\s*\},)\n'
    match = re.search(long_distance_pattern, venue_content)
    
    if match:
        # longDistanceAccessの後に挿入
        insert_pos = match.end()
        venue_content = venue_content[:insert_pos] + new_facilities + venue_content[insert_pos:]
    else:
        # longDistanceAccessがない場合、nearbyAttractionsの後に挿入
        nearby_pattern = r'(nearbyAttractions:\s*\[[\s\S]*?\],)\n'
        nearby_match = re.search(nearby_pattern, venue_content)
        if nearby_match:
            insert_pos = nearby_match.end()
            venue_content = venue_content[:insert_pos] + new_facilities + venue_content[insert_pos:]
        else:
            # どちらもない場合、}の直前に挿入
            venue_content = re.sub(r'(\n\s*}(?:\s*,)?\s*$)', '\n' + new_facilities + r'\1', venue_content)
    
    # 元のコンテンツを更新
    lines[start_line:end_line + 1] = venue_content.split('\n')
    
    return '\n'.join(lines)


def main():
    json_path = '/Users/pochi/sources/github.com/twilightdve/reol/venue_facilities_data.json'
    ts_path = '/Users/pochi/sources/github.com/twilightdve/reol/src/data/venues.ts'
    
    print("Loading JSON data...")
    facilities_data = load_json_data(json_path)
    
    print("Reading venues.ts...")
    content = read_venues_ts(ts_path)
    
    print("\nIntegrating facility data...")
    
    updated_count = 0
    for venue_id, facilities in facilities_data.items():
        total_facilities = sum(len(items) for items in facilities.values())
        if total_facilities > 0:
            print(f"  Processing {venue_id}: {total_facilities} facilities")
            content = insert_or_update_facilities(content, venue_id, facilities)
            updated_count += 1
    
    print(f"\nWriting updated venues.ts...")
    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n✅ Successfully updated {updated_count} venues!")
    print(f"   Updated file: {ts_path}")


if __name__ == '__main__':
    main()
