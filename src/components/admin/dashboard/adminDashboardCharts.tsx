import TicketStatusChart from
  "./ticketStatusChart";

import TicketPriorityChart from
  "./ticketPriorityChart";

import ResolutionRateCard from
  "./resolutionRateCard";

import AgentAvailabilityCard from
  "./agentAvailabilityCard";

import type {
  AdminDashboardData,
} from "../../../types/adminDashboard.types";


interface AdminDashboardChartsProps {
  data: AdminDashboardData;
}


const AdminDashboardCharts = ({
  data,
}: AdminDashboardChartsProps) => {

  return (

    <section className="space-y-6">

      <div>

        <h2 className="text-lg font-semibold
                       text-slate-800">

          Support Performance Analytics

        </h2>

        <p className="mt-1 text-sm
                      text-slate-500">

          Monitor ticket distribution,
          resolution performance and
          agent account availability.

        </p>

      </div>


      {/* Ticket charts */}

      <div className="grid grid-cols-1
                      gap-6 xl:grid-cols-2">

        <TicketStatusChart
          stats={data.tickets.by_status}
        />

        <TicketPriorityChart
          stats={data.tickets.by_priority}
        />

      </div>


      {/* Performance cards */}

      <div className="grid grid-cols-1
                      gap-6 xl:grid-cols-2">

        <ResolutionRateCard
          stats={data.tickets.overview}
        />

        <AgentAvailabilityCard
          stats={data.agents}
        />

      </div>

    </section>

  );

};


export default AdminDashboardCharts;