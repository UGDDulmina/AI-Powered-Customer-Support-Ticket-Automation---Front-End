import { useState, useRef } from "react";
import type { FormEvent } from "react";

import { useNavigate } from "react-router-dom";

import {
  UserRound,
  Mail,
  ShieldCheck,
  CircleCheck,
  Fingerprint,
  LockKeyhole,
  Eye,
  EyeOff,
  Save,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";

import {
  validateAgentName,
  validateAgentEmail,
  validateAgentPassword,
  validateConfirmPassword,
} from "../utils/agentValidation";

import { getApiErrorMessage } from "../utils/apiError";

import type {
  AuthenticatedAgent,
  ProfileFormData,
  ChangePasswordFormData,
} from "../types/auth.types";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100";

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  disabled?: boolean;
}

function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
  disabled = false,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          disabled={disabled}
          autoComplete={autoComplete}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`${inputClass} pr-12`}
          placeholder={`Enter ${label.toLowerCase()}`}
        />

        <button
          type="button"
          disabled={disabled}
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-3 text-slate-500 hover:text-slate-800"
        >
          {visible ? (
            <EyeOff size={19} />
          ) : (
            <Eye size={19} />
          )}
        </button>
      </div>
    </label>
  );
}

interface ProfileContentProps {
  user: AuthenticatedAgent;
}

function ProfileContent({
  user,
}: ProfileContentProps) {
  const navigate = useNavigate();

  const {
    updateProfile,
    changePassword,
  } = useAuth();

  const [profile, setProfile] =
    useState<ProfileFormData>({
      name: user.name,
      email: user.email,
      currentPassword: "",
    });

  const [passwords, setPasswords] =
    useState<ChangePasswordFormData>({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [profileError, setProfileError] =
    useState("");

  const [profileSuccess, setProfileSuccess] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const submissionLock = useRef(false);

  const busy = savingProfile || changingPassword;

  const emailChanged =
    profile.email.trim().toLowerCase() !==
    user.email.trim().toLowerCase();

  const profileChanged =
    profile.name.trim() !== user.name ||
    emailChanged;

  const initials =
    user.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase() || "SA";

  const roleLabel =
    user.role === "admin"
      ? "Administrator"
      : "Support Agent";

  const profileFields = [
    {
      label: "Full Name",
      value: user.name,
      icon: UserRound,
    },
    {
      label: "Email Address",
      value: user.email,
      icon: Mail,
    },
    {
      label: "Account ID",
      value: `#${user.id}`,
      icon: Fingerprint,
    },
    {
      label: "Account Role",
      value: roleLabel,
      icon: ShieldCheck,
    },
  ];

  const handleProfileSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      busy ||
      submissionLock.current ||
      !profileChanged
    ) {
      return;
    }

    setProfileError("");
    setProfileSuccess("");

    const nameError =
      validateAgentName(profile.name);

    const emailError =
      validateAgentEmail(profile.email);

    if (nameError || emailError) {
      setProfileError(nameError || emailError);
      return;
    }

    if (profile.name.trim().length > 100) {
      setProfileError(
        "Name cannot exceed 100 characters."
      );
      return;
    }

    if (
      emailChanged &&
      !profile.currentPassword
    ) {
      setProfileError(
        "Enter your current password to change your email."
      );

      return;
    }

    submissionLock.current = true;
    setSavingProfile(true);

    try {
      const updated = await updateProfile({
        name: profile.name.trim(),
        email: profile.email.trim().toLowerCase(),
        ...(emailChanged
          ? {
              current_password:
                profile.currentPassword,
            }
          : {}),
      });

      setProfile({
        name: updated.name,
        email: updated.email,
        currentPassword: "",
      });

      setProfileSuccess(
        "Your profile has been updated successfully."
      );
    } catch (error: unknown) {
      setProfileError(
        getApiErrorMessage(error)
      );
    } finally {
      submissionLock.current = false;
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (busy || submissionLock.current) {
      return;
    }

    setPasswordError("");

    if (!passwords.currentPassword) {
      setPasswordError(
        "Current password is required."
      );

      return;
    }

    const newPasswordError =
      validateAgentPassword(
        passwords.newPassword
      );

    if (newPasswordError) {
      setPasswordError(newPasswordError);
      return;
    }

    const confirmPasswordError =
      validateConfirmPassword(
        passwords.newPassword,
        passwords.confirmPassword
      );

    if (confirmPasswordError) {
      setPasswordError(confirmPasswordError);
      return;
    }

    if (
      passwords.currentPassword ===
      passwords.newPassword
    ) {
      setPasswordError(
        "New password must differ from your current password."
      );

      return;
    }

    submissionLock.current = true;
    setChangingPassword(true);

    try {
      await changePassword({
        current_password:
          passwords.currentPassword,
        new_password:
          passwords.newPassword,
      });

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Password changed successfully. Please log in again.",
        },
      });
    } catch (error: unknown) {
      setPasswordError(
        getApiErrorMessage(error)
      );
    } finally {
      submissionLock.current = false;
      setChangingPassword(false);
    }
  };

  const resetProfile = () => {
    setProfile({
      name: user.name,
      email: user.email,
      currentPassword: "",
    });

    setProfileError("");
    setProfileSuccess("");
  };

  const resetPasswords = () => {
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordError("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your personal information and account security.
        </p>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="h-28 bg-gradient-to-r from-blue-700 to-indigo-600" />

        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-wrap items-end gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-blue-100 text-3xl font-semibold text-blue-700">
              {initials}
            </div>

            <div className="min-w-0 pb-1">
              <h2 className="break-words text-xl font-bold text-slate-900">
                {user.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {roleLabel}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                user.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <CircleCheck size={15} />

              {user.is_active
                ? "Active Account"
                : "Inactive Account"}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {profileFields.map((field) => {
              const Icon = field.icon;

              return (
                <div
                  key={field.label}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Icon size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">
                      {field.label}
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                      {field.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 p-6">
          <div className="rounded-lg bg-blue-100 p-3">
            <UserRound
              size={22}
              className="text-blue-600"
            />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update your name and email address.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleProfileSubmit}
          className="space-y-5 p-6"
        >
          {profileError && (
            <div
              role="alert"
              className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle
                size={19}
                className="shrink-0"
              />

              {profileError}
            </div>
          )}

          {profileSuccess && (
            <div
              role="status"
              className="flex items-center gap-3 rounded-lg bg-green-50 p-4 text-sm text-green-700"
            >
              <CheckCircle2
                size={19}
                className="shrink-0"
              />

              {profileSuccess}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Full Name
              </span>

              <input
                type="text"
                value={profile.name}
                maxLength={100}
                disabled={busy}
                autoComplete="name"
                onChange={(event) =>
                  setProfile((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Email Address
              </span>

              <input
                type="email"
                value={profile.email}
                maxLength={255}
                disabled={busy}
                autoComplete="email"
                onChange={(event) =>
                  setProfile((previous) => ({
                    ...previous,
                    email: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </label>
          </div>

          {emailChanged && (
            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
                <ShieldCheck size={18} />

                Verify your identity
              </div>

              <p className="text-sm text-amber-700">
                Changing your email requires your current password.
                Your new email will be used for future logins.
              </p>

              <PasswordInput
                label="Current Password"
                value={profile.currentPassword}
                autoComplete="current-password"
                disabled={busy}
                onChange={(value) =>
                  setProfile((previous) => ({
                    ...previous,
                    currentPassword: value,
                  }))
                }
              />
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              disabled={busy}
              onClick={resetProfile}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={busy || !profileChanged}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingProfile ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Save size={17} />
              )}

              {savingProfile
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 p-6">
          <div className="rounded-lg bg-green-100 p-3">
            <LockKeyhole
              size={22}
              className="text-green-600"
            />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Account Security
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Change your account password.
            </p>
          </div>
        </div>

        <form
          onSubmit={handlePasswordSubmit}
          className="space-y-5 p-6"
        >
          {passwordError && (
            <div
              role="alert"
              className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle
                size={19}
                className="shrink-0"
              />

              {passwordError}
            </div>
          )}

          <div className="max-w-xl">
            <PasswordInput
              label="Current Password"
              value={passwords.currentPassword}
              autoComplete="current-password"
              disabled={busy}
              onChange={(value) =>
                setPasswords((previous) => ({
                  ...previous,
                  currentPassword: value,
                }))
              }
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <PasswordInput
              label="New Password"
              value={passwords.newPassword}
              autoComplete="new-password"
              disabled={busy}
              onChange={(value) =>
                setPasswords((previous) => ({
                  ...previous,
                  newPassword: value,
                }))
              }
            />

            <PasswordInput
              label="Confirm New Password"
              value={passwords.confirmPassword}
              autoComplete="new-password"
              disabled={busy}
              onChange={(value) =>
                setPasswords((previous) => ({
                  ...previous,
                  confirmPassword: value,
                }))
              }
            />
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">
              Password Requirements
            </h3>

            <div className="mt-3 space-y-2">
              {[
                {
                  label: "At least 12 characters",
                  valid:
                    passwords.newPassword.length >= 12,
                },
                {
                  label: "Maximum 128 characters",
                  valid:
                    passwords.newPassword.length > 0 &&
                    passwords.newPassword.length <= 128,
                },
                {
                  label: "Not empty or only spaces",
                  valid: Boolean(
                    passwords.newPassword.trim()
                  ),
                },
                {
                  label: "Different from current password",
                  valid:
                    Boolean(passwords.newPassword) &&
                    passwords.newPassword !==
                      passwords.currentPassword,
                },
                {
                  label: "Passwords match",
                  valid:
                    Boolean(passwords.confirmPassword) &&
                    passwords.newPassword ===
                      passwords.confirmPassword,
                },
              ].map((requirement) => (
                <div
                  key={requirement.label}
                  className={`flex items-center gap-2 text-sm ${
                    requirement.valid
                      ? "text-green-700"
                      : "text-slate-500"
                  }`}
                >
                  <CircleCheck size={16} />

                  {requirement.label}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <p className="text-sm text-amber-800">
              After changing your password, you will be logged
              out of this session and must log in using your
              new password.
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              disabled={busy}
              onClick={resetPasswords}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={
                busy ||
                !passwords.currentPassword ||
                !passwords.newPassword ||
                !passwords.confirmPassword
              }
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {changingPassword ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <LockKeyhole size={17} />
              )}

              {changingPassword
                ? "Changing Password..."
                : "Change Password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function AgentProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || !user.is_active) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Profile information is unavailable.
      </div>
    );
  }

  return (
    <ProfileContent
      key={user.id}
      user={user}
    />
  );
}