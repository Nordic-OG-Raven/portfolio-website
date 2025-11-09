#!/bin/bash
#
# Stop FinSight Local Development
#

set -e

FLASK_PORT=5001
NEXTJS_PORT=3000

echo "Stopping FinSight..."

# Kill by PID file if exists
if [ -f /tmp/flask_finsight.pid ]; then
    kill -9 $(cat /tmp/flask_finsight.pid) 2>/dev/null || true
    rm /tmp/flask_finsight.pid 2>/dev/null || true
fi

if [ -f /tmp/nextjs_finsight.pid ]; then
    kill -9 $(cat /tmp/nextjs_finsight.pid) 2>/dev/null || true
    rm /tmp/nextjs_finsight.pid 2>/dev/null || true
fi

# Kill by port (backup method)
lsof -ti:$FLASK_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:$NEXTJS_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true

# Kill by process name (backup method)
pkill -9 -f "python.*main.py" 2>/dev/null || true
pkill -9 -f "next dev" 2>/dev/null || true

sleep 1
echo "✅ Stopped"

