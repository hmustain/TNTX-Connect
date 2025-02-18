// server/routes/admin.js
const express = require('express');
const router = express.Router();
const { 
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  changeUserRole,
  setUserActiveStatus,
  createCompany,
  updateCompany,
  deleteCompany 
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All admin routes are protected and require the admin role.
router.use(protect, authorize('admin'));

// User management routes
router.post('/users', createUser);
router.get('/users', getUsers); // New endpoint to get all users
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', changeUserRole);
router.put('/users/:id/status', setUserActiveStatus);

// Company management routes
router.post('/companies', createCompany);
router.put('/companies/:id', updateCompany);
router.delete('/companies/:id', deleteCompany);

module.exports = router;
