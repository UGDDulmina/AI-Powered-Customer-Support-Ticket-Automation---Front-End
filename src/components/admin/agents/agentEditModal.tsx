import {
  useState,
  useEffect,
  useRef,
} from "react";

import type { FormEvent } from "react";

import {
  Pencil,
  X,
  Save,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import axios from "axios";

import { updateAgent } from "../../../api/agents.api";

import type {
  Agent,
  AgentEditFormData,
} from "../../../types/agent.types";

import {
  validateAgentName,
  validateAgentEmail,
} from "../../../utils/agentValidation";

import {
  getApiErrorMessage,
} from "../../../utils/apiError";


interface AgentEditModalProps {
  agent: Agent;
  onClose: () => void;
  onSuccess: (agent: Agent) => void;
}


type EditErrors = Partial<
  Record<keyof AgentEditFormData, string>
>;


const AgentEditModal = ({
  agent,
  onClose,
  onSuccess,
}: AgentEditModalProps) => {

  const [form, setForm] =
    useState<AgentEditFormData>({
      name: agent.name,
      email: agent.email,
    });

  const [errors, setErrors] =
    useState<EditErrors>({});

  const [apiError, setApiError] =
    useState("");

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


  // Update input fields

  const handleChange = (
    field: keyof AgentEditFormData,
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

    setApiError("");

  };


  // Check whether values have changed

  const hasChanges =
    form.name.trim() !== agent.name ||
    form.email.trim().toLowerCase() !==
      agent.email.toLowerCase();


  // Submit changes

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    if (
      submittingRef.current ||
      !hasChanges
    ) {
      return;
    }

    const validationErrors: EditErrors = {};

    const nameError =
      validateAgentName(form.name);

    const emailError =
      validateAgentEmail(form.email);

    if (nameError) {
      validationErrors.name = nameError;
    }

    if (emailError) {
      validationErrors.email = emailError;
    }

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors).length > 0
    ) {
      return;
    }

    submittingRef.current = true;

    setSubmitting(true);

    setApiError("");

    let updatedAgent: Agent;

    try {

      updatedAgent = await updateAgent(
        agent.id,
        {
          name: form.name.trim(),
          email: form.email
            .trim()
            .toLowerCase(),
        }
      );

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

    onSuccess(updatedAgent);

  };


  const inputClass =
    "w-full rounded-lg border px-4 py-2.5 " +
    "text-sm outline-none " +
    "focus:border-blue-500 " +
    "focus:ring-2 focus:ring-blue-100 " +
    "disabled:bg-slate-100";


  return (

    <dialog
      ref={dialogRef}
      aria-labelledby="edit-agent-title"
      onCancel={(event) => {

        event.preventDefault();

        if (!submittingRef.current) {
          onClose();
        }

      }}
      className="fixed inset-0 m-auto
                 max-h-[90vh] w-[calc(100%-2rem)]
                 max-w-lg overflow-y-auto
                 rounded-2xl bg-white p-0
                 shadow-2xl
                 backdrop:bg-slate-900/50"
    >

      {/* Header */}

      <div className="flex items-center
                      justify-between gap-4
                      border-b border-slate-100
                      p-6">

        <div className="flex items-center gap-3">

          <div className="rounded-xl
                          bg-blue-50 p-3
                          text-blue-600">

            <Pencil size={23} />

          </div>

          <div>

            <h2
              id="edit-agent-title"
              className="text-xl font-semibold
                         text-slate-900"
            >

              Edit Agent

            </h2>

            <p className="mt-1 text-xs
                          text-slate-500">

              Update support agent information

            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="Close edit form"
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
                size={18}
                className="shrink-0"
              />

              {apiError}

            </div>

          )}


          {/* Name */}

          <div>

            <label
              htmlFor="edit-agent-name"
              className="mb-2 block text-sm
                         font-medium
                         text-slate-700"
            >

              Full Name *

            </label>

            <input
              id="edit-agent-name"
              type="text"
              autoFocus
              required
              maxLength={150}
              value={form.name}
              disabled={submitting}
              aria-invalid={!!errors.name}
              onChange={(event) =>
                handleChange(
                  "name",
                  event.target.value
                )
              }
              className={`${inputClass} ${
                errors.name
                  ? "border-red-400"
                  : "border-slate-200"
              }`}
            />

            {errors.name && (

              <p
                role="alert"
                className="mt-1 text-xs
                           text-red-600"
              >

                {errors.name}

              </p>

            )}

          </div>


          {/* Email */}

          <div>

            <label
              htmlFor="edit-agent-email"
              className="mb-2 block text-sm
                         font-medium
                         text-slate-700"
            >

              Email Address *

            </label>

            <input
              id="edit-agent-email"
              type="email"
              required
              maxLength={255}
              value={form.email}
              disabled={submitting}
              aria-invalid={!!errors.email}
              onChange={(event) =>
                handleChange(
                  "email",
                  event.target.value
                )
              }
              className={`${inputClass} ${
                errors.email
                  ? "border-red-400"
                  : "border-slate-200"
              }`}
            />

            {errors.email && (

              <p
                role="alert"
                className="mt-1 text-xs
                           text-red-600"
              >

                {errors.email}

              </p>

            )}

            <p className="mt-2 text-xs
                          text-slate-500">

              The updated email address will
              be used for future login attempts.

            </p>

          </div>


          {/* Account information */}

          <div className="space-y-3
                          rounded-xl
                          bg-slate-50 p-4
                          text-sm">

            <div className="flex justify-between">

              <span className="text-slate-500">
                Agent ID
              </span>

              <span className="font-medium">
                #{agent.id}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-slate-500">
                Role
              </span>

              <span className="font-medium">
                Support Agent
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-slate-500">
                Account Status
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

        </div>


        {/* Footer */}

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
            disabled={
              submitting || !hasChanges
            }
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

                <Save size={18} />

                Save Changes

              </>

            )}

          </button>

        </div>

      </form>

    </dialog>

  );

};

export default AgentEditModal;