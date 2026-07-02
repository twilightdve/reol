#!/usr/bin/env python3
"""
CSVファイルからVenue施設情報を更新するスクリプト
"""
import csv
import json
from typing import Dict, List, Any

def read_csv_facilities(csv_path: str) -> Dict[str, Dict[str, List[Dict[str, Any]]]]:
    """
    CSVファイルを読み込んで会場IDごとに施設情報を整理
    
    Returns:
        {
            'venue_id': {
                'parking': [...],
                'coinLocker': [...],
                'cafe': [...],
                'restaurant': [...],
                'holyPlace': [...]
            }
        }
    """
    facilities = {}
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            venue_id = row['会場ID']
            category = row['カテゴリ']
            name = row['施設名']
            website = row['Website URL']
            maps_url = row.get('Google Maps URL', '')
            
            # 削除指示があるものはスキップ
            if '削除' in name or '削除' in website:
                continue
            
            # 会場IDが初めて登場する場合は初期化
            if venue_id not in facilities:
                facilities[venue_id] = {
                    'parking': [],
                    'coinLocker': [],
                    'cafe': [],
                    'restaurant': [],
                    'holyPlace': []
                }
            
            # 施設情報を作成
            facility = {
                'name': name,
            }
            
            # URLがある場合のみ追加
            if website and website.strip() and not website.startswith('閉店') and not website.startswith('存在しない') and not website.startswith('特定の店'):
                facility['website'] = website.strip()
            
            if maps_url and maps_url.strip():
                facility['mapsUrl'] = maps_url.strip()
            
            # カテゴリ別に情報を追加
            if category == 'parking':
                facility['description'] = f'{name}の駐車場情報'
                facilities[venue_id]['parking'].append(facility)
                
            elif category == 'coinLocker':
                facility['description'] = f'{name}のコインロッカー'
                facilities[venue_id]['coinLocker'].append(facility)
                
            elif category == 'cafe':
                facility['description'] = f'{name}でライブ前後の休憩に最適'
                facilities[venue_id]['cafe'].append(facility)
                
            elif category == 'restaurant':
                facility['description'] = f'{name}で地元のグルメを楽しめます'
                facility['cuisine'] = '地元料理'
                facilities[venue_id]['restaurant'].append(facility)
                
            elif category == 'holyPlace':
                facility['description'] = f'れをる関連の聖地: {name}'
                facility['type'] = 'MV/作品関連'
                facilities[venue_id]['holyPlace'].append(facility)
    
    return facilities

def generate_typescript_updates(facilities: Dict[str, Dict[str, List[Dict[str, Any]]]]) -> str:
    """
    TypeScriptのコード更新用の情報を生成
    """
    output = []
    
    for venue_id, categories in facilities.items():
        output.append(f"\n// {venue_id} の施設情報")
        output.append(f"// Parking: {len(categories['parking'])} items")
        output.append(f"// Coin Lockers: {len(categories['coinLocker'])} items")
        output.append(f"// Cafes: {len(categories['cafe'])} items")
        output.append(f"// Restaurants: {len(categories['restaurant'])} items")
        output.append(f"// Holy Places: {len(categories['holyPlace'])} items")
        
        # JSON形式で出力（手動でコピペしやすいように）
        output.append(json.dumps(categories, indent=2, ensure_ascii=False))
        output.append("-" * 80)
    
    return "\n".join(output)

def main():
    csv_path = '/Users/pochi/sources/github.com/twilightdve/reol/venue_facilities_links.csv'
    
    print("Reading CSV file...")
    facilities = read_csv_facilities(csv_path)
    
    print(f"\nProcessed {len(facilities)} venues")
    
    # 統計情報
    for venue_id, categories in facilities.items():
        total = sum(len(items) for items in categories.values())
        print(f"\n{venue_id}:")
        print(f"  Total facilities: {total}")
        for category, items in categories.items():
            if items:
                print(f"  - {category}: {len(items)}")
    
    # JSON出力
    output_path = '/Users/pochi/sources/github.com/twilightdve/reol/venue_facilities_data.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(facilities, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Saved to: {output_path}")
    print("\nYou can now use this JSON to update venues.ts")

if __name__ == '__main__':
    main()
