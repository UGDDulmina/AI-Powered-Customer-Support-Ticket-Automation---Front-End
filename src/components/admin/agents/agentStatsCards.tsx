import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
} from "lucide-react";

import type {
  AgentManagementStats,
} from "../../../types/agent.types";

interface AgentStatsCardsProps {
  stats: AgentManagementStats;
}

const AgentStatsCards = ({
  stats,
}: AgentStatsCardsProps) => {

  const cards = [
    {
      title: "Total Agents",
      value: stats.total,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
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
      value: stats.loginReady,
      icon: ShieldCheck,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (

    <div className="grid grid-cols-1 gap-4
                    sm:grid-cols-2 xl:grid-cols-4">

      {cards.map((card) => {

        const Icon = card.icon;

        return (

          <div
            key={card.title}
            className="rounded-xl border
                       border-slate-200
                       bg-white p-5 shadow-sm"
          >

            <div className={`mb-4 inline-flex
                             rounded-lg p-3
                             ${card.color}`}>

              <Icon size={24} />

            </div>

            <p className="text-sm text-slate-500">
              {card.title}
            </p>

            <h3 className="mt-2 text-3xl
                           font-bold text-slate-900">

              {card.value.toLocaleString()}

            </h3>

          </div>

        );

      })}

    </div>

  );

};

export default AgentStatsCards;