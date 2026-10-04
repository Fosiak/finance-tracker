const API_URL = import.meta.env.VITE_API_URL;

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let refreshPromise = null;

function getCookie(name) {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`),
  );

  return match ? decodeURIComponent(match[1]) : null;
}

function buildHeaders(method, extraHeaders) {
  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  if (UNSAFE_METHODS.has(method)) {
    const csrfToken = getCookie("csrftoken");

    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }
  }

  return headers;
}

async function rawFetch(endpoint, options) {
  const method = (options.method || "GET").toUpperCase();

  return fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    method,
    headers: buildHeaders(method, options.headers),
  });
}

// SECURITY: so the backend's double-submit CSRF check has a token to
// compare against. Call this once on app boot, before anything else
// writes data.
export async function ensureCsrfCookie() {
  await fetch(`${API_URL}/api/auth/csrf/`, {
    credentials: "include",
  });
}

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = rawFetch("/api/auth/refresh/", {
      method: "POST",
    }).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function apiRequest(endpoint, options = {}) {
  let response = await rawFetch(endpoint, options);

  if (response.status === 401 && !options._isRetry) {
    const refreshResponse = await refreshAccessToken();

    if (refreshResponse.ok) {
      response = await rawFetch(endpoint, {
        ...options,
        _isRetry: true,
      });
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || "Something went wrong.");
  }

  return data;
}

export default apiRequest;
