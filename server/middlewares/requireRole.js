function requireRole(...roles) {
  return function roleGuard(req, res, next) {
    if (!req.auth || !req.auth.role) {
      res.status(401);
      return next(new Error('Not authenticated'));
    }

    if (!roles.includes(req.auth.role)) {
      res.status(403);
      return next(new Error('Forbidden'));
    }

    return next();
  };
}

module.exports = { requireRole };
