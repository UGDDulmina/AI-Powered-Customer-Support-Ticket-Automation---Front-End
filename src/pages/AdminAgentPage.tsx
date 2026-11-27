import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

import {
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  CheckCircle2,
  X,
} from "lucide-react";

import {
  getSupportAgents,
  getAgentsWorkload,
  calculateAgentManagementStats,
} from "../api/agents.api";

import type {
  Agent,
  AgentWorkload,
  AgentStatusFilter,
  AgentRegistrationResponse,
} from "../types/agent.types";

import AgentStatsCards from
  "../components/admin/agents/agentStatsCards";

import AgentFilters from
  "../components/admin/agents/agentFilters";

import AgentTable from
  "../components/admin/agents/agentTable";

import AgentRegistrationModal from
  "../components/admin/agents/agentRegistrationModal";

import AgentEditModal from
  "../components/admin/agents/agentEditModal";

import AgentStatusModal from
  "../components/admin/agents/agentStatusModal";

import AgentPasswordResetModal from
  "../components/admin/agents/agentPasswordResetModal";

import LoadingSpinner from
  "../components/common/LoadingSpinner";

import {
  getApiErrorMessage,
} from "../utils/apiError";


const PAGE_SIZE = 10;


type AgentModal =
  | { type: "register" }
  | { type: "edit"; agent: Agent }
  | { type: "status"; agent: Agent }
  | { type: "password"; agent: Agent }
  | null;


const AdminAgentsPage = () => {


  const [agents, setAgents] =
    useState<Agent[]>([]);

  const [workload, setWorkload] =
    useState<AgentWorkload[]>([]);


  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [hasLoaded, setHasLoaded] =
    useState(false);


  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<AgentStatusFilter>("all");


  const [page, setPage] =
    useState(1);


  const [modal, setModal] =
    useState<AgentModal>(null);


  const [successMessage, setSuccessMessage] =
    useState("");


  const controllerRef =
    useRef<AbortController | null>(null);


  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);


  const loadAgents = useCallback(
    async (isRefresh = false) => {

      controllerRef.current?.abort();

      const controller = new AbortController();

      controllerRef.current = controller;

      if (isRefresh) {

        setRefreshing(true);

      } else {

        setLoading(true);

      }

      setError("");

      try {

        const [agentData, workloadData] =
          await Promise.all([

            getSupportAgents(
              undefined,
              controller.signal
            ),

            getAgentsWorkload(
              controller.signal
            ),

          ]);

        if (controller.signal.aborted) {
          return;
        }

        setAgents(agentData);

        setWorkload(workloadData);

        setHasLoaded(true);

        setLastUpdated(new Date());

      } catch (err: unknown) {

        if (controller.signal.aborted) {
          return;
        }

        setError(
          getApiErrorMessage(err)
        );

      } finally {

        if (!controller.signal.aborted) {

          setLoading(false);

          setRefreshing(false);

        }

      }

    },
    []
  );

  useEffect(() => {

    void loadAgents();

    return () => {

      controllerRef.current?.abort();

    };

  }, [loadAgents]);


  useEffect(() => {

    if (!successMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {

      setSuccessMessage("");

    }, 5000);

    return () => {

      window.clearTimeout(timeout);

    };

  }, [successMessage]);

  const supportAgents = useMemo(
    () => agents.filter(
      (agent) => agent.role === "agent"
    ),
    [agents]
  );

  const stats = useMemo(
    () => calculateAgentManagementStats(
      supportAgents
    ),
    [supportAgents]
  );

  const filteredAgents = useMemo(() => {

    const keyword =
      search.trim().toLowerCase();

    return supportAgents
      .filter((agent) => {

        const matchesSearch =
          !keyword ||

          agent.name
            .toLowerCase()
            .includes(keyword) ||

          agent.email
            .toLowerCase()
            .includes(keyword) ||

          String(agent.id)
            .includes(keyword);

        const matchesStatus =
          status === "all" ||

          (
            status === "active" &&
            agent.is_active
          ) ||

          (
            status === "inactive" &&
            !agent.is_active
          );

        return matchesSearch && matchesStatus;

      })
      .sort((a, b) => b.id - a.id);

  }, [supportAgents, search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredAgents.length / PAGE_SIZE
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const startIndex =
    (currentPage - 1) * PAGE_SIZE;

  const endIndex =
    startIndex + PAGE_SIZE;

  const paginatedAgents =
    filteredAgents.slice(
      startIndex,
      endIndex
    );

  const handleSearchChange = (
    value: string
  ) => {

    setSearch(value);

    setPage(1);

  };

  const handleStatusChange = (
    value: AgentStatusFilter
  ) => {

    setStatus(value);

    setPage(1);

  };

  const handleClearFilters = () => {

    setSearch("");

    setStatus("all");

    setPage(1);

  };

  const handleRefresh = () => {

    if (loading || refreshing || modal) {
      return;
    }

    void loadAgents(true);

  };

  const handleOpenRegistration = () => {

    setSuccessMessage("");

    setModal({
      type: "register",
    });

  };

  const handleOpenEdit = (agent: Agent) => {

    if (agent.role !== "agent") {
      return;
    }

    setSuccessMessage("");

    setModal({
      type: "edit",
      agent,
    });

  };

  const handleOpenStatus = (agent: Agent) => {

    if (agent.role !== "agent") {
      return;
    }

    setSuccessMessage("");

    setModal({
      type: "status",
      agent,
    });

  };

  const handleOpenPasswordReset = (
    agent: Agent
  ) => {

    if (agent.role !== "agent") {
      return;
    }

    setSuccessMessage("");

    setModal({
      type: "password",
      agent,
    });

  };

  const handleCloseModal = useCallback(() => {

    setModal(null);

  }, []);

  const updateLocalAgent = (
    updatedAgent: Agent
  ) => {

    setAgents((previous) =>
      previous.map((agent) =>
        agent.id === updatedAgent.id
          ? updatedAgent
          : agent
      )
    );

    setWorkload((previous) =>
      previous.map((item) =>
        item.agent_id === updatedAgent.id
          ? {
              ...item,
              agent_name: updatedAgent.name,
              is_active: updatedAgent.is_active,
            }
          : item
      )
    );

  };

  const handleRegistrationSuccess = (
    agent: AgentRegistrationResponse
  ) => {

    setModal(null);

    setSuccessMessage(
      `${agent.name} was registered successfully.`
    );

    setSearch("");

    setStatus("all");

    setPage(1);

    void loadAgents(true);

  };

  const handleEditSuccess = (
    updatedAgent: Agent
  ) => {

    updateLocalAgent(updatedAgent);

    setModal(null);

    setSuccessMessage(
      `${updatedAgent.name} was updated successfully.`
    );

    void loadAgents(true);

  };

  const handleStatusSuccess = (
    updatedAgent: Agent
  ) => {

    updateLocalAgent(updatedAgent);

    setModal(null);

    const action = updatedAgent.is_active
      ? "activated"
      : "deactivated";

    setSuccessMessage(
      `${updatedAgent.name} was ${action} successfully.`
    );

    void loadAgents(true);

  };

  const handlePasswordResetSuccess = (
    updatedAgent: Agent
  ) => {

    updateLocalAgent(updatedAgent);

    const wasConfigured =
      modal?.type === "password" &&
      !modal.agent.has_password;

    setModal(null);

    setSuccessMessage(

      wasConfigured

        ? `Password configured successfully for ${updatedAgent.name}.`

        : `Password reset successfully for ${updatedAgent.name}.`

    );

    void loadAgents(true);

  };

  if (loading && !hasLoaded) {

    return (

      <LoadingSpinner
        message="Loading support agents..."
      />

    );

  }

 

  if (error && !hasLoaded) {

    return (

      <div className="rounded-xl border
                      border-red-200
                      bg-white p-8
                      text-center">

        <AlertCircle
          size={40}
          className="mx-auto mb-4
                     text-red-500"
        />

        <h2 className="text-lg font-semibold
                       text-slate-800">

          Unable to load agents

        </h2>

        <p className="mt-2 text-sm
                      text-red-600">

          {error}

        </p>

        <button
          type="button"
          onClick={() => void loadAgents()}
          className="mt-5 rounded-lg
                     bg-blue-600 px-5 py-2.5
                     text-sm font-medium
                     text-white
                     hover:bg-blue-700"
        >

          Try Again

        </button>

      </div>

    );

  }


  return (

    <div className="space-y-6">


      <div className="flex flex-wrap
                      items-center
                      justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold
                         text-slate-900">

            Agent Management

          </h1>

          <p className="mt-1 text-sm
                        text-slate-500">

            Manage your customer support team
            and monitor agent account status.

          </p>

          {lastUpdated && (

            <p className="mt-2 text-xs
                          text-slate-400">

              Last updated:{" "}

              {lastUpdated.toLocaleString()}

            </p>

          )}

        </div>


        <div className="flex flex-wrap
                        items-center gap-3">

          <button
            type="button"
            onClick={handleRefresh}
            disabled={
              loading ||
              refreshing ||
              modal !== null
            }
            className="flex items-center gap-2
                       rounded-lg border
                       border-slate-200
                       bg-white px-4 py-2.5
                       text-sm font-medium
                       text-slate-700
                       hover:bg-slate-50
                       disabled:opacity-50"
          >

            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}

          </button>

          <button
            type="button"
            onClick={handleOpenRegistration}
            disabled={
              loading ||
              refreshing ||
              modal !== null
            }
            className="flex items-center gap-2
                       rounded-lg bg-blue-600
                       px-4 py-2.5 text-sm
                       font-medium text-white
                       shadow-sm
                       hover:bg-blue-700
                       disabled:opacity-50"
          >

            <UserPlus size={18} />

            Register Agent

          </button>

        </div>

      </div>


      {successMessage && (

        <div
          role="status"
          className="flex items-center
                     justify-between gap-3
                     rounded-xl border
                     border-green-200
                     bg-green-50 p-4"
        >

          <div className="flex
                          items-center gap-3">

            <CheckCircle2
              size={21}
              className="shrink-0
                         text-green-600"
            />

            <span className="text-sm font-medium
                             text-green-700">

              {successMessage}

            </span>

          </div>

          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setSuccessMessage("")}
            className="text-green-600
                       hover:text-green-800"
          >

            <X size={18} />

          </button>

        </div>

      )}


      {error && hasLoaded && (

        <div
          role="alert"
          className="flex items-center gap-3
                     rounded-lg border
                     border-red-200
                     bg-red-50 p-4
                     text-sm text-red-700"
        >

          <AlertCircle
            size={20}
            className="shrink-0"
          />

          <span>

            Refresh failed: {error}.
            Showing the last available data.

          </span>

        </div>

      )}

      <AgentStatsCards stats={stats} />


      {stats.passwordRequired > 0 && (

        <div className="flex items-start gap-3
                        rounded-xl border
                        border-amber-200
                        bg-amber-50 p-4">

          <AlertCircle
            size={20}
            className="shrink-0
                       text-amber-600"
          />

          <div>

            <p className="text-sm font-semibold
                          text-amber-800">

              Password configuration required

            </p>

            <p className="mt-1 text-sm
                          text-amber-700">

              {stats.passwordRequired}

              {" agent account(s) do not have "}
              {"a configured password. "}
              {"Use the Set Password action "}
              {"to configure their credentials."}

            </p>

          </div>

        </div>

      )}

      <section className="overflow-hidden
                          rounded-xl border
                          border-slate-200
                          bg-white shadow-sm">

        <div className="border-b
                        border-slate-100 p-5">

          <h2 className="text-lg font-semibold
                         text-slate-800">

            Support Agents

          </h2>

          <p className="mt-1 text-sm
                        text-slate-500">

            View and manage registered
            support agent accounts.

          </p>

        </div>


        <AgentFilters
          search={search}
          status={status}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onClear={handleClearFilters}
        />

        <AgentTable
          agents={paginatedAgents}
          workload={workload}
          hasFilters={
            search.trim().length > 0 ||
            status !== "all"
          }
          disabled={
            refreshing ||
            modal !== null
          }
          onEdit={handleOpenEdit}
          onToggleStatus={handleOpenStatus}
          onResetPassword={handleOpenPasswordReset}
        />


        <div className="flex flex-wrap
                        items-center
                        justify-between gap-4
                        border-t
                        border-slate-100 p-5">

          <p className="text-sm
                        text-slate-500">

            Showing{" "}

            {filteredAgents.length === 0
              ? 0
              : startIndex + 1}

            {" to "}

            {Math.min(
              endIndex,
              filteredAgents.length
            )}

            {" of "}

            {filteredAgents.length}

            {" agents"}

          </p>


          <div className="flex
                          items-center gap-3">

            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setPage(
                  Math.max(
                    1,
                    currentPage - 1
                  )
                )
              }
              className="flex items-center gap-1
                         rounded-lg border
                         border-slate-200
                         px-3 py-2 text-sm
                         text-slate-700
                         hover:bg-slate-50
                         disabled:opacity-40"
            >

              <ChevronLeft size={16} />

              Previous

            </button>

            <span className="text-sm font-medium
                             text-slate-700">

              {currentPage} / {totalPages}

            </span>

            <button
              type="button"
              disabled={
                currentPage >= totalPages
              }
              onClick={() =>
                setPage(
                  Math.min(
                    totalPages,
                    currentPage + 1
                  )
                )
              }
              className="flex items-center gap-1
                         rounded-lg border
                         border-slate-200
                         px-3 py-2 text-sm
                         text-slate-700
                         hover:bg-slate-50
                         disabled:opacity-40"
            >

              Next

              <ChevronRight size={16} />

            </button>

          </div>

        </div>

      </section>

      {modal?.type === "register" && (

        <AgentRegistrationModal
          onClose={handleCloseModal}
          onSuccess={handleRegistrationSuccess}
        />

      )}

      {modal?.type === "edit" && (

        <AgentEditModal
          agent={modal.agent}
          onClose={handleCloseModal}
          onSuccess={handleEditSuccess}
        />

      )}

      {modal?.type === "status" && (

        <AgentStatusModal
          agent={modal.agent}
          activeTickets={
            workload.find(
              (item) =>
                item.agent_id === modal.agent.id
            )?.active_tickets
          }
          onClose={handleCloseModal}
          onSuccess={handleStatusSuccess}
        />

      )}

      {modal?.type === "password" && (

        <AgentPasswordResetModal
          agent={modal.agent}
          onClose={handleCloseModal}
          onSuccess={handlePasswordResetSuccess}
        />

      )}

    </div>

  );

};

export default AdminAgentsPage;