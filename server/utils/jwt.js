const jwt = require('jsonwebtoken');

function signAccessToken({ sub, role }) {
  if (!process.env.JWT_ACCESS_SECRET) throw new Error('JWT_ACCESS_SECRET is required');

  return jwt.sign(
    { role },
    process.env.JWT_ACCESS_SECRET,
    {
      subject: String(sub),
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    }
  );
}

function signRefreshToken({ sub, role }) {
  if (!process.env.JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET is required');

  return jwt.sign(
    { role },
    process.env.JWT_REFRESH_SECRET,
    {
      subject: String(sub),
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie('refreshToken', {
    path: '/api/auth/refresh',
  });
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
};
