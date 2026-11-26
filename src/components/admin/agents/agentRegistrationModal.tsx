import {
  useState,
  useEffect,
  useRef,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  UserPlus,
  X,
  UserRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import { createPortal } from "react-dom";

import axios from "axios";

import {
  registerAgent,
} from "../../../api/agents.api";

import type {
  AgentRegistrationFormData,
  AgentRegistrationResponse,
} from "../../../types/agent.types";

import {
  validateAgentRegistration,
} from "../../../utils/agentValidation";

import type {
  AgentRegistrationErrors,
} from "../../../utils/agentValidation";

import {
  getApiErrorMessage,
} from "../../../utils/apiError";


interface AgentRegistrationModalProps {
  onClose: () => void;
  onSuccess: (
    agent: AgentRegistrationResponse
  ) => void;
}


const initialForm: AgentRegistrationFormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};


const AgentRegistrationModal = ({
  onClose,
  onSuccess,
}: AgentRegistrationModalProps) => {


  // Registration form state

  const [form, setForm] =
    useState<AgentRegistrationFormData>(
      initialForm
    );


  // Validation errors

  const [errors, setErrors] =
    useState<AgentRegistrationErrors>({});


  // API submission state

  const [submitting, setSubmitting] =
    useState(false);

  const [apiError, setApiError] =
    useState("");


  // Password visibility

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);


  // Prevent duplicate submissions

  const submittingRef = useRef(false);


  // Modal and input references

  const modalRef =
    useRef<HTMLDivElement>(null);

  const nameInputRef =
    useRef<HTMLInputElement>(null);


  // Focus management and keyboard handling

  useEffect(() => {

    const previousFocus =
      document.activeElement as HTMLElement | null;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    nameInputRef.current?.focus();


    const handleKeyDown = (
      event: KeyboardEvent
    ) => {

      if (
        event.key === "Escape" &&
        !submittingRef.current
      ) {

        onClose();

      }


      // Keep keyboard focus inside the modal

      if (event.key === "Tab") {

        const elements =
          modalRef.current
            ?.querySelectorAll<HTMLElement>(
              'button:not([disabled]), ' +
              'input:not([disabled]), ' +
              'select:not([disabled]), ' +
              'textarea:not([disabled]), ' +
              '[tabindex="0"]'
            );

        if (!elements?.length) {
          event.preventDefault();
          modalRef.current?.focus();
          return;
        }

        const first = elements[0];

        const last =
          elements[elements.length - 1];

        if (
          event.shiftKey &&
          (
            document.activeElement === first ||
            !modalRef.current?.contains(
              document.activeElement
            )
          )
        ) {

          event.preventDefault();

          last.focus();

        } else if (
          !event.shiftKey &&
          (
            document.activeElement === last ||
            !modalRef.current?.contains(
              document.activeElement
            )
          )
        ) {

          event.preventDefault();

          first.focus();

        }

      }

    };


    document.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      previousFocus?.focus();

    };

  }, [onClose]);


  // Update form fields

  const handleChange = (
    field: keyof AgentRegistrationFormData,
    value: string
  ) => {

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));


    // Clear related validation errors

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,

      ...(field === "password"
        ? { confirmPassword: undefined }
        : {}),
    }));

    setApiError("");

  };


  // Input styling

  const getInputClass = (
    field: keyof AgentRegistrationFormData
  ): string => {

    return `
      w-full rounded-lg border
      bg-white py-2.5 pl-10 pr-4
      text-sm text-slate-800
      outline-none transition-colors
      disabled:bg-slate-100

      ${
        errors[field]
          ? "border-red-400 focus:ring-2 focus:ring-red-100"
          : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      }
    `;

  };


  // Submit registration form

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    if (submittingRef.current) {
      return;
    }

    setApiError("");


    // Validate input

    const validationErrors =
      validateAgentRegistration(form);

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors).length > 0
    ) {

      return;

    }


    // Submit API request

    submittingRef.current = true;

    setSubmitting(true);

    let registeredAgent:
      AgentRegistrationResponse;

    try {

      registeredAgent = await registerAgent({

        name: form.name.trim(),

        email: form.email
          .trim()
          .toLowerCase(),

        password: form.password,

        role: "agent",

      });

    } catch (error: unknown) {

      if (
        axios.isAxiosError(error) &&
        error.response?.status === 409
      ) {

        setErrors({
          email:
            "An account with this email already exists.",
        });

      } else {

        setApiError(
          getApiErrorMessage(error)
        );

      }

      return;

    } finally {

      submittingRef.current = false;

      setSubmitting(false);

    }


    // Clear sensitive form data

    setForm(initialForm);


    // Notify parent after successful registration

    onSuccess(registeredAgent);

  };


  return createPortal(

    <div className="fixed inset-0 z-50
                    flex items-center
                    justify-center
                    bg-slate-900/50 p-4">

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-agent-title"
        tabIndex={-1}
        className="max-h-[90vh] w-full
                   max-w-lg overflow-y-auto
                   rounded-2xl bg-white
                   shadow-2xl outline-none"
      >

        {/* Modal header */}

        <div className="flex items-center
                        justify-between
                        gap-4 border-b
                        border-slate-100 p-6">

          <div className="flex
                          items-center gap-3">

            <div className="rounded-xl
                            bg-blue-50 p-3
                            text-blue-600">

              <UserPlus size={25} />

            </div>

            <div>

              <h2
                id="register-agent-title"
                className="text-xl
                           font-semibold
                           text-slate-900"
              >

                Register New Agent

              </h2>

              <p className="mt-1 text-xs
                            text-slate-500">

                Create a support agent account

              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close registration form"
            className="rounded-lg p-2
                       text-slate-400
                       hover:bg-slate-100
                       hover:text-slate-700
                       disabled:opacity-50"
          >

            <X size={22} />

          </button>

        </div>


        <form
          onSubmit={handleSubmit}
          noValidate
          aria-busy={submitting}
        >

          <div className="space-y-5 p-6">


            {/* API error */}

            {apiError && (

              <div
                role="alert"
                className="flex items-start
                           gap-3 rounded-lg
                           border border-red-200
                           bg-red-50 p-3
                           text-sm text-red-700"
              >

                <AlertCircle
                  size={19}
                  className="shrink-0"
                />

                <span>{apiError}</span>

              </div>

            )}


            {/* Full name */}

            <div>

              <label
                htmlFor="agent-name"
                className="mb-2 block
                           text-sm font-medium
                           text-slate-700"
              >

                Full Name *

              </label>

              <div className="relative">

                <UserRound
                  size={18}
                  className="absolute left-3
                             top-1/2
                             -translate-y-1/2
                             text-slate-400"
                />

                <input
                  ref={nameInputRef}
                  id="agent-name"
                  type="text"
                  autoComplete="off"
                  required
                  maxLength={150}
                  value={form.name}
                  disabled={submitting}
                  aria-invalid={!!errors.name}
                  aria-describedby={
                    errors.name
                      ? "agent-name-error"
                      : undefined
                  }
                  onChange={(event) =>
                    handleChange(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Enter agent's full name"
                  className={getInputClass("name")}
                />

              </div>

              {errors.name && (

                <p
                  id="agent-name-error"
                  role="alert"
                  className="mt-1 text-xs
                             text-red-600"
                >

                  {errors.name}

                </p>

              )}

            </div>


            {/* Email address */}

            <div>

              <label
                htmlFor="agent-email"
                className="mb-2 block
                           text-sm font-medium
                           text-slate-700"
              >

                Email Address *

              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-3
                             top-1/2
                             -translate-y-1/2
                             text-slate-400"
                />

                <input
                  id="agent-email"
                  type="email"
                  autoComplete="off"
                  required
                  maxLength={255}
                  value={form.email}
                  disabled={submitting}
                  aria-invalid={!!errors.email}
                  aria-describedby={
                    errors.email
                      ? "agent-email-error"
                      : undefined
                  }
                  onChange={(event) =>
                    handleChange(
                      "email",
                      event.target.value
                    )
                  }
                  placeholder="agent@example.com"
                  className={getInputClass("email")}
                />

              </div>

              {errors.email && (

                <p
                  id="agent-email-error"
                  role="alert"
                  className="mt-1 text-xs
                             text-red-600"
                >

                  {errors.email}

                </p>

              )}

            </div>


            {/* Password */}

            <div>

              <label
                htmlFor="agent-password"
                className="mb-2 block
                           text-sm font-medium
                           text-slate-700"
              >

                Password *

              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-3
                             top-1/2
                             -translate-y-1/2
                             text-slate-400"
                />

                <input
                  id="agent-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  required
                  minLength={12}
                  maxLength={128}
                  value={form.password}
                  disabled={submitting}
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password
                      ? "agent-password-error"
                      : "agent-password-help"
                  }
                  onChange={(event) =>
                    handleChange(
                      "password",
                      event.target.value
                    )
                  }
                  placeholder="Minimum 12 characters"
                  className={
                    `${getInputClass("password")} !pr-11`
                  }
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
                  className="absolute right-3
                             top-1/2
                             -translate-y-1/2
                             text-slate-400
                             hover:text-slate-700"
                >

                  {showPassword
                    ? <EyeOff size={18} />
                    : <Eye size={18} />}

                </button>

              </div>

              {errors.password ? (

                <p
                  id="agent-password-error"
                  role="alert"
                  className="mt-1 text-xs
                             text-red-600"
                >

                  {errors.password}

                </p>

              ) : (

                <p
                  id="agent-password-help"
                  className="mt-1 text-xs
                             text-slate-500"
                >

                  Use at least 12 characters.
                  Choose a unique, strong password.

                </p>

              )}

            </div>


            {/* Confirm password */}

            <div>

              <label
                htmlFor="agent-confirm-password"
                className="mb-2 block
                           text-sm font-medium
                           text-slate-700"
              >

                Confirm Password *

              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-3
                             top-1/2
                             -translate-y-1/2
                             text-slate-400"
                />

                <input
                  id="agent-confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  required
                  maxLength={128}
                  value={form.confirmPassword}
                  disabled={submitting}
                  aria-invalid={
                    !!errors.confirmPassword
                  }
                  aria-describedby={
                    errors.confirmPassword
                      ? "agent-confirm-password-error"
                      : undefined
                  }
                  onChange={(event) =>
                    handleChange(
                      "confirmPassword",
                      event.target.value
                    )
                  }
                  placeholder="Re-enter password"
                  className={
                    `${getInputClass("confirmPassword")} !pr-11`
                  }
                />

                <button
                  type="button"
                  disabled={submitting}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  className="absolute right-3
                             top-1/2
                             -translate-y-1/2
                             text-slate-400
                             hover:text-slate-700"
                >

                  {showConfirmPassword
                    ? <EyeOff size={18} />
                    : <Eye size={18} />}

                </button>

              </div>

              {errors.confirmPassword && (

                <p
                  id="agent-confirm-password-error"
                  role="alert"
                  className="mt-1 text-xs
                             text-red-600"
                >

                  {errors.confirmPassword}

                </p>

              )}

            </div>


            {/* Account information */}

            <div className="rounded-xl
                            border border-slate-100
                            bg-slate-50 p-4">

              <div className="mb-3 flex
                              items-center gap-2">

                <ShieldCheck
                  size={20}
                  className="text-blue-600"
                />

                <h3 className="text-sm
                               font-semibold
                               text-slate-700">

                  Account Information

                </h3>

              </div>


              <div className="space-y-2
                              text-sm">

                <div className="flex
                                justify-between">

                  <span className="text-slate-500">

                    Role

                  </span>

                  <span className="font-medium
                                   text-slate-700">

                    Support Agent

                  </span>

                </div>


                <div className="flex
                                justify-between">

                  <span className="text-slate-500">

                    Initial Status

                  </span>

                  <span className="font-medium
                                   text-green-600">

                    Active

                  </span>

                </div>

              </div>


              <p className="mt-3 text-xs
                            text-slate-500">

                The agent can log in using the
                registered email and password
                after successful registration.

              </p>

            </div>

          </div>


          {/* Modal footer */}

          <div className="flex flex-wrap
                          justify-end gap-3
                          border-t
                          border-slate-100
                          bg-slate-50 p-5">

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border
                         border-slate-200
                         bg-white px-5 py-2.5
                         text-sm font-medium
                         text-slate-700
                         hover:bg-slate-100
                         disabled:opacity-50"
            >

              Cancel

            </button>


            <button
              type="submit"
              disabled={submitting}
              className="flex items-center
                         justify-center gap-2
                         rounded-lg bg-blue-600
                         px-5 py-2.5 text-sm
                         font-medium text-white
                         hover:bg-blue-700
                         disabled:cursor-not-allowed
                         disabled:opacity-60"
            >

              {submitting ? (

                <>

                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />

                  Registering...

                </>

              ) : (

                <>

                  <UserPlus size={18} />

                  Register Agent

                </>

              )}

            </button>

          </div>

        </form>

      </div>

    </div>,

    document.body

  );

};


export default AgentRegistrationModal;