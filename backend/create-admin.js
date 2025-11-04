// Create Default Admin Account
// Run this once: node create-admin.js

import Database from 'sqlite3';
import bcryptjs from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { verbose } = Database;
const sqlite3 = verbose();

const dbPath = path.join(__dirname, 'exam_seating.db');

async function createAdmin() {
    console.log('\n=== Creating Default Admin Account ===\n');
    
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('✗ Error opening database:', err.message);
                reject(err);
                return;
            }
            
            console.log('✓ Connected to database');
            
            // Check if admin exists
            db.get('SELECT * FROM users WHERE username = ?', ['admin'], async (err, existingAdmin) => {
                if (err) {
                    console.error('✗ Error checking admin:', err.message);
                    db.close();
                    reject(err);
                    return;
                }
                
                if (existingAdmin) {
                    console.log('✓ Admin account already exists');
                    console.log('  Username: admin');
                    console.log('  Email:', existingAdmin.email);
                    db.close();
                    resolve();
                    return;
                }
                
                // Create admin account
                const hashedPassword = await bcryptjs.hash('admin123', 10);
                
                db.run(
                    'INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
                    ['admin', 'admin@examseating.com', hashedPassword, 'Administrator', 'admin'],
                    function(err) {
                        if (err) {
                            console.error('✗ Error creating admin:', err.message);
                            db.close();
                            reject(err);
                            return;
                        }
                        
                        console.log('\n✓ Default admin account created successfully!');
                        console.log('\n=== Login Credentials ===');
                        console.log('Username: admin');
                        console.log('Email: admin@examseating.com');
                        console.log('Password: admin123');
                        console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');
                        
                        db.close();
                        resolve();
                    }
                );
            });
        });
    });
}

createAdmin().catch(err => {
    console.error('Setup failed:', err);
    process.exit(1);
});
