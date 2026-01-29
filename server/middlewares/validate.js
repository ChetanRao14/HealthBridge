const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  res.status(400);
  return next(new Error(result.array().map((e) => e.msg).join(', ')));
}

module.exports = { validate };
