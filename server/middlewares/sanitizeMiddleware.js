/**
 * Universal Input Sanitization Middleware to prevent XSS (Cross-Site Scripting)
 * Preserves password fields as-is so valid special characters can be hashed securely.
 */

const EXCLUDED_KEYS = new Set(['password', 'confirmPassword', 'currentPassword', 'password_hash', 'salt']);

function sanitizeValue(value, key = '') {
  if (typeof value === 'string') {
    if (EXCLUDED_KEYS.has(key)) {
      return value;
    }
    // Strip dangerous tags, script/iframe/object, javascript: URIs and event handlers
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/javascript:[^"']*/gi, '')
      .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/<\/?(?:script|iframe|style|link|meta|object|embed|applet)\b[^>]*>/gi, '')
      .trim();
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, key));
  }

  if (value !== null && typeof value === 'object') {
    const sanitizedObj = {};
    for (const [subKey, subVal] of Object.entries(value)) {
      sanitizedObj[subKey] = sanitizeValue(subVal, subKey);
    }
    return sanitizedObj;
  }

  return value;
}

export function sanitizeMiddleware(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params);
  }
  next();
}
