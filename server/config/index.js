import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '8012', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3012',
  dataFile: path.resolve(__dirname, '../data/assessments.json'),
  registrationDataFile: path.resolve(__dirname, '../data/registrations.json'),
  userDataFile: path.resolve(__dirname, '../data/users.json'),
  db: {
    host: process.env.DB_HOST || '10.69.255.196',
    user: process.env.DB_USER || 'appdb4',
    password: process.env.DB_PASSWORD || 'Hpjaya3455??',
    database: process.env.DB_NAME || 'dbtjsl',
    port: parseInt(process.env.DB_PORT || '3306', 10)
  }
};
