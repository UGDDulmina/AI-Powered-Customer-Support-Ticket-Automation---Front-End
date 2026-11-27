import type {
  AdminTicketCreateForm,
} from "../types/adminTicket.types";

export type TicketFormErrors = Partial<
  Record<keyof AdminTicketCreateForm, string>
>;

export const validateTicketSubject = (
  subject: string
): string => {
  const value = subject.trim();

  if (!value) {
    return "Subject is required.";
  }

  if (value.length < 3) {
    return "Subject must contain at least 3 characters.";
  }

  if (value.length > 200) {
    return "Subject cannot exceed 200 characters.";
  }

  return "";
};

export const validateTicketDescription = (
  description: string
): string => {
  const value = description.trim();

  if (!value) {
    return "Description is required.";
  }

  if (value.length < 10) {
    return "Description must contain at least 10 characters.";
  }

  return "";
};

export const validateTicketForm = (
  form: AdminTicketCreateForm
): TicketFormErrors => {
  const errors: TicketFormErrors = {};

  const customerId = Number(form.customerId);

  if (
    !form.customerId ||
    !Number.isSafeInteger(customerId) ||
    customerId <= 0
  ) {
    errors.customerId = "Please select a customer.";
  }

  const subjectError = validateTicketSubject(
    form.subject
  );

  if (subjectError) {
    errors.subject = subjectError;
  }

  const descriptionError = validateTicketDescription(
    form.description
  );

  if (descriptionError) {
    errors.description = descriptionError;
  }

  if (form.category.trim().length > 50) {
    errors.category =
      "Category cannot exceed 50 characters.";
  }

  const validPriorities = [
    "low",
    "medium",
    "high",
    "urgent",
  ];

  if (!validPriorities.includes(form.priority)) {
    errors.priority = "Please select a valid priority.";
  }

  return errors;
};