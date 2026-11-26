import {
  CheckCircle2,
  Target,
} from "lucide-react";

import type {
  TicketOverviewStats,
} from "../../../types/adminDashboard.types";


interface ResolutionRateCardProps {
  stats: TicketOverviewStats;
}


const ResolutionRateCard = ({
  stats,
}: ResolutionRateCardProps) => {

  const rate =
    stats.total_tickets > 0
      ? (
          stats.completed_tickets /
          stats.total_tickets
        ) * 100
      : 0;


  const progressWidth = Math.min(
    100,
    Math.max(0, rate)
  );


  return (

    <div className="rounded-xl border
                    border-slate-200
                    bg-white p-5 shadow-sm">

      <div className="flex items-center
                      justify-between">

        <div>

          <h2 className="text-lg font-semibold
                         text-slate-800">

            Resolution Rate

          </h2>

          <p className="mt-1 text-sm
                        text-slate-500">

            Completed ticket percentage

          </p>

        </div>


        <div className="rounded-lg bg-green-50
                        p-3 text-green-600">

          <Target size={24} />

        </div>

      </div>


      <div className="mt-6">

        <p className="text-4xl font-bold
                      text-slate-900">

          {stats.total_tickets > 0
            ? `${rate.toFixed(1)}%`
            : "N/A"}

        </p>

        <div className="mt-4 h-3
                        overflow-hidden
                        rounded-full
                        bg-slate-100">

          <div
            className="h-full rounded-full
                       bg-green-500
                       transition-all
                       duration-500"
            style={{
              width: `${progressWidth}%`,
            }}
          />

        </div>

      </div>


      <div className="mt-5 flex items-center
                      gap-2 text-sm
                      text-slate-600">

        <CheckCircle2
          size={18}
          className="text-green-600"
        />

        <span>

          {stats.completed_tickets.toLocaleString()}

          {" of "}

          {stats.total_tickets.toLocaleString()}

          {" tickets completed"}

        </span>

      </div>


      <div className="mt-5 grid
                      grid-cols-2 gap-3">

        <div className="rounded-lg
                        bg-slate-50 p-3">

          <p className="text-xs
                        text-slate-500">

            Active Tickets

          </p>

          <p className="mt-1 text-xl
                        font-semibold
                        text-slate-800">

            {stats.active_tickets.toLocaleString()}

          </p>

        </div>


        <div className="rounded-lg
                        bg-green-50 p-3">

          <p className="text-xs
                        text-green-700">

            Completed Tickets

          </p>

          <p className="mt-1 text-xl
                        font-semibold
                        text-green-700">

            {stats.completed_tickets.toLocaleString()}

          </p>

        </div>

      </div>

    </div>

  );

};


export default ResolutionRateCard;