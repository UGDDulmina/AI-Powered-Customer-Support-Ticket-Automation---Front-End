import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";

import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  AlertTriangle,
  LoaderCircle,
} from "lucide-react";

import { resetAgentPassword } from "../../../api/agents.api";

import type { Agent } from "../../../types/agent.types";

import {
  validateAgentPassword,
  validateConfirmPassword,
} from "../../../utils/agentValidation";

import {
  getApiErrorMessage,
} from "../../../utils/apiError";


interface AgentPasswordResetModalProps {
  agent: Agent;
  onClose: () => void;
  onSuccess: (agent: Agent) => void;
}


const AgentPasswordResetModal = ({
  agent,
  onClose,
  onSuccess,
}: AgentPasswordResetModalProps) => {

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const [confirmError, setConfirmError] =
    useState("");

  const [apiError, setApiError] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const submittingRef = useRef(false);

  const dialogRef =
    useRef<HTMLDialogElement>(null);


  // Open native modal

  useEffect(() => {

    const dialog = dialogRef.current;

    dialog?.showModal();

    return () => {
      dialog?.close();
    };

  }, []);


  // Determine operation label

  const actionLabel = agent.has_password
    ? "Reset Password"
    : "Configure Password";


  // Submit new password

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    if (submittingRef.current) {
      return;
    }

    setApiError("");

    const newPasswordError =
      validateAgentPassword(password);

    const newConfirmError =
      validateConfirmPassword(
        password,
        confirmPassword
      );

    setPasswordError(newPasswordError);

    setConfirmError(newConfirmError);

    if (newPasswordError || newConfirmError) {
      return;
    }

    submittingRef.current = true;

    setSubmitting(true);

    let updatedAgent: Agent;

    try {

      updatedAgent = await resetAgentPassword(
        agent.id,
        { password }
      );

    } catch (error: unknown) {

      setApiError(
        getApiErrorMessage(error)
      );

      return;

    } finally {

      submittingRef.current = false;

      setSubmitting(false);

    }

    // Clear sensitive form data

    setPassword("");

    setConfirmPassword("");

    onSuccess(updatedAgent);

  };


  const inputClass =
    "w-full rounded-lg border bg-white " +
    "py-2.5 pl-10 pr-11 text-sm " +
    "outline-none focus:border-blue-500 " +
    "focus:ring-2 focus:ring-blue-100 " +
    "disabled:bg-slate-100";


  return (

    <dialog
      ref={dialogRef}
      aria-labelledby="password-reset-title"
      onCancel={(event) => {

        event.preventDefault();

        if (!submittingRef.current) {
          onClose();
        }

      }}
      className="fixed inset-0 m-auto
                 max-h-[90vh]
                 w-[calc(100%-2rem)]
                 max-w-lg overflow-y-auto
                 rounded-2xl bg-white p-0
                 shadow-2xl
                 backdrop:bg-slate-900/50"
    >

      {/* Modal header */}

      <div className="flex items-center
                      justify-between gap-4
                      border-b border-slate-100
                      p-6">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-blue-50
                          p-3 text-blue-600">

            <KeyRound size={25} />

          </div>

          <div>

            <h2
              id="password-reset-title"
              className="text-xl font-semibold
                         text-slate-900"
            >

              {actionLabel}

            </h2>

            <p className="mt-1 text-xs
                          text-slate-500">

              Configure agent login credentials

            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="Close password form"
          className="rounded-lg p-2
                     text-slate-400
                     hover:bg-slate-100
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

          {/* Agent information */}

          <div className="rounded-xl
                          border border-slate-100
                          bg-slate-50 p-4">

            <p className="font-semibold
                          text-slate-800">

              {agent.name}

            </p>

            <p className="mt-1 text-sm
                          text-slate-500">

              {agent.email}

            </p>

            <div className="mt-3 flex
                            flex-wrap gap-3
                            text-xs">

              <span className="text-slate-500">

                Agent #{agent.id}

              </span>

              <span className={
                agent.is_active
                  ? "font-medium text-green-600"
                  : "font-medium text-red-600"
              }>

                {agent.is_active
                  ? "Active"
                  : "Inactive"}

              </span>

            </div>

          </div>


          {/* API error */}

          {apiError && (

            <div
              role="alert"
              className="flex items-start gap-3
                         rounded-lg border
                         border-red-200
                         bg-red-50 p-3
                         text-sm text-red-700"
            >

              <AlertCircle
                size={19}
                className="shrink-0"
              />

              {apiError}

            </div>

          )}


          {/* New password */}

          <div>

            <label
              htmlFor="reset-password"
              className="mb-2 block text-sm
                         font-medium
                         text-slate-700"
            >

              New Password *

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
                id="reset-password"
                type={showPassword
                  ? "text"
                  : "password"}
                autoComplete="new-password"
                autoFocus
                required
                minLength={12}
                maxLength={128}
                value={password}
                disabled={submitting}
                aria-invalid={!!passwordError}
                aria-describedby={
                  passwordError
                    ? "reset-password-error"
                    : "reset-password-help"
                }
                onChange={(event) => {

                  setPassword(event.target.value);

                  setPasswordError("");

                  setConfirmError("");

                  setApiError("");

                }}
                placeholder="Enter new password"
                className={`${inputClass} ${
                  passwordError
                    ? "border-red-400"
                    : "border-slate-200"
                }`}
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

            {passwordError ? (

              <p
                id="reset-password-error"
                role="alert"
                className="mt-1 text-xs
                           text-red-600"
              >

                {passwordError}

              </p>

            ) : (

              <p
                id="reset-password-help"
                className="mt-1 text-xs
                           text-slate-500"
              >

                Use a unique, strong password
                containing at least 12 characters.

              </p>

            )}

          </div>


          {/* Confirm password */}

          <div>

            <label
              htmlFor="reset-confirm-password"
              className="mb-2 block text-sm
                         font-medium
                         text-slate-700"
            >

              Confirm New Password *

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
                id="reset-confirm-password"
                type={showConfirmPassword
                  ? "text"
                  : "password"}
                autoComplete="new-password"
                required
                maxLength={128}
                value={confirmPassword}
                disabled={submitting}
                aria-invalid={!!confirmError}
                aria-describedby={
                  confirmError
                    ? "reset-confirm-error"
                    : undefined
                }
                onChange={(event) => {

                  setConfirmPassword(
                    event.target.value
                  );

                  setConfirmError("");

                  setApiError("");

                }}
                placeholder="Re-enter new password"
                className={`${inputClass} ${
                  confirmError
                    ? "border-red-400"
                    : "border-slate-200"
                }`}
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

            {confirmError && (

              <p
                id="reset-confirm-error"
                role="alert"
                className="mt-1 text-xs
                           text-red-600"
              >

                {confirmError}

              </p>

            )}

          </div>


          {/* Security warning */}

          <div className="flex items-start gap-3
                          rounded-lg border
                          border-amber-200
                          bg-amber-50 p-4">

            <AlertTriangle
              size={20}
              className="shrink-0
                         text-amber-600"
            />

            <div className="space-y-2">

              <p className="text-sm font-semibold
                            text-amber-800">

                Important Information

              </p>

              <p className="text-xs leading-relaxed
                            text-amber-700">

                {agent.has_password

                  ? "The previous password will no longer work for new login attempts."

                  : "A new password will be configured for this agent account."}

              </p>

              <p className="text-xs
                            text-amber-700">

                Existing ticket assignments and
                account information will remain
                unchanged.

              </p>

              {!agent.is_active && (

                <p className="text-xs font-medium
                              text-amber-800">

                  This account is inactive.
                  Activate the account separately
                  to allow the agent to log in.

                </p>

              )}

            </div>

          </div>

        </div>


        {/* Modal footer */}

        <div className="flex flex-wrap
                        justify-end gap-3
                        border-t border-slate-100
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
            className="flex items-center gap-2
                       rounded-lg bg-blue-600
                       px-5 py-2.5 text-sm
                       font-medium text-white
                       hover:bg-blue-700
                       disabled:cursor-not-allowed
                       disabled:opacity-50"
          >

            {submitting ? (

              <>

                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />

                Saving...

              </>

            ) : (

              <>

                <KeyRound size={18} />

                {actionLabel}

              </>

            )}

          </button>

        </div>

      </form>

    </dialog>

  );

};

export default AgentPasswordResetModal;