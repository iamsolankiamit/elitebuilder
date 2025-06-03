import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface ProjectInfo {
  type: 'node' | 'python' | 'unknown';
  hasDockerfile: boolean;
  packageFiles: string[];
}

export interface BuildResult {
  success: boolean;
  logs: string;
  imageId?: string;
  error?: string;
}

export interface TestResult {
  success: boolean;
  score: number;
  logs: string;
  results: any;
  error?: string;
}

@Injectable()
export class DockerService {
  private readonly logger = new Logger(DockerService.name);
  private readonly workspaceDir = '/tmp/evaluations';

  async detectProjectType(repoPath: string): Promise<ProjectInfo> {
    const packageFiles: string[] = [];
    let projectType: 'node' | 'python' | 'unknown' = 'unknown';

    try {
      const files = await fs.readdir(repoPath);
      
      // Check for package files
      if (files.includes('package.json')) {
        packageFiles.push('package.json');
        projectType = 'node';
      }
      
      if (files.includes('requirements.txt')) {
        packageFiles.push('requirements.txt');
        projectType = 'python';
      }
      
      if (files.includes('pyproject.toml')) {
        packageFiles.push('pyproject.toml');
        projectType = 'python';
      }

      const hasDockerfile = files.includes('Dockerfile');

      return {
        type: projectType,
        hasDockerfile,
        packageFiles,
      };
    } catch (error) {
      this.logger.error(`Failed to detect project type: ${error.message}`);
      return {
        type: 'unknown',
        hasDockerfile: false,
        packageFiles: [],
      };
    }
  }

  async buildImage(repoPath: string, challengePackPath: string, projectInfo: ProjectInfo): Promise<BuildResult> {
    const sessionId = uuidv4();
    const buildContext = path.join(this.workspaceDir, sessionId);
    
    try {
      // Create build context
      await fs.mkdir(buildContext, { recursive: true });
      
      // Copy repo to build context
      await this.copyDirectory(repoPath, path.join(buildContext, 'code'));
      
      // Copy challenge pack
      if (challengePackPath) {
        await this.copyDirectory(challengePackPath, path.join(buildContext, 'pack'));
      } else {
        // Create default challenge pack
        await this.createDefaultChallengePack(path.join(buildContext, 'pack'));
      }
      
      // Generate Dockerfile based on project type
      const dockerfile = await this.generateDockerfile(projectInfo);
      await fs.writeFile(path.join(buildContext, 'Dockerfile'), dockerfile);
      
      // Build the image
      const imageTag = `submission-${sessionId}:latest`;
      const buildResult = await this.runCommand('docker', [
        'build',
        '-t', imageTag,
        buildContext
      ]);

      return {
        success: buildResult.success,
        logs: buildResult.output,
        imageId: buildResult.success ? imageTag : undefined,
        error: buildResult.success ? undefined : buildResult.output,
      };
    } catch (error) {
      this.logger.error(`Build failed: ${error.message}`);
      return {
        success: false,
        logs: '',
        error: error.message,
      };
    } finally {
      // Cleanup build context
      await fs.rm(buildContext, { recursive: true, force: true }).catch(() => {});
    }
  }

  async runTests(imageId: string, timeoutMinutes: number = 30): Promise<TestResult> {
    const resultsDir = `/tmp/results-${uuidv4()}`;
    
    try {
      await fs.mkdir(resultsDir, { recursive: true });
      
      const runResult = await this.runCommand('docker', [
        'run',
        '--rm',
        '-v', `${resultsDir}:/results`,
        '--network', 'none', // No network access during evaluation
        '--memory', '2g',
        '--cpus', '2',
        imageId
      ], timeoutMinutes * 60 * 1000); // Convert to milliseconds

      // If docker run failed, return immediately with score 0
      if (!runResult.success) {
        return {
          success: false,
          score: 0,
          logs: runResult.output,
          results: {},
          error: runResult.output,
        };
      }

      // Read results only if docker run was successful
      let results = {};
      let score = 0;
      
      try {
        const scoreFile = path.join(resultsDir, 'score.json');
        const scoreContent = await fs.readFile(scoreFile, 'utf-8');
        results = JSON.parse(scoreContent);
        score = (results as any).totalScore || 0;
      } catch (error) {
        this.logger.warn(`Failed to read score results: ${error.message}`);
        // If we can't read results but docker run succeeded, still consider it a failure
        return {
          success: false,
          score: 0,
          logs: runResult.output,
          results: {},
          error: `Failed to read evaluation results: ${error.message}`,
        };
      }

      return {
        success: true,
        score,
        logs: runResult.output,
        results,
      };
    } catch (error) {
      this.logger.error(`Test execution failed: ${error.message}`);
      return {
        success: false,
        score: 0,
        logs: '',
        results: {},
        error: error.message,
      };
    } finally {
      // Cleanup results directory
      await fs.rm(resultsDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  private async createDefaultChallengePack(packPath: string): Promise<void> {
    await fs.mkdir(packPath, { recursive: true });
    await fs.mkdir(path.join(packPath, 'tests'), { recursive: true });

    // Create enhanced entrypoint script that performs real analysis
    const entrypoint = `#!/bin/bash
set -e

echo "🔄 Starting comprehensive evaluation..."
echo "📁 Working directory: $(pwd)"

# Create results directory
mkdir -p /results

# Initialize results
echo '{}' > /results/score.json

# Function to update JSON results
update_result() {
    local key="$1"
    local value="$2"
    echo "Setting $key = $value"
    echo $(cat /results/score.json | jq ".$key = $value") > /results/score.json
}

# 1. Analyze project structure
echo "🔍 Analyzing project structure..."
HAS_README=false
HAS_TESTS=false
HAS_DEPENDENCIES=false
HAS_DOCKERFILE=false
HAS_UI=false

if [ -f "/app/README.md" ] || [ -f "/app/readme.md" ] || [ -f "/app/README.txt" ]; then
    HAS_README=true
    echo "✅ Found README file"
fi

if [ -d "/app/test" ] || [ -d "/app/tests" ] || [ -d "/app/__tests__" ] || [ -f "/app/test.js" ] || [ -f "/app/test.py" ]; then
    HAS_TESTS=true
    echo "✅ Found test files/directory"
fi

if [ -f "/app/package.json" ] || [ -f "/app/requirements.txt" ] || [ -f "/app/pyproject.toml" ]; then
    HAS_DEPENDENCIES=true
    echo "✅ Found dependency management files"
fi

if [ -f "/app/Dockerfile" ]; then
    HAS_DOCKERFILE=true
    echo "✅ Found Dockerfile"
fi

# Check for UI-related files
if find /app -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.vue" | head -1 | grep -q .; then
    HAS_UI=true
    echo "✅ Found UI-related files"
fi

# 2. Try to run project-specific tests
echo "🧪 Running project tests..."
TESTS_PASS=false
TESTS_COVERED=0
TEST_OUTPUT=""

if [ -f "/app/package.json" ]; then
    echo "📦 Node.js project detected"
    cd /app
    
    # Check if npm test script exists
    if npm run 2>&1 | grep -q "test"; then
        echo "Running npm test..."
        if timeout 300 npm test > /tmp/test_output.txt 2>&1; then
            TESTS_PASS=true
            TESTS_COVERED=\$(grep -o "passing" /tmp/test_output.txt | wc -l)
            echo "✅ Tests passed (estimated coverage: \$TESTS_COVERED)"
        else
            echo "❌ Tests failed or timed out"
            TESTS_COVERED=\$(grep -o "failing" /tmp/test_output.txt | wc -l)
        fi
        TEST_OUTPUT=\$(cat /tmp/test_output.txt)
    else
        echo "⚠️  No test script found in package.json"
    fi
    
elif [ -f "/app/requirements.txt" ] || [ -f "/app/pyproject.toml" ]; then
    echo "🐍 Python project detected"
    cd /app
    
    # Try to run pytest if tests exist
    if [ -d "tests" ] || [ -d "test" ]; then
        echo "Running pytest..."
        if timeout 300 python -m pytest --tb=short > /tmp/test_output.txt 2>&1; then
            TESTS_PASS=true
            TESTS_COVERED=\$(grep -o "passed" /tmp/test_output.txt | wc -l)
            echo "✅ Tests passed (coverage: \$TESTS_COVERED)"
        else
            echo "❌ Tests failed or timed out"
            TESTS_COVERED=\$(grep -o "failed" /tmp/test_output.txt | wc -l)
        fi
        TEST_OUTPUT=\$(cat /tmp/test_output.txt)
    else
        echo "⚠️  No test directory found"
    fi
fi

# 3. Basic code quality checks
echo "📊 Analyzing code quality..."
CODE_QUALITY_SCORE=5
FILE_COUNT=\$(find /app -name "*.js" -o -name "*.py" -o -name "*.tsx" -o -name "*.ts" | wc -l)

if [ \$FILE_COUNT -gt 0 ]; then
    echo "📄 Found \$FILE_COUNT source files"
    CODE_QUALITY_SCORE=\$((CODE_QUALITY_SCORE + 2))
    
    # Check for reasonable file sizes (not too large)
    LARGE_FILES=\$(find /app -name "*.js" -o -name "*.py" -o -name "*.tsx" -o -name "*.ts" -size +100k | wc -l)
    if [ \$LARGE_FILES -eq 0 ]; then
        CODE_QUALITY_SCORE=\$((CODE_QUALITY_SCORE + 1))
        echo "✅ No excessively large files"
    fi
    
    # Check for documentation in code
    COMMENT_FILES=\$(find /app -name "*.js" -o -name "*.py" -o -name "*.tsx" -o -name "*.ts" -exec grep -l "\/\*\|\/\/\|#" {} \; | wc -l)
    if [ \$COMMENT_FILES -gt 0 ]; then
        CODE_QUALITY_SCORE=\$((CODE_QUALITY_SCORE + 2))
        echo "✅ Found comments/documentation in code"
    fi
fi

# 4. Generate comprehensive results
echo "📋 Generating evaluation results..."

# Calculate technical score components
TECHNICAL_BASE=15
if [ "\$TESTS_PASS" = "true" ]; then
    TECHNICAL_BASE=\$((TECHNICAL_BASE + TESTS_COVERED * 2))
fi

# Update JSON with all results
cat > /results/score.json << EOF
{
  "totalScore": \$(( (TECHNICAL_BASE > 40 ? 40 : TECHNICAL_BASE) + 20 )),
  "testsCovered": \$TESTS_COVERED,
  "testsPass": \$TESTS_PASS,
  "hasReadme": \$HAS_README,
  "hasTests": \$HAS_TESTS,
  "hasDependencies": \$HAS_DEPENDENCIES,
  "hasDockerfile": \$HAS_DOCKERFILE,
  "hasUserInterface": \$HAS_UI,
  "followsProjectStructure": true,
  "codeQuality": {
    "score": \$CODE_QUALITY_SCORE,
    "fileCount": \$FILE_COUNT
  },
  "userExperience": {
    "score": \$([ "\$HAS_UI" = "true" ] && echo 4 || echo 2)
  },
  "testOutput": "\$TEST_OUTPUT",
  "analysis": {
    "projectType": "\$([ -f '/app/package.json' ] && echo 'nodejs' || echo 'python')",
    "structure": "analyzed",
    "timestamp": "\$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  }
}
EOF

echo "✅ Evaluation completed successfully!"
echo "📊 Final score preview:"
cat /results/score.json | jq '.totalScore'

echo "🎯 Evaluation summary saved to /results/score.json"
`;
    
    await fs.writeFile(path.join(packPath, 'entrypoint.sh'), entrypoint, { mode: 0o755 });
    
    // Create enhanced eval config
    const evalConfig = `timeout: 1800
healthcheck:
  enabled: false
environment:
  NODE_ENV: test
  PYTHONPATH: /app
  PYTHON_ENV: test
  CI: true
`;
    
    await fs.writeFile(path.join(packPath, 'eval_config.yaml'), evalConfig);
  }

  private async generateDockerfile(projectInfo: ProjectInfo): Promise<string> {
    if (projectInfo.hasDockerfile) {
      // Use existing Dockerfile but add evaluation layer
      return `
FROM code AS submission
COPY pack/tests /opt/tests
COPY pack/eval_config.yaml /opt/eval_config.yaml
COPY pack/entrypoint.sh /opt/entrypoint.sh
RUN chmod +x /opt/entrypoint.sh
CMD ["/opt/entrypoint.sh"]
`;
    }

    // Generate standard Dockerfile based on project type
    switch (projectInfo.type) {
      case 'node':
        return `
FROM node:18-slim AS submission
WORKDIR /app
COPY code/package*.json ./
RUN npm ci --only=production
COPY code/ .
COPY pack/tests /opt/tests
COPY pack/eval_config.yaml /opt/eval_config.yaml
COPY pack/entrypoint.sh /opt/entrypoint.sh
RUN chmod +x /opt/entrypoint.sh
CMD ["/opt/entrypoint.sh"]
`;
      
      case 'python':
        return `
FROM python:3.11-slim AS submission
WORKDIR /app
COPY code/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY code/ .
COPY pack/tests /opt/tests
COPY pack/eval_config.yaml /opt/eval_config.yaml
COPY pack/entrypoint.sh /opt/entrypoint.sh
RUN chmod +x /opt/entrypoint.sh
CMD ["/opt/entrypoint.sh"]
`;
      
      default:
        return `
FROM ubuntu:22.04 AS submission
WORKDIR /app
COPY code/ .
COPY pack/tests /opt/tests
COPY pack/eval_config.yaml /opt/eval_config.yaml
COPY pack/entrypoint.sh /opt/entrypoint.sh
RUN chmod +x /opt/entrypoint.sh
CMD ["/opt/entrypoint.sh"]
`;
    }
  }

  private async runCommand(
    command: string,
    args: string[],
    timeoutMs: number = 30000
  ): Promise<{ success: boolean; output: string }> {
    return new Promise((resolve) => {
      const process = spawn(command, args);
      let output = '';
      let timeoutId: NodeJS.Timeout;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        process.kill();
      };

      timeoutId = setTimeout(() => {
        cleanup();
        resolve({
          success: false,
          output: output + '\nProcess timed out',
        });
      }, timeoutMs);

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        output += data.toString();
      });

      process.on('close', (code) => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve({
          success: code === 0,
          output,
        });
      });

      process.on('error', (error) => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve({
          success: false,
          output: output + '\nProcess error: ' + error.message,
        });
      });
    });
  }

  private async copyDirectory(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
} 