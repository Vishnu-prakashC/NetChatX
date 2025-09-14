// Minimal API client using fetch
const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:5000';

export const getAuthToken = () => {
  try {
    return localStorage.getItem('chat_jwt_token');
  } catch {
    return null;
  }
};

export const setAuthToken = (token) => {
  try {
    if (token) localStorage.setItem('chat_jwt_token', token);
  } catch {}
};

export const clearAuth = () => {
  try {
    localStorage.removeItem('chat_jwt_token');
  } catch {}
};

const authHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleUnauthorized = async () => {
  try { localStorage.removeItem('chat_current_user'); } catch {}
  clearAuth();
  try { window.location.href = '/'; } catch {}
};

async function handleHttpResponse(res) {
  if (res.status === 401) {
    await handleUnauthorized();
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function apiPost(path, body, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
    body: JSON.stringify(body || {}),
    credentials: 'include',
  });
  return handleHttpResponse(res);
}

export async function apiGet(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
    credentials: 'include',
  });
  return handleHttpResponse(res);
}

// Auth
export async function login(identifier, password) {
  const data = await apiPost('/api/auth/login', { identifier, password });
  return data?.data;
}

export async function register({ username, email, password, displayName }) {
  const data = await apiPost('/api/auth/register', { username, email, password, displayName });
  return data?.data;
}

// Messages
export async function getRoomMessages(roomId, { limit = 50, before } = {}) {
  const qs = new URLSearchParams();
  if (limit) qs.set('limit', String(limit));
  if (before) qs.set('before', before instanceof Date ? before.toISOString() : String(before));
  const data = await apiGet(`/api/messages/${encodeURIComponent(roomId)}${qs.toString() ? `?${qs.toString()}` : ''}`);
  return data?.data?.messages || [];
}

export async function sendRoomMessage(roomId, { text, messageType = 'text', replyTo } = {}) {
  const data = await apiPost(`/api/messages/${encodeURIComponent(roomId)}`, { text, messageType, replyTo });
  return data?.data?.message;
}

export default {
  login,
  register,
  getRoomMessages,
  sendRoomMessage,
  getAuthToken,
  setAuthToken,
  clearAuth,
};


