const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Every query below filters by BOTH the employee ID and the owner (user) ID,
// so a user can never read, change or delete another user's employee.

// Returns the employee only if it belongs to userId
async function getOwnedEmployee(eid, userId) {
  const employee = await Employee.findOne({ _id: eid, user: userId });
  if (employee) return employee;

  // Not found for this user -> work out whether it exists at all (403) or not (404)
  const existsForSomeoneElse = await Employee.exists({ _id: eid });
  if (existsForSomeoneElse) {
    logger.warn('Authorization failed: cross-user employee access blocked', { userId, employeeId: eid });
    throw new AppError(403, 'Forbidden. This employee belongs to another user.');
  }

  throw new AppError(404, 'Employee not found');
}

async function listEmployees(userId) {
  return Employee.find({ user: userId }).sort({ created_at: -1 });
}

async function createEmployee(userId, data) {
  // Owner is set from the authenticated user, not from the request body
  return Employee.create({ ...data, user: userId });
}

async function updateEmployee(eid, userId, data) {
  const employee = await getOwnedEmployee(eid, userId);
  Object.assign(employee, data);
  await employee.save();
  return employee;
}

async function deleteEmployee(eid, userId) {
  const employee = await getOwnedEmployee(eid, userId);
  await Employee.deleteOne({ _id: employee._id, user: userId });
}

module.exports = {
  getOwnedEmployee,
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee
};