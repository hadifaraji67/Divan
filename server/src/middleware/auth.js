import jwt from 'jsonwebtoken';
import { config } from '../config.js';

/**
 * ساخت توکن JWT
 */
export function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn || '30d' }
  );
}

/**
 * بررسی توکن (middleware)
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'توکن احراز هویت لازم است' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'توکن منقضی شده — دوباره وارد شوید' });
    }
    return res.status(401).json({ error: 'توکن نامعتبر است' });
  }
}

/**
 * بررسی نقش (RBAC)
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'احراز هویت لازم است' });
    }
    if (!roles.includes(req.user.role) && req.user.role !== 'admin') {
      return res.status(403).json({
        error: `دسترسی رد شد — نقش لازم: ${roles.join(' یا ')}`,
      });
    }
    next();
  };
}
