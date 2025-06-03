import { spawn } from 'child_process';
import { Logger } from '@nestjs/common';

const logger = new Logger('DockerCheck');

export async function checkDockerAvailability(): Promise<boolean> {
  return new Promise((resolve) => {
    const process = spawn('docker', ['--version']);
    let output = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    process.stderr.on('data', (data) => {
      output += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        logger.log(`Docker is available: ${output.trim()}`);
        resolve(true);
      } else {
        logger.error(`Docker is not available. Exit code: ${code}, Output: ${output}`);
        resolve(false);
      }
    });

    process.on('error', (error) => {
      logger.error(`Docker check failed: ${error.message}`);
      resolve(false);
    });
  });
}

export async function checkDockerRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    const process = spawn('docker', ['info']);
    let output = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    process.stderr.on('data', (data) => {
      output += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        logger.log('Docker daemon is running');
        resolve(true);
      } else {
        logger.error(`Docker daemon is not running. Exit code: ${code}, Output: ${output}`);
        resolve(false);
      }
    });

    process.on('error', (error) => {
      logger.error(`Docker daemon check failed: ${error.message}`);
      resolve(false);
    });
  });
} 