import { Test, TestingModule } from '@nestjs/testing';
import { DockerService, ProjectInfo, BuildResult, TestResult } from '../docker.service';
import * as fs from 'fs/promises';
import { spawn } from 'child_process';

// Mock fs and child_process
jest.mock('fs/promises');
jest.mock('child_process');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

describe('DockerService', () => {
  let service: DockerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DockerService],
    }).compile();

    service = module.get<DockerService>(DockerService);

    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('detectProjectType', () => {
    it('should detect Node.js project with package.json', async () => {
      mockFs.readdir.mockResolvedValue([
        'package.json',
        'src',
        'README.md',
        'Dockerfile',
      ] as any);

      const result = await service.detectProjectType('/test/repo');

      expect(result).toEqual({
        type: 'node',
        hasDockerfile: true,
        packageFiles: ['package.json'],
      });
    });

    it('should detect Python project with requirements.txt', async () => {
      mockFs.readdir.mockResolvedValue([
        'requirements.txt',
        'src',
        'README.md',
      ] as any);

      const result = await service.detectProjectType('/test/repo');

      expect(result).toEqual({
        type: 'python',
        hasDockerfile: false,
        packageFiles: ['requirements.txt'],
      });
    });

    it('should detect Python project with pyproject.toml', async () => {
      mockFs.readdir.mockResolvedValue([
        'pyproject.toml',
        'src',
        'README.md',
      ] as any);

      const result = await service.detectProjectType('/test/repo');

      expect(result).toEqual({
        type: 'python',
        hasDockerfile: false,
        packageFiles: ['pyproject.toml'],
      });
    });

    it('should handle unknown project type', async () => {
      mockFs.readdir.mockResolvedValue([
        'main.cpp',
        'README.md',
      ] as any);

      const result = await service.detectProjectType('/test/repo');

      expect(result).toEqual({
        type: 'unknown',
        hasDockerfile: false,
        packageFiles: [],
      });
    });

    it('should handle detection errors gracefully', async () => {
      mockFs.readdir.mockRejectedValue(new Error('Permission denied'));

      const result = await service.detectProjectType('/test/repo');

      expect(result).toEqual({
        type: 'unknown',
        hasDockerfile: false,
        packageFiles: [],
      });
    });
  });

  describe('buildImage', () => {
    beforeEach(() => {
      // Mock the copyDirectory and createDefaultChallengePack methods
      (service as any).copyDirectory = jest.fn().mockResolvedValue(undefined);
      (service as any).createDefaultChallengePack = jest.fn().mockResolvedValue(undefined);
      
      // Mock fs operations
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.rm.mockResolvedValue(undefined);
    });

    it('should build image successfully for Node.js project', async () => {
      const projectInfo: ProjectInfo = {
        type: 'node',
        hasDockerfile: false,
        packageFiles: ['package.json'],
      };

      // Mock successful docker build
      mockSpawn.mockImplementation(() => {
        const mockProcess: any = {
          stdout: { on: jest.fn() },
          stderr: { on: jest.fn() },
          on: jest.fn((event, callback) => {
            if (event === 'close') {
              setTimeout(() => callback(0), 10); // Success exit code
            }
          }),
          kill: jest.fn(),
        };
        return mockProcess;
      });

      const result = await service.buildImage('/test/repo', '/test/pack', projectInfo);

      expect(result.success).toBe(true);
      expect(result.imageId).toMatch(/^submission-.+:latest$/);
      expect(mockFs.mkdir).toHaveBeenCalled();
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it('should handle build failure', async () => {
      const projectInfo: ProjectInfo = {
        type: 'python',
        hasDockerfile: false,
        packageFiles: ['requirements.txt'],
      };

      // Mock failed docker build
      mockSpawn.mockImplementation(() => {
        const mockProcess: any = {
          stdout: { on: jest.fn() },
          stderr: { on: jest.fn() },
          on: jest.fn((event, callback) => {
            if (event === 'close') {
              setTimeout(() => callback(1), 10); // Failure exit code
            }
          }),
          kill: jest.fn(),
        };
        return mockProcess;
      });

      const result = await service.buildImage('/test/repo', '/test/pack', projectInfo);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.imageId).toBeUndefined();
    });

    it('should use existing Dockerfile when available', async () => {
      const projectInfo: ProjectInfo = {
        type: 'node',
        hasDockerfile: true,
        packageFiles: ['package.json'],
      };

      // Mock successful docker build
      mockSpawn.mockImplementation(() => {
        const mockProcess: any = {
          stdout: { on: jest.fn() },
          stderr: { on: jest.fn() },
          on: jest.fn((event, callback) => {
            if (event === 'close') {
              setTimeout(() => callback(0), 10);
            }
          }),
          kill: jest.fn(),
        };
        return mockProcess;
      });

      await service.buildImage('/test/repo', '/test/pack', projectInfo);

      // Should write Dockerfile that extends the existing one
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('Dockerfile'),
        expect.stringContaining('FROM code AS submission')
      );
    });
  });

  describe('runTests', () => {
    beforeEach(() => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.rm.mockResolvedValue(undefined);
    });

    it('should run tests successfully and parse results', async () => {
      const mockResults = {
        totalScore: 85,
        testsCovered: 12,
        testsPass: true,
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockResults));

      // Mock successful docker run
      mockSpawn.mockImplementation(() => {
        const mockProcess: any = {
          stdout: { on: jest.fn() },
          stderr: { on: jest.fn() },
          on: jest.fn((event, callback) => {
            if (event === 'close') {
              setTimeout(() => callback(0), 10);
            }
          }),
          kill: jest.fn(),
        };
        return mockProcess;
      });

      const result = await service.runTests('test-image:latest');

      expect(result.success).toBe(true);
      expect(result.score).toBe(85);
      expect(result.results).toEqual(mockResults);
      expect(mockFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('score.json'),
        'utf-8'
      );
    });

    it('should handle test execution failure', async () => {
      // Mock failed docker run
      mockSpawn.mockImplementation(() => {
        const mockProcess: any = {
          stdout: { on: jest.fn() },
          stderr: { on: jest.fn() },
          on: jest.fn((event, callback) => {
            if (event === 'close') {
              setTimeout(() => callback(1), 10); // Failure exit code
            }
          }),
          kill: jest.fn(),
        };
        return mockProcess;
      });

      const result = await service.runTests('test-image:latest');

      expect(result.success).toBe(false);
      expect(result.score).toBe(0); // Should be 0 for failed execution
      expect(result.error).toBeDefined();
      // Should not try to read score file when docker run fails
      expect(mockFs.readFile).not.toHaveBeenCalled();
    });

    it('should handle missing results file gracefully', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      // Mock successful docker run
      mockSpawn.mockImplementation(() => {
        const mockProcess: any = {
          stdout: { on: jest.fn() },
          stderr: { on: jest.fn() },
          on: jest.fn((event, callback) => {
            if (event === 'close') {
              setTimeout(() => callback(0), 10);
            }
          }),
          kill: jest.fn(),
        };
        return mockProcess;
      });

      const result = await service.runTests('test-image:latest');

      expect(result.success).toBe(false);
      expect(result.score).toBe(0);
      expect(result.results).toEqual({});
      expect(result.error).toContain('Failed to read evaluation results');
    });

    it('should apply security constraints during test execution', async () => {
      mockFs.readFile.mockResolvedValue('{}');

      // Mock successful docker run
      mockSpawn.mockImplementation(() => {
        const mockProcess: any = {
          stdout: { on: jest.fn() },
          stderr: { on: jest.fn() },
          on: jest.fn((event, callback) => {
            if (event === 'close') {
              setTimeout(() => callback(0), 10);
            }
          }),
          kill: jest.fn(),
        };
        return mockProcess;
      });

      await service.runTests('test-image:latest', 15);

      expect(mockSpawn).toHaveBeenCalledWith('docker', expect.arrayContaining([
        'run',
        '--rm',
        '--network', 'none', // No network access
        '--memory', '2g',
        '--cpus', '2',
        'test-image:latest',
      ]));
    });
  });

  describe('generateDockerfile', () => {
    it('should generate Dockerfile for Node.js project', async () => {
      const projectInfo: ProjectInfo = {
        type: 'node',
        hasDockerfile: false,
        packageFiles: ['package.json'],
      };

      const dockerfile = await (service as any).generateDockerfile(projectInfo);

      expect(dockerfile).toContain('FROM node:18-slim');
      expect(dockerfile).toContain('npm ci --only=production');
      expect(dockerfile).toContain('COPY code/package*.json');
      expect(dockerfile).toContain('/opt/entrypoint.sh');
    });

    it('should generate Dockerfile for Python project', async () => {
      const projectInfo: ProjectInfo = {
        type: 'python',
        hasDockerfile: false,
        packageFiles: ['requirements.txt'],
      };

      const dockerfile = await (service as any).generateDockerfile(projectInfo);

      expect(dockerfile).toContain('FROM python:3.11-slim');
      expect(dockerfile).toContain('pip install --no-cache-dir');
      expect(dockerfile).toContain('COPY code/requirements.txt');
      expect(dockerfile).toContain('/opt/entrypoint.sh');
    });

    it('should generate extension Dockerfile for existing Dockerfile', async () => {
      const projectInfo: ProjectInfo = {
        type: 'node',
        hasDockerfile: true,
        packageFiles: ['package.json'],
      };

      const dockerfile = await (service as any).generateDockerfile(projectInfo);

      expect(dockerfile).toContain('FROM code AS submission');
      expect(dockerfile).toContain('COPY pack/tests /opt/tests');
      expect(dockerfile).toContain('/opt/entrypoint.sh');
    });
  });
}); 