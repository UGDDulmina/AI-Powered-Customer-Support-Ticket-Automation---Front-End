import { useRef, useState } from "react";

import type {
  FormEvent,
  ReactNode,
} from "react";

import { Link } from "react-router-dom";
import axios from "axios";

import {
  Headset,
  User,
  Mail,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Circle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { registerCustomer } from "../api/customerAuth.api";

import type {
  CustomerRegisterFormData,
  CustomerRegisterFormErrors,
  AuthenticatedCustomer,
} from "../types/customerAuth.types";

import {
  validateCustomerRegistration,
  getCustomerPasswordRequirements,
} from "../utils/customerAuthValidation";

const INITIAL_FORM: CustomerRegisterFormData = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

function FormField({
  id,
  label,
  error,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      {children}

      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}

interface PasswordRequirementProps {
  label: string;
  satisfied: boolean;
}

function PasswordRequirement({
  label,
  satisfied,
}: PasswordRequirementProps) {
  return (
    <div className="flex items-center gap-2">
      {satisfied ? (
        <CheckCircle2
          size={15}
          className="shrink-0 text-green-600"
        />
      ) : (
        <Circle
          size={15}
          className="shrink-0 text-gray-400"
        />
      )}

      <span
        className={`text-xs ${
          satisfied
            ? "text-green-700"
            : "text-gray-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function getRegistrationError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Unable to connect to the server. Please try again.";
    }

    const status = error.response.status;

    if (status === 409) {
      return "An account or customer record already exists with this email address.";
    }

    if (status === 422) {
      return "Some registration details are invalid. Please check your information.";
    }

    if (status === 429) {
      return "Too many requests. Please try again later.";
    }

    if (status >= 500) {
      return "A server error occurred. Please try again later.";
    }
  }

  return "Registration failed. Please try again.";
}

export default function CustomerRegisterPage() {
  const [form, setForm] =
    useState<CustomerRegisterFormData>(INITIAL_FORM);

  const [errors, setErrors] =
    useState<CustomerRegisterFormErrors>({});

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [serverError, setServerError] =
    useState("");

  const [registeredCustomer, setRegisteredCustomer] =
    useState<AuthenticatedCustomer | null>(null);

  const submissionLock = useRef(false);

  const requirements = getCustomerPasswordRequirements(
    form.password,
    form.confirmPassword
  );

  const updateField = (
    field: keyof CustomerRegisterFormData,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
      ...(field === "password"
        ? { confirmPassword: undefined }
        : {}),
    }));

    setServerError("");
  };

  const getInputClass = (
    field: keyof CustomerRegisterFormData,
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
      validateCustomerRegistration(form);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    submissionLock.current = true;
    setSubmitting(true);

    try {
      const customer = await registerCustomer({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        password: form.password,
      });

      setRegisteredCustomer(customer);
      setForm(INITIAL_FORM);
      setErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      setServerError(getRegistrationError(error));

      if (
        axios.isAxiosError(error) &&
        error.response?.status === 409
      ) {
        setErrors((previous) => ({
          ...previous,
          email: "This email address is already registered.",
        }));
      }
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  };

  if (registeredCustomer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 size={42} />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Registration Successful
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Welcome, {registeredCustomer.name}. Your customer
            account has been created successfully.
          </p>

          <div className="mt-6 rounded-lg bg-gray-50 p-4 text-left">
            <p className="text-xs text-gray-500">
              Registered email address
            </p>

            <p className="mt-1 break-all text-sm font-medium text-gray-900">
              {registeredCustomer.email}
            </p>
          </div>

          <Link
            to="/customer/login"
            state={{ email: registeredCustomer.email }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Continue to Login
            <ArrowRight size={17} />
          </Link>

          <p className="mt-5 text-xs text-gray-400">
            Sign in to create and manage your support tickets.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-lg">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <Headset size={32} />
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-blue-600">
              Customer Support Portal
            </p>

            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              Create your account
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Register to submit tickets and receive support.
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

              <p className="text-sm leading-relaxed text-red-700">
                {serverError}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-8 space-y-5"
          >
            <FormField
              id="name"
              label="Full Name"
              error={errors.name}
            >
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3.5 top-3.5 text-gray-400"
                />

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  maxLength={100}
                  disabled={submitting}
                  required
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={
                    errors.name ? "name-error" : undefined
                  }
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                  className={getInputClass("name")}
                />
              </div>
            </FormField>

            <FormField
              id="email"
              label="Email Address"
              error={errors.email}
            >
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-3.5 text-gray-400"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
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
                    updateField("email", event.target.value)
                  }
                  className={getInputClass("email")}
                />
              </div>
            </FormField>

            <FormField
              id="phone"
              label="Phone Number (Optional)"
              error={errors.phone}
            >
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3.5 top-3.5 text-gray-400"
                />

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  maxLength={20}
                  disabled={submitting}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={
                    errors.phone ? "phone-error" : undefined
                  }
                  onChange={(event) =>
                    updateField("phone", event.target.value)
                  }
                  className={getInputClass("phone")}
                />
              </div>
            </FormField>

            <FormField
              id="password"
              label="Password"
              error={errors.password}
            >
              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3.5 top-3.5 text-gray-400"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={form.password}
                  maxLength={128}
                  disabled={submitting}
                  required
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password
                      ? "password-error password-requirements"
                      : "password-requirements"
                  }
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  className={getInputClass("password", true)}
                />

                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowPassword((previous) => !previous)
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
            </FormField>

            <FormField
              id="confirmPassword"
              label="Confirm Password"
              error={errors.confirmPassword}
            >
              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3.5 top-3.5 text-gray-400"
                />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  maxLength={128}
                  disabled={submitting}
                  required
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={
                    errors.confirmPassword
                      ? "confirmPassword-error"
                      : undefined
                  }
                  onChange={(event) =>
                    updateField(
                      "confirmPassword",
                      event.target.value
                    )
                  }
                  className={getInputClass(
                    "confirmPassword",
                    true
                  )}
                />

                <button
                  type="button"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </FormField>

            <div
              id="password-requirements"
              className="space-y-2.5 rounded-lg border border-gray-100 bg-gray-50 p-4"
            >
              <p className="mb-3 text-xs font-semibold text-gray-700">
                Password Requirements
              </p>

              <PasswordRequirement
                label="At least 12 characters"
                satisfied={requirements.minimumLength}
              />

              <PasswordRequirement
                label="Maximum 128 characters"
                satisfied={requirements.maximumLength}
              />

              <PasswordRequirement
                label="Cannot contain only whitespace"
                satisfied={requirements.notWhitespace}
              />

              <PasswordRequirement
                label="Passwords must match"
                satisfied={requirements.passwordsMatch}
              />
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
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}

            <Link
              to="/customer/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Sign in
            </Link>
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 border-t border-gray-100 pt-5">
            <ShieldCheck
              size={16}
              className="text-green-600"
            />

            <p className="text-xs text-gray-500">
              Passwords are securely hashed by our server.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          AI-Powered Customer Support System
        </p>
      </div>
    </div>
  );
}