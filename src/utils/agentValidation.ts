import type {
  AgentRegistrationFormData,
} from "../types/agent.types";


export type AgentRegistrationErrors =
  Partial<
    Record<
      keyof AgentRegistrationFormData,
      string
    >
  >;

export const validateAgentName = (
  name: string
): string => {

  const value = name.trim();

  if (!value) {
    return "Full name is required.";
  }

  if (value.length < 2) {
    return "Name must contain at least 2 characters.";
  }

  if (value.length > 150) {
    return "Name cannot exceed 150 characters.";
  }

  return "";
};


 

export const validateAgentEmail = (
  email: string
): string => {

  const value = email.trim();

  if (!value) {
    return "Email address is required.";
  }

  if (value.length > 255) {
    return "Email cannot exceed 255 characters.";
  }

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(value)) {
    return "Enter a valid email address.";
  }

  return "";
};


 

export const validateAgentPassword = (
  password: string
): string => {

  if (!password) {
    return "Password is required.";
  }

  if (password.length < 12) {
    return "Password must contain at least 12 characters.";
  }

  if (password.length > 128) {
    return "Password cannot exceed 128 characters.";
  }

  if (!password.trim()) {
    return "Password cannot contain only spaces.";
  }

  return "";
};


 

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): string => {

  if (!confirmPassword) {
    return "Please confirm the password.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return "";
};


 

export const validateAgentRegistration = (
  form: AgentRegistrationFormData
): AgentRegistrationErrors => {

  const errors: AgentRegistrationErrors = {};

  const nameError =
    validateAgentName(form.name);

  const emailError =
    validateAgentEmail(form.email);

  const passwordError =
    validateAgentPassword(form.password);

  const confirmPasswordError =
    validateConfirmPassword(
      form.password,
      form.confirmPassword
    );


  if (nameError) {
    errors.name = nameError;
  }

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  if (confirmPasswordError) {
    errors.confirmPassword =
      confirmPasswordError;
  }

  return errors;
};