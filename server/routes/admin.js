// server/routes/admin.js
const express = require('express');
const router = express.Router();
const { 
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserRole,
  setUserActiveStatus,
  getCompanies,
  getCompanyById,
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
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', changeUserRole);
router.put('/users/:id/status', setUserActiveStatus);

// Company management routes
router.get('/companies', getCompanies),
router.get('companies/:id', getCompanyById),
router.post('/companies', createCompany);
router.put('/companies/:id', updateCompany);
router.delete('/companies/:id', deleteCompany);

module.exports = router;
