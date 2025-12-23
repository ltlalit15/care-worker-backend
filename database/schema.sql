-- ============================================
-- Care Worker Management System Database Schema
-- Complete Schema with all tables and migrations
-- ============================================

-- Create database (run this separately if needed)
-- CREATE DATABASE IF NOT EXISTS care_worker_db;
-- USE care_worker_db;

-- ============================================
-- USERS TABLE
-- ============================================
-- Stores both Admin and Care Workers
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'care_worker') NOT NULL,
  status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
);

-- ============================================
-- CARE WORKER PROFILES TABLE
-- ============================================
-- Additional info for care workers
CREATE TABLE IF NOT EXISTS care_worker_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- ============================================
-- FORM TEMPLATES TABLE
-- ============================================
-- Master forms (both template and client forms)
-- form_category distinguishes between:
--   - 'template': Forms shown in Admin → Forms / Templates (~30 forms)
--   - 'client': Forms shown in Admin → Clients (~4 forms)
CREATE TABLE IF NOT EXISTS form_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('Input', 'Document') DEFAULT 'Input',
  form_category ENUM('template', 'client') DEFAULT 'template',
  version VARCHAR(50) DEFAULT '1.0',
  form_data JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_name (name),
  INDEX idx_type (type),
  INDEX idx_form_category (form_category),
  INDEX idx_is_active (is_active)
);

-- ============================================
-- FORM ASSIGNMENTS TABLE
-- ============================================
-- Admin assigns forms to care workers
CREATE TABLE IF NOT EXISTS form_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  care_worker_id INT NOT NULL,
  form_template_id INT NOT NULL,
  status ENUM('assigned', 'in_progress', 'submitted', 'completed', 'signature_pending') DEFAULT 'assigned',
  progress INT DEFAULT 0,
  form_data JSON,
  assigned_by INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  due_date DATE NULL,
  FOREIGN KEY (care_worker_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (form_template_id) REFERENCES form_templates(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id),
  INDEX idx_care_worker_id (care_worker_id),
  INDEX idx_form_template_id (form_template_id),
  INDEX idx_status (status)
);

-- ============================================
-- SIGNATURES TABLE
-- ============================================
-- Digital signatures for forms
CREATE TABLE IF NOT EXISTS signatures (
  id INT PRIMARY KEY AUTO_INCREMENT,
  form_assignment_id INT NOT NULL,
  signature_data TEXT NOT NULL,
  signature_type ENUM('draw', 'type') DEFAULT 'draw',
  signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_assignment_id) REFERENCES form_assignments(id) ON DELETE CASCADE,
  INDEX idx_form_assignment_id (form_assignment_id)
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
-- Notifications for care workers
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read)
);

-- ============================================
-- PAYROLL TABLE
-- ============================================
-- Payroll records for care workers
CREATE TABLE IF NOT EXISTS payroll (
  id INT PRIMARY KEY AUTO_INCREMENT,
  care_worker_id INT NOT NULL,
  region VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  client_no VARCHAR(50),
  date VARCHAR(50),
  total_hours DECIMAL(10, 2) DEFAULT 0,
  rate_per_hour DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  paid DECIMAL(10, 2) DEFAULT 0,
  status ENUM('Paid', 'Unpaid') DEFAULT 'Unpaid',
  balance DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (care_worker_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_care_worker_id (care_worker_id),
  INDEX idx_status (status),
  INDEX idx_region (region)
);

-- ============================================
-- DOCUMENTS TABLE
-- ============================================
-- Documents for care workers (contracts, policies, etc.)
CREATE TABLE IF NOT EXISTS documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  care_worker_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(500),
  file_type VARCHAR(50),
  file_size INT,
  status ENUM('Pending', 'Signed', 'Completed') DEFAULT 'Pending',
  signed_at TIMESTAMP NULL,
  uploaded_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (care_worker_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  INDEX idx_care_worker_id (care_worker_id),
  INDEX idx_status (status)
);

-- ============================================
-- NOTES
-- ============================================
-- Default admin user will be created by running: node scripts/setupAdmin.js
-- Or manually insert with proper bcrypt hash for password 'password'
--
-- To insert client forms after running this schema:
-- SET @admin_id = (SELECT id FROM users WHERE role = 'admin' LIMIT 1);
-- INSERT INTO form_templates (name, description, type, form_category, version, form_data, is_active, created_by) VALUES
-- ('Telephone Monitoring', 'Form for monitoring telephone conversations with clients', 'Input', 'client', '1.0', '{}', TRUE, @admin_id),
-- ('Care Plan', 'Comprehensive care planning document', 'Input', 'client', '2.0', '{}', TRUE, @admin_id),
-- ('Risk Management', 'Document for identifying and managing risks', 'Input', 'client', '2.0', '{}', TRUE, @admin_id),
-- ('Incident Form', 'Form for reporting incidents', 'Input', 'client', '1.0', '{}', TRUE, @admin_id);
