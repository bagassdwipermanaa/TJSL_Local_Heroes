import assert from 'assert';
import { hashPassword, verifyPassword, generateToken } from '../models/userModel.js';

// 1. Password hash & verify
const testPass = 'PlnHero2026!';
const { hash, salt } = hashPassword(testPass);
assert(hash && hash.length === 128, 'Hash must be 128 hex chars');
assert(salt && salt.length === 32, 'Salt must be 32 hex chars');

const isValid = verifyPassword(testPass, hash, salt);
assert.strictEqual(isValid, true, 'Valid password verification should be true');

const isWrong = verifyPassword('WrongPassword123', hash, salt);
assert.strictEqual(isWrong, false, 'Invalid password verification should be false');

// 2. Token generation
const token1 = generateToken();
const token2 = generateToken();
assert(token1 && token1.length === 64, 'Token must be 64 hex chars');
// 3. Password Complexity Rule Checks
function checkComplexity(pass) {
  return pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass);
}
assert.strictEqual(checkComplexity('PlnHero2026!'), true, 'Should accept valid complex password');
assert.strictEqual(checkComplexity('weakpass'), false, 'Should reject weak password');
assert.strictEqual(checkComplexity('NoNumber!'), false, 'Should reject password without numbers');
assert.strictEqual(checkComplexity('nocapital123!'), false, 'Should reject password without uppercase');
assert.strictEqual(checkComplexity('NoSymbol1234'), false, 'Should reject password without symbol');

console.log('All auth assertions passed successfully.');
