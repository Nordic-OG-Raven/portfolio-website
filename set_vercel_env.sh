#!/bin/bash
# Set Vercel environment variables for Novo Nordisk dashboard

echo "Setting Vercel environment variables for production..."
echo ""

# Public variables (client-side)
echo "NEXT_PUBLIC_SUPERSET_DOMAIN (use http://localhost:8088 for now, update when Superset is public)"
echo -n "6af6faef-7149-4f36-aad7-0b7b47e18d62" | vercel env add NEXT_PUBLIC_DASHBOARD_UUID production

echo "14" | vercel env add NEXT_PUBLIC_DASHBOARD_ID production

echo "http://localhost:8088" | vercel env add NEXT_PUBLIC_SUPERSET_DOMAIN production

# Server-side variables
echo "http://localhost:8088" | vercel env add SUPERSET_DOMAIN production

echo "admin" | vercel env add SUPERSET_USERNAME production

echo "1Ndubioproreo." | vercel env add SUPERSET_PASSWORD production

echo ""
echo "✅ Environment variables set!"
echo "⚠️  Remember to update SUPERSET_DOMAIN when you deploy Superset publicly"

