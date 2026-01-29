function errorHandler(err, req, res, next) {
  const isMongoDuplicate = err && (err.code === 11000 || err.code === 11001);
  const status =
    err && err.statusCode
      ? err.statusCode
      : isMongoDuplicate
        ? 409
      : res.statusCode && res.statusCode !== 200
        ? res.statusCode
        : 500;

  res.status(status).json({
    message: isMongoDuplicate ? 'Duplicate value' : err && err.message ? err.message : 'Server error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err && err.stack ? err.stack : null } : {}),
  });
}

module.exports = { errorHandler };
