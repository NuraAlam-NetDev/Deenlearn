import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { ACCESS_COOKIE, verifyAccessToken } from '../utils/tokens.js';

// Requires a valid access-token cookie; attaches the fresh user to req.user.
export const protect = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) throw httpError(401, 'Not authenticated');

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    // Client should call POST /api/auth/refresh, then retry
    throw httpError(401, 'Access token invalid or expired');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw httpError(401, 'User no longer exists');

  req.user = user;
  next();
});
// Like protect(), but never rejects: guests just continue without req.user.
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (user) req.user = user;
  } catch {
    // Invalid or expired token: treat as guest
  }
  next();
});

// Use after protect(): authorize('teacher', 'admin')
export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(httpError(401, 'Not authenticated'));
    if (!roles.includes(req.user.role)) {
      return next(httpError(403, 'You do not have permission to do this'));
    }
    next();
  };
