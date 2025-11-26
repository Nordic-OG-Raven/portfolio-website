#!/bin/bash
#
# FinSight Local Development Startup Script
# Handles all setup automatically - just open http://localhost:3000/finsight
#

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
PROJECT_ROOT="/Users/jonas/Website/portfolio"
FINSIGHT_API="/Users/jonas/FinSight/api"
VENV_PATH="/Users/jonas/FinSight/.venv"
FLASK_PORT=5001
NEXTJS_PORT=3000

echo "========================================================================"
echo "  FinSight Local Development Startup"
echo "========================================================================"
echo ""

# Function to kill process on port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}Killing processes on port $port...${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Function to kill processes by name
kill_processes() {
    local pattern=$1
    local pids=$(pgrep -f "$pattern" 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}Killing existing $pattern processes...${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Step 1: Clean up any existing processes
echo -e "${BLUE}Step 1: Cleaning up existing processes...${NC}"
kill_port $FLASK_PORT
kill_port $NEXTJS_PORT
kill_processes "python.*main.py"
kill_processes "next dev"
sleep 2
echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""

# Step 2: Verify dependencies
echo -e "${BLUE}Step 2: Verifying dependencies...${NC}"
if [ ! -d "$VENV_PATH" ]; then
    echo -e "${RED}❌ Virtual environment not found at $VENV_PATH${NC}"
    exit 1
fi

if [ ! -d "$FINSIGHT_API" ]; then
    echo -e "${RED}❌ FinSight API directory not found at $FINSIGHT_API${NC}"
    exit 1
fi

if [ ! -d "$PROJECT_ROOT" ]; then
    echo -e "${RED}❌ Project root not found at $PROJECT_ROOT${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies verified${NC}"
echo ""

# Step 3: Check PostgreSQL
echo -e "${BLUE}Step 3: Checking PostgreSQL...${NC}"
if ! docker ps | grep -q postgres; then
    echo -e "${YELLOW}⚠️  PostgreSQL not running. Starting...${NC}"
    cd /Users/jonas/FinSight
    docker-compose up postgres -d 2>/dev/null || echo -e "${YELLOW}⚠️  Could not start PostgreSQL. Continuing anyway...${NC}"
    sleep 3
fi
echo -e "${GREEN}✅ PostgreSQL check complete${NC}"
echo ""

# Step 4: Setup environment
echo -e "${BLUE}Step 4: Setting up environment...${NC}"
cd "$PROJECT_ROOT"
echo "NEXT_PUBLIC_FINSIGHT_API=http://localhost:$FLASK_PORT" > .env.local
echo -e "${GREEN}✅ Environment configured${NC}"
echo ""

# Step 5: Start Flask API
echo -e "${BLUE}Step 5: Starting Flask API on port $FLASK_PORT...${NC}"
cd "$FINSIGHT_API"
source "$VENV_PATH/bin/activate"
nohup python main.py > /tmp/flask_finsight.log 2>&1 &
FLASK_PID=$!
echo $FLASK_PID > /tmp/flask_finsight.pid
sleep 3

# Verify Flask started
if ! kill -0 $FLASK_PID 2>/dev/null; then
    echo -e "${RED}❌ Flask failed to start. Check /tmp/flask_finsight.log${NC}"
    tail -20 /tmp/flask_finsight.log
    exit 1
fi

# Wait for Flask to be ready
for i in {1..10}; do
    if curl -s "http://localhost:$FLASK_PORT/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Flask API running on http://localhost:$FLASK_PORT${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ Flask API not responding after 10s${NC}"
        tail -20 /tmp/flask_finsight.log
        exit 1
    fi
    sleep 1
done
echo ""

# Step 6: Start Next.js
echo -e "${BLUE}Step 6: Starting Next.js on port $NEXTJS_PORT...${NC}"
cd "$PROJECT_ROOT"
rm -rf .next 2>/dev/null || true
nohup npm run dev > /tmp/nextjs_finsight.log 2>&1 &
NEXTJS_PID=$!
echo $NEXTJS_PID > /tmp/nextjs_finsight.pid
sleep 5

# Verify Next.js started
if ! kill -0 $NEXTJS_PID 2>/dev/null; then
    echo -e "${RED}❌ Next.js failed to start. Check /tmp/nextjs_finsight.log${NC}"
    tail -20 /tmp/nextjs_finsight.log
    exit 1
fi

# Wait for Next.js to be ready
for i in {1..30}; do
    if curl -s "http://localhost:$NEXTJS_PORT" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Next.js running on http://localhost:$NEXTJS_PORT${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠️  Next.js taking longer than expected. Check /tmp/nextjs_finsight.log${NC}"
        break
    fi
    sleep 1
done
echo ""

# Step 7: Final status
echo "========================================================================"
echo -e "${GREEN}✅ FinSight is ready!${NC}"
echo "========================================================================"
echo ""
echo -e "Open your browser to: ${BLUE}http://localhost:$NEXTJS_PORT/finsight${NC}"
echo ""
echo "Process IDs:"
echo "  Flask API: $FLASK_PID (port $FLASK_PORT)"
echo "  Next.js:   $NEXTJS_PID (port $NEXTJS_PORT)"
echo ""
echo "Logs:"
echo "  Flask:   tail -f /tmp/flask_finsight.log"
echo "  Next.js: tail -f /tmp/nextjs_finsight.log"
echo ""
echo "To stop:"
echo "  kill $FLASK_PID $NEXTJS_PID"
echo "  or run: pkill -f 'python.*main.py' && pkill -f 'next dev'"
echo ""
echo "========================================================================"

