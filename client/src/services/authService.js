import { API_BASE } from '../config';

const TOKEN_KEY = 'pln_tjsl_auth_token';
const USER_KEY = 'pln_tjsl_auth_user';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(token, user) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.warn('[authService] LocalStorage error:', err);
  }
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (err) {
    console.warn('[authService] LocalStorage error:', err);
  }
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.');
  }

  setStoredSession(data.data.token, data.data.user);
  return data.data;
}

export async function registerUser({ nama, email, password, role, nip }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nama, email, password, role, nip })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Gagal mendaftar akun.');
  }

  setStoredSession(data.data.token, data.data.user);
  return data.data;
}

export async function fetchCurrentUser() {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      clearStoredSession();
      return null;
    }

    const data = await res.json();
    if (data.success && data.data?.user) {
      setStoredSession(token, data.data.user);
      return data.data.user;
    }
    return null;
  } catch {
    return getStoredUser();
  }
}

export async function logoutUser() {
  const token = getStoredToken();
  try {
    if (token) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
    }
  } catch (err) {
    console.warn('[authService] Logout error:', err);
  } finally {
    clearStoredSession();
  }
}
