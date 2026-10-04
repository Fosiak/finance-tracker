import apiRequest from "./api";

export async function login(username, password) {
  await apiRequest("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
    }),
  });

  return fetchProfile();
}

export async function register(userData) {
  return apiRequest("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function logout() {
  return apiRequest("/api/auth/logout/", {
    method: "POST",
  });
}

export async function fetchProfile() {
  return apiRequest("/api/auth/profile/");
}
