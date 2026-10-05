const API_URL = import.meta.env.VITE_API_URL;

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let refreshPromise = null;

function getCookie(name) {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`),
  );

  return match ? decodeURIComponent(match[1]) : null;
}

function buildHeaders(method, extraHeaders, isFormData) {
  const headers = {
    // Let the browser set "multipart/form-data; boundary=..." itself -
    // a manually-set Content-Type here would be missing the boundary.
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
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
  const isFormData = options.body instanceof FormData;

  return fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    method,
    headers: buildHeaders(method, options.headers, isFormData),
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

// DRF returns {"detail": "..."} for most errors, but field-level
// validation errors (e.g. avatar upload) come back as
// {"field_name": ["message"]} instead.
function extractErrorMessage(data) {
  if (!data) {
    return "Something went wrong.";
  }

  if (data.detail) {
    return data.detail;
  }

  const firstFieldErrors = Object.values(data)[0];

  if (Array.isArray(firstFieldErrors) && firstFieldErrors.length > 0) {
    return firstFieldErrors[0];
  }

  return "Something went wrong.";
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
    throw new Error(extractErrorMessage(data));
  }

  return data;
}

export default apiRequest;
