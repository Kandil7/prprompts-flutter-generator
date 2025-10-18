#!/bin/bash
set -e

# PRPROMPTS Performance Benchmarking Suite
# Measures execution time and resource usage of key operations

echo "========================================"
echo "PRPROMPTS Performance Benchmarks"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Benchmark output directory
BENCH_DIR="coverage/benchmarks"
mkdir -p "$BENCH_DIR"

# Results file
RESULTS_FILE="$BENCH_DIR/performance-results.txt"
JSON_FILE="$BENCH_DIR/performance.json"

# Check if prprompts is installed
if ! command -v prprompts &> /dev/null; then
  echo -e "${RED}Error: prprompts command not found${NC}"
  echo "Please install first: npm install -g ."
  exit 1
fi

# Helper functions
benchmark_start() {
  BENCH_NAME="$1"
  echo -e "${BLUE}Benchmarking:${NC} $BENCH_NAME"
  START_TIME=$(date +%s%N 2>/dev/null || date +%s)
}

benchmark_end() {
  END_TIME=$(date +%s%N 2>/dev/null || date +%s)
  DURATION=$((END_TIME - START_TIME))

  # Convert nanoseconds to milliseconds (or seconds if ns not available)
  if [ ${#DURATION} -gt 10 ]; then
    DURATION_MS=$((DURATION / 1000000))
    echo -e "  ${GREEN}✓${NC} Completed in ${DURATION_MS}ms"
  else
    echo -e "  ${GREEN}✓${NC} Completed in ${DURATION}s"
    DURATION_MS=$((DURATION * 1000))
  fi

  echo "$DURATION_MS"
}

# Initialize results
{
  echo "PRPROMPTS Performance Benchmarks"
  echo "Generated: $(date)"
  echo "================================"
  echo ""
} > "$RESULTS_FILE"

# JSON array start
echo "{" > "$JSON_FILE"
echo "  \"timestamp\": \"$(date -Iseconds 2>/dev/null || date)\"," >> "$JSON_FILE"
echo "  \"benchmarks\": [" >> "$JSON_FILE"

FIRST_BENCH=true

# Test directory
TEST_DIR="test-output/performance"
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"

echo "Test directory: $TEST_DIR"
echo ""

# ========================================
# Benchmark 1: CLI Startup Time
# ========================================
echo "Benchmark 1: CLI Startup Time"
echo "----------------------------------------"

benchmark_start "CLI version check"
prprompts --version &>/dev/null
TIME_VERSION=$(benchmark_end)

benchmark_start "CLI help display"
prprompts --help &>/dev/null
TIME_HELP=$(benchmark_end)

# Calculate average startup time
STARTUP_AVG=$(((TIME_VERSION + TIME_HELP) / 2))
echo -e "  Average startup: ${STARTUP_AVG}ms"
echo ""

# Record results
{
  echo "1. CLI Startup Time"
  echo "  - Version check: ${TIME_VERSION}ms"
  echo "  - Help display: ${TIME_HELP}ms"
  echo "  - Average: ${STARTUP_AVG}ms"
  echo ""
} >> "$RESULTS_FILE"

# JSON entry
if [ "$FIRST_BENCH" = false ]; then echo "    ," >> "$JSON_FILE"; fi
{
  echo "    {"
  echo "      \"name\": \"CLI Startup\","
  echo "      \"version_check_ms\": $TIME_VERSION,"
  echo "      \"help_display_ms\": $TIME_HELP,"
  echo "      \"average_ms\": $STARTUP_AVG"
  echo "    }"
} >> "$JSON_FILE"
FIRST_BENCH=false

# ========================================
# Benchmark 2: PRPROMPTS File Reading
# ========================================
echo "Benchmark 2: PRPROMPTS File Reading"
echo "----------------------------------------"

# Check if PRPROMPTS files exist
if [ -d ".claude/prompts/prprompts/core" ]; then
  PROMPT_DIR=".claude/prompts/prprompts/core"
elif [ -d "prompts/core" ]; then
  PROMPT_DIR="prompts/core"
else
  echo -e "${YELLOW}⊘ PRPROMPTS files not found, skipping${NC}"
  PROMPT_DIR=""
fi

if [ -n "$PROMPT_DIR" ]; then
  benchmark_start "Reading all PRPROMPTS files"
  FILE_COUNT=$(find "$PROMPT_DIR" -name "*.md" | wc -l)

  # Calculate total size
  TOTAL_SIZE=$(find "$PROMPT_DIR" -name "*.md" -exec wc -c {} + | tail -1 | awk '{print $1}')
  TOTAL_SIZE_KB=$((TOTAL_SIZE / 1024))

  TIME_READ=$(benchmark_end)

  echo -e "  Files read: $FILE_COUNT"
  echo -e "  Total size: ${TOTAL_SIZE_KB}KB"
  echo -e "  Throughput: $((TOTAL_SIZE_KB * 1000 / TIME_READ))KB/s"
  echo ""

  # Record results
  {
    echo "2. PRPROMPTS File Reading"
    echo "  - Files: $FILE_COUNT"
    echo "  - Size: ${TOTAL_SIZE_KB}KB"
    echo "  - Time: ${TIME_READ}ms"
    echo "  - Throughput: $((TOTAL_SIZE_KB * 1000 / TIME_READ))KB/s"
    echo ""
  } >> "$RESULTS_FILE"

  # JSON entry
  echo "    ," >> "$JSON_FILE"
  {
    echo "    {"
    echo "      \"name\": \"File Reading\","
    echo "      \"files\": $FILE_COUNT,"
    echo "      \"size_kb\": $TOTAL_SIZE_KB,"
    echo "      \"time_ms\": $TIME_READ,"
    echo "      \"throughput_kbps\": $((TOTAL_SIZE_KB * 1000 / TIME_READ))"
    echo "    }"
  } >> "$JSON_FILE"
fi

# ========================================
# Benchmark 3: Extension Loading
# ========================================
echo "Benchmark 3: Extension Manifest Loading"
echo "----------------------------------------"

benchmark_start "Loading extension manifests"

# Load all extension manifests
MANIFEST_COUNT=0
if [ -f "claude-extension.json" ]; then
  node -e "JSON.parse(require('fs').readFileSync('claude-extension.json', 'utf8'))" &>/dev/null
  MANIFEST_COUNT=$((MANIFEST_COUNT + 1))
fi
if [ -f "qwen-extension.json" ]; then
  node -e "JSON.parse(require('fs').readFileSync('qwen-extension.json', 'utf8'))" &>/dev/null
  MANIFEST_COUNT=$((MANIFEST_COUNT + 1))
fi
if [ -f "gemini-extension.json" ]; then
  node -e "JSON.parse(require('fs').readFileSync('gemini-extension.json', 'utf8'))" &>/dev/null
  MANIFEST_COUNT=$((MANIFEST_COUNT + 1))
fi

TIME_MANIFESTS=$(benchmark_end)

echo -e "  Manifests loaded: $MANIFEST_COUNT"
echo -e "  Average per manifest: $((TIME_MANIFESTS / MANIFEST_COUNT))ms"
echo ""

# Record results
{
  echo "3. Extension Manifest Loading"
  echo "  - Manifests: $MANIFEST_COUNT"
  echo "  - Time: ${TIME_MANIFESTS}ms"
  echo "  - Average: $((TIME_MANIFESTS / MANIFEST_COUNT))ms"
  echo ""
} >> "$RESULTS_FILE"

# JSON entry
echo "    ," >> "$JSON_FILE"
{
  echo "    {"
  echo "      \"name\": \"Extension Loading\","
  echo "      \"manifests\": $MANIFEST_COUNT,"
  echo "      \"time_ms\": $TIME_MANIFESTS,"
  echo "      \"average_ms\": $((TIME_MANIFESTS / MANIFEST_COUNT))"
  echo "    }"
} >> "$JSON_FILE"

# ========================================
# Benchmark 4: Example PRD Processing
# ========================================
echo "Benchmark 4: Example PRD Processing"
echo "----------------------------------------"

if [ -f "examples/healthcare-prd.md" ]; then
  benchmark_start "Reading example PRD"

  # Copy example PRD
  cd "$TEST_DIR"
  mkdir -p docs
  cp ../../examples/healthcare-prd.md docs/PRD.md

  # Measure PRD size
  PRD_SIZE=$(wc -c < docs/PRD.md)
  PRD_SIZE_KB=$((PRD_SIZE / 1024))

  TIME_PRD=$(benchmark_end)

  echo -e "  PRD size: ${PRD_SIZE_KB}KB"
  echo -e "  Processing time: ${TIME_PRD}ms"
  echo ""

  cd ../..

  # Record results
  {
    echo "4. Example PRD Processing"
    echo "  - Size: ${PRD_SIZE_KB}KB"
    echo "  - Time: ${TIME_PRD}ms"
    echo ""
  } >> "$RESULTS_FILE"

  # JSON entry
  echo "    ," >> "$JSON_FILE"
  {
    echo "    {"
    echo "      \"name\": \"PRD Processing\","
    echo "      \"size_kb\": $PRD_SIZE_KB,"
    echo "      \"time_ms\": $TIME_PRD"
    echo "    }"
  } >> "$JSON_FILE"
else
  echo -e "${YELLOW}⊘ Example PRD not found, skipping${NC}"
  echo ""
fi

# ========================================
# Benchmark 5: Package Size Analysis
# ========================================
echo "Benchmark 5: Package Size Analysis"
echo "----------------------------------------"

benchmark_start "Analyzing package size"

# Count files
TOTAL_FILES=$(find . -type f ! -path "*/node_modules/*" ! -path "*/test-output/*" ! -path "*/.git/*" | wc -l)

# Calculate total size
TOTAL_SIZE=$(find . -type f ! -path "*/node_modules/*" ! -path "*/test-output/*" ! -path "*/.git/*" -exec wc -c {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
TOTAL_SIZE_MB=$((TOTAL_SIZE / 1024 / 1024))

TIME_ANALYSIS=$(benchmark_end)

echo -e "  Total files: $TOTAL_FILES"
echo -e "  Total size: ${TOTAL_SIZE_MB}MB"
echo -e "  Analysis time: ${TIME_ANALYSIS}ms"
echo ""

# Record results
{
  echo "5. Package Size Analysis"
  echo "  - Files: $TOTAL_FILES"
  echo "  - Size: ${TOTAL_SIZE_MB}MB"
  echo "  - Time: ${TIME_ANALYSIS}ms"
  echo ""
} >> "$RESULTS_FILE"

# JSON entry
echo "    ," >> "$JSON_FILE"
{
  echo "    {"
  echo "      \"name\": \"Package Analysis\","
  echo "      \"files\": $TOTAL_FILES,"
  echo "      \"size_mb\": $TOTAL_SIZE_MB,"
  echo "      \"time_ms\": $TIME_ANALYSIS"
  echo "    }"
} >> "$JSON_FILE"

# ========================================
# Performance Summary
# ========================================
echo "========================================"
echo "Performance Summary"
echo "========================================"

# Calculate total benchmark time
TOTAL_TIME=$((TIME_VERSION + TIME_HELP + TIME_READ + TIME_MANIFESTS + TIME_PRD + TIME_ANALYSIS))

echo "Total benchmark time: ${TOTAL_TIME}ms"
echo ""

# Performance rating
if [ $STARTUP_AVG -lt 100 ]; then
  STARTUP_RATING="Excellent"
  STARTUP_COLOR="$GREEN"
elif [ $STARTUP_AVG -lt 300 ]; then
  STARTUP_RATING="Good"
  STARTUP_COLOR="$GREEN"
elif [ $STARTUP_AVG -lt 500 ]; then
  STARTUP_RATING="Fair"
  STARTUP_COLOR="$YELLOW"
else
  STARTUP_RATING="Slow"
  STARTUP_COLOR="$RED"
fi

echo -e "CLI Startup: ${STARTUP_COLOR}${STARTUP_RATING}${NC} (${STARTUP_AVG}ms)"

# Record summary
{
  echo "Performance Summary"
  echo "  - Total benchmark time: ${TOTAL_TIME}ms"
  echo "  - CLI startup rating: ${STARTUP_RATING} (${STARTUP_AVG}ms)"
  echo ""
} >> "$RESULTS_FILE"

# Close JSON
echo "  ]," >> "$JSON_FILE"
echo "  \"summary\": {" >> "$JSON_FILE"
echo "    \"total_time_ms\": $TOTAL_TIME," >> "$JSON_FILE"
echo "    \"startup_avg_ms\": $STARTUP_AVG," >> "$JSON_FILE"
echo "    \"startup_rating\": \"${STARTUP_RATING}\"" >> "$JSON_FILE"
echo "  }" >> "$JSON_FILE"
echo "}" >> "$JSON_FILE"

echo ""
echo "Results saved to:"
echo "  - Text: $RESULTS_FILE"
echo "  - JSON: $JSON_FILE"
echo ""

# Performance targets
echo "Performance Targets:"
echo "  ✓ CLI Startup < 300ms"
if [ $STARTUP_AVG -lt 300 ]; then
  echo -e "    ${GREEN}✓ PASS${NC} (${STARTUP_AVG}ms)"
else
  echo -e "    ${RED}✗ FAIL${NC} (${STARTUP_AVG}ms)"
fi

echo ""
echo -e "${GREEN}✅ Performance benchmarking complete!${NC}"
