# Add Admin User to Database

## 🚀 Quick Method (Recommended)

Run the Node.js script which properly hashes the password:

```bash
node scripts/setupAdmin.js
```

This will:
- Create admin user with email: `admin@m.com`
- Password: `password`
- Properly hash the password using bcrypt
- Update if admin already exists

## 📝 SQL Method

If you prefer SQL directly:

```bash
mysql -u root -p care_worker_db < database/insert_admin.sql
```

**OR** run this SQL directly:

```sql
USE care_worker_db;

INSERT INTO users (email, password, role, status) 
VALUES ('admin@m.com', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOeJqJqJqJqJqJqJqJqJqJqJqJqJq', 'admin', 'active')
ON DUPLICATE KEY UPDATE 
    password = VALUES(password),
    status = 'active';
```

## 🔐 Admin Credentials

- **Email:** `admin@m.com`
- **Password:** `password`

⚠️ **IMPORTANT:** Change password in production!

## ✅ Verify Admin

After insertion, verify admin exists:

```sql
SELECT id, email, role, status FROM users WHERE email = 'admin@m.com';
```

## 🔄 Update Admin Password

To change admin password, run:

```bash
node scripts/setupAdmin.js
```

Or update manually in SQL (you'll need to generate bcrypt hash first).

