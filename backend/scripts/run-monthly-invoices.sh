#!/bin/bash
# filepath: /Users/kevinkoech/Documents/property-saas/backend/scripts/run-monthly-invoices.sh

# Monthly Invoice Generation Script
# This script generates property invoices for the previous month
# Schedule with cron: 0 2 1 * * /path/to/run-monthly-invoices.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/invoice-generation-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

echo "========================================" | tee -a "$LOG_FILE"
echo "Monthly Invoice Generation" | tee -a "$LOG_FILE"
echo "Started at: $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

cd "$PROJECT_DIR"

# Load environment variables if .env exists
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
    echo "Environment loaded from .env" | tee -a "$LOG_FILE"
fi

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed" | tee -a "$LOG_FILE"
    exit 1
fi

# Check if ts-node is available, otherwise use compiled JS
if command -v npx &> /dev/null && [ -f "src/scripts/generateMonthlyInvoices.ts" ]; then
    echo "Running with ts-node..." | tee -a "$LOG_FILE"
    npx ts-node src/scripts/generateMonthlyInvoices.ts 2>&1 | tee -a "$LOG_FILE"
elif [ -f "dist/scripts/generateMonthlyInvoices.js" ]; then
    echo "Running compiled JavaScript..." | tee -a "$LOG_FILE"
    node dist/scripts/generateMonthlyInvoices.js 2>&1 | tee -a "$LOG_FILE"
else
    echo "ERROR: Script not found. Run 'npm run build' first." | tee -a "$LOG_FILE"
    exit 1
fi

EXIT_CODE=$?

echo "========================================" | tee -a "$LOG_FILE"
echo "Finished at: $(date)" | tee -a "$LOG_FILE"
echo "Exit code: $EXIT_CODE" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

# Keep only last 30 log files
find "$LOG_DIR" -name "invoice-generation-*.log" -type f -mtime +30 -delete 2>/dev/null || true

exit $EXIT_CODE