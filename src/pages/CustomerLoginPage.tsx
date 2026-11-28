import { useRef, useState } from "react";
import type { FormEvent } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  Headset,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import {
  useCustomerAuth,
} from "../hooks/useCustomerAuth";

import type {
  CustomerLoginFormData,
  CustomerLoginFormErrors,
} from "../types/customerAuth.types";

import {
  validateCustomerLogin,
} from "../utils/customerAuthValidation";

function getLoginError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Unable to connect to the server. Please try again.";
    }

    const status = error.response.status;

    if (status === 401) {
      return "Invalid email or password.";
    }

    if (status === 403) {
      return "You are not authorized to access the customer portal.";
    }

    if (status === 422) {
      return "Please enter valid login credentials.";
    }

    if (status === 429) {
      return "Too many login attempts. Please try again later.";
    }

    if (status >= 500) {
      return "A server error occurred. Please try again later.";
    }
  }

  return "Unable to sign in. Please try again.";
}

function getSafeRedirect(value: unknown): string {
  if (typeof value !== "string") {
    return "/customer/dashboard";
  }

  if (
    !value.startsWith("/customer/") ||
    value.includes("\\") ||
    value.startsWith("//")
  ) {
    return "/customer/dashboard";
  }

  const pathname = value.split("?")[0];

  const allowedRoutes = [
    "/customer/dashboard",
    "/customer/tickets",
    "/customer/tickets/create",
    "/customer/profile",
  ];

  if (
    allowedRoutes.includes(pathname) ||
    /^\/customer\/tickets\/[1-9]\d*$/.test(pathname)
  ) {
    return value;
  }

  return "/customer/dashboard";
}

export default function CustomerLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useCustomerAuth();

  const registeredEmail =
    typeof location.state?.email === "string"
      ? location.state.email
      : "";

  const redirectPath = getSafeRedirect(
    location.state?.from
  );

  const [form, setForm] =
    useState<CustomerLoginFormData>({
      email: registeredEmail,
      password: "",
    });

  const [errors, setErrors] =
    useState<CustomerLoginFormErrors>({});

  const [showPassword, setShowPassword] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [serverError, setServerError] =
    useState("");

  const submissionLock = useRef(false);

  const updateField = (
    field: keyof CustomerLoginFormData,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));

    setServerError("");
  };

  const getInputClass = (
    field: keyof CustomerLoginFormData,
    passwordField = false
  ) => {
    return `w-full rounded-lg border bg-white py-3 pl-11 ${
      passwordField ? "pr-12" : "pr-4"
    } text-sm text-gray-900 outline-none transition placeholder:text-gray-400 disabled:bg-gray-50 ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    }`;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (submissionLock.current) {
      return;
    }

    setServerError("");

    const validationErrors =
      validateCustomerLogin(form);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    submissionLock.current = true;
    setSubmitting(true);

    try {
      await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      setForm((previous) => ({
        ...previous,
        password: "",
      }));

      navigate(redirectPath, {
        replace: true,
      });
    } catch (error) {
      setServerError(getLoginError(error));

      setForm((previous) => ({
        ...previous,
        password: "",
      }));

      setShowPassword(false);
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <Headset size={32} />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-blue-600">
              Customer Support Portal
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Sign in to manage your support tickets.
            </p>
          </div>

          {serverError && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4"
            >
              <AlertCircle
                size={19}
                className="shrink-0 text-red-600"
              />

              <p className="text-sm text-red-700">
                {serverError}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-8 space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-3.5 text-gray-400"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@example.com"
                  value={form.email}
                  maxLength={255}
                  disabled={submitting}
                  required
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "email-error" : undefined
                  }
                  onChange={(event) =>
                    updateField(
                      "email",
                      event.target.value
                    )
                  }
                  className={getInputClass("email")}
                />
              </div>

              {errors.email && (
                <p
                  id="email-error"
                  className="mt-1.5 text-xs text-red-600"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3.5 top-3.5 text-gray-400"
                />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword ? "text" : "password"
                  }
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  maxLength={128}
                  disabled={submitting}
                  required
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password
                      ? "password-error"
                      : undefined
                  }
                  onChange={(event) =>
                    updateField(
                      "password",
                      event.target.value
                    )
                  }
                  className={getInputClass(
                    "password",
                    true
                  )}
                />

                <button
                  type="button"
                  disabled={submitting}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.password && (
                <p
                  id="password-error"
                  className="mt-1.5 text-xs text-red-600"
                >
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />

                  Signing In...
                </>
              ) : (
                <>
                  Sign In

                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}

            <Link
              to="/customer/register"
              className="font-semibold text-blue-600 hover:underline"
            >
              Register now
            </Link>
          </p>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="mb-3 text-center text-xs text-gray-500">
              Administrator or support agent?
            </p>

            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ShieldCheck size={17} />

              Staff Login
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          AI-Powered Customer Support System
        </p>
      </div>
    </div>
  );
}