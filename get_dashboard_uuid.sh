#!/bin/bash
# Quick script to get dashboard UUID - requires you to be logged into Superset in browser

echo "Getting dashboard UUID from Superset..."
echo ""
echo "Option 1: Get UUID from browser (easiest)"
echo "1. Open http://localhost:8088/superset/dashboard/14/"
echo "2. Open browser DevTools (F12)"
echo "3. Go to Network tab"
echo "4. Refresh the page"
echo "5. Find the request to '/api/v1/dashboard/14'"
echo "6. Look for 'uuid' in the response JSON"
echo ""
echo "Option 2: Use browser console"
echo "1. Open http://localhost:8088/superset/dashboard/14/"
echo "2. Open browser console (F12)"
echo "3. Run: fetch('/api/v1/dashboard/14').then(r => r.json()).then(d => console.log('UUID:', d.result.uuid))"
echo ""
echo "Option 3: Copy auth token from browser"
echo "1. Login to Superset in browser"
echo "2. Open DevTools > Application > Cookies"
echo "3. Copy the 'session' cookie value"
echo "4. Run: curl -H 'Cookie: session=YOUR_SESSION_COOKIE' http://localhost:8088/api/v1/dashboard/14 | grep -o '\"uuid\":\"[^\"]*\"'"

