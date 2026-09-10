import { useState } from "react";
import { Camera, Save, User, Mail, Shield } from "lucide-react";

function Profile() {
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
  });

  const [avatar, setAvatar] = useState(null);
  const [saved, setSaved] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }));

    setSaved(false);
  }

  function handleAvatarChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setAvatar(imageUrl);
    setSaved(false);
  }

  function handleSubmit(event) {
    event.preventDefault();

    setSaved(true);
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
              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-2xl font-semibold text-black">
                  {profile.firstName.charAt(0)}
                  {profile.lastName.charAt(0)}
                </div>
              )}

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
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                {profile.firstName} {profile.lastName}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                JPG, PNG or WebP. Maximum 5 MB.
              </p>
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
                className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                <Save size={16} />
                Save changes
              </button>
            </div>

            {saved && (
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
                Change your account password.
              </p>
            </div>

            <button
              type="button"
              className="rounded-lg border border-[#292929] bg-[#111111] px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-[#222222] hover:text-white"
            >
              Change password
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Profile;
