const pool = require('../config/db');

/**
 * Get pending signatures for care worker
 * GET /api/signatures/pending
 */
const getPendingSignatures = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT 
        fa.id as assignment_id,
        fa.status,
        fa.submitted_at,
        fa.due_date,
        ft.id as form_template_id,
        ft.name as form_name,
        ft.type as form_type,
        ft.version as form_version,
        ft.description as form_description
      FROM form_assignments fa
      JOIN form_templates ft ON fa.form_template_id = ft.id
      WHERE fa.status IN ('signature_pending', 'submitted')
    `;

    const params = [];

    // Care workers can only see their own signatures
    if (userRole === 'care_worker') {
      query += ` AND fa.care_worker_id = ?`;
      params.push(userId);
    }

    query += ` ORDER BY fa.submitted_at DESC`;

    const [signatures] = await pool.execute(query, params);

    res.json({
      success: true,
      data: signatures
    });
  } catch (error) {
    console.error('Get pending signatures error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Submit signature for form assignment
 * POST /api/signatures
 */
const submitSignature = async (req, res) => {
  try {
    const { assignmentId, signatureData, signatureType } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!assignmentId || !signatureData) {
      return res.status(400).json({
        success: false,
        message: 'Assignment ID and signature data are required'
      });
    }

    // Get assignment
    const [assignments] = await pool.execute(
      'SELECT * FROM form_assignments WHERE id = ?',
      [assignmentId]
    );

    if (assignments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Form assignment not found'
      });
    }

    const assignment = assignments[0];

    // Check permission
    if (userRole === 'care_worker' && assignment.care_worker_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if signature is pending or form is submitted (both need signature)
    // Allow both 'signature_pending' and 'submitted' status as they both require signature
    const allowedStatuses = ['signature_pending', 'submitted'];
    if (!allowedStatuses.includes(assignment.status)) {
      console.log('Assignment status:', assignment.status, 'for assignment ID:', assignmentId);
      return res.status(400).json({
        success: false,
        message: `Form is not pending signature. Current status: ${assignment.status}. Allowed statuses: ${allowedStatuses.join(', ')}`,
        currentStatus: assignment.status
      });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Save signature
      await connection.execute(
        `INSERT INTO signatures (form_assignment_id, signature_data, signature_type)
         VALUES (?, ?, ?)`,
        [assignmentId, signatureData, signatureType || 'draw']
      );

      // Update assignment status to completed
      await connection.execute(
        `UPDATE form_assignments 
         SET status = 'completed', completed_at = NOW(), progress = 100
         WHERE id = ?`,
        [assignmentId]
      );

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: 'Signature submitted successfully'
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Submit signature error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getPendingSignatures,
  submitSignature
};

