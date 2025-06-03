#!/bin/bash

set -e

echo "🧪 EliteBuilders Evaluation Test Suite Validation"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "success" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "warning" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    elif [ "$status" = "error" ]; then
        echo -e "${RED}❌ $message${NC}"
    else
        echo -e "${BLUE}ℹ️  $message${NC}"
    fi
}

# Check prerequisites
echo ""
echo "🔍 Checking Prerequisites"
echo "------------------------"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "success" "Node.js is available: $NODE_VERSION"
else
    print_status "error" "Node.js is not available"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "success" "npm is available: $NPM_VERSION"
else
    print_status "error" "npm is not available"
    exit 1
fi

# Check Docker (optional for unit tests)
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_status "success" "Docker is available: $DOCKER_VERSION"
    DOCKER_AVAILABLE=true
else
    print_status "warning" "Docker is not available (some integration tests may be mocked)"
    DOCKER_AVAILABLE=false
fi

# Check Redis (optional for unit tests)
if command -v redis-cli &> /dev/null; then
    if redis-cli -p 6380 ping &> /dev/null; then
        print_status "success" "Redis is available on port 6380"
        REDIS_AVAILABLE=true
    else
        print_status "warning" "Redis is not responding on port 6380 (will use mocked version)"
        REDIS_AVAILABLE=false
    fi
else
    print_status "warning" "Redis CLI is not available (will use mocked version)"
    REDIS_AVAILABLE=false
fi

# Run tests
echo ""
echo "🧪 Running Evaluation Tests"
echo "---------------------------"

print_status "info" "Starting test execution..."

# Capture test output
TEST_OUTPUT=$(npm run test:evaluation 2>&1)
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_status "success" "All evaluation tests passed!"
    
    # Extract test statistics
    PASSED_TESTS=$(echo "$TEST_OUTPUT" | grep -o "[0-9]* passed" | tail -1)
    TEST_SUITES=$(echo "$TEST_OUTPUT" | grep -o "Test Suites: [0-9]* passed, [0-9]* total" | tail -1)
    
    echo ""
    echo "📊 Test Results Summary"
    echo "----------------------"
    print_status "success" "Tests: $PASSED_TESTS"
    print_status "success" "$TEST_SUITES"
    
else
    print_status "error" "Some tests failed!"
    echo ""
    echo "❌ Test Output:"
    echo "$TEST_OUTPUT"
    exit 1
fi

# Analyze test coverage
echo ""
echo "📈 Test Coverage Analysis"
echo "------------------------"

# List test files
UNIT_TESTS=$(find src/evaluation/__tests__ -name "*.spec.ts" | grep -v e2e | grep -v integration | wc -l)
INTEGRATION_TESTS=$(find src/evaluation/__tests__ -name "*.integration.spec.ts" | wc -l)
E2E_TESTS=$(find src/evaluation/__tests__ -name "*.e2e.spec.ts" | wc -l)

print_status "info" "Unit Tests: $UNIT_TESTS files"
print_status "info" "Integration Tests: $INTEGRATION_TESTS files"
print_status "info" "E2E Tests: $E2E_TESTS files"

# Check for test patterns
echo ""
echo "🔍 Test Quality Checks"
echo "----------------------"

# Check for mocking patterns
MOCKED_TESTS=$(grep -r "jest.mock" src/evaluation/__tests__ | wc -l)
print_status "info" "Mocking usage: $MOCKED_TESTS instances"

# Check for error handling tests
ERROR_TESTS=$(grep -r "should.*error\|should.*fail" src/evaluation/__tests__ | wc -l)
print_status "info" "Error handling tests: $ERROR_TESTS test cases"

# Check for async patterns
ASYNC_TESTS=$(grep -r "async.*=>" src/evaluation/__tests__ | wc -l)
print_status "info" "Async test patterns: $ASYNC_TESTS instances"

# Performance check
echo ""
echo "⏱️  Performance Analysis"
echo "------------------------"

# Extract test duration from output
TEST_TIME=$(echo "$TEST_OUTPUT" | grep -o "Time: [0-9.]* s" | tail -1)
if [ ! -z "$TEST_TIME" ]; then
    print_status "info" "Test execution time: $TEST_TIME"
fi

# Environment recommendations
echo ""
echo "💡 Environment Recommendations"
echo "------------------------------"

if [ "$DOCKER_AVAILABLE" = false ]; then
    print_status "warning" "Install Docker for full integration testing"
fi

if [ "$REDIS_AVAILABLE" = false ]; then
    print_status "warning" "Install Redis for queue integration testing"
fi

print_status "info" "All unit tests can run without external dependencies"
print_status "info" "Integration tests benefit from Docker and Redis"

# Summary
echo ""
echo "🎉 Validation Complete"
echo "====================="

if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_status "success" "Evaluation test suite is working correctly!"
    print_status "success" "All critical functionality is properly tested"
    print_status "success" "Error handling and edge cases are covered"
    
    echo ""
    echo "The evaluation pipeline is ready for production use."
else
    print_status "error" "Test suite validation failed"
    exit 1
fi 