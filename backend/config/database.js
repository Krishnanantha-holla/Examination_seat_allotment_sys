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

// Helper function to extract table name from SQL
function extractTableName(sql) {
  const match = sql.match(/INSERT\s+INTO\s+(\w+)/i);
  return match ? match[1] : null;
}

// Create a connection pool-like interface for SQLite
class SQLitePool {
  constructor(dbPath) {
    this.dbPath = dbPath;
  }

  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      // Convert PostgreSQL $1, $2 syntax to SQLite ? syntax
      let sqliteSql = sql;
      if (params.length > 0 && sql.includes('$')) {
        for (let i = params.length; i >= 1; i--) {
          sqliteSql = sqliteSql.replace(new RegExp('\\$' + i, 'g'), '?');
        }
      }

      const db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }
      });

      // Handle RETURNING clause (PostgreSQL syntax)
      let returningFields = [];
      const returningMatch = sqliteSql.match(/RETURNING\s+(.+?)(?:;|$)/i);
      if (returningMatch) {
        returningFields = returningMatch[1].split(',').map(f => f.trim());
        sqliteSql = sqliteSql.replace(/RETURNING\s+.+?(?:;|$)/i, '');
      }

      // Handle different query types
      const upperSql = sqliteSql.trim().toUpperCase();
      if (upperSql.startsWith('SELECT') || upperSql.startsWith('PRAGMA')) {
        db.all(sqliteSql, params, (err, rows) => {
          db.close();
          if (err) {
            reject(err);
          } else {
            resolve({ rows, rowCount: rows.length });
          }
        });
      } else if (upperSql.startsWith('INSERT')) {
        db.run(sqliteSql, params, function(err) {
          if (err) {
            db.close();
            reject(err);
            return;
          }
          
          const insertId = this.lastID;
          
          // If RETURNING was requested, fetch the inserted row
          if (returningFields.length > 0) {
            const selectFields = returningFields.join(', ');
            db.get(`SELECT ${selectFields} FROM ${extractTableName(sqliteSql)} WHERE rowid = ?`, [insertId], (err, row) => {
              db.close();
              if (err) {
                reject(err);
              } else {
                resolve({ 
                  rows: row ? [row] : [],
                  rowCount: 1,
                  insertId
                });
              }
            });
          } else {
            db.close();
            resolve({ 
              rows: [], 
              rowCount: this.changes,
              insertId
            });
          }
        });
      } else {
        db.run(sqliteSql, params, function(err) {
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
