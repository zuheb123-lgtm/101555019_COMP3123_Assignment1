const { body, param, query, checkExact } = require('express-validator');

const UNKNOWN_FIELDS_MSG = 'Unknown field(s) in request';

// Builds the validation rules for the employee fields.
// isUpdate = true  -> every field is optional (PUT can update only some fields)
// isUpdate = false -> every field is required (POST)
const employeeFieldRules = (isUpdate) => {
  const start = (field, label) => {
    const chain = body(field);
    return isUpdate
      ? chain.optional()
      : chain.exists({ values: 'falsy' }).withMessage(`${label} is required`).bail();
  };

  const textField = (field, label, max) =>
    start(field, label)
      .isString().withMessage(`${label} must be a string`).bail()
      .trim()
      .notEmpty().withMessage(`${label} cannot be empty`)
      .isLength({ max }).withMessage(`${label} must be at most ${max} characters`);

  return [
    textField('first_name', 'First name', 50),
    textField('last_name', 'Last name', 50),

    start('email', 'Email')
      .isString().withMessage('Email must be a string').bail()
      .trim()
      .isEmail().withMessage('Email must be a valid email address')
      .isLength({ max: 100 }).withMessage('Email must be at most 100 characters')
      .toLowerCase(),

    textField('position', 'Position', 100),

    start('salary', 'Salary')
      .isFloat({ gt: 0, max: 10000000 }).withMessage('Salary must be a positive number')
      .toFloat(),

    start('date_of_joining', 'Date of joining')
      .isISO8601({ strict: true }).withMessage('Date of joining must be a valid date (YYYY-MM-DD)').bail()
      .custom((value) => {
        if (new Date(value) > new Date()) {
          throw new Error('Date of joining cannot be in the future');
        }
        return true;
      })
      .toDate(),

    textField('department', 'Department', 100)
  ];
};

const eidParam = param('eid')
  .isMongoId().withMessage('Invalid employee ID');

// POST /api/v1/emp/employees
exports.createEmployeeRules = checkExact(employeeFieldRules(false), { message: UNKNOWN_FIELDS_MSG });

// GET /api/v1/emp/employees/:eid
exports.getEmployeeRules = [eidParam];

// PUT /api/v1/emp/employees/:eid
exports.updateEmployeeRules = checkExact([eidParam, ...employeeFieldRules(true)], { message: UNKNOWN_FIELDS_MSG });

// DELETE /api/v1/emp/employees?eid=xxx
exports.deleteEmployeeRules = [
  query('eid')
    .exists({ values: 'falsy' }).withMessage('Employee ID (eid) query parameter is required').bail()
    .isMongoId().withMessage('Invalid employee ID')
];
