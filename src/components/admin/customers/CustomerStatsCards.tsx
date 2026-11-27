import {
  Users,
  Phone,
  PhoneOff,
} from "lucide-react";

import type {
  CustomerManagementStats,
} from "../../../types/customer.types";

interface CustomerStatsCardsProps {
  stats: CustomerManagementStats;
}

const CustomerStatsCards = ({
  stats,
}: CustomerStatsCardsProps) => {

  const cards = [
    {
      title: "Total Customers",
      value: stats.total,
      icon: Users,
      color: "text-blue-600",
      background: "bg-blue-50",
      description: "All registered customers",
    },
    {
      title: "With Phone Number",
      value: stats.withPhone,
      icon: Phone,
      color: "text-green-600",
      background: "bg-green-50",
      description: "Customers with contact numbers",
    },
    {
      title: "Without Phone Number",
      value: stats.withoutPhone,
      icon: PhoneOff,
      color: "text-amber-600",
      background: "bg-amber-50",
      description: "Customers without contact numbers",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4
                    sm:grid-cols-2 xl:grid-cols-3">

      {cards.map((card) => {

        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-xl border
                       border-slate-200 bg-white
                       p-5 shadow-sm"
          >

            <div className="flex items-center
                            justify-between gap-3">

              <p className="text-sm font-medium
                            text-slate-500">
                {card.title}
              </p>

              <div className={`rounded-xl p-3
                ${card.background} ${card.color}`}>

                <Icon size={23} />

              </div>

            </div>

            <h3 className="mt-3 text-3xl
                           font-bold text-slate-900">
              {card.value.toLocaleString()}
            </h3>

            <p className="mt-2 text-xs
                          text-slate-500">
              {card.description}
            </p>

          </div>
        );

      })}

    </div>
  );

};

export default CustomerStatsCards;