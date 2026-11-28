import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";

import type {
  AgentAIAnalytics,
} from "../../../types/aiAnalytics.types";

import {
  calculatePercentage,
  formatAnalyticsPercentage,
} from "../../../utils/aiAnalytics.utils";

interface Props {
  agents: AgentAIAnalytics[];
}

type StatusFilter = "all" | "active" | "inactive";

type SortOption = "reviewed" | "acceptance" | "sent" | "name";

const PAGE_SIZE = 10;

export default function AgentAIAnalyticsTable({
  agents,
}: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("reviewed");
  const [page, setPage] = useState(1);

  const filteredAgents = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = agents.filter((agent) => {
      const matchesSearch =
        agent.agent_name.toLowerCase().includes(query) ||
        String(agent.agent_id).includes(query);

      const matchesStatus =
        status === "all" ||
        (status === "active" && agent.is_active) ||
        (status === "inactive" && !agent.is_active);

      return matchesSearch && matchesStatus;
    });

    return result.sort((first, second) => {
      if (sortBy === "name") {
        return first.agent_name.localeCompare(second.agent_name);
      }

      if (sortBy === "acceptance") {
        return (
          second.acceptance_rate - first.acceptance_rate ||
          second.reviewed_suggestions - first.reviewed_suggestions
        );
      }

      if (sortBy === "sent") {
        return second.sent_suggestions - first.sent_suggestions;
      }

      return second.reviewed_suggestions - first.reviewed_suggestions;
    });
  }, [agents, search, status, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAgents.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleAgents = filteredAgents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <section className="min-w-0 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-5">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-blue-600" />

          <h2 className="text-lg font-semibold text-gray-900">
            Agent AI Performance
          </h2>
        </div>

        <p className="mt-1 text-sm text-gray-500">
          AI suggestion review and acceptance statistics by staff member
        </p>

        <div className="mt-5 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-3 text-gray-400"
            />

            <input
              type="search"
              value={search}
              placeholder="Search by agent name or ID"
              aria-label="Search agents"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={status}
            aria-label="Filter agent status"
            onChange={(event) => {
              setStatus(event.target.value as StatusFilter);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={sortBy}
            aria-label="Sort agents"
            onChange={(event) => {
              setSortBy(event.target.value as SortOption);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none"
          >
            <option value="reviewed">Most Reviewed</option>
            <option value="acceptance">Highest Acceptance</option>
            <option value="sent">Most Sent</option>
            <option value="name">Agent Name</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              {[
                "Agent",
                "Status",
                "Reviewed",
                "Accepted",
                "Rejected",
                "Sent",
                "Edited",
                "Acceptance Rate",
              ].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-5 py-4 font-semibold"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {visibleAgents.map((agent) => {
              const accepted =
                agent.approved_suggestions + agent.sent_suggestions;

              const acceptanceRate = calculatePercentage(
                accepted,
                agent.reviewed_suggestions
              );

              return (
                <tr
                  key={agent.agent_id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">
                      {agent.agent_name}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      ID: {agent.agent_id}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        agent.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {agent.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-5 py-4 font-medium text-gray-700">
                    {agent.reviewed_suggestions}
                  </td>

                  <td className="px-5 py-4 text-green-600">
                    {accepted}
                  </td>

                  <td className="px-5 py-4 text-red-600">
                    {agent.rejected_suggestions}
                  </td>

                  <td className="px-5 py-4 text-blue-600">
                    {agent.sent_suggestions}
                  </td>

                  <td className="px-5 py-4 text-purple-600">
                    {agent.edited_suggestions}
                  </td>

                  <td className="px-5 py-4">
                    {agent.reviewed_suggestions > 0 ? (
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{
                              width: `${Math.min(100, acceptanceRate)}%`,
                            }}
                          />
                        </div>

                        <span className="font-medium text-gray-700">
                          {formatAnalyticsPercentage(acceptanceRate)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">
                        Not reviewed
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}

            {visibleAgents.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-12 text-center text-gray-500"
                >
                  No matching agent records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 p-5">
        <p className="text-sm text-gray-500">
          {filteredAgents.length === 0
            ? "0 agents"
            : `Showing ${(currentPage - 1) * PAGE_SIZE + 1} to ${Math.min(
                currentPage * PAGE_SIZE,
                filteredAgents.length
              )} of ${filteredAgents.length} agents`}
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(currentPage + 1)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}