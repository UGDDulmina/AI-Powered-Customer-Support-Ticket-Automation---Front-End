import {
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Pencil,
  Power,
  KeyRound,
} from "lucide-react";

import type {
  Agent,
  AgentWorkload,
} from "../../../types/agent.types";


interface AgentTableProps {
  agents: Agent[];
  workload: AgentWorkload[];
  hasFilters: boolean;
  disabled?: boolean;
  onEdit: (agent: Agent) => void;
  onToggleStatus: (agent: Agent) => void;
  onResetPassword: (agent: Agent) => void;
}


const getInitials = (name: string): string => {

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase() || "A";

};


const formatDate = (value: string): string => {

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

};


const AgentTable = ({
  agents,
  workload,
  hasFilters,
  disabled = false,
  onEdit,
  onToggleStatus,
  onResetPassword,
}: AgentTableProps) => {

  const workloadMap = new Map(
    workload.map((item) => [
      item.agent_id,
      item.active_tickets,
    ])
  );


  // Empty state

  if (agents.length === 0) {

    return (

      <div className="flex min-h-64
                      flex-col items-center
                      justify-center
                      p-8 text-center">

        <Users
          size={44}
          className="mb-4 text-slate-300"
        />

        <h3 className="font-semibold
                       text-slate-700">

          {hasFilters
            ? "No matching agents"
            : "No agents registered"}

        </h3>

        <p className="mt-2 text-sm
                      text-slate-500">

          {hasFilters

            ? "Try changing your search or filters."

            : "Registered support agents will appear here."}

        </p>

      </div>

    );

  }


  return (

    <div className="overflow-x-auto">

      <table className="w-full text-left text-sm">

        <thead className="bg-slate-50
                          text-xs uppercase
                          text-slate-500">

          <tr>

            <th className="px-5 py-4">
              Agent
            </th>

            <th className="px-5 py-4">
              Role
            </th>

            <th className="px-5 py-4">
              Account Status
            </th>

            <th className="px-5 py-4">
              Password
            </th>

            <th className="px-5 py-4">
              Login Readiness
            </th>

            <th className="px-5 py-4">
              Active Tickets
            </th>

            <th className="px-5 py-4">
              Registered Date
            </th>

            <th className="px-5 py-4">
              Actions
            </th>

          </tr>

        </thead>

        <tbody className="divide-y
                          divide-slate-100">

          {agents.map((agent) => {

            const loginReady =
              agent.is_active &&
              agent.has_password;

            const activeTickets =
              workloadMap.get(agent.id);

            const isAdmin =
              agent.role === "admin";

            return (

              <tr
                key={agent.id}
                className="transition-colors
                           hover:bg-slate-50"
              >

                {/* Agent information */}

                <td className="min-w-64 px-5 py-4">

                  <div className="flex
                                  items-center gap-3">

                    <div className="flex h-11 w-11
                                    shrink-0 items-center
                                    justify-center
                                    rounded-full
                                    bg-blue-100
                                    font-semibold
                                    text-blue-700">

                      {getInitials(agent.name)}

                    </div>

                    <div>

                      <p className="font-semibold
                                    text-slate-800">

                        {agent.name}

                      </p>

                      <p className="mt-0.5 text-xs
                                    text-slate-500">

                        {agent.email}

                      </p>

                      <p className="mt-1 text-xs
                                    text-slate-400">

                        Agent #{agent.id}

                      </p>

                    </div>

                  </div>

                </td>


                {/* Role */}

                <td className="px-5 py-4">

                  <span className="rounded-full
                                   bg-indigo-50
                                   px-3 py-1 text-xs
                                   font-medium
                                   capitalize
                                   text-indigo-700">

                    {agent.role}

                  </span>

                </td>


                {/* Account status */}

                <td className="px-5 py-4">

                  <span className={`
                    inline-flex items-center
                    gap-1.5 rounded-full
                    px-3 py-1 text-xs font-medium
                    ${
                      agent.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  `}>

                    <span className={`
                      h-2 w-2 rounded-full
                      ${
                        agent.is_active
                          ? "bg-green-500"
                          : "bg-red-500"
                      }
                    `} />

                    {agent.is_active
                      ? "Active"
                      : "Inactive"}

                  </span>

                </td>


                {/* Password status */}

                <td className="whitespace-nowrap
                               px-5 py-4">

                  {agent.has_password ? (

                    <span className="inline-flex
                                     items-center
                                     gap-1.5 text-xs
                                     text-green-600">

                      <CheckCircle2 size={16} />

                      Configured

                    </span>

                  ) : (

                    <span className="inline-flex
                                     items-center
                                     gap-1.5 text-xs
                                     text-amber-600">

                      <AlertCircle size={16} />

                      Required

                    </span>

                  )}

                </td>


                {/* Login readiness */}

                <td className="whitespace-nowrap
                               px-5 py-4">

                  {loginReady ? (

                    <span className="inline-flex
                                     items-center
                                     gap-1.5 text-xs
                                     text-green-600">

                      <CheckCircle2 size={16} />

                      Ready

                    </span>

                  ) : (

                    <span className="inline-flex
                                     items-center
                                     gap-1.5 text-xs
                                     text-slate-500">

                      <XCircle size={16} />

                      Not Ready

                    </span>

                  )}

                </td>


                {/* Active tickets */}

                <td className="px-5 py-4">

                  <span className="font-semibold
                                   text-slate-800">

                    {activeTickets ?? "N/A"}

                  </span>

                  {!agent.is_active &&
                    activeTickets !== undefined &&
                    activeTickets > 0 && (

                      <p className="mt-1 text-xs
                                    text-amber-600">

                        Reassignment required

                      </p>

                  )}

                </td>


                {/* Registered date */}

                <td className="whitespace-nowrap
                               px-5 py-4
                               text-slate-500">

                  {formatDate(agent.created_at)}

                </td>


                {/* Actions */}

                <td className="min-w-64 px-5 py-4">

                  {isAdmin ? (

                    <span className="text-xs
                                     text-slate-500">

                      Administrator account

                    </span>

                  ) : (

                    <div className="flex flex-wrap
                                    items-center gap-2">

                      {/* Edit agent */}

                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onEdit(agent)}
                        aria-label={`Edit ${agent.name}`}
                        className="inline-flex
                                   items-center gap-1.5
                                   rounded-lg bg-blue-50
                                   px-3 py-2 text-xs
                                   font-medium
                                   text-blue-700
                                   hover:bg-blue-100
                                   disabled:opacity-50"
                      >

                        <Pencil size={15} />

                        Edit

                      </button>


                      {/* Activate or deactivate */}

                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          onToggleStatus(agent)
                        }
                        aria-label={`${
                          agent.is_active
                            ? "Deactivate"
                            : "Activate"
                        } ${agent.name}`}
                        className={`
                          inline-flex items-center
                          gap-1.5 rounded-lg
                          px-3 py-2 text-xs
                          font-medium
                          disabled:opacity-50
                          ${
                            agent.is_active
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          }
                        `}
                      >

                        <Power size={15} />

                        {agent.is_active
                          ? "Deactivate"
                          : "Activate"}

                      </button>


                      {/* Password reset */}

                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          onResetPassword(agent)
                        }
                        aria-label={`${
                          agent.has_password
                            ? "Reset password for"
                            : "Set password for"
                        } ${agent.name}`}
                        className="inline-flex
                                   items-center gap-1.5
                                   rounded-lg bg-amber-50
                                   px-3 py-2 text-xs
                                   font-medium
                                   text-amber-700
                                   hover:bg-amber-100
                                   disabled:opacity-50"
                      >

                        <KeyRound size={15} />

                        {agent.has_password
                          ? "Reset Password"
                          : "Set Password"}

                      </button>

                    </div>

                  )}

                </td>

              </tr>

            );

          })}

        </tbody>

      </table>

    </div>

  );

};

export default AgentTable;