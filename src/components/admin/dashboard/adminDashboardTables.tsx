import RecentTicketsTable from
  "./recentTicketsTable";

import AgentWorkloadTable from
  "./agentWorkloadTable";

import type {
  AdminDashboardData,
} from "../../../types/adminDashboard.types";


interface AdminDashboardTablesProps {
  data: AdminDashboardData;
}


const AdminDashboardTables = ({
  data,
}: AdminDashboardTablesProps) => {

  return (

    <section className="space-y-6">

      <div>

        <h2 className="text-lg font-semibold
                       text-slate-800">

          Support Operations

        </h2>

        <p className="mt-1 text-sm
                      text-slate-500">

          Monitor recent customer requests
          and support agent assignments.

        </p>

      </div>


      <RecentTicketsTable
        tickets={data.recentTickets}
      />


      <AgentWorkloadTable
        agents={data.agentWorkload}
      />

    </section>

  );

};


export default AdminDashboardTables;