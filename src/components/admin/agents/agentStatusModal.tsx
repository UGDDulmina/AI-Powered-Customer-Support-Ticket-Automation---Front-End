import {
  useState,
  useEffect,
  useRef,
} from "react";

import {
  UserCheck,
  UserX,
  AlertTriangle,
  AlertCircle,
  LoaderCircle,
  Power,
  X,
} from "lucide-react";

import {
  activateAgent,
  deactivateAgent,
} from "../../../api/agents.api";

import type {
  Agent,
} from "../../../types/agent.types";

import {
  getApiErrorMessage,
} from "../../../utils/apiError";


interface AgentStatusModalProps {
  agent: Agent;
  activeTickets: number | undefined;
  onClose: () => void;
  onSuccess: (agent: Agent) => void;
}


const AgentStatusModal = ({
  agent,
  activeTickets,
  onClose,
  onSuccess,
}: AgentStatusModalProps) => {

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const submittingRef = useRef(false);

  const dialogRef =
    useRef<HTMLDialogElement>(null);


  // Determine requested operation

  const isDeactivation = agent.is_active;

  const activationBlocked =
    !isDeactivation &&
    !agent.has_password;

  const actionLabel = isDeactivation
    ? "Deactivate"
    : "Activate";

  const StatusIcon = isDeactivation
    ? UserX
    : UserCheck;


  // Open native modal

  useEffect(() => {

    const dialog = dialogRef.current;

    dialog?.showModal();

    return () => {
      dialog?.close();
    };

  }, []);


  // Submit account status change

  const handleConfirm = async () => {

    if (
      submittingRef.current ||
      activationBlocked
    ) {
      return;
    }

    submittingRef.current = true;

    setSubmitting(true);

    setError("");

    let updatedAgent: Agent;

    try {

      updatedAgent = isDeactivation
        ? await deactivateAgent(agent.id)
        : await activateAgent(agent.id);

    } catch (err: unknown) {

      setError(
        getApiErrorMessage(err)
      );

      return;

    } finally {

      submittingRef.current = false;

      setSubmitting(false);

    }

    onSuccess(updatedAgent);

  };


  return (

    <dialog
      ref={dialogRef}
      aria-labelledby="agent-status-title"
      onCancel={(event) => {

        event.preventDefault();

        if (!submittingRef.current) {
          onClose();
        }

      }}
      className="fixed inset-0 m-auto
                 max-h-[90vh]
                 w-[calc(100%-2rem)]
                 max-w-md overflow-y-auto
                 rounded-2xl bg-white p-0
                 shadow-2xl
                 backdrop:bg-slate-900/50"
    >

      <div className="space-y-5 p-6">

        {/* Header */}

        <div className="flex items-start
                        justify-between">

          <div className={`rounded-full p-4 ${
            isDeactivation
              ? "bg-red-100 text-red-600"
              : "bg-green-100 text-green-600"
          }`}>

            <StatusIcon size={28} />

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close confirmation"
            className="rounded-lg p-2
                       text-slate-400
                       hover:bg-slate-100
                       disabled:opacity-50"
          >

            <X size={21} />

          </button>

        </div>


        {/* Confirmation message */}

        <div>

          <h2
            id="agent-status-title"
            className="text-xl font-bold
                       text-slate-900"
          >

            {actionLabel} Agent?

          </h2>

          <p className="mt-2 text-sm
                        leading-relaxed
                        text-slate-600">

            Are you sure you want to{" "}

            {actionLabel.toLowerCase()}

            {" "}

            <strong>{agent.name}</strong>?

          </p>

        </div>


        {/* Agent details */}

        <div className="rounded-lg
                        bg-slate-50 p-4">

          <p className="font-medium
                        text-slate-800">

            {agent.name}

          </p>

          <p className="mt-1 text-sm
                        text-slate-500">

            {agent.email}

          </p>

          <p className="mt-2 text-xs
                        text-slate-400">

            Agent #{agent.id}

          </p>

        </div>


        {/* Active ticket warning */}

        {isDeactivation &&
          activeTickets !== undefined &&
          activeTickets > 0 && (

          <div className="flex items-start
                          gap-3 rounded-lg
                          border border-amber-200
                          bg-amber-50 p-4">

            <AlertTriangle
              size={21}
              className="shrink-0
                         text-amber-600"
            />

            <div>

              <p className="text-sm
                            font-semibold
                            text-amber-800">

                {activeTickets} active ticket(s)
                assigned

              </p>

              <p className="mt-2 text-xs
                            leading-relaxed
                            text-amber-700">

                These tickets will remain
                assigned to this agent.
                Review and reassign them
                to another active agent.

              </p>

            </div>

          </div>

        )}


        {/* Unknown workload warning */}

        {isDeactivation &&
          activeTickets === undefined && (

          <div className="flex items-start
                          gap-3 rounded-lg
                          bg-amber-50 p-4
                          text-sm text-amber-700">

            <AlertTriangle
              size={20}
              className="shrink-0"
            />

            Workload information is unavailable.
            Check assigned tickets before
            deactivating this account.

          </div>

        )}


        {/* Password requirement */}

        {activationBlocked && (

          <div className="flex items-start
                          gap-3 rounded-lg
                          border border-amber-200
                          bg-amber-50 p-4">

            <AlertCircle
              size={20}
              className="shrink-0
                         text-amber-600"
            />

            <div>

              <p className="text-sm
                            font-semibold
                            text-amber-800">

                Password required

              </p>

              <p className="mt-1 text-xs
                            text-amber-700">

                Configure a password before
                activating this account.

              </p>

            </div>

          </div>

        )}


        {/* Operation information */}

        <p className="text-sm
                      leading-relaxed
                      text-slate-500">

          {isDeactivation

            ? "The agent will no longer be able to log in. Existing account information and ticket history will be preserved."

            : "The agent will be able to log in using their registered credentials after successful activation."}

        </p>


        {/* API error */}

        {error && (

          <div
            role="alert"
            className="flex items-start
                       gap-3 rounded-lg
                       border border-red-200
                       bg-red-50 p-3
                       text-sm text-red-700"
          >

            <AlertCircle
              size={18}
              className="shrink-0"
            />

            {error}

          </div>

        )}

      </div>


      {/* Footer */}

      <div className="flex flex-wrap
                      justify-end gap-3
                      border-t border-slate-100
                      bg-slate-50 p-5">

        <button
          type="button"
          autoFocus
          onClick={onClose}
          disabled={submitting}
          className="rounded-lg border
                     border-slate-200
                     bg-white px-4 py-2.5
                     text-sm font-medium
                     text-slate-700
                     hover:bg-slate-100
                     disabled:opacity-50"
        >

          Cancel

        </button>


        <button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={
            submitting ||
            activationBlocked
          }
          className={`flex items-center
                      gap-2 rounded-lg
                      px-4 py-2.5 text-sm
                      font-medium text-white
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                      ${
                        isDeactivation
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
        >

          {submitting ? (

            <>

              <LoaderCircle
                size={17}
                className="animate-spin"
              />

              Processing...

            </>

          ) : (

            <>

              <Power size={17} />

              {actionLabel} Agent

            </>

          )}

        </button>

      </div>

    </dialog>

  );

};

export default AgentStatusModal;