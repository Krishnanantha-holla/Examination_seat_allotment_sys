import Database from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { verbose } = Database;
const sqlite3 = verbose();

const dbPath = path.join(__dirname, '..', 'exam_seating.db');

// Create a connection pool-like interface for SQLite
class SQLitePool {
  constructor(dbPath) {
    this.dbPath = dbPath;
  }

  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }
      });

      // Handle different query types
      if (sql.trim().toUpperCase().startsWith('SELECT') || 
          sql.trim().toUpperCase().startsWith('PRAGMA')) {
        db.all(sql, params, (err, rows) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve({ rows, rowCount: rows.length });
          }
        });
      } else {
        db.run(sql, params, function(err) {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve({ 
              rows: [], 
              rowCount: this.changes,
              insertId: this.lastID 
            });
          }
        });
      }
    });
  }

  async end() {
    // No-op for SQLite, connections are closed after each query
    return Promise.resolve();
  }
}

const pool = new SQLitePool(dbPath);

console.log(`✓ Using SQLite database at: ${dbPath}`);

export default pool;
