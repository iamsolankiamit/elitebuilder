# EliteBuilders Evaluation System - Testing Guide

This guide covers comprehensive testing of the evaluation system, including unit tests, integration tests, and end-to-end testing.

## Overview

The evaluation system consists of several key components:

- **EvaluationService**: Manages submission evaluation queuing and results
- **DockerService**: Handles container building and execution
- **ScoringService**: Calculates submission scores based on various criteria
- **EvaluationProcessor**: Processes evaluation jobs through the queue
- **EvaluationController**: Provides API endpoints for evaluation management

## Test Structure

```
backend/src/evaluation/__tests__/
├── evaluation.service.spec.ts          # Unit tests for evaluation service
├── docker.service.spec.ts              # Unit tests for Docker service
├── scoring.service.spec.ts             # Unit tests for scoring service
├── evaluation.processor.integration.spec.ts  # Integration tests for processor
└── evaluation.e2e.spec.ts             # End-to-end API tests
```

## Running Tests

### Unit Tests Only

```bash
# Run all evaluation tests
npm run test:evaluation

# Run tests with watch mode
npm run test:evaluation:watch

# Run with coverage
npm run test:cov -- --testPathPattern=evaluation
```

### Comprehensive System Testing

```bash
# Run the comprehensive test suite (includes mock repos, Docker tests, etc.)
npm run test:evaluation:comprehensive

# Run quick evaluation tests
npm run test:evaluation:quick
```

### Individual Test Files

```bash
# Test specific components
npx jest evaluation.service.spec.ts
npx jest docker.service.spec.ts
npx jest scoring.service.spec.ts
npx jest evaluation.processor.integration.spec.ts
npx jest evaluation.e2e.spec.ts
```

## Test Coverage

The tests cover the following scenarios:

### EvaluationService Tests
- ✅ Queueing evaluations for valid submissions
- ✅ Handling missing submissions
- ✅ Updating evaluation results
- ✅ Queue status monitoring
- ✅ Queue statistics

### DockerService Tests
- ✅ Project type detection (Node.js, Python, unknown)
- ✅ Docker image building (with and without Dockerfile)
- ✅ Test execution in containers
- ✅ Security constraints (no network, resource limits)
- ✅ Result parsing and error handling

### ScoringService Tests
- ✅ Technical score calculation based on tests and code quality
- ✅ Presentation score based on pitch deck and demo video
- ✅ Innovation score calculation
- ✅ Usability score assessment
- ✅ Feedback generation
- ✅ Recommendation system

### EvaluationProcessor Integration Tests
- ✅ End-to-end evaluation workflow
- ✅ Build failure handling
- ✅ Git clone failures
- ✅ Missing submission handling
- ✅ Challenge pack processing
- ✅ Resource cleanup

### API Tests (E2E)
- ✅ Evaluation status endpoints
- ✅ Queue statistics endpoints
- ✅ Retry evaluation functionality
- ✅ Authentication requirements
- ✅ Error handling

## Mock Data

### Test Repositories

The comprehensive test suite creates mock repositories for testing:

1. **Node.js Chat App**: Complete Express.js application with tests
2. **Python AI Analyzer**: Flask app with ML components
3. **Dockerized ML API**: FastAPI with Docker configuration
4. **Broken Project**: Intentionally broken for error testing

### Mock Submissions

Test data includes various submission scenarios:
- Valid submissions with all required fields
- Submissions with missing presentation materials
- Submissions with invalid URLs
- Build failures and test failures

## Prerequisites

Before running comprehensive tests, ensure:

1. **Docker is installed and running**
   ```bash
   docker --version
   docker run hello-world
   ```

2. **Redis is available** (will be started automatically if Docker is available)
   ```bash
   # Check if Redis is running
   docker ps | grep redis
   ```

3. **EliteBuilders server is running**
   ```bash
   npm run start:dev
   ```

4. **Required tools are installed**
   ```bash
   # Check for required tools
   which git curl jq npm docker
   ```

## Environment Variables

```bash
# Configuration for testing
export BASE_URL="http://localhost:3001"
export REDIS_PORT="6380"
export NODE_ENV="test"
```

## Testing Scenarios

### Happy Path Testing
1. Create submission with valid repository
2. Queue evaluation
3. Process through Docker build
4. Run tests and analysis
5. Calculate scores
6. Update submission with results

### Error Handling Testing
1. Invalid repository URLs
2. Build failures (missing dependencies, syntax errors)
3. Test failures and timeouts
4. Missing presentation materials
5. Network issues and service unavailability

### Performance Testing
1. Queue processing under load
2. Docker container resource limits
3. Large repository handling
4. Concurrent evaluation processing

## Debugging Tests

### Enable Debug Logging
```bash
# Run tests with debug output
DEBUG=evaluation:* npm run test:evaluation

# Run specific test with verbose output
npx jest evaluation.service.spec.ts --verbose
```

### Docker Debugging
```bash
# Check Docker container logs
docker logs <container-name>

# Inspect Docker images created during tests
docker images | grep submission

# Clean up test containers
docker system prune -f
```

### Redis Debugging
```bash
# Connect to Redis container
docker exec -it redis-evaluation redis-cli

# Monitor Redis operations
docker exec redis-evaluation redis-cli monitor
```

## Continuous Integration

For CI environments, use:

```bash
# Run tests without interactive prompts
npm run test:evaluation:comprehensive -- --no-cleanup

# Run only unit tests (no Docker required)
npm run test:evaluation
```

## Troubleshooting

### Common Issues

**Docker not found**
- Install Docker Desktop or Docker Engine
- Ensure Docker daemon is running
- Check user permissions for Docker

**Redis connection failed**
- Verify Redis container is running
- Check port conflicts (default: 6380)
- Ensure Redis container has proper networking

**Test timeouts**
- Increase Jest timeout in test files
- Check Docker resource allocation
- Verify system performance

**Build failures in tests**
- Check Docker image availability
- Verify internet connection for package downloads
- Review mock repository configurations

### Getting Help

1. Check test logs in `/tmp/elitebuilders-test/`
2. Review Docker container logs
3. Enable debug logging for detailed output
4. Run individual test files to isolate issues

## Contributing

When adding new tests:

1. Follow existing test patterns and naming conventions
2. Include both positive and negative test cases
3. Mock external dependencies appropriately
4. Add integration tests for new workflows
5. Update this documentation

## Performance Benchmarks

Target performance metrics:
- Unit tests: < 10 seconds total
- Integration tests: < 30 seconds total
- End-to-end tests: < 60 seconds total
- Individual evaluation: < 5 minutes
- Queue processing: < 1 second per job

## Security Testing

The test suite includes security validations:
- Container isolation (no network access during evaluation)
- Resource limits (memory, CPU)
- File system isolation
- Input validation and sanitization
- Authentication requirements for API endpoints 