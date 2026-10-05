import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Lock, Save, Trash2, User, Mail, Shield } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
} from "../services/auth";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { focusRing } from "../components/ui/styles";

function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const isVerified = user.email_verified;

  const [profile, setProfile] = useState({
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
  });

  const [isSaving, setIsSaving] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const isAvatarBusy = isUploadingAvatar || isRemovingAvatar;

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const avatarSrc = avatarPreview || user.avatar || null;

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }));
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setIsUploadingAvatar(true);

    try {
      await uploadAvatar(file);
      await refreshUser();
      showSuccess("Avatar updated.");
    } catch (err) {
      showError(err.message);
    } finally {
      setIsUploadingAvatar(false);
      setAvatarPreview(null);
      URL.revokeObjectURL(previewUrl);
    }
  }

  async function handleAvatarReset() {
    setIsRemovingAvatar(true);

    try {
      await deleteAvatar();
      await refreshUser();
      showSuccess("Avatar reset to default.");
    } catch (err) {
      showError(err.message);
    } finally {
      setIsRemovingAvatar(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setIsSaving(true);

    try {
      await updateProfile({
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email,
      });

      await refreshUser();

      showSuccess("Profile updated.");
    } catch (err) {
      showError(err.message);
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
      showError(err.message);
      setIsSavingPassword(false);
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Profile
        </h1>

        <p className="mt-1 text-sm text-text-muted">
          Manage your personal information and account.
        </p>
      </div>

      <div className="mt-8 max-w-3xl">
        {/* Avatar */}
        <Card>
          <div>
            <h2 className="text-base font-semibold text-white">
              Profile picture
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              Choose a profile picture for your account.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-5">
            <div className="relative">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt=""
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
                  aria-label="Change profile picture"
                  className={`absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border-default bg-surface text-text-muted transition hover:bg-white/[0.06] hover:text-white ${focusRing}`}
                >
                  <Camera size={15} />

                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={isAvatarBusy}
                    className="hidden"
                  />
                </label>
              ) : (
                <div
                  role="img"
                  aria-label="Verify your email to change your avatar"
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-border-default bg-surface text-text-faint"
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

              <p className="mt-1 text-xs text-text-muted">
                {isVerified
                  ? isUploadingAvatar
                    ? "Uploading..."
                    : isRemovingAvatar
                      ? "Removing..."
                      : "JPG, PNG or WebP. Maximum 5 MB."
                  : "Verify your email to change your avatar."}
              </p>

              {isVerified && user.avatar && (
                <button
                  type="button"
                  onClick={handleAvatarReset}
                  disabled={isAvatarBusy}
                  className={`mt-2 flex items-center gap-1.5 rounded text-xs font-medium text-text-muted transition hover:text-danger disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                >
                  <Trash2 size={13} />
                  {isRemovingAvatar ? "Removing..." : "Reset to default"}
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Personal information */}
        <Card className="mt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-control bg-white/[0.04]">
              <User size={18} className="text-slate-300" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-white">
                Personal information
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                Update your personal details.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6">
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="First name"
                id="firstName"
                name="firstName"
                type="text"
                value={profile.firstName}
                onChange={handleChange}
                required
              />

              <Input
                label="Last name"
                id="lastName"
                name="lastName"
                type="text"
                value={profile.lastName}
                onChange={handleChange}
                required
              />

              <Input
                label="Email address"
                id="email"
                name="email"
                type="email"
                icon={Mail}
                value={profile.email}
                onChange={handleChange}
                required
                wrapperClassName="md:col-span-2"
              />
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-border-default pt-5">
              <p className="text-xs text-text-faint">
                Your information will be securely stored.
              </p>

              <Button type="submit" disabled={isSaving}>
                <Save size={16} />
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Security */}
        <Card className="mt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-control bg-white/[0.04]">
              <Shield size={18} className="text-slate-300" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-white">Security</h2>

              <p className="mt-1 text-sm text-text-muted">
                Manage your account security.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border-default pt-5">
            <div>
              <p className="text-sm font-medium text-white">Password</p>

              <p className="mt-1 text-xs text-text-muted">
                {isVerified
                  ? "Change your account password."
                  : "Verify your email to change your password."}
              </p>
            </div>

            {isVerified && (
              <Button
                variant="secondary"
                onClick={() => setIsChangingPassword((current) => !current)}
              >
                {isChangingPassword ? "Cancel" : "Change password"}
              </Button>
            )}

            {!isVerified && (
              <div
                role="img"
                aria-label="Verify your email to change your password"
                className="flex items-center gap-2 rounded-control border border-border-default bg-surface-inset px-4 py-2.5 text-sm font-medium text-text-faint"
              >
                <Lock size={14} />
                Change password
              </div>
            )}
          </div>

          {isVerified && isChangingPassword && (
            <form
              onSubmit={handlePasswordSubmit}
              className="mt-5 space-y-4 border-t border-border-default pt-5"
            >
              <Input
                label="Current password"
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordFieldChange}
                required
                autoComplete="current-password"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="New password"
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordFieldChange}
                  required
                  autoComplete="new-password"
                />

                <Input
                  label="Confirm new password"
                  id="newPasswordConfirm"
                  name="newPasswordConfirm"
                  type="password"
                  value={passwordForm.newPasswordConfirm}
                  onChange={handlePasswordFieldChange}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-text-faint">
                  You'll be signed out and asked to log in again.
                </p>

                <Button type="submit" disabled={isSavingPassword}>
                  {isSavingPassword ? "Saving..." : "Save new password"}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

export default Profile;
