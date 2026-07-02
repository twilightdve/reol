#!/usr/bin/env python3
import csv
import requests
from typing import Dict, List, Tuple
import time
from urllib.parse import urlparse

def check_url_status(url: str, timeout: int = 10) -> Tuple[int, str]:
    """
    URLのHTTPステータスコードをチェックする
    
    Returns:
        Tuple[int, str]: (ステータスコード, ステータス説明)
    """
    if not url or url.strip() == '':
        return (0, 'Empty URL')
    
    try:
        # User-Agentを設定してリクエスト
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # HEADリクエストで先にチェック（軽量）
        response = requests.head(url, timeout=timeout, headers=headers, allow_redirects=True)
        
        # HEADが405 (Method Not Allowed)の場合はGETで再試行
        if response.status_code == 405:
            response = requests.get(url, timeout=timeout, headers=headers, allow_redirects=True)
        
        return (response.status_code, response.reason)
    
    except requests.exceptions.Timeout:
        return (-1, 'Timeout')
    except requests.exceptions.ConnectionError:
        return (-2, 'Connection Error')
    except requests.exceptions.TooManyRedirects:
        return (-3, 'Too Many Redirects')
    except requests.exceptions.RequestException as e:
        return (-4, f'Request Error: {str(e)}')
    except Exception as e:
        return (-5, f'Unknown Error: {str(e)}')

def read_csv_with_urls(csv_path: str) -> List[Dict]:
    """CSVファイルを読み込む"""
    rows = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows

def check_urls_in_csv(csv_path: str, check_404_first: bool = True):
    """
    CSVファイル内のURLをチェックしてステータスを追記
    
    Args:
        csv_path: CSVファイルのパス
        check_404_first: 404エラーのものから先にチェックするかどうか
    """
    print(f"Reading CSV file: {csv_path}")
    rows = read_csv_with_urls(csv_path)
    
    print(f"Total rows: {len(rows)}")
    
    # URLを収集
    urls_to_check = []
    for idx, row in enumerate(rows):
        website_url = row.get('Website URL', '').strip()
        maps_url = row.get('Google Maps URL', '').strip()
        
        if website_url:
            urls_to_check.append({
                'row_idx': idx,
                'url_type': 'Website URL',
                'url': website_url
            })
        
        if maps_url:
            urls_to_check.append({
                'row_idx': idx,
                'url_type': 'Google Maps URL',
                'url': maps_url
            })
    
    print(f"Total URLs to check: {len(urls_to_check)}")
    
    # URLチェックの実行
    results = []
    
    for i, url_info in enumerate(urls_to_check):
        url = url_info['url']
        url_type = url_info['url_type']
        row_idx = url_info['row_idx']
        
        print(f"\n[{i+1}/{len(urls_to_check)}] Checking {url_type}: {url}")
        
        status_code, status_reason = check_url_status(url)
        
        result = {
            'row_idx': row_idx,
            'url_type': url_type,
            'url': url,
            'status_code': status_code,
            'status_reason': status_reason
        }
        
        results.append(result)
        
        print(f"  Status: {status_code} - {status_reason}")
        
        # レート制限対策で少し待機
        time.sleep(0.5)
    
    # 結果をステータスコード別に集計
    print("\n" + "="*80)
    print("Summary:")
    print("="*80)
    
    status_summary = {}
    for result in results:
        status = result['status_code']
        if status not in status_summary:
            status_summary[status] = []
        status_summary[status].append(result)
    
    for status_code in sorted(status_summary.keys()):
        count = len(status_summary[status_code])
        print(f"\nStatus {status_code}: {count} URLs")
        
        if status_code == 404 or status_code < 0:
            for result in status_summary[status_code]:
                print(f"  - {result['url_type']}: {result['url']}")
                print(f"    Row: {rows[result['row_idx']]['会場名']} - {rows[result['row_idx']]['施設名']}")
    
    # 結果をCSVに追記
    print("\n" + "="*80)
    print("Adding status columns to CSV...")
    print("="*80)
    
    # 各行にステータス情報を追加
    for row in rows:
        row['Website URL Status'] = ''
        row['Google Maps URL Status'] = ''
    
    for result in results:
        row_idx = result['row_idx']
        url_type = result['url_type']
        status = f"{result['status_code']} {result['status_reason']}"
        
        if url_type == 'Website URL':
            rows[row_idx]['Website URL Status'] = status
        elif url_type == 'Google Maps URL':
            rows[row_idx]['Google Maps URL Status'] = status
    
    # 新しいCSVファイルに書き込み
    output_path = csv_path.replace('.csv', '_with_status.csv')
    
    fieldnames = list(rows[0].keys())
    
    with open(output_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"\nResults saved to: {output_path}")
    
    return results

if __name__ == '__main__':
    csv_path = '/Users/pochi/sources/github.com/twilightdve/reol/venue_facilities_links.csv'
    check_urls_in_csv(csv_path, check_404_first=True)
