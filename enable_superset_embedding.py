#!/usr/bin/env python3
"""
Enable Superset dashboard embedding via API and get UUID
"""
import requests
import json
import sys
import os

SUPERSET_URL = os.getenv('SUPERSET_URL', 'http://localhost:8088')
SUPERSET_USERNAME = os.getenv('SUPERSET_USERNAME', 'admin')
SUPERSET_PASSWORD = os.getenv('SUPERSET_PASSWORD') or (sys.argv[1] if len(sys.argv) > 1 else None)
DASHBOARD_ID = os.getenv('DASHBOARD_ID', '14')

if not SUPERSET_PASSWORD:
    print("Usage: python enable_superset_embedding.py YOUR_PASSWORD")
    print("Example: python enable_superset_embedding.py mypassword123")
    print("Or: SUPERSET_PASSWORD=mypassword123 python enable_superset_embedding.py")
    sys.exit(1)

def enable_embedding():
    # Step 1: Login
    print(f"🔐 Authenticating with Superset at {SUPERSET_URL}...")
    login_response = requests.post(
        f"{SUPERSET_URL}/api/v1/security/login",
        json={
            "username": SUPERSET_USERNAME,
            "password": SUPERSET_PASSWORD,
            "provider": "db",
            "refresh": True
        }
    )
    
    if not login_response.ok:
        print(f"❌ Login failed: {login_response.status_code} - {login_response.text}")
        sys.exit(1)
    
    access_token = login_response.json()['access_token']
    print("✅ Authenticated")
    
    # Step 2: Get dashboard details
    print(f"📊 Fetching dashboard {DASHBOARD_ID}...")
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    dashboard_response = requests.get(
        f"{SUPERSET_URL}/api/v1/dashboard/{DASHBOARD_ID}",
        headers=headers
    )
    
    if not dashboard_response.ok:
        print(f"❌ Failed to get dashboard: {dashboard_response.status_code}")
        sys.exit(1)
    
    dashboard = dashboard_response.json()['result']
    dashboard_uuid = dashboard.get('uuid') or dashboard.get('dashboard_uuid')
    
    print(f"✅ Dashboard found: {dashboard.get('dashboard_title', 'Untitled')}")
    print(f"   UUID: {dashboard_uuid}")
    print(f"   Published: {dashboard.get('published', False)}")
    
    # Step 3: Publish dashboard first (required for embedding)
    if not dashboard.get('published', False):
        print("📝 Publishing dashboard...")
        publish_response = requests.put(
            f"{SUPERSET_URL}/api/v1/dashboard/{DASHBOARD_ID}",
            headers=headers,
            json={"published": True}
        )
        if publish_response.ok:
            print("✅ Dashboard published")
        else:
            print(f"⚠️  Failed to publish: {publish_response.status_code}")
    
    # Step 4: Enable embedding
    is_embedded = dashboard.get('is_embedded', False)
    
    if is_embedded:
        print("✅ Embedding already enabled")
    else:
        print("🔧 Enabling embedding...")
        # Try PATCH instead of PUT for partial update
        patch_response = requests.patch(
            f"{SUPERSET_URL}/api/v1/dashboard/{DASHBOARD_ID}",
            headers=headers,
            json={"is_embedded": True}
        )
        
        if not patch_response.ok:
            # Try with full dashboard data
            print("   Trying alternative method...")
            full_response = requests.put(
                f"{SUPERSET_URL}/api/v1/dashboard/{DASHBOARD_ID}",
                headers=headers,
                json={**dashboard, "is_embedded": True, "published": True}
            )
            if full_response.ok:
                print("✅ Embedding enabled")
            else:
                print(f"⚠️  Failed to enable embedding: {full_response.status_code}")
                print(f"   Response: {full_response.text[:200]}")
                print("   You may need to enable it manually in the UI:")
                print("   1. Go to http://localhost:8088/superset/dashboard/14/")
                print("   2. Click the menu (⋮) in top right")
                print("   3. Select 'Embed dashboard'")
        else:
            print("✅ Embedding enabled")
    
    # Output for environment variables
    print("\n" + "="*60)
    print("📋 Add these to your .env.local or Vercel:")
    print("="*60)
    print(f"NEXT_PUBLIC_DASHBOARD_UUID={dashboard_uuid}")
    print(f"NEXT_PUBLIC_DASHBOARD_ID={DASHBOARD_ID}")
    print(f"NEXT_PUBLIC_SUPERSET_DOMAIN={SUPERSET_URL}")
    print("="*60)

if __name__ == "__main__":
    enable_embedding()

