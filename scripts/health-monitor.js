#!/usr/bin/env node

/**
 * Chatbot Health Monitor
 * 
 * Usage:
 * node scripts/health-monitor.js [url] [interval]
 * 
 * Examples:
 * node scripts/health-monitor.js http://localhost:3000 30
 * node scripts/health-monitor.js https://your-domain.com 60
 */

const https = require('https');
const http = require('http');

const DEFAULT_URL = 'http://localhost:3000';
const DEFAULT_INTERVAL = 30; // seconds

class HealthMonitor {
  constructor(baseUrl, interval = 30) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.interval = interval * 1000; // Convert to milliseconds
    this.consecutiveFailures = 0;
    this.isRunning = false;
    this.lastHealthCheck = null;
  }

  async checkHealth() {
    const url = `${this.baseUrl}/api/health`;
    const startTime = Date.now();

    try {
      const response = await this.makeRequest(url);
      const responseTime = Date.now() - startTime;
      const health = JSON.parse(response);

      this.onHealthSuccess(health, responseTime);
      this.consecutiveFailures = 0;
    } catch (error) {
      this.consecutiveFailures++;
      this.onHealthFailure(error);
    }
  }

  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      
      const req = client.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  onHealthSuccess(health, responseTime) {
    const timestamp = new Date().toISOString();
    const status = health.status;
    const dbType = health.database?.type || 'unknown';
    const mode = health.mode || 'unknown';

    console.log(`✅ [${timestamp}] Health Check PASSED`);
    console.log(`   Status: ${status} | Mode: ${mode} | DB: ${dbType} | Response: ${responseTime}ms`);
    
    if (health.database?.connected === false && !health.mode.includes('demo')) {
      console.log(`⚠️  Warning: Database not connected in ${mode} mode`);
    }

    // Alert on degraded status
    if (status === 'degraded') {
      console.log('🚨 ALERT: Service is in degraded state');
    }

    this.lastHealthCheck = { timestamp, status: 'success', health, responseTime };
  }

  onHealthFailure(error) {
    const timestamp = new Date().toISOString();
    
    console.log(`❌ [${timestamp}] Health Check FAILED`);
    console.log(`   Error: ${error.message}`);
    console.log(`   Consecutive failures: ${this.consecutiveFailures}`);

    // Alert after 3 consecutive failures
    if (this.consecutiveFailures >= 3) {
      console.log('🚨 CRITICAL ALERT: Service is down - 3+ consecutive failures');
    }

    this.lastHealthCheck = { timestamp, status: 'failure', error: error.message };
  }

  start() {
    if (this.isRunning) {
      console.log('Monitor is already running');
      return;
    }

    console.log(`🔍 Starting Health Monitor`);
    console.log(`   URL: ${this.baseUrl}/api/health`);
    console.log(`   Interval: ${this.interval / 1000} seconds`);
    console.log(`   Started at: ${new Date().toISOString()}\n`);

    this.isRunning = true;

    // Initial check
    this.checkHealth();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.checkHealth();
    }, this.interval);

    // Graceful shutdown
    process.on('SIGINT', () => {
      this.stop();
    });

    process.on('SIGTERM', () => {
      this.stop();
    });
  }

  stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('\n🛑 Stopping Health Monitor...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.isRunning = false;
    console.log('Monitor stopped');
    process.exit(0);
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheck: this.lastHealthCheck,
      consecutiveFailures: this.consecutiveFailures,
      monitorUrl: `${this.baseUrl}/api/health`,
      interval: this.interval / 1000,
    };
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const url = args[0] || DEFAULT_URL;
  const interval = parseInt(args[1]) || DEFAULT_INTERVAL;

  const monitor = new HealthMonitor(url, interval);
  monitor.start();
}

module.exports = HealthMonitor;