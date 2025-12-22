# 📥 Postman Collection Import Instructions

## Quick Import Guide

### Method 1: Import JSON File
1. Open **Postman**
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `Care_Worker_API_Complete.postman_collection.json`
5. Click **Import**

### Method 2: Import from URL
1. Open **Postman**
2. Click **Import** button
3. Select **Link** tab
4. Paste the file path or URL
5. Click **Continue** → **Import**

## ✅ After Import

### 1. Check Variables
The collection includes these variables (automatically set):
- `baseUrl` = `http://localhost:5000/api`
- `authToken` = (auto-filled after login)
- `adminToken` = (auto-filled after admin login)
- `careWorkerToken` = (auto-filled after care worker login)
- `careWorkerId` = `2` (update as needed)
- `formTemplateId` = `1` (update as needed)
- `assignmentId` = `1` (update as needed)

### 2. Update Base URL (if needed)
If your server runs on different port:
1. Click collection name → **Variables** tab
2. Update `baseUrl` value
3. Click **Save**

## 🚀 Quick Start Testing

### Step 1: Test Health Check
1. Run **Health Check** request (no auth needed)
2. Should return: `{"success": true, "message": "Care Worker Backend API is running"}`

### Step 2: Login as Admin
1. Go to **🔐 Authentication** folder
2. Run **Admin Login**
3. Token automatically saved to `adminToken` variable
4. Check response - should have `token` field

### Step 3: Test Admin APIs
1. Go to **👤 Admin APIs** folder
2. Run **Get Admin Dashboard**
3. Should return dashboard data with KPIs

### Step 4: Login as Care Worker
1. Go to **🔐 Authentication** folder
2. Run **Care Worker Login**
3. Token automatically saved to `careWorkerToken` variable

### Step 5: Test Care Worker APIs
1. Go to **🏠 Care Worker Dashboard** folder
2. Run **Get Care Worker Dashboard**
3. Should return care worker's dashboard data

## 📋 Collection Structure

```
Care Worker API - Complete Collection
├── 🔐 Authentication (3 requests)
│   ├── Admin Login
│   ├── Care Worker Login
│   └── Get Current User (Me)
├── 👤 Admin APIs (1 request)
│   └── Get Admin Dashboard
├── 👥 Care Worker Management (5 requests)
│   ├── Get All Care Workers
│   ├── Get Care Worker by ID
│   ├── Create Care Worker
│   ├── Update Care Worker
│   └── Delete Care Worker
├── 📋 Form Templates (5 requests)
│   ├── Get All Forms
│   ├── Get Form by ID
│   ├── Create Form Template
│   ├── Update Form Template
│   └── Delete Form Template
├── 📝 Form Assignments (4 requests)
│   ├── Assign Forms to Care Worker
│   ├── Get Care Worker Assignments
│   ├── Update Form Assignment
│   └── Submit Form
├── ✍️ Signatures (3 requests)
│   ├── Get Pending Signatures
│   ├── Submit Signature (Draw)
│   └── Submit Signature (Type)
├── 🏠 Care Worker Dashboard (1 request)
│   └── Get Care Worker Dashboard
├── 📥📤 Import/Export (2 requests)
│   ├── Export Care Workers to CSV
│   └── Import Care Workers from CSV
└── 🏥 Health Check (1 request)
```

**Total: 25 API Endpoints**

## 🔐 Default Credentials

**Admin:**
- Email: `admin@m.com`
- Password: `password`

**Care Worker:**
- Email: `careworker1@example.com`
- Password: `password123`

## 💡 Tips

1. **Auto Token Management**: Login requests automatically save tokens
2. **Collection Auth**: Bearer token is set at collection level
3. **Update Variables**: Change IDs in variables as needed for your data
4. **Test Scripts**: Login requests have test scripts that auto-save tokens
5. **Environment**: Create Postman Environment for different servers (dev/staging/prod)

## 🐛 Troubleshooting

**401 Unauthorized:**
- Make sure you've logged in first
- Check if token is saved in variables
- Token might be expired (login again)

**403 Forbidden:**
- Check if you're using correct role token
- Admin endpoints need `adminToken`
- Care Worker endpoints need `careWorkerToken`

**404 Not Found:**
- Verify server is running on correct port
- Check `baseUrl` variable
- Verify endpoint path is correct

**500 Internal Server Error:**
- Check server logs
- Verify database connection
- Check if sample data is loaded

## 📝 Notes

- All timestamps are in ISO format
- Form data is stored as JSON
- Signatures can be base64 image (draw) or text (type)
- CSV import requires proper format (see API documentation)

