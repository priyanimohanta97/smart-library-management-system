/**
 * Athenaeum Library Management System
 * Authentication Service
 * 
 * Handles real REST communication with the Spring Boot backend (/api/auth).
 * Manages session-scoped token and user storage securely without persistent localStorage exposure.
 */

const AUTH_STORAGE_KEY = 'athenaeum_auth_session';

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
    response = await fetch('/api/auth/login', {
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

/**
 * Retrieves the current session-scoped authentication record.
 * Uses sessionStorage so credentials do not persist beyond the active browser tab.
 * 
 * @returns {{token: string, tokenType: string, user: Object} | null}
 */
export function getStoredAuth() {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.token && parsed.user) {
      return parsed;
    }
    return null;
  } catch {
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
    const sessionData = {
      token: authData.token,
      tokenType: authData.tokenType || 'Bearer',
      expiresInMs: authData.expiresInMs,
      user: authData.user,
      storedAt: Date.now(),
    };
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
  } catch (e) {
    console.warn('Session storage write failed:', e);
  }
}

/**
 * Clears stored authentication session.
 */
export function clearStoredAuth() {
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Ignore in restricted environments
  }
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
    response = await fetch('/api/auth/register', {
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

