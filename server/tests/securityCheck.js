import assert from 'assert';
import { hashPassword, verifyPassword } from '../models/userModel.js';
import { sanitizeMiddleware } from '../middlewares/sanitizeMiddleware.js';
import { loginLimiter } from '../middlewares/rateLimiter.js';

// 1. Test Password Hashing Security
const rawPassword = 'SuperSecret@2026';
const { hash, salt } = hashPassword(rawPassword);
assert.notStrictEqual(hash, rawPassword, 'Password must never be stored in plaintext');
assert.strictEqual(hash.length, 128, 'Scrypt hash length must be 128 hex chars');
assert.strictEqual(salt.length, 32, 'Salt must be 32 hex chars');
assert.strictEqual(verifyPassword(rawPassword, hash, salt), true, 'Valid password verification');
assert.strictEqual(verifyPassword("WrongPassword123", hash, salt), false, 'Invalid password rejected');

// 2. Test Input Sanitization (Anti-XSS)
const maliciousReq = {
  body: {
    nama: 'Budi<script>alert("xss")</script>',
    bio: '<iframe src="evil.com"></iframe>Kegiatan TJSL',
    program: 'Program Bersih <a href="javascript:steal()">Klik</a>',
    password: 'KeepMyPasswordSpecial#123<tag>'
  },
  query: {
    search: '<script>document.cookie</script>Pahlawan'
  },
  params: {}
};

sanitizeMiddleware(maliciousReq, {}, () => {});
assert.strictEqual(maliciousReq.body.nama, 'Budi', 'Script tag must be stripped');
assert.strictEqual(maliciousReq.body.bio, 'Kegiatan TJSL', 'Iframe must be stripped');
assert.strictEqual(maliciousReq.body.program, 'Program Bersih <a href="">Klik</a>', 'Javascript: URI must be stripped');
assert.strictEqual(maliciousReq.body.password, 'KeepMyPasswordSpecial#123<tag>', 'Password special characters must be preserved for hashing');
assert.strictEqual(maliciousReq.query.search, 'Pahlawan', 'Query script tag must be stripped');

// 3. Test Anti Brute Force Rate Limiter
const testReq = {
  headers: { 'x-forwarded-for': '192.168.10.99' },
  socket: {}
};
let blocked = false;
const mockRes = {
  setHeader: () => {},
  status: (code) => ({
    json: () => {
      if (code === 429) blocked = true;
    }
  })
};

// Simulate 5 attempts (allowed)
for (let i = 0; i < 5; i++) {
  loginLimiter.middleware()(testReq, mockRes, () => {});
}
assert.strictEqual(blocked, false, 'First 5 attempts should not be blocked');

// 6th attempt must be blocked with 429 Too Many Requests
loginLimiter.middleware()(testReq, mockRes, () => {});
assert.strictEqual(blocked, true, '6th attempt must be blocked by rate limiter');

// Reset rate limiter for the test IP
loginLimiter.reset(testReq);

console.log('All security checks (Sanitization, Brute Force Protection, Password Hashing) passed successfully.');
