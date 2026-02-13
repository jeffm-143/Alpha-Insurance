import express from 'express';
import supabase from '../config/database.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all policy routes
router.use(authMiddleware);

// Helper function to format dates as YYYY-MM-DD to avoid timezone issues
const formatDateFields = (rows) => {
  return rows.map(row => ({
    ...row,
    date_issued: row.date_issued ? formatDate(row.date_issued) : null,
    date_received: row.date_received ? formatDate(row.date_received) : null,
    insurance_from_date: row.insurance_from_date ? formatDate(row.insurance_from_date) : null,
    insurance_to_date: row.insurance_to_date ? formatDate(row.insurance_to_date) : null,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null
  }));
};

// Helper to format Date to YYYY-MM-DD string
const formatDate = (dateValue) => {
  if (!dateValue) return null;
  
  // If it's already a string in YYYY-MM-DD format, return it
  if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}/)) {
    return dateValue.substring(0, 10);
  }
  
  // If it's a Date object
  if (dateValue instanceof Date) {
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const day = String(dateValue.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return null;
};

// Helper to validate and convert dates - only accept YYYY-MM-DD format
// MOVED TO TOP LEVEL - NO MORE DUPLICATION
const validateDate = (dateVal) => {
  // Handle false, "false", null, undefined, empty string, "0000-00-00"
  if (!dateVal || 
      dateVal === 'false' || 
      dateVal === false || 
      dateVal === '0000-00-00' || 
      dateVal === 'null' || 
      dateVal === 'undefined' ||
      String(dateVal).trim() === '') {
    return null;
  }
  
  const dateStr = String(dateVal).trim();
  
  // Validate YYYY-MM-DD format
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }
  
  return null;
};

// CREATE - Add new policy
router.post('/', async (req, res) => {
  try {
    const {
      assured, address, coc_number, or_number, policy_number, policy_type,
      policy_year, date_issued, date_received, insurance_from_date, insurance_to_date,
      model, make, body_type, color, mv_file_no, plate_no, chassis_no, motor_no,
      premium, other_charges, auth_fee
    } = req.body;

    // ADD THIS DEBUG LOGGING
    console.log('Received dates:', {
      date_issued,
      date_received,
      insurance_from_date,
      insurance_to_date,
      types: {
        date_issued: typeof date_issued,
        date_received: typeof date_received,
        insurance_from_date: typeof insurance_from_date,
        insurance_to_date: typeof insurance_to_date
      }
    });

    // Calculate rates
    const premiumNum = parseFloat(premium) || 0;
    const otherChargesNum = parseFloat(other_charges) || 0;
    const authFeeNum = parseFloat(auth_fee) || 50.40;
    
    const docStamps = premiumNum * 0.125;
    const eVat = premiumNum * 0.12;
    const lgt = premiumNum * 0.005;
    const totalPremium = premiumNum + otherChargesNum + docStamps + eVat + lgt + authFeeNum;

    // ADD THIS - Log validated dates
    const validatedDates = {
      date_issued: validateDate(date_issued),
      date_received: validateDate(date_received),
      insurance_from_date: validateDate(insurance_from_date),
      insurance_to_date: validateDate(insurance_to_date)
    };
    console.log('Validated dates:', validatedDates);

    const { data, error } = await supabase
      .from('insurance_policies')
      .insert([{
        assured: String(assured).trim(),
        address: String(address || '').trim(),
        coc_number: String(coc_number).trim(),
        or_number: String(or_number).trim(),
        policy_number: String(policy_number || '').trim(),
        policy_type: String(policy_type || '').trim(),
        policy_year: parseInt(policy_year) || new Date().getFullYear(),
        date_issued: validatedDates.date_issued,
        date_received: validatedDates.date_received,
        insurance_from_date: validatedDates.insurance_from_date,
        insurance_to_date: validatedDates.insurance_to_date,
        model: String(model || '').trim(),
        make: String(make || '').trim(),
        body_type: String(body_type || '').trim(),
        color: String(color || '').trim(),
        mv_file_no: String(mv_file_no || '').trim(),
        plate_no: String(plate_no || '').trim(),
        chassis_no: String(chassis_no || '').trim(),
        motor_no: String(motor_no || '').trim(),
        premium: premiumNum,
        other_charges: otherChargesNum,
        auth_fee: authFeeNum,
        doc_stamps: docStamps,
        e_vat: eVat,
        lgt: lgt,
        total_premium: totalPremium
      }])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      policyId: data[0]?.id
    });
  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating policy',
      error: error.message
    });
  }
});

// READ - Get all policies (excluding soft-deleted)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('id, assured, address, coc_number, or_number, policy_number, policy_type, policy_year, date_issued, date_received, insurance_from_date, insurance_to_date, model, make, body_type, color, mv_file_no, plate_no, chassis_no, motor_no, premium, other_charges, auth_fee, doc_stamps, e_vat, lgt, total_premium, created_at, updated_at')
      .is('deleted_at', null)
      .order('id', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: formatDateFields(data || [])
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching policies',
      error: error.message
    });
  }
});

// READ - Get single policy by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('id, assured, address, coc_number, or_number, policy_number, policy_type, policy_year, date_issued, date_received, insurance_from_date, insurance_to_date, model, make, body_type, color, mv_file_no, plate_no, chassis_no, motor_no, premium, other_charges, auth_fee, doc_stamps, e_vat, lgt, total_premium, created_at, updated_at')
      .eq('id', req.params.id)
      .is('deleted_at', null)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    res.json({
      success: true,
      data: formatDateFields([data])[0]
    });
  } catch (error) {
    console.error('Error fetching policy:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching policy',
      error: error.message
    });
  }
});

// UPDATE - Update existing policy
router.put('/:id', async (req, res) => {
  try {
    const {
      assured, address, coc_number, or_number, policy_number, policy_type,
      policy_year, date_issued, date_received, insurance_from_date, insurance_to_date,
      model, make, body_type, color, mv_file_no, plate_no, chassis_no, motor_no,
      premium, other_charges, doc_stamps, e_vat, lgt, auth_fee, total_premium
    } = req.body;

    // Validate required fields
    if (!assured || !coc_number || !or_number) {
      return res.status(400).json({
        success: false,
        message: 'Error updating policy',
        error: 'Required fields missing: assured, coc_number, or_number'
      });
    }

    const { data, error } = await supabase
      .from('insurance_policies')
      .update({
        assured: String(assured).trim(),
        address: String(address || '').trim(),
        coc_number: String(coc_number).trim(),
        or_number: String(or_number).trim(),
        policy_number: String(policy_number || '').trim(),
        policy_type: String(policy_type || '').trim(),
        policy_year: parseInt(policy_year) || new Date().getFullYear(),
        date_issued: validateDate(date_issued),
        date_received: validateDate(date_received),
        insurance_from_date: validateDate(insurance_from_date),
        insurance_to_date: validateDate(insurance_to_date),
        model: String(model || '').trim(),
        make: String(make || '').trim(),
        body_type: String(body_type || '').trim(),
        color: String(color || '').trim(),
        mv_file_no: String(mv_file_no || '').trim(),
        plate_no: String(plate_no || '').trim(),
        chassis_no: String(chassis_no || '').trim(),
        motor_no: String(motor_no || '').trim(),
        premium: parseFloat(premium) || 0,
        other_charges: parseFloat(other_charges) || 0,
        auth_fee: parseFloat(auth_fee) || 50.40,
        doc_stamps: parseFloat(doc_stamps) || 0,
        e_vat: parseFloat(e_vat) || 0,
        lgt: parseFloat(lgt) || 0,
        total_premium: parseFloat(total_premium) || 0
      })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    res.json({
      success: true,
      message: 'Policy updated successfully'
    });
  } catch (error) {
    console.error('Error updating policy:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating policy',
      error: error.message
    });
  }
});

// DELETE - Soft delete policy
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid policy ID'
      });
    }

    const { data, error } = await supabase
      .from('insurance_policies')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found or already deleted'
      });
    }

    res.json({
      success: true,
      message: 'Policy deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting policy:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting policy',
      error: error.message
    });
  }
});

// READ - Get deleted policies
router.get('/deleted/list', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('insurance_policies')
      .select('id, assured, address, coc_number, or_number, policy_number, policy_type, policy_year, date_issued, date_received, insurance_from_date, insurance_to_date, model, make, body_type, color, mv_file_no, plate_no, chassis_no, motor_no, premium, other_charges, auth_fee, doc_stamps, e_vat, lgt, total_premium, created_at, updated_at')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: formatDateFields(data || [])
    });
  } catch (error) {
    console.error('Error fetching deleted policies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching deleted policies',
      error: error.message
    });
  }
});

// RESTORE - Restore soft-deleted policy
router.put('/:id/restore', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('insurance_policies')
      .update({ deleted_at: null })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    res.json({
      success: true,
      message: 'Policy restored successfully'
    });
  } catch (error) {
    console.error('Error restoring policy:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring policy',
      error: error.message
    });
  }
});

export default router;