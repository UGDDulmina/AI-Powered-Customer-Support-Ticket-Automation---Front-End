import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
} from "lucide-react";

import type {
  AgentStats,
} from "../../../types/adminDashboard.types";


interface AgentAvailabilityCardProps {
  stats: AgentStats;
}


const AgentAvailabilityCard = ({
  stats,
}: AgentAvailabilityCardProps) => {

  const activePercentage =
    stats.total > 0
      ? (stats.active / stats.total) * 100
      : 0;


  const inactivePercentage =
    stats.total > 0
      ? (stats.inactive / stats.total) * 100
      : 0;


  const accounts = [
    {
      title: "Active Agents",
      value: stats.active,
      icon: UserCheck,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Inactive Agents",
      value: stats.inactive,
      icon: UserX,
      color: "bg-red-50 text-red-600",
    },
    {
      title: "Login Ready",
      value: stats.login_ready,
      icon: ShieldCheck,
      color: "bg-blue-50 text-blue-600",
    },
  ];


  return (

    <div className="rounded-xl border
                    border-slate-200
                    bg-white p-5 shadow-sm">

      <div className="flex items-center
                      justify-between">

        <div>

          <h2 className="text-lg font-semibold
                         text-slate-800">

            Agent Account Availability

          </h2>

          <p className="mt-1 text-sm
                        text-slate-500">

            Support agent account status

          </p>

        </div>


        <div className="rounded-lg
                        bg-purple-50 p-3
                        text-purple-600">

          <Users size={24} />

        </div>

      </div>


      <div className="mt-6 grid
                      grid-cols-1 gap-3
                      sm:grid-cols-3">

        {accounts.map((account) => {

          const Icon = account.icon;

          return (

            <div
              key={account.title}
              className="rounded-lg
                         bg-slate-50 p-3"
            >

              <div className={`mb-3 inline-flex
                               rounded-lg p-2
                               ${account.color}`}>

                <Icon size={18} />

              </div>

              <p className="text-xs
                            text-slate-500">

                {account.title}

              </p>

              <p className="mt-1 text-2xl
                            font-bold
                            text-slate-900">

                {account.value.toLocaleString()}

              </p>

            </div>

          );

        })}

      </div>


      {/* Availability progress bar */}

      <div className="mt-6">

        <div className="mb-2 flex
                        justify-between
                        text-sm">

          <span className="font-medium
                           text-green-600">

            {activePercentage.toFixed(1)}%
            {" Active"}

          </span>

          <span className="font-medium
                           text-red-600">

            {inactivePercentage.toFixed(1)}%
            {" Inactive"}

          </span>

        </div>


        <div className="flex h-3
                        overflow-hidden
                        rounded-full
                        bg-slate-100">

          <div
            className="bg-green-500
                       transition-all"
            style={{
              width: `${activePercentage}%`,
            }}
          />

          <div
            className="bg-red-500
                       transition-all"
            style={{
              width: `${inactivePercentage}%`,
            }}
          />

        </div>

      </div>


      <p className="mt-4 text-sm
                    text-slate-500">

        {stats.total.toLocaleString()}

        {" registered support agents"}

      </p>


      {stats.active > stats.login_ready && (

        <div className="mt-4 rounded-lg
                        bg-amber-50 p-3
                        text-sm text-amber-700">

          {stats.active - stats.login_ready}

          {" active agent account(s) do not "}
          {"have a configured password."}

        </div>

      )}

    </div>

  );

};


export default AgentAvailabilityCard;