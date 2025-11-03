// Database Setup Script
// This creates the database and runs the schema
// Run: node setup-db.js

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const { Pool } = pg;

// First connection to postgres database (to create our database)
const systemPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'postgres', // Connect to default postgres database
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

// Second connection to our new database (to create tables)
const appPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'exam_seating_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function setupDatabase() {
  console.log('\n=== Database Setup Starting ===\n');
  
  try {
    // Step 1: Create database
    console.log('Step 1: Creating database...');
    try {
      await systemPool.query(`CREATE DATABASE ${process.env.DB_NAME || 'exam_seating_db'}`);
      console.log('✓ Database created successfully');
    } catch (err) {
      if (err.code === '42P04') {
        console.log('✓ Database already exists');
      } else {
        throw err;
      }
    }
    
    // Step 2: Read schema file
    console.log('\nStep 2: Reading schema file...');
    const schemaPath = path.join(__dirname, 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('✓ Schema file loaded');
    
    // Step 3: Execute schema
    console.log('\nStep 3: Creating tables...');
    await appPool.query(schema);
    console.log('✓ Schema executed successfully');
    
    // Step 4: Verify tables
    console.log('\nStep 4: Verifying tables...');
    const result = await appPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\nCreated tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    console.log('\n✓ Database setup complete!\n');
    console.log('=== Next Steps ===');
    console.log('1. Run: npm run dev');
    console.log('2. In another terminal: cd ../frontend && npm start');
    console.log('3. Open: http://localhost:3000\n');
    
  } catch (error) {
    console.error('\n✗ Error during setup:');
    console.error(error.message);
    
    if (error.code === '28P01') {
      console.error('\n❌ Authentication failed!');
      console.error('Please check your DB_PASSWORD in backend/.env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ Cannot connect to PostgreSQL!');
      console.error('Please ensure PostgreSQL is running');
      console.error(`Trying to connect to: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    }
    
    process.exit(1);
  } finally {
    await systemPool.end();
    await appPool.end();
  }
}

// Run the setup
setupDatabase();
