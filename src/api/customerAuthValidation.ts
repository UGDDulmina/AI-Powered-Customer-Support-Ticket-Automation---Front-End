import type {
  CustomerRegisterFormData,
  CustomerRegisterFormErrors,
  CustomerLoginFormData,
  CustomerLoginFormErrors,
} from "../types/customerAuth.types";

export const CUSTOMER_PASSWORD_MIN_LENGTH = 12;
export const CUSTOMER_PASSWORD_MAX_LENGTH = 128;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateCustomerRegistration = (
  form: CustomerRegisterFormData
): CustomerRegisterFormErrors => {
  const errors: CustomerRegisterFormErrors = {};

  const name = form.name.trim();
  const email = form.email.trim();
  const phone = form.phone.trim();

  if (!name) {
    errors.name = "Full name is required.";
  } else if (name.length < 2) {
    errors.name = "Full name must contain at least 2 characters.";
  } else if (name.length > 100) {
    errors.name = "Full name cannot exceed 100 characters.";
  }

  if (!email) {
    errors.email = "Email address is required.";
  } else if (email.length > 255) {
    errors.email = "Email address cannot exceed 255 characters.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (phone.length > 20) {
    errors.phone = "Phone number cannot exceed 20 characters.";
  }

  if (!form.password) {
    errors.password = "Password is required.";
  } else if (
    form.password.length < CUSTOMER_PASSWORD_MIN_LENGTH
  ) {
    errors.password =
      "Password must contain at least 12 characters.";
  } else if (
    form.password.length > CUSTOMER_PASSWORD_MAX_LENGTH
  ) {
    errors.password =
      "Password cannot exceed 128 characters.";
  } else if (!form.password.trim()) {
    errors.password =
      "Password cannot contain only whitespace.";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
};

export const validateCustomerLogin = (
  form: CustomerLoginFormData
): CustomerLoginFormErrors => {
  const errors: CustomerLoginFormErrors = {};

  const email = form.email.trim();

  if (!email) {
    errors.email = "Email address is required.";
  } else if (
    email.length > 255 ||
    !EMAIL_PATTERN.test(email)
  ) {
    errors.email = "Enter a valid email address.";
  }

  if (!form.password) {
    errors.password = "Password is required.";
  } else if (
    form.password.length > CUSTOMER_PASSWORD_MAX_LENGTH
  ) {
    errors.password =
      "Password cannot exceed 128 characters.";
  }

  return errors;
};

export const getCustomerPasswordRequirements = (
  password: string,
  confirmPassword: string
) => {
  return {
    minimumLength:
      password.length >= CUSTOMER_PASSWORD_MIN_LENGTH,

    maximumLength:
      password.length > 0 &&
      password.length <= CUSTOMER_PASSWORD_MAX_LENGTH,

    notWhitespace:
      password.trim().length > 0,

    passwordsMatch:
      password.length > 0 &&
      confirmPassword.length > 0 &&
      password === confirmPassword,
  };
};