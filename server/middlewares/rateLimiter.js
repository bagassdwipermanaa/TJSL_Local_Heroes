/**
 * Lightweight, zero-dependency in-memory rate limiter to prevent Brute Force & DoS attacks.
 */

class MemoryRateLimiter {
  constructor(windowMs, maxRequests, message) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.message = message || 'Terlalu banyak permintaan. Silakan coba kembali nanti.';
    this.hits = new Map();

    // Auto-cleanup stale entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000).unref();
  }

  getClientKey(req) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';
    return ip;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.hits.entries()) {
      if (now - record.startTime > this.windowMs) {
        this.hits.delete(key);
      }
    }
  }

  middleware() {
    return (req, res, next) => {
      const key = this.getClientKey(req);
      const now = Date.now();
      const record = this.hits.get(key) || { count: 0, startTime: now };

      if (now - record.startTime > this.windowMs) {
        record.count = 1;
        record.startTime = now;
      } else {
        record.count += 1;
      }

      this.hits.set(key, record);

      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - record.count));

      if (record.count > this.maxRequests) {
        const retryAfterSeconds = Math.ceil((record.startTime + this.windowMs - now) / 1000);
        res.setHeader('Retry-After', retryAfterSeconds);
        return res.status(429).json({
          success: false,
          message: `${this.message} (Coba lagi dalam ${Math.ceil(retryAfterSeconds / 60)} menit).`
        });
      }

      next();
    };
  }

  reset(req) {
    const key = this.getClientKey(req);
    this.hits.delete(key);
  }
}

// 1. Anti Brute Force for Login: max 5 attempts per 15 minutes
export const loginLimiter = new MemoryRateLimiter(
  15 * 60 * 1000,
  5,
  'Terlalu banyak percobaan masuk yang gagal demi keamanan akun.'
);

// 2. Anti Spam for Registration: max 10 attempts per 60 minutes
export const registerLimiter = new MemoryRateLimiter(
  60 * 60 * 1000,
  10,
  'Batas pendaftaran akun baru telah tercapai.'
);

// 3. General API protection: max 150 requests per minute
export const generalApiLimiter = new MemoryRateLimiter(
  60 * 1000,
  150,
  'Batas lalu lintas API terlampaui.'
);
