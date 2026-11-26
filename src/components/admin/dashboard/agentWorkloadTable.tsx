import {
  ArrowRight,
  Users,
  AlertCircle,
} from "lucide-react";

import { Link } from "react-router-dom";

import type {
  AgentWorkload,
} from "../../../types/adminDashboard.types";


interface AgentWorkloadTableProps {
  agents: AgentWorkload[];
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


const AgentWorkloadTable = ({
  agents,
}: AgentWorkloadTableProps) => {


  // Sort agents by active ticket count

  const sortedAgents = [...agents].sort(
    (a, b) =>
      b.active_tickets - a.active_tickets
  );


  // Calculate total assigned active tickets

  const totalAssignedTickets = agents.reduce(
    (sum, agent) =>
      sum + agent.active_tickets,
    0
  );


  // Active agent accounts

  const activeAgents = agents.filter(
    (agent) => agent.is_active
  );


  // Active tickets assigned to enabled agents

  const activeAgentTickets =
    activeAgents.reduce(
      (sum, agent) =>
        sum + agent.active_tickets,
      0
    );


  // Average workload per enabled agent

  const averageWorkload =
    activeAgents.length > 0
      ? activeAgentTickets /
        activeAgents.length
      : 0;


  // Maximum workload for comparison bars

  const maxWorkload = Math.max(
    1,
    ...agents.map(
      (agent) => agent.active_tickets
    )
  );


  // Inactive agents with unfinished tickets

  const inactiveAgentsWithTickets =
    agents.filter(
      (agent) =>
        !agent.is_active &&
        agent.active_tickets > 0
    );


  return (

    <section className="overflow-hidden
                        rounded-xl border
                        border-slate-200
                        bg-white shadow-sm">

      {/* Header */}

      <div className="flex flex-wrap
                      items-center
                      justify-between gap-3
                      border-b border-slate-100
                      p-5">

        <div>

          <h2 className="text-lg font-semibold
                         text-slate-800">

            Agent Workload

          </h2>

          <p className="mt-1 text-sm
                        text-slate-500">

            Monitor active ticket assignments

          </p>

        </div>


        <Link
          to="/admin/agents"
          className="flex items-center gap-2
                     text-sm font-medium
                     text-blue-600
                     hover:text-blue-800"
        >

          Manage agents

          <ArrowRight size={16} />

        </Link>

      </div>


      {/* Workload summary */}

      <div className="grid grid-cols-1
                      gap-3 p-5
                      sm:grid-cols-3">

        <div className="rounded-lg
                        bg-blue-50 p-4">

          <p className="text-xs
                        text-blue-700">

            Assigned Active Tickets

          </p>

          <p className="mt-2 text-2xl
                        font-bold
                        text-blue-800">

            {totalAssignedTickets}

          </p>

        </div>


        <div className="rounded-lg
                        bg-green-50 p-4">

          <p className="text-xs
                        text-green-700">

            Active Agents

          </p>

          <p className="mt-2 text-2xl
                        font-bold
                        text-green-800">

            {activeAgents.length}

          </p>

        </div>


        <div className="rounded-lg
                        bg-purple-50 p-4">

          <p className="text-xs
                        text-purple-700">

            Average Active Agent Load

          </p>

          <p className="mt-2 text-2xl
                        font-bold
                        text-purple-800">

            {activeAgents.length > 0
              ? averageWorkload.toFixed(1)
              : "N/A"}

          </p>

        </div>

      </div>


      {/* Inactive agent warning */}

      {inactiveAgentsWithTickets.length > 0 && (

        <div className="mx-5 mb-5 flex
                        items-start gap-3
                        rounded-lg
                        border border-amber-200
                        bg-amber-50 p-4">

          <AlertCircle
            size={20}
            className="shrink-0
                       text-amber-600"
          />

          <div>

            <p className="text-sm
                          font-medium
                          text-amber-800">

              Inactive agents have active tickets

            </p>

            <p className="mt-1 text-xs
                          text-amber-700">

              {inactiveAgentsWithTickets.length}

              {" inactive agent(s) still have "}
              {"unfinished ticket assignments. "}
              {"Review and reassign these tickets."}

            </p>

          </div>

        </div>

      )}


      {/* Empty state */}

      {agents.length === 0 ? (

        <div className="flex min-h-48
                        flex-col items-center
                        justify-center p-6">

          <Users
            size={40}
            className="mb-3 text-slate-300"
          />

          <p className="font-medium
                        text-slate-700">

            No support agents available

          </p>

          <p className="mt-1 text-sm
                        text-slate-500">

            Register agents to monitor
            ticket assignments.

          </p>

        </div>

      ) : (

        <div className="overflow-x-auto">

          <table className="w-full
                            text-left text-sm">

            <thead className="bg-slate-50
                              text-xs uppercase
                              text-slate-500">

              <tr>

                <th className="px-5 py-4">
                  Agent
                </th>

                <th className="px-5 py-4">
                  Account Status
                </th>

                <th className="px-5 py-4">
                  Relative Workload
                </th>

                <th className="px-5 py-4
                               text-right">

                  Active Tickets

                </th>

              </tr>

            </thead>


            <tbody className="divide-y
                              divide-slate-100">

              {sortedAgents.map((agent) => {

                const workloadPercentage =
                  (
                    agent.active_tickets /
                    maxWorkload
                  ) * 100;


                return (

                  <tr
                    key={agent.agent_id}
                    className="hover:bg-slate-50"
                  >

                    {/* Agent information */}

                    <td className="whitespace-nowrap
                                   px-5 py-4">

                      <div className="flex
                                      items-center
                                      gap-3">

                        <div className="flex
                                        h-10 w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-blue-100
                                        text-sm
                                        font-semibold
                                        text-blue-700">

                          {getInitials(
                            agent.agent_name
                          )}

                        </div>


                        <div>

                          <p className="font-medium
                                        text-slate-800">

                            {agent.agent_name}

                          </p>

                          <p className="text-xs
                                        text-slate-500">

                            Agent #{agent.agent_id}

                          </p>

                        </div>

                      </div>

                    </td>


                    {/* Account status */}

                    <td className="px-5 py-4">

                      <span
                        className={`rounded-full
                                    px-3 py-1
                                    text-xs
                                    font-medium
                                    ${
                                      agent.is_active
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                      >

                        {agent.is_active
                          ? "Active"
                          : "Inactive"}

                      </span>

                    </td>


                    {/* Relative workload */}

                    <td className="min-w-40
                                   px-5 py-4">

                      <div
                        className="h-2.5
                                   overflow-hidden
                                   rounded-full
                                   bg-slate-100"
                        title={`${agent.active_tickets} active tickets`}
                      >

                        <div
                          className={`h-full
                                      rounded-full
                                      transition-all
                                      ${
                                        agent.is_active
                                          ? "bg-blue-500"
                                          : "bg-amber-500"
                                      }`}
                          style={{
                            width:
                              `${workloadPercentage}%`,
                          }}
                        />

                      </div>

                    </td>


                    {/* Ticket count */}

                    <td className="px-5 py-4
                                   text-right
                                   font-semibold
                                   text-slate-800">

                      {agent.active_tickets}

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

      )}

    </section>

  );

};


export default AgentWorkloadTable;