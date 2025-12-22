const pool = require('../config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixCareWorkerPassword() {
  try {
    console.log('🔧 Fixing care worker password...\n');

    const email = 'careworker1@example.com';
    const password = 'password123';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      // Create user if doesn't exist
      const [result] = await pool.execute(
        'INSERT INTO users (email, password, role, status) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, 'care_worker', 'active']
      );
      console.log(`✅ Created care worker user: ${email} (ID: ${result.insertId})`);
      
      // Create profile
      await pool.execute(
        'INSERT INTO care_worker_profiles (user_id, name, phone, address, emergency_contact_name, emergency_contact_phone) VALUES (?, ?, ?, ?, ?, ?)',
        [result.insertId, 'John Doe', '+44 7700 900123', '123 Main Street, London, UK', 'Jane Doe', '+44 7700 900124']
      );
      console.log(`✅ Created care worker profile`);
    } else {
      // Update password
      await pool.execute(
        'UPDATE users SET password = ?, status = ? WHERE email = ?',
        [hashedPassword, 'active', email]
      );
      console.log(`✅ Updated password for: ${email}`);
    }

    console.log('\n✅ Password fixed successfully!');
    console.log(`\n📧 Login credentials:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixCareWorkerPassword();

