#!/bin/bash
cd /Users/jonas/Website/portfolio
echo "NEXT_PUBLIC_FINSIGHT_API=http://localhost:5000" > .env.local
npm run dev

