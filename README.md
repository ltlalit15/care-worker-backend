# Care Worker Management System - Backend API

Complete backend API for Admin & Care Worker Management System built with Node.js, Express.js, and MySQL.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin & Care Worker)
  - Secure password hashing with bcrypt

- **Admin Features**
  - Dashboard with KPIs (Total Carers, Pending Forms, Completed Packs, Pending Signatures)
  - Care Worker CRUD operations
  - Form Templates management
  - Form Assignment to Care Workers
  - CSV Import/Export for Care Workers

- **Care Worker Features**
  - Dashboard with summary cards
  - View assigned forms
  - Fill and submit forms
  - Digital signature submission
  - Profile management

- **Form Management**
  - Form Templates (Input & Document types)
  - Version control
  - Form Assignment workflow
  - Progress tracking
  - Signature workflow

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd Care_Worker_Bachend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env` file and update with your database credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=care_worker_db
   JWT_SECRET=your_jwt_secret_key_change_in_production_12345
   ```

4. **Create database and run schema**
   ```bash
   # Login to MySQL
   mysql -u root -p

   # Create database
   CREATE DATABASE care_worker_db;

   # Run schema
   mysql -u root -p care_worker_db < database/schema.sql
   ```

6. **Setup default admin user**
   ```bash
   node scripts/setupAdmin.js
   ```

5. **Create uploads directory**
   ```bash
   mkdir uploads
   ```

## 🚀 Running the Server

### Development Mode (with nodemon)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login (Admin or Care Worker)
- `GET /api/auth/me` - Get current user info

### Admin APIs
- `GET /api/admin/dashboard` - Get admin dashboard summary
- `GET /api/care-workers` - Get all care workers
- `GET /api/care-workers/:id` - Get care worker by ID
- `POST /api/care-workers` - Create care worker
- `PUT /api/care-workers/:id` - Update care worker
- `DELETE /api/care-workers/:id` - Delete care worker (soft delete)

### Form Management
- `GET /api/forms` - Get all form templates
- `GET /api/forms/:id` - Get form template by ID
- `POST /api/forms` - Create form template (Admin only)
- `PUT /api/forms/:id` - Update form template (Admin only)
- `DELETE /api/forms/:id` - Delete form template (Admin only)

### Form Assignments
- `POST /api/form-assignments` - Assign forms to care worker (Admin only)
- `GET /api/form-assignments/care-worker/:id` - Get assignments for care worker
- `PUT /api/form-assignments/:id` - Update form assignment

### Signatures
- `GET /api/signatures/pending` - Get pending signatures
- `POST /api/signatures` - Submit signature

### Care Worker Dashboard
- `GET /api/care-worker/dashboard` - Get care worker dashboard

### Import/Export
- `POST /api/import-export/import-care-workers` - Import care workers from CSV (Admin only)
- `GET /api/import-export/export-care-workers` - Export care workers to CSV (Admin only)

## 🔐 Default Admin Credentials

After running the schema, default admin user is created:
- **Email:** `admin@m.com`
- **Password:** `password`

**⚠️ IMPORTANT:** Change the default password in production!

## 📝 CSV Import Format

For importing care workers, CSV should have the following columns:
- `email` (required)
- `password` (required)
- `name` (required)
- `phone` (optional)
- `address` (optional)
- `emergencyContactName` (optional)
- `emergencyContactPhone` (optional)
- `status` (optional, default: 'active')

## 🧪 Testing API

### Login Example
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@m.com",
    "password": "password"
  }'
```

### Get Dashboard (with token)
```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📁 Project Structure

```
Care_Worker_Bachend/
├── config/
│   └── db.js                 # Database connection
├── controllers/              # Business logic
│   ├── adminController.js
│   ├── authController.js
│   ├── careWorkerController.js
│   ├── careWorkerDashboardController.js
│   ├── formController.js
│   ├── formAssignmentController.js
│   ├── importExportController.js
│   └── signatureController.js
├── database/
│   └── schema.sql           # Database schema
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/                   # API routes
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── careWorkerRoutes.js
│   ├── careWorkerDashboardRoutes.js
│   ├── formRoutes.js
│   ├── formAssignmentRoutes.js
│   ├── importExportRoutes.js
│   └── signatureRoutes.js
├── uploads/                  # CSV uploads directory
├── .env                      # Environment variables
├── .gitignore
├── package.json
├── README.md
└── server.js                 # Entry point
```

## 🔒 Security Notes

- Passwords are hashed using bcrypt
- JWT tokens expire after 24 hours
- Role-based access control enforced
- SQL injection protection using parameterized queries
- File upload validation for CSV imports

## 🐛 Troubleshooting

### Database Connection Error
- Check MySQL is running
- Verify database credentials in `.env`
- Ensure database exists: `CREATE DATABASE care_worker_db;`

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using port 5000

### Module Not Found
- Run `npm install` again
- Check `node_modules` exists

## 📄 License

ISC

## 👥 Support

For issues or questions, please contact the development team.

