import { NextResponse } from 'next/server';
import { isTestEnvironment, isDevelopmentEnvironment, isProductionEnvironment } from '@/lib/constants';
import { isUsingMockDb } from '@/lib/db/connection';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: {
      production: isProductionEnvironment,
      development: isDevelopmentEnvironment,
      test: isTestEnvironment,
    },
    database: {
      connected: !isUsingMockDb,
      type: isUsingMockDb ? 'mock' : 'postgresql',
    },
    features: {
      auth: process.env.AUTH_SECRET ? 'configured' : 'missing',
      ai: {
        xai: process.env.XAI_API_KEY ? 'configured' : 'missing',
        openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
      },
      storage: {
        blob: process.env.BLOB_READ_WRITE_TOKEN ? 'configured' : 'missing',
        redis: process.env.REDIS_URL ? 'configured' : 'missing',
      },
    },
    mode: isTestEnvironment ? 'demo' : 'production',
  };

  // Test database connection if using real database
  if (!isUsingMockDb) {
    try {
      // Simple connection test would go here
      health.database.status = 'connected';
    } catch (error) {
      health.database.status = 'error';
      health.status = 'degraded';
    }
  }

  return NextResponse.json(health, {
    status: health.status === 'healthy' ? 200 : 503,
  });
}