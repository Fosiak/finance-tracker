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

export async function updateProfile(data) {
  return apiRequest("/api/auth/profile/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function resendVerificationEmail() {
  return apiRequest("/api/auth/resend-verification/", {
    method: "POST",
  });
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);

  return apiRequest("/api/auth/profile/avatar/", {
    method: "PATCH",
    body: formData,
  });
}

export async function deleteAvatar() {
  return apiRequest("/api/auth/profile/avatar/", {
    method: "DELETE",
  });
}

export async function changePassword(data) {
  return apiRequest("/api/auth/change-password/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function requestPasswordReset(email) {
  return apiRequest("/api/auth/password-reset/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function confirmPasswordReset({
  uid,
  token,
  newPassword,
  newPasswordConfirm,
}) {
  return apiRequest("/api/auth/password-reset-confirm/", {
    method: "POST",
    body: JSON.stringify({
      uid,
      token,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    }),
  });
}

export async function deleteAccount(password) {
  return apiRequest("/api/auth/delete-account/", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}
