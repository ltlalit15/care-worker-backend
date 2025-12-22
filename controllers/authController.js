const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Login - Admin or Care Worker
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const [users] = await pool.execute(
      'SELECT id, email, password, role, status FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active. Please contact administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Get additional profile info for care workers
    let profileData = null;
    if (user.role === 'care_worker') {
      const [profiles] = await pool.execute(
        'SELECT name, phone, address, emergency_contact_name, emergency_contact_phone FROM care_worker_profiles WHERE user_id = ?',
        [user.id]
      );
      if (profiles.length > 0) {
        profileData = profiles[0];
      }
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          ...(profileData && { profile: profileData })
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get current user info
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user info
    const [users] = await pool.execute(
      'SELECT id, email, role, status, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Get profile info if care worker
    let profileData = null;
    if (user.role === 'care_worker') {
      const [profiles] = await pool.execute(
        'SELECT name, phone, address, emergency_contact_name, emergency_contact_phone FROM care_worker_profiles WHERE user_id = ?',
        [userId]
      );
      if (profiles.length > 0) {
        profileData = profiles[0];
      }
    }

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          ...(profileData && { profile: profileData })
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  login,
  getMe
};

