import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  dataFile: path.resolve(__dirname, '../data/assessments.json'),
  db: {
    host: process.env.DB_HOST || 'db.bagasdp.online',
    user: process.env.DB_USER || 'bagas',
    password: process.env.DB_PASSWORD || 'bagasajaya21',
    database: process.env.DB_NAME || 'tjsl_local_heroes',
    port: parseInt(process.env.DB_PORT || '3306', 10)
  }
};
