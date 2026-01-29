const { verifyAccessToken } = require('../utils/jwt');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401);
    return next(new Error('Missing or invalid Authorization header'));
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyAccessToken(token);
    req.auth = {
      id: payload.sub,
      role: payload.role,
    };
    return next();
  } catch (err) {
    res.status(401);
    return next(new Error('Invalid or expired access token'));
  }
}

module.exports = { authenticate };
