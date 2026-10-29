/**
 * Athenaeum Library Management System
 * Authentication Service
 * 
 * Handles real REST communication with the Spring Boot backend (/api/auth).
 * Manages session-scoped token and user storage securely without persistent localStorage exposure.
 */

const AUTH_STORAGE_KEY = 'athenaeum_auth_session';

import { buildApiUrl } from './apiConfig.js';

/**
 * Sends authentication credentials to the backend endpoint: POST /api/auth/login
 * 
 * @param {Object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @returns {Promise<{token: string, tokenType: string, expiresInMs: number, user: Object}>}
 */
export async function login({ email, password }) {
  if (!email || !password) {
    throw new Error('Both email and password are required.');
  }

  const payload = {
    email: email.trim().toLowerCase(),
    password: password,
  };

  let response;
  try {
    response = await fetch(buildApiUrl('/api/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (networkError) {
    throw new Error(
      'Unable to connect to the Athenaeum authentication server. Please ensure the backend service is running on port 8080.'
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(data?.message || 'Invalid institutional email or password.');
    }
    if (response.status === 400 && data?.validationErrors) {
      const details = Object.values(data.validationErrors).join('; ');
      throw new Error(details || data?.message || 'Invalid request data.');
    }
    if (response.status === 403) {
      throw new Error('Access denied: your account is inactive or restricted.');
    }
    throw new Error(
      data?.message || `Authentication failed with status code ${response.status}.`
    );
  }

  if (!data?.token || !data?.user) {
    throw new Error('Malformed authentication response received from server.');
  }

  // Store in session-scoped storage
  setStoredAuth(data);

  return data;
}

// In-memory storage fallback for Node.js test runners or environments where sessionStorage is undefined
let memorySessionStorage = null;

function getStorage() {
  if (typeof sessionStorage !== 'undefined') {
    return sessionStorage;
  }
  if (!memorySessionStorage) {
    const store = new Map();
    memorySessionStorage = {
      getItem: (key) => store.get(key) || null,
      setItem: (key, val) => store.set(key, String(val)),
      removeItem: (key) => store.delete(key),
      clear: () => store.clear(),
    };
  }
  return memorySessionStorage;
}

/**
 * Determines whether a session object or JWT token is expired or invalid.
 * 
 * @param {Object} session
 * @returns {boolean}
 */
export function isSessionExpired(session) {
  if (!session || !session.token || !session.user) {
    return true;
  }

  // 1. Check stored expiresInMs if provided and positive
  if (session.expiresInMs && typeof session.expiresInMs === 'number' && session.expiresInMs > 0) {
    const storedAt = session.storedAt || 0;
    if (storedAt > 0 && Date.now() - storedAt >= session.expiresInMs) {
      return true;
    }
  }

  // 2. Decode embedded JWT expiration claim
  try {
    const parts = String(session.token).split('.');
    if (parts.length !== 3) {
      // Tokens in this system are Spring Security JWTs; non-3-part tokens are malformed/invalid
      return true;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    
    let jsonString;
    if (typeof atob === 'function') {
      jsonString = atob(padded);
    } else if (typeof Buffer !== 'undefined') {
      jsonString = Buffer.from(padded, 'base64').toString('utf-8');
    }

    if (jsonString) {
      const payload = JSON.parse(jsonString);
      if (payload.exp && typeof payload.exp === 'number') {
        // exp claim is in seconds
        if (Date.now() >= payload.exp * 1000) {
          return true;
        }
      }
    }
  } catch {
    // If token parsing fails, treat as malformed/expired
    return true;
  }

  return false;
}

/**
 * Retrieves the current session-scoped authentication record.
 * Uses sessionStorage so credentials do not persist beyond the active browser tab.
 * Safely purges expired sessions.
 * 
 * @returns {{token: string, tokenType: string, expiresInMs: number, user: Object} | null}
 */
export function getStoredAuth() {
  try {
    const storage = getStorage();
    const raw = storage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.token && parsed.user) {
      if (isSessionExpired(parsed)) {
        clearStoredAuth();
        return null;
      }
      return parsed;
    }
    clearStoredAuth();
    return null;
  } catch {
    clearStoredAuth();
    return null;
  }
}

/**
 * Saves authenticated session data.
 * Does NOT store raw passwords.
 * 
 * @param {Object} authData
 */
export function setStoredAuth(authData) {
  try {
    const storage = getStorage();
    const sessionData = {
      token: authData.token,
      tokenType: authData.tokenType || 'Bearer',
      expiresInMs: authData.expiresInMs,
      user: authData.user,
      storedAt: Date.now(),
    };
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
  } catch (e) {
    console.warn('Session storage write failed:', e);
  }
}

/**
 * Clears stored authentication session.
 */
export function clearStoredAuth() {
  try {
    const storage = getStorage();
    storage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Ignore in restricted environments
  }
}

/**
 * Verifies active token against backend /api/users/me.
 * Clears session and returns null if the server reports the token is invalid/expired.
 * 
 * @returns {Promise<Object|null>}
 */
export async function fetchCurrentUser() {
  const auth = getStoredAuth();
  if (!auth?.token) {
    return null;
  }

  let response;
  try {
    response = await fetch(buildApiUrl('/api/users/me'), {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    // Return cached user if network is unreachable
    return auth.user;
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearStoredAuth();
      return null;
    }
    return auth.user;
  }

  const userData = await response.json().catch(() => null);
  if (userData && userData.email) {
    setStoredAuth({ ...auth, user: userData });
    return userData;
  }

  return auth.user;
}

/**
 * Returns Authorization header with Bearer token if user is authenticated.
 * 
 * @returns {Object}
 */
export function getAuthHeaders() {
  const auth = getStoredAuth();
  if (auth?.token) {
    return {
      'Authorization': `${auth.tokenType || 'Bearer'} ${auth.token}`,
      'Content-Type': 'application/json',
    };
  }
  return {
    'Content-Type': 'application/json',
  };
}

/**
 * Sends a registration request for a new reader account: POST /api/auth/register
 * 
 * @param {Object} registrationData
 * @param {string} registrationData.fullName
 * @param {string} registrationData.email
 * @param {string} registrationData.password
 * @returns {Promise<Object>}
 */
export async function register({ fullName, email, password }) {
  const payload = {
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    password: password,
  };

  let response;
  try {
    response = await fetch(buildApiUrl('/api/auth/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (networkError) {
    throw new Error(
      'Unable to connect to the Athenaeum registration server. Please verify backend availability.'
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error(data?.message || 'An account with this email address already exists.');
    }
    if (response.status === 400 && data?.validationErrors) {
      const details = Object.values(data.validationErrors).join('; ');
      throw new Error(details || data?.message || 'Validation failed.');
    }
    throw new Error(data?.message || 'Registration failed.');
  }

  return data;
}

