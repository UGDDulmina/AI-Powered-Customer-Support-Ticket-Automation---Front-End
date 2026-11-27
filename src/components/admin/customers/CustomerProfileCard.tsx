import {
  Mail,
  Phone,
  CalendarDays,
  Hash,
} from "lucide-react";

import type {
  Customer,
} from "../../../types/customer.types";

interface CustomerProfileCardProps {
  customer: Customer;
}

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase() || "C";

const formatDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const CustomerProfileCard = ({
  customer,
}: CustomerProfileCardProps) => {
  const details = [
    {
      label: "Customer ID",
      value: `#${customer.id}`,
      icon: Hash,
    },
    {
      label: "Email Address",
      value: customer.email,
      icon: Mail,
    },
    {
      label: "Phone Number",
      value: customer.phone?.trim() || "Not provided",
      icon: Phone,
    },
    {
      label: "Registered Date",
      value: formatDate(customer.created_at),
      icon: CalendarDays,
    },
  ];

  return (
    <section className="rounded-xl border border-slate-200
                        bg-white shadow-sm">

      <div className="flex flex-wrap items-center
                      gap-5 border-b border-slate-100 p-6">

        <div className="flex h-20 w-20 shrink-0
                        items-center justify-center
                        rounded-full bg-blue-100
                        text-3xl font-bold text-blue-700">

          {getInitials(customer.name)}

        </div>

        <div className="min-w-0">

          <h2 className="break-words text-2xl
                         font-bold text-slate-900">

            {customer.name}

          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Customer #{customer.id}
          </p>

          <span className="mt-3 inline-block rounded-full
                           bg-blue-50 px-3 py-1 text-xs
                           font-medium text-blue-700">

            Registered Customer

          </span>

        </div>

      </div>

      <div className="grid grid-cols-1 gap-6
                      p-6 sm:grid-cols-2
                      xl:grid-cols-4">

        {details.map((detail) => {
          const Icon = detail.icon;

          return (
            <div
              key={detail.label}
              className="flex min-w-0 items-start gap-3"
            >

              <div className="shrink-0 rounded-lg
                              bg-slate-100 p-3
                              text-slate-500">

                <Icon size={20} />

              </div>

              <div className="min-w-0">

                <p className="text-xs font-medium
                              text-slate-500">

                  {detail.label}

                </p>

                <p className="mt-1 break-words text-sm
                              font-semibold text-slate-800">

                  {detail.value}

                </p>

              </div>

            </div>
          );
        })}

      </div>

    </section>
  );
};

export default CustomerProfileCard;