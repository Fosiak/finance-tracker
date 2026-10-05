import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Lock, Save, User, Mail, Shield } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { updateProfile, uploadAvatar, changePassword } from "../services/auth";

function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const isVerified = user.email_verified;

  const [profile, setProfile] = useState({
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
  });

  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const avatarSrc = avatarPreview || user.avatar || null;

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }));

    setSaved(false);
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setAvatarError("");

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setIsUploadingAvatar(true);

    try {
      await uploadAvatar(file);
      await refreshUser();
    } catch (err) {
      setAvatarError(err.message);
    } finally {
      setIsUploadingAvatar(false);
      setAvatarPreview(null);
      URL.revokeObjectURL(previewUrl);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setIsSaving(true);

    try {
      await updateProfile({
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email,
      });

      await refreshUser();

      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  function handlePasswordFieldChange(event) {
    const { name, value } = event.target;

    setPasswordForm((current) => ({ ...current, [name]: value }));
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    setPasswordError("");
    setIsSavingPassword(true);

    try {
      await changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        new_password_confirm: passwordForm.newPasswordConfirm,
      });

      // Changing your password blacklists existing sessions server-side,
      // so send them back to log in again with the new one.
      await logout();

      navigate("/auth", {
        state: {
          message: "Password changed. Please log in again.",
        },
      });
    } catch (err) {
      setPasswordError(err.message);
      setIsSavingPassword(false);
    }
  }

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Profile
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Manage your personal information and account.
        </p>
      </div>

      <div className="mt-8 max-w-3xl">
        {/* Avatar */}
        <section className="rounded-xl border border-[#292929] bg-[#181818] p-6">
          <div>
            <h2 className="text-base font-semibold text-white">
              Profile picture
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Choose a profile picture for your account.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-5">
            <div className="relative">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-2xl font-semibold text-black">
                  {(profile.firstName || user.username).charAt(0).toUpperCase()}
                  {profile.lastName.charAt(0).toUpperCase()}
                </div>
              )}

              {isVerified ? (
                <label
                  htmlFor="avatar"
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#292929] bg-[#222222] text-zinc-300 transition hover:bg-[#2a2a2a] hover:text-white"
                >
                  <Camera size={15} />

                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={isUploadingAvatar}
                    className="hidden"
                  />
                </label>
              ) : (
                <div
                  title="Verify your email to change your avatar"
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-[#292929] bg-[#222222] text-zinc-600"
                >
                  <Lock size={14} />
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                {profile.firstName || profile.lastName
                  ? `${profile.firstName} ${profile.lastName}`.trim()
                  : user.username}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {isVerified
                  ? isUploadingAvatar
                    ? "Uploading..."
                    : "JPG, PNG or WebP. Maximum 5 MB."
                  : "Verify your email to change your avatar."}
              </p>

              {avatarError && (
                <p role="alert" className="mt-1 text-xs text-red-400">
                  {avatarError}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Personal information */}
        <section className="mt-6 rounded-xl border border-[#292929] bg-[#181818] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#222222]">
              <User size={18} className="text-zinc-300" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-white">
                Personal information
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Update your personal details.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6">
            <div className="grid gap-5 md:grid-cols-2">
              {/* First name */}
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  First name
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={profile.firstName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-[#292929] bg-[#111111] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
                />
              </div>

              {/* Last name */}
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Last name
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={profile.lastName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-[#292929] bg-[#111111] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-[#292929] bg-[#111111] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#292929] pt-5">
              <p className="text-xs text-zinc-600">
                Your information will be securely stored.
              </p>

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={16} />
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>

            {error && (
              <p role="alert" className="mt-4 text-right text-xs text-red-400">
                {error}
              </p>
            )}

            {saved && !error && (
              <p className="mt-4 text-right text-xs text-zinc-400">
                Changes saved successfully.
              </p>
            )}
          </form>
        </section>

        {/* Security */}
        <section className="mt-6 rounded-xl border border-[#292929] bg-[#181818] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#222222]">
              <Shield size={18} className="text-zinc-300" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-white">Security</h2>

              <p className="mt-1 text-sm text-zinc-500">
                Manage your account security.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-[#292929] pt-5">
            <div>
              <p className="text-sm font-medium text-white">Password</p>

              <p className="mt-1 text-xs text-zinc-600">
                {isVerified
                  ? "Change your account password."
                  : "Verify your email to change your password."}
              </p>
            </div>

            {isVerified && (
              <button
                type="button"
                onClick={() => setIsChangingPassword((current) => !current)}
                className="rounded-lg border border-[#292929] bg-[#111111] px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-[#222222] hover:text-white"
              >
                {isChangingPassword ? "Cancel" : "Change password"}
              </button>
            )}

            {!isVerified && (
              <div
                title="Verify your email to change your password"
                className="flex items-center gap-2 rounded-lg border border-[#292929] bg-[#111111] px-4 py-2.5 text-sm font-medium text-zinc-600"
              >
                <Lock size={14} />
                Change password
              </div>
            )}
          </div>

          {isVerified && isChangingPassword && (
            <form
              onSubmit={handlePasswordSubmit}
              className="mt-5 space-y-4 border-t border-[#292929] pt-5"
            >
              <div>
                <label
                  htmlFor="currentPassword"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Current password
                </label>

                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordFieldChange}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-[#292929] bg-[#111111] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                  >
                    New password
                  </label>

                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordFieldChange}
                    required
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-[#292929] bg-[#111111] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPasswordConfirm"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                  >
                    Confirm new password
                  </label>

                  <input
                    id="newPasswordConfirm"
                    name="newPasswordConfirm"
                    type="password"
                    value={passwordForm.newPasswordConfirm}
                    onChange={handlePasswordFieldChange}
                    required
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-[#292929] bg-[#111111] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-zinc-600">
                  You'll be signed out and asked to log in again.
                </p>

                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingPassword ? "Saving..." : "Save new password"}
                </button>
              </div>

              {passwordError && (
                <p role="alert" className="text-right text-xs text-red-400">
                  {passwordError}
                </p>
              )}
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

export default Profile;
