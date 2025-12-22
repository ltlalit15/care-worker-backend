# Database Setup Guide

## 📋 Setup Steps

### 1. Create Database
```bash
mysql -u root -p
```
```sql
CREATE DATABASE care_worker_db;
EXIT;
```

### 2. Run Schema
```bash
mysql -u root -p care_worker_db < database/schema.sql
```

### 3. Setup Admin User
```bash
node scripts/setupAdmin.js
```

### 4. Load Sample Data (Optional)

**Recommended: Use Node.js script (proper password hashing)**
```bash
node scripts/insertSampleData.js
```

**OR use SQL file (requires manual password hash update)**
```bash
mysql -u root -p care_worker_db < database/sample_data.sql
```

## 📊 Sample Data Includes

### Care Workers
- 8 care workers with different statuses (active, pending)
- Complete profiles with contact information
- Mix of progress levels

### Form Templates
- 24 different form templates
- Mix of Input and Document types
- Various versions

### Form Assignments
- Multiple assignments per care worker
- Different statuses: assigned, in_progress, submitted, signature_pending, completed
- Realistic progress percentages
- Due dates spread across time

### Signatures
- Sample signatures for completed forms
- Mix of drawn and typed signatures

### Notifications
- Various notification types
- Mix of read/unread status
- Different timestamps

## 🔐 Default Credentials

After running sample_data.sql:

**Admin:**
- Email: `admin@m.com`
- Password: `password`

**Care Workers:**
- Email: `careworker1@example.com` through `careworker8@example.com`
- Password: `password123` (for all)

## 📈 Data Statistics

After loading sample data:
- **8 Care Workers** (5 active, 3 pending)
- **24 Form Templates**
- **60+ Form Assignments**
- **5 Signatures**
- **10 Notifications**

## 🔄 Reset Database

To reset and reload:
```bash
mysql -u root -p
```
```sql
DROP DATABASE care_worker_db;
CREATE DATABASE care_worker_db;
EXIT;
```
Then run schema and sample data again.

