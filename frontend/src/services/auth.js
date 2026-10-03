import apiRequest from "./api";

export async function login(username, password) {
  return apiRequest("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
    }),
  });
}

export async function register(userData) {
  return apiRequest("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}