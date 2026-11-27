import type {
  CustomerFormData,
} from "../types/customer.types";

export type CustomerFormErrors =
  Partial<Record<keyof CustomerFormData, string>>;

export const validateCustomerName = (
  name: string
): string => {
  const value = name.trim();

  if (!value) {
    return "Customer name is required.";
  }

  if (value.length < 2) {
    return "Name must contain at least 2 characters.";
  }

  if (value.length > 100) {
    return "Name cannot exceed 100 characters.";
  }

  return "";
};

export const validateCustomerEmail = (
  email: string
): string => {
  const value = email.trim();

  if (!value) {
    return "Email address is required.";
  }

  if (value.length > 255) {
    return "Email cannot exceed 255 characters.";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(value)) {
    return "Enter a valid email address.";
  }

  return "";
};

export const validateCustomerPhone = (
  phone: string
): string => {
  const value = phone.trim();

  if (!value) {
    return "";
  }

  const phonePattern = /^\+?[\d\s()-]+$/;

  if (!phonePattern.test(value)) {
    return "Enter a valid phone number.";
  }

  const digits = value.replace(/\D/g, "");

  if (digits.length < 7 || digits.length > 15) {
    return "Phone number must contain 7 to 15 digits.";
  }

  if (value.length > 30) {
    return "Phone number cannot exceed 30 characters.";
  }

  return "";
};

export const validateCustomerForm = (
  form: CustomerFormData
): CustomerFormErrors => {
  const errors: CustomerFormErrors = {};

  const nameError = validateCustomerName(form.name);
  const emailError = validateCustomerEmail(form.email);
  const phoneError = validateCustomerPhone(form.phone);

  if (nameError) {
    errors.name = nameError;
  }

  if (emailError) {
    errors.email = emailError;
  }

  if (phoneError) {
    errors.phone = phoneError;
  }

  return errors;
};