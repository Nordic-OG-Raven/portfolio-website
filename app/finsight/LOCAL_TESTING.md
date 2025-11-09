# Local Testing Guide - FinSight Financial Statements

## Quick Start

**Both servers are currently running:**
- ✅ Flask API: `http://localhost:5001`
- ✅ Next.js Frontend: `http://localhost:3000`

**Open your browser to:**
```
http://localhost:3000/finsight
```

## Verify Servers Are Running

```bash
# Check Flask API
curl http://localhost:5001/health
# Should return: {"status":"healthy",...}

# Check Next.js
curl http://localhost:3000 > /dev/null && echo "✅ Next.js running" || echo "❌ Not running"
```

## If Servers Are Not Running

### Start Flask API (Terminal 1):
```bash
cd /Users/jonas/FinSight/api
source /Users/jonas/Thesis/.venv/bin/activate
python main.py
```

Wait for: `Running on http://127.0.0.1:5001`

### Start Next.js (Terminal 2):
```bash
cd /Users/jonas/Website/portfolio
echo "NEXT_PUBLIC_FINSIGHT_API=http://localhost:5001" > .env.local
npm run dev
```

Wait for: `Ready in Xms` and `Local: http://localhost:3000`

## What You Should See

After opening `http://localhost:3000/finsight`:

1. **Select a company** (e.g., NVO, AAPL)
2. **Select a year** (e.g., 2024)
3. **Click "View Full Statements"** or navigate to Financial Statements tab
4. **You should see:**
   - Multi-year columns (2024, 2023, 2022)
   - Hierarchical structure with indentation
   - Proper accounting order (Revenue → Costs → Gross Profit → Operating Profit)
   - Calculated totals in bold with gray background
   - Accounting-style formatting (commas, parentheses for negatives)
   - Units shown once at top of table

## Troubleshooting

**Port 5001 in use:**
```bash
lsof -ti:5001 | xargs kill -9
```

**Port 3000 in use:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Flask API errors:**
```bash
# Check logs
tail -50 /tmp/flask.log

# Restart Flask
pkill -f "python.*main.py"
cd /Users/jonas/FinSight/api
source /Users/jonas/Thesis/.venv/bin/activate
python main.py
```

**Next.js errors:**
```bash
# Clear cache and restart
cd /Users/jonas/Website/portfolio
rm -rf .next
npm run dev
```

**Database connection issues:**
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# If not running:
cd /Users/jonas/FinSight
docker-compose up postgres -d
```

## Testing the New Features

### Test Multi-Year Display:
1. Select a company with data for multiple years
2. View Financial Statements
3. Verify columns show: 2024, 2023, 2022

### Test Hierarchical Structure:
1. Look for indented items under parent totals
2. Verify calculated totals (Gross Profit, Operating Profit) are bold and gray
3. Check that items are in proper accounting order (not alphabetical)

### Test Number Formatting:
1. Verify numbers use commas (e.g., 290,403)
2. Verify negatives use parentheses (e.g., (44,522))
3. Verify units shown once at top, not per row

