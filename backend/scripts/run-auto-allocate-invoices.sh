#!/bin/bash
# filepath: /Users/kevinkoech/Documents/property-saas/backend/scripts/run-auto-allocate-invoices.sh

# Auto-Allocate Existing Invoices Script
# This script auto-allocates unallocated property payments to existing invoices
# Usage: ./run-auto-allocate-invoices.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/auto-allocate-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

echo "========================================" | tee -a "$LOG_FILE"
echo "Auto-Allocate Invoices Script" | tee -a "$LOG_FILE"
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
if command -v npx &> /dev/null && [ -f "src/scripts/autoAllocateExistingInvoices.ts" ]; then
    echo "Running with ts-node..." | tee -a "$LOG_FILE"
    npx ts-node src/scripts/autoAllocateExistingInvoices.ts 2>&1 | tee -a "$LOG_FILE"
elif [ -f "dist/scripts/autoAllocateExistingInvoices.js" ]; then
    echo "Running compiled JavaScript..." | tee -a "$LOG_FILE"
    node dist/scripts/autoAllocateExistingInvoices.js 2>&1 | tee -a "$LOG_FILE"
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
find "$LOG_DIR" -name "auto-allocate-*.log" -type f -mtime +30 -delete 2>/dev/null || true

exit $EXIT_CODE