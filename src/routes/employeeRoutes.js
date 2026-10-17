const express = require('express');
const employeeController = require('../controllers/employeeController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createEmployeeRules,
  getEmployeeRules,
  updateEmployeeRules,
  deleteEmployeeRules
} = require('../validators/employeeValidators');

const router = express.Router();

// Every employee route requires a valid JWT
router.use(authenticate);

router.get('/employees', employeeController.getAllEmployees);
router.post('/employees', createEmployeeRules, validate, employeeController.createEmployee);
router.get('/employees/:eid', getEmployeeRules, validate, employeeController.getEmployeeById);
router.put('/employees/:eid', updateEmployeeRules, validate, employeeController.updateEmployee);
router.delete('/employees', deleteEmployeeRules, validate, employeeController.deleteEmployee);

module.exports = router;