const { matchedData } = require('express-validator');
const employeeService = require('../services/employeeService');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

// GET /api/v1/emp/employees  ->  200 (only the logged-in user's employees)
exports.getAllEmployees = asyncHandler(async (req, res) => {
  const employees = await employeeService.listEmployees(req.user.id);

  res.status(200).json({
    success: true,
    count: employees.length,
    employees
  });
});

// POST /api/v1/emp/employees  ->  201
exports.createEmployee = asyncHandler(async (req, res) => {
  // Only the validated employee fields are used
  const data = matchedData(req, { locations: ['body'] });
  const employee = await employeeService.createEmployee(req.user.id, data);

  logger.info('Employee created', { userId: req.user.id, employeeId: employee._id.toString() });

  res.status(201).json({
    success: true,
    message: 'Employee created successfully',
    employee
  });
});

// GET /api/v1/emp/employees/:eid  ->  200
exports.getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await employeeService.getOwnedEmployee(req.params.eid, req.user.id);

  res.status(200).json({
    success: true,
    employee
  });
});

// PUT /api/v1/emp/employees/:eid  ->  200
exports.updateEmployee = asyncHandler(async (req, res) => {
  const data = matchedData(req, { locations: ['body'] });

  if (Object.keys(data).length === 0) {
    throw new AppError(400, 'At least one employee field must be provided to update');
  }

  const employee = await employeeService.updateEmployee(req.params.eid, req.user.id, data);

  logger.info('Employee updated', { userId: req.user.id, employeeId: employee._id.toString() });

  res.status(200).json({
    success: true,
    message: 'Employee updated successfully',
    employee
  });
});

// DELETE /api/v1/emp/employees?eid=xxx  ->  204 No Content
exports.deleteEmployee = asyncHandler(async (req, res) => {
  const { eid } = req.query;
  await employeeService.deleteEmployee(eid, req.user.id);

  logger.info('Employee deleted', { userId: req.user.id, employeeId: eid });

  res.status(204).send();
});
