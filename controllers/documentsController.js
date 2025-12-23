const pool = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

/**
 * Get all documents for care worker
 * GET /api/documents/care-worker/:id
 * GET /api/documents/care-worker/me (for logged-in care worker)
 */
const getCareWorkerDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // If id is "me", use logged-in user's ID
    const targetUserId = id === 'me' ? userId : parseInt(id);

    // Check if user has permission (admin or own documents)
    if (userRole !== 'admin' && targetUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [documents] = await pool.execute(
      `SELECT 
        d.*,
        u.email as uploaded_by_email,
        cwp.name as care_worker_name
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      LEFT JOIN users u2 ON d.care_worker_id = u2.id
      LEFT JOIN care_worker_profiles cwp ON u2.id = cwp.user_id
      WHERE d.care_worker_id = ?
      ORDER BY d.created_at DESC`,
      [targetUserId]
    );

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get document by ID
 * GET /api/documents/:id
 */
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [documents] = await pool.execute(
      `SELECT 
        d.*,
        u.email as uploaded_by_email,
        cwp.name as care_worker_name
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      LEFT JOIN users u2 ON d.care_worker_id = u2.id
      LEFT JOIN care_worker_profiles cwp ON u2.id = cwp.user_id
      WHERE d.id = ?`,
      [id]
    );

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const document = documents[0];

    // Check permission
    if (userRole !== 'admin' && document.care_worker_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Get document by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Upload document
 * POST /api/documents
 */
const uploadDocument = async (req, res) => {
  try {
    const { careWorkerId, name, description, fileUrl, fileType, fileSize } = req.body;
    const uploadedBy = req.user.id;

    // Validate required fields
    if (!careWorkerId || !name) {
      return res.status(400).json({
        success: false,
        message: 'Care worker ID and document name are required'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO documents 
        (care_worker_id, name, description, file_url, file_type, file_size, uploaded_by, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        careWorkerId,
        name,
        description || null,
        fileUrl || null,
        fileType || null,
        fileSize || null,
        uploadedBy
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Update document
 * PUT /api/documents/:id
 */
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, signedAt } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if document exists
    const [existing] = await pool.execute('SELECT * FROM documents WHERE id = ?', [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check permission (admin or care worker who owns the document)
    if (userRole !== 'admin' && existing[0].care_worker_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    if (signedAt !== undefined) {
      updateFields.push('signed_at = ?');
      updateValues.push(signedAt);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(id);

    await pool.execute(
      `UPDATE documents SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Document updated successfully'
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Delete document
 * DELETE /api/documents/:id
 */
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if document exists
    const [existing] = await pool.execute('SELECT * FROM documents WHERE id = ?', [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check permission (admin only for delete)
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can delete documents'
      });
    }

    // Delete file if exists
    if (existing[0].file_url) {
      try {
        const filePath = path.join(__dirname, '..', 'uploads', existing[0].file_url);
        await fs.unlink(filePath);
      } catch (fileError) {
        console.warn('File not found or already deleted:', fileError.message);
      }
    }

    await pool.execute('DELETE FROM documents WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getCareWorkerDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  deleteDocument
};

