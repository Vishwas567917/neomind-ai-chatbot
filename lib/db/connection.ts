import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { isTestEnvironment, isDevelopmentEnvironment } from '../constants';

// Mock database for test/demo environments
const createMockDb = () => {
  return {
    select: () => ({
      from: () => ({
        where: () => Promise.resolve([]),
      }),
    }),
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve([{ id: 'mock-id', email: 'guest@demo.com' }]),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => Promise.resolve([]),
      }),
    }),
    delete: () => ({
      where: () => Promise.resolve([]),
    }),
  };
};

let db: any;
let client: any;

try {
  if (isTestEnvironment || !process.env.POSTGRES_URL) {
    console.log('🔧 Using mock database for development/demo mode');
    db = createMockDb();
  } else {
    console.log('🗄️ Connecting to PostgreSQL database');
    client = postgres(process.env.POSTGRES_URL);
    db = drizzle(client);
  }
} catch (error) {
  console.warn('⚠️ Database connection failed, falling back to mock database');
  db = createMockDb();
}

export { db, client };
export const isUsingMockDb = isTestEnvironment || !process.env.POSTGRES_URL;