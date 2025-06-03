# Evaluation Pipeline

The evaluation pipeline automatically scores submissions based on technical implementation, presentation quality, innovation, and usability.

## Architecture

```
Submission Created → Queue Job → Clone Repo → Build Container → Run Tests → Score → Update DB
```

### Components

1. **EvaluationService** - Manages evaluation queue and results
2. **DockerService** - Handles containerized evaluation environment
3. **ScoringService** - Calculates scores using automated tests + LLM analysis
4. **EvaluationProcessor** - Orchestrates the evaluation pipeline
5. **Bull Queue** - Async job processing with Redis

## Features

- ✅ **Secure Evaluation** - Runs user code in isolated Docker containers
- ✅ **Language Detection** - Supports Node.js, Python, and custom Dockerfiles
- ✅ **Cheat-Proof Testing** - Sponsor-controlled test harnesses
- ✅ **Hybrid Scoring** - Automated tests + LLM-based presentation analysis
- ✅ **Queue System** - Priority-based async processing
- ✅ **Real-time Progress** - Job progress tracking
- ✅ **Automatic Cleanup** - Cleans up containers and temporary files

## Scoring Breakdown

- **Technical (40 points)** - Build success, test coverage, code quality
- **Presentation (25 points)** - Pitch deck quality, demo video effectiveness
- **Innovation (20 points)** - Creative approaches, unique features
- **Usability (15 points)** - User experience, interface design

## Setup

### Prerequisites

1. **Docker** - Required for containerized evaluation
2. **Redis** - Required for Bull queue system
3. **Git** - Required for cloning repositories

### Installation

```bash
# Install dependencies
npm install @nestjs/bull bull redis uuid

# Start Redis (using Docker)
docker run -d --name redis -p 6379:6379 redis:alpine

# Set environment variables
REDIS_HOST=localhost
REDIS_PORT=6379
EVALUATION_TIMEOUT=1800
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_HOST` | Redis host for queue | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `EVALUATION_TIMEOUT` | Max evaluation time (seconds) | `1800` |
| `MAX_CONCURRENT_EVALUATIONS` | Max parallel evaluations | `3` |
| `DOCKER_WORKSPACE_DIR` | Docker workspace directory | `/tmp/evaluations` |

## Usage

### Automatic Evaluation

Evaluations are automatically queued when submissions are created:

```typescript
// Submissions are automatically evaluated
const submission = await submissionsService.create(dto, userId);
// → Evaluation is queued immediately
```

### Manual Evaluation

```typescript
// Queue evaluation manually
await evaluationService.queueEvaluation(submissionId);

// Check evaluation status
const status = await evaluationService.getEvaluationStatus(submissionId);

// Get queue statistics
const stats = await evaluationService.getQueueStats();
```

### API Endpoints

- `GET /evaluation/status/:submissionId` - Get evaluation status
- `GET /evaluation/queue/stats` - Get queue statistics
- `POST /evaluation/retry/:submissionId` - Retry failed evaluation

## Challenge Packs

Challenge packs contain sponsor-controlled tests and evaluation criteria:

```
challenge-pack/
├── tests/              # Test files (pytest, jest, etc.)
├── eval_config.yaml    # Evaluation configuration
└── entrypoint.sh       # Test execution script
```

### Example Challenge Pack

```yaml
# eval_config.yaml
timeout: 1800
healthcheck:
  enabled: false
environment:
  NODE_ENV: test
  PYTHONPATH: /app
```

```bash
#!/bin/bash
# entrypoint.sh
set -e

echo "Starting evaluation..."

# Run tests based on project type
if [[ -f package.json ]]; then
  npm test
elif [[ -f requirements.txt ]]; then
  pytest tests/
fi

# Generate score results
python /opt/score.py > /results/score.json

echo "Evaluation completed"
```

## Security

- **Isolated Execution** - Code runs in containers with no network access
- **Resource Limits** - Memory and CPU limits prevent resource abuse
- **Controlled Environment** - Sponsor controls test environment and criteria
- **Sandboxed Testing** - User tests are ignored; only sponsor tests run

## Monitoring

### Queue Status

```typescript
const stats = await evaluationService.getQueueStats();
// {
//   waiting: 5,
//   active: 2,
//   completed: 150,
//   failed: 3
// }
```

### Evaluation Progress

```typescript
const status = await evaluationService.getEvaluationStatus(submissionId);
// {
//   submissionId: 123,
//   status: 'processing',
//   progress: 75,
//   logs: '...'
// }
```

## Error Handling

- **Build Failures** - Partial credit for attempt, detailed error logs
- **Test Failures** - Reduced technical score, feedback provided
- **Timeout Errors** - Graceful handling with cleanup
- **System Errors** - Automatic retry with exponential backoff

## Performance

- **Parallel Processing** - Multiple evaluations run simultaneously
- **Priority Queue** - Urgent deadlines get higher priority
- **Resource Management** - Automatic cleanup of Docker images
- **Caching** - Build layer caching for faster subsequent builds

## Troubleshooting

### Common Issues

1. **Docker not running**
   ```bash
   # Check Docker status
   docker info
   ```

2. **Redis connection failed**
   ```bash
   # Check Redis status
   redis-cli ping
   ```

3. **Evaluation stuck**
   ```bash
   # Check queue status
   curl http://localhost:3001/evaluation/queue/stats
   ```

### Debug Mode

Set `NODE_ENV=development` for detailed logging:

```bash
export NODE_ENV=development
npm run start:dev
```

## Future Enhancements

- [ ] LLM integration for presentation scoring
- [ ] Video analysis for UX evaluation
- [ ] Advanced code quality metrics
- [ ] Multi-language support (Go, Rust, Java)
- [ ] GPU support for ML evaluations
- [ ] Distributed evaluation across multiple machines 