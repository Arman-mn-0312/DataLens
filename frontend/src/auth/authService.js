const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      clearStoredToken();
    }
    throw new Error(payload?.message || 'Authentication request failed.');
  }

  return payload;
}

export function getStoredToken() {
  try {
    return localStorage.getItem('datalens_auth_token');
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    localStorage.setItem('datalens_auth_token', token);
  } catch {
    // ignore storage issues
  }
}

export function clearStoredToken() {
  try {
    localStorage.removeItem('datalens_auth_token');
  } catch {
    // ignore storage issues
  }
  window.dispatchEvent(new CustomEvent('datalens:auth-expired'));
}

export async function registerUser({ name, email, password }) {
  return requestJson('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
}

export async function loginUser({ email, password }) {
  return requestJson('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function logoutUser() {
  try {
    const token = getStoredToken();
    if (token) {
      await requestJson('/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  } catch {
    // Ignore logout errors and clear local state.
  }
  clearStoredToken();
  return { success: true };
}

export async function getCurrentUser(token = getStoredToken()) {
  if (!token) {
    return null;
  }

  const payload = await requestJson('/auth/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });

  return payload?.user || null;
}

export function startGoogleLogin() {
  window.location.href = `${API_BASE_URL}/auth/google/login`;
}

export default API_BASE_URL;
