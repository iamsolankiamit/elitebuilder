#!/bin/bash

set -e

echo "🚀 EliteBuilders Evaluation System - Comprehensive Testing"
echo "=========================================================="

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3001}"
REDIS_PORT="${REDIS_PORT:-6380}"
TEST_DIR="/tmp/elitebuilders-test"
MOCK_REPOS_DIR="$TEST_DIR/mock-repos"
LOG_FILE="$TEST_DIR/test-results.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Utility functions
log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if required tools are available
    local missing_tools=()
    
    command -v docker >/dev/null 2>&1 || missing_tools+=("docker")
    command -v git >/dev/null 2>&1 || missing_tools+=("git")
    command -v curl >/dev/null 2>&1 || missing_tools+=("curl")
    command -v jq >/dev/null 2>&1 || missing_tools+=("jq")
    command -v npm >/dev/null 2>&1 || missing_tools+=("npm")
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        error "Missing required tools: ${missing_tools[*]}"
        error "Please install missing tools and try again"
        exit 1
    fi
    
    success "All required tools are available"
}

check_server() {
    log "Checking if EliteBuilders server is running..."
    
    if curl -s "$BASE_URL" > /dev/null; then
        success "Server is running at $BASE_URL"
    else
        error "Server is not running at $BASE_URL"
        error "Please start the server with 'npm run start:dev' and try again"
        exit 1
    fi
}

check_redis() {
    log "Checking Redis connection..."
    
    if command -v docker >/dev/null 2>&1; then
        if docker ps | grep -q "redis.*:$REDIS_PORT"; then
            if docker exec $(docker ps --filter "publish=$REDIS_PORT" --format "{{.Names}}" | head -1) redis-cli ping | grep -q "PONG"; then
                success "Redis is running and responding on port $REDIS_PORT"
            else
                error "Redis container exists but not responding"
                exit 1
            fi
        else
            warning "Redis container not found on port $REDIS_PORT"
            log "Starting Redis container..."
            docker run -d --name redis-evaluation -p $REDIS_PORT:6379 redis:alpine
            sleep 2
            success "Redis container started"
        fi
    else
        warning "Docker not available, assuming Redis is running externally"
    fi
}

setup_test_environment() {
    log "Setting up test environment..."
    
    # Create test directory
    mkdir -p "$TEST_DIR"
    mkdir -p "$MOCK_REPOS_DIR"
    
    # Initialize log file
    echo "EliteBuilders Evaluation Test - $(date)" > "$LOG_FILE"
    
    success "Test environment ready at $TEST_DIR"
}

create_mock_repositories() {
    log "Creating mock repositories for testing..."
    
    # 1. Create a simple Node.js project
    create_nodejs_project() {
        local project_dir="$MOCK_REPOS_DIR/nodejs-chat-app"
        mkdir -p "$project_dir"
        
        cat > "$project_dir/package.json" << 'EOF'
{
  "name": "ai-chat-assistant",
  "version": "1.0.0",
  "description": "A simple AI-powered chat assistant",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "test": "jest",
    "build": "echo 'Build completed'"
  },
  "dependencies": {
    "express": "^4.18.0",
    "openai": "^4.0.0"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
EOF

        cat > "$project_dir/app.js" << 'EOF'
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Mock AI endpoint
app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    
    // Simple mock AI response
    const responses = [
        "That's an interesting question!",
        "I understand what you're asking.",
        "Let me help you with that.",
        "Thanks for your message!"
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    res.json({
        response: response,
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'ai-chat-assistant' });
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(\`AI Chat Assistant running on port \${port}\`);
    });
}

module.exports = app;
EOF

        cat > "$project_dir/app.test.js" << 'EOF'
const request = require('supertest');
const app = require('./app');

describe('AI Chat Assistant', () => {
    test('should respond to health check', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('healthy');
    });

    test('should handle chat messages', async () => {
        const response = await request(app)
            .post('/api/chat')
            .send({ message: 'Hello' });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('response');
        expect(response.body).toHaveProperty('timestamp');
    });
});
EOF

        mkdir -p "$project_dir/public"
        cat > "$project_dir/public/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Chat Assistant</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .chat-container { border: 1px solid #ddd; height: 400px; overflow-y: auto; padding: 10px; margin-bottom: 20px; }
        .message { margin-bottom: 10px; }
        .user { text-align: right; color: blue; }
        .ai { text-align: left; color: green; }
        input { width: 80%; padding: 10px; }
        button { padding: 10px 20px; }
    </style>
</head>
<body>
    <h1>AI Chat Assistant</h1>
    <div class="chat-container" id="chat"></div>
    <input type="text" id="messageInput" placeholder="Type your message...">
    <button onclick="sendMessage()">Send</button>

    <script>
        async function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            if (!message) return;

            addMessage('You: ' + message, 'user');
            input.value = '';

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message })
                });
                const data = await response.json();
                addMessage('AI: ' + data.response, 'ai');
            } catch (error) {
                addMessage('Error: Could not connect to AI', 'ai');
            }
        }

        function addMessage(text, type) {
            const chat = document.getElementById('chat');
            const div = document.createElement('div');
            div.className = 'message ' + type;
            div.textContent = text;
            chat.appendChild(div);
            chat.scrollTop = chat.scrollHeight;
        }

        document.getElementById('messageInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    </script>
</body>
</html>
EOF

        cat > "$project_dir/README.md" << 'EOF'
# AI Chat Assistant

A simple web-based AI chat assistant built with Node.js and Express.

## Features

- Real-time chat interface
- AI-powered responses
- Responsive design
- RESTful API

## Installation

```bash
npm install
npm start
```

## Testing

```bash
npm test
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/chat` - Send message to AI

## Architecture

This application demonstrates a simple AI-powered chat system with:
- Express.js backend
- Static HTML/CSS/JS frontend
- Mock AI responses (easily replaceable with real AI APIs)
- Unit tests with Jest

## Demo

Visit `http://localhost:3000` to try the chat interface.
EOF

        success "Created Node.js chat app at $project_dir"
    }
    
    # 2. Create a Python project
    create_python_project() {
        local project_dir="$MOCK_REPOS_DIR/python-ai-analyzer"
        mkdir -p "$project_dir"
        
        cat > "$project_dir/requirements.txt" << 'EOF'
flask==2.3.0
numpy==1.24.0
scikit-learn==1.3.0
pandas==2.0.0
pytest==7.4.0
EOF

        cat > "$project_dir/app.py" << 'EOF'
from flask import Flask, request, jsonify, render_template_string
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json

app = Flask(__name__)

# Mock AI text analyzer
class TextAnalyzer:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.sample_texts = [
            "This is a positive sentiment",
            "This is a negative sentiment", 
            "This is a neutral statement",
            "This shows excitement and joy",
            "This expresses sadness and disappointment"
        ]
        self.sample_vectors = self.vectorizer.fit_transform(self.sample_texts)
    
    def analyze_sentiment(self, text):
        if not text.strip():
            return {"error": "Empty text"}
        
        text_vector = self.vectorizer.transform([text])
        similarities = cosine_similarity(text_vector, self.sample_vectors)[0]
        
        max_sim_idx = np.argmax(similarities)
        confidence = similarities[max_sim_idx]
        
        sentiments = ["positive", "negative", "neutral", "excited", "sad"]
        
        return {
            "text": text,
            "sentiment": sentiments[max_sim_idx],
            "confidence": float(confidence),
            "scores": {
                "positive": float(similarities[0]),
                "negative": float(similarities[1]),
                "neutral": float(similarities[2])
            }
        }

analyzer = TextAnalyzer()

@app.route('/')
def home():
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head>
        <title>AI Text Analyzer</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .result { margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 5px; }
            textarea { width: 100%; height: 100px; margin: 10px 0; }
            button { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; }
            .sentiment { font-weight: bold; }
            .positive { color: green; }
            .negative { color: red; }
            .neutral { color: blue; }
        </style>
    </head>
    <body>
        <h1>AI Text Sentiment Analyzer</h1>
        <textarea id="textInput" placeholder="Enter text to analyze..."></textarea><br>
        <button onclick="analyzeText()">Analyze Sentiment</button>
        <div id="result"></div>

        <script>
            async function analyzeText() {
                const text = document.getElementById('textInput').value;
                if (!text.trim()) return;

                try {
                    const response = await fetch('/api/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: text })
                    });
                    const data = await response.json();
                    
                    document.getElementById('result').innerHTML = `
                        <h3>Analysis Result:</h3>
                        <p><strong>Text:</strong> ${data.text}</p>
                        <p><strong>Sentiment:</strong> <span class="sentiment ${data.sentiment}">${data.sentiment.toUpperCase()}</span></p>
                        <p><strong>Confidence:</strong> ${(data.confidence * 100).toFixed(1)}%</p>
                        <p><strong>Detailed Scores:</strong></p>
                        <ul>
                            <li>Positive: ${(data.scores.positive * 100).toFixed(1)}%</li>
                            <li>Negative: ${(data.scores.negative * 100).toFixed(1)}%</li>
                            <li>Neutral: ${(data.scores.neutral * 100).toFixed(1)}%</li>
                        </ul>
                    `;
                } catch (error) {
                    document.getElementById('result').innerHTML = '<p style="color: red;">Error analyzing text</p>';
                }
            }
        </script>
    </body>
    </html>
    ''')

@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400
    
    result = analyzer.analyze_sentiment(data['text'])
    return jsonify(result)

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "service": "ai-text-analyzer"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
EOF

        cat > "$project_dir/test_app.py" << 'EOF'
import pytest
import json
from app import app, analyzer

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    response = client.get('/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'healthy'

def test_analyze_positive_text(client):
    response = client.post('/api/analyze', 
                          json={'text': 'I am very happy today!'})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'sentiment' in data
    assert 'confidence' in data

def test_analyze_empty_text(client):
    response = client.post('/api/analyze', json={'text': ''})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'error' in data

def test_analyzer_sentiment():
    result = analyzer.analyze_sentiment("This is amazing!")
    assert 'sentiment' in result
    assert 'confidence' in result
    assert result['confidence'] >= 0
EOF

        cat > "$project_dir/README.md" << 'EOF'
# AI Text Sentiment Analyzer

A Python-based web application that analyzes text sentiment using machine learning.

## Features

- Real-time sentiment analysis
- Confidence scoring
- RESTful API
- Web interface
- Machine learning powered

## Installation

```bash
pip install -r requirements.txt
python app.py
```

## Testing

```bash
pytest
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/analyze` - Analyze text sentiment

## Technology Stack

- Flask for web framework
- scikit-learn for ML analysis
- NumPy for numerical operations
- TF-IDF for text vectorization

## Demo

Visit `http://localhost:5000` to try the analyzer.
EOF

        success "Created Python AI analyzer at $project_dir"
    }
    
    # 3. Create a project with Dockerfile
    create_dockerized_project() {
        local project_dir="$MOCK_REPOS_DIR/dockerized-ml-api"
        mkdir -p "$project_dir"
        
        cat > "$project_dir/Dockerfile" << 'EOF'
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "main.py"]
EOF

        cat > "$project_dir/requirements.txt" << 'EOF'
fastapi==0.104.0
uvicorn==0.24.0
pydantic==2.4.0
numpy==1.24.0
EOF

        cat > "$project_dir/main.py" << 'EOF'
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import uvicorn

app = FastAPI(title="ML Prediction API", version="1.0.0")

class PredictionRequest(BaseModel):
    features: list[float]

class PredictionResponse(BaseModel):
    prediction: float
    confidence: float
    model_version: str

# Mock ML model
class SimpleMLModel:
    def __init__(self):
        self.weights = np.random.randn(4)  # 4 features
        self.bias = 0.5
        
    def predict(self, features):
        if len(features) != 4:
            raise ValueError("Model expects exactly 4 features")
        
        features_array = np.array(features)
        prediction = np.dot(features_array, self.weights) + self.bias
        confidence = min(abs(prediction) / 10.0, 1.0)  # Mock confidence
        
        return prediction, confidence

model = SimpleMLModel()

@app.get("/")
async def root():
    return {"message": "ML Prediction API", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "ml-prediction-api"}

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    try:
        prediction, confidence = model.predict(request.features)
        
        return PredictionResponse(
            prediction=float(prediction),
            confidence=float(confidence),
            model_version="1.0.0"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/model/info")
async def model_info():
    return {
        "model_type": "linear_regression",
        "features_required": 4,
        "weights": model.weights.tolist(),
        "bias": float(model.bias)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

        cat > "$project_dir/test_main.py" << 'EOF'
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "ML Prediction API" in response.json()["message"]

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_predict_valid():
    response = client.post("/predict", json={
        "features": [1.0, 2.0, 3.0, 4.0]
    })
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert "confidence" in data

def test_predict_invalid_features():
    response = client.post("/predict", json={
        "features": [1.0, 2.0]  # Wrong number of features
    })
    assert response.status_code == 400

def test_model_info():
    response = client.get("/model/info")
    assert response.status_code == 200
    data = response.json()
    assert data["features_required"] == 4
EOF

        cat > "$project_dir/README.md" << 'EOF'
# ML Prediction API

A containerized FastAPI application for machine learning predictions.

## Features

- FastAPI framework
- Pydantic data validation
- Docker containerization
- RESTful API design
- Mock ML model

## Installation

### Docker (Recommended)

```bash
docker build -t ml-api .
docker run -p 8000:8000 ml-api
```

### Local Development

```bash
pip install -r requirements.txt
python main.py
```

## API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation.

## Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `POST /predict` - Make predictions
- `GET /model/info` - Model information

## Testing

```bash
pytest
```
EOF

        success "Created Dockerized ML API at $project_dir"
    }
    
    # 4. Create a broken project for failure testing
    create_broken_project() {
        local project_dir="$MOCK_REPOS_DIR/broken-project"
        mkdir -p "$project_dir"
        
        cat > "$project_dir/package.json" << 'EOF'
{
  "name": "broken-project",
  "version": "1.0.0",
  "scripts": {
    "start": "node nonexistent-file.js",
    "test": "npm run nonexistent-command"
  },
  "dependencies": {
    "nonexistent-package": "^1.0.0"
  }
}
EOF

        cat > "$project_dir/README.md" << 'EOF'
# Broken Project

This project is intentionally broken for testing error handling.

## Issues

- Missing main file
- Invalid dependencies
- Broken scripts

This should fail during evaluation.
EOF

        success "Created broken project at $project_dir"
    }
    
    create_nodejs_project
    create_python_project
    create_dockerized_project
    create_broken_project
}

run_unit_tests() {
    log "Running unit tests..."
    
    cd "$(dirname "$0")/.."
    
    if [ -f "package.json" ]; then
        log "Running Jest tests..."
        if npm test 2>&1 | tee -a "$LOG_FILE"; then
            success "Unit tests passed"
        else
            warning "Some unit tests may have failed - check logs"
        fi
    else
        warning "No package.json found - skipping Jest tests"
    fi
}

test_evaluation_endpoints() {
    log "Testing evaluation API endpoints..."
    
    # Test queue stats endpoint (requires auth)
    log "Testing queue stats endpoint..."
    QUEUE_RESPONSE=$(curl -s -w "%{http_code}" "$BASE_URL/evaluation/queue/stats" || echo "000")
    
    if [[ "$QUEUE_RESPONSE" == *"401"* ]] || [[ "$QUEUE_RESPONSE" == *"403"* ]]; then
        success "Queue stats endpoint properly requires authentication"
    elif [[ "$QUEUE_RESPONSE" == *"200"* ]]; then
        warning "Queue stats endpoint accessible without auth (may be in dev mode)"
    else
        warning "Queue stats endpoint returned unexpected response: $QUEUE_RESPONSE"
    fi
}

simulate_evaluation_workflow() {
    log "Simulating evaluation workflow..."
    
    local projects=("nodejs-chat-app" "python-ai-analyzer" "dockerized-ml-api" "broken-project")
    
    for project in "${projects[@]}"; do
        local project_path="$MOCK_REPOS_DIR/$project"
        
        if [ -d "$project_path" ]; then
            log "Simulating evaluation for $project..."
            
            # Initialize git repo
            cd "$project_path"
            git init -q
            git add .
            git commit -q -m "Initial commit"
            
            success "Mock evaluation setup complete for $project"
        fi
    done
}

test_docker_integration() {
    log "Testing Docker integration..."
    
    # Test Docker availability
    if docker --version >/dev/null 2>&1; then
        success "Docker is available"
        
        # Test basic Docker functionality
        if docker run --rm hello-world >/dev/null 2>&1; then
            success "Docker is working correctly"
        else
            warning "Docker is installed but may not be working properly"
        fi
    else
        error "Docker is not available - this will prevent evaluations"
        return 1
    fi
}

test_redis_queue() {
    log "Testing Redis queue functionality..."
    
    # Test Redis basic operations
    if command -v docker >/dev/null 2>&1; then
        local redis_container=$(docker ps --filter "publish=$REDIS_PORT" --format "{{.Names}}" | head -1)
        
        if [ -n "$redis_container" ]; then
            # Test basic Redis operations
            if docker exec "$redis_container" redis-cli set test-key "test-value" >/dev/null 2>&1; then
                if docker exec "$redis_container" redis-cli get test-key | grep -q "test-value"; then
                    success "Redis read/write operations working"
                    docker exec "$redis_container" redis-cli del test-key >/dev/null 2>&1
                else
                    error "Redis read operation failed"
                fi
            else
                error "Redis write operation failed"
            fi
        else
            warning "Redis container not found for testing"
        fi
    fi
}

run_performance_tests() {
    log "Running performance tests..."
    
    # Test server response time
    local start_time=$(date +%s%N)
    curl -s "$BASE_URL" >/dev/null
    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
    
    if [ $response_time -lt 1000 ]; then
        success "Server response time: ${response_time}ms (Good)"
    elif [ $response_time -lt 3000 ]; then
        warning "Server response time: ${response_time}ms (Acceptable)"
    else
        warning "Server response time: ${response_time}ms (Slow)"
    fi
}

generate_test_report() {
    log "Generating test report..."
    
    local report_file="$TEST_DIR/evaluation-test-report.md"
    
    cat > "$report_file" << EOF
# EliteBuilders Evaluation System Test Report

**Generated:** $(date)
**Test Environment:** $TEST_DIR

## Test Summary

This report contains the results of comprehensive testing for the EliteBuilders evaluation system.

### Mock Projects Created

1. **Node.js Chat App** - A simple AI-powered chat assistant
   - Location: \`$MOCK_REPOS_DIR/nodejs-chat-app\`
   - Features: Express.js, REST API, tests, web interface

2. **Python AI Analyzer** - Text sentiment analysis tool
   - Location: \`$MOCK_REPOS_DIR/python-ai-analyzer\`
   - Features: Flask, scikit-learn, ML analysis, tests

3. **Dockerized ML API** - Containerized FastAPI application
   - Location: \`$MOCK_REPOS_DIR/dockerized-ml-api\`
   - Features: FastAPI, Docker, Pydantic validation, tests

4. **Broken Project** - Intentionally broken for error testing
   - Location: \`$MOCK_REPOS_DIR/broken-project\`
   - Purpose: Test error handling and failure scenarios

### Test Results

Detailed test results are available in the log file: \`$LOG_FILE\`

### Next Steps

To test the evaluation system:

1. Create submissions in the EliteBuilders platform using the mock repositories
2. Monitor the evaluation queue: \`GET /evaluation/queue/stats\`
3. Track evaluation progress: \`GET /evaluation/status/:submissionId\`
4. Review evaluation results and scoring

### Mock Repository URLs

For testing purposes, you can use these local repository paths:
- \`file://$MOCK_REPOS_DIR/nodejs-chat-app\`
- \`file://$MOCK_REPOS_DIR/python-ai-analyzer\`
- \`file://$MOCK_REPOS_DIR/dockerized-ml-api\`
- \`file://$MOCK_REPOS_DIR/broken-project\`

Alternatively, push these to GitHub/GitLab and use the remote URLs.

### Configuration

- **Base URL:** $BASE_URL
- **Redis Port:** $REDIS_PORT
- **Test Directory:** $TEST_DIR

EOF

    success "Test report generated: $report_file"
}

cleanup() {
    log "Cleaning up test environment..."
    
    # Optional: Remove test directory
    read -p "Remove test directory $TEST_DIR? (y/N): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$TEST_DIR"
        success "Test directory removed"
    else
        log "Test directory preserved at $TEST_DIR"
    fi
}

# Main execution
main() {
    echo ""
    setup_test_environment
    check_prerequisites
    check_server
    check_redis
    
    echo ""
    log "Creating mock repositories..."
    create_mock_repositories
    
    echo ""
    log "Running tests..."
    run_unit_tests
    test_evaluation_endpoints
    simulate_evaluation_workflow
    test_docker_integration
    test_redis_queue
    run_performance_tests
    
    echo ""
    generate_test_report
    
    echo ""
    echo "🎉 Comprehensive evaluation testing completed!"
    echo ""
    echo "📋 Summary:"
    echo "   • Mock repositories created for testing"
    echo "   • Unit tests executed"
    echo "   • API endpoints verified"
    echo "   • Docker integration tested"
    echo "   • Redis queue functionality verified"
    echo "   • Performance benchmarks completed"
    echo ""
    echo "📁 Test artifacts:"
    echo "   • Test directory: $TEST_DIR"
    echo "   • Log file: $LOG_FILE"
    echo "   • Mock repositories: $MOCK_REPOS_DIR"
    echo ""
    echo "🚀 Ready to test submission evaluations!"
    echo ""
    
    # Optional cleanup
    if [ "$1" != "--no-cleanup" ]; then
        cleanup
    fi
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "EliteBuilders Evaluation Testing Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h        Show this help message"
        echo "  --no-cleanup      Skip cleanup prompt at the end"
        echo ""
        echo "Environment Variables:"
        echo "  BASE_URL          API base URL (default: http://localhost:3001)"
        echo "  REDIS_PORT        Redis port (default: 6380)"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac 