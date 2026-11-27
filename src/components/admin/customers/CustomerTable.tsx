import {
  Users,
  Mail,
  Phone,
  CalendarDays,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";

import { Link } from "react-router-dom";

import type {
  Customer,
} from "../../../types/customer.types";

interface CustomerTableProps {
  customers: Customer[];
  hasFilters: boolean;
  disabled?: boolean;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
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
    month: "short",
    year: "numeric",
  });
};

const CustomerTable = ({
  customers,
  hasFilters,
  disabled = false,
  onEdit,
  onDelete,
}: CustomerTableProps) => {
  if (customers.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center
                      justify-center p-8 text-center">

        <Users size={46} className="mb-4 text-slate-300" />

        <h3 className="font-semibold text-slate-700">

          {hasFilters
            ? "No matching customers"
            : "No customers registered"}

        </h3>

        <p className="mt-2 text-sm text-slate-500">

          {hasFilters
            ? "Try changing your search or filters."
            : "Add your first customer to get started."}

        </p>

      </div>
    );
  }

  return (
    <div className="overflow-x-auto">

      <table className="w-full text-left text-sm">

        <thead className="bg-slate-50 text-xs
                          uppercase text-slate-500">

          <tr>
            <th className="px-5 py-4">Customer ID</th>
            <th className="px-5 py-4">Customer Name</th>
            <th className="px-5 py-4">Email Address</th>
            <th className="px-5 py-4">Phone Number</th>
            <th className="px-5 py-4">Registered Date</th>
            <th className="px-5 py-4">Actions</th>
          </tr>

        </thead>

        <tbody className="divide-y divide-slate-100">

          {customers.map((customer) => (

            <tr
              key={customer.id}
              className="transition-colors hover:bg-slate-50"
            >

              <td className="whitespace-nowrap px-5 py-4">

                <span className="font-medium text-slate-600">
                  #{customer.id}
                </span>

              </td>

              <td className="min-w-56 px-5 py-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0
                                  items-center justify-center
                                  rounded-full bg-blue-100
                                  font-semibold text-blue-700">

                    {getInitials(customer.name)}

                  </div>

                  <Link
                    to={`/admin/customers/${customer.id}`}
                    className="font-semibold text-slate-800
                               hover:text-blue-600"
                  >

                    {customer.name}

                  </Link>

                </div>

              </td>

              <td className="whitespace-nowrap px-5 py-4">

                <div className="flex items-center
                                gap-2 text-slate-600">

                  <Mail size={16} className="text-slate-400" />

                  {customer.email}

                </div>

              </td>

              <td className="whitespace-nowrap px-5 py-4">

                {customer.phone?.trim() ? (

                  <div className="flex items-center
                                  gap-2 text-slate-600">

                    <Phone size={16} className="text-slate-400" />

                    {customer.phone}

                  </div>

                ) : (

                  <span className="rounded-full bg-amber-50
                                   px-3 py-1 text-xs
                                   font-medium text-amber-700">

                    Not provided

                  </span>

                )}

              </td>

              <td className="whitespace-nowrap px-5 py-4">

                <div className="flex items-center
                                gap-2 text-slate-500">

                  <CalendarDays
                    size={16}
                    className="text-slate-400"
                  />

                  {formatDate(customer.created_at)}

                </div>

              </td>

              <td className="whitespace-nowrap px-5 py-4">

                <div className="flex items-center gap-2">

                  <Link
                    to={`/admin/customers/${customer.id}`}
                    aria-label={`View ${customer.name}`}
                    className="inline-flex items-center gap-1.5
                               rounded-lg bg-slate-100 px-3 py-2
                               text-xs font-medium text-slate-700
                               hover:bg-slate-200"
                  >

                    <Eye size={15} />

                    View

                  </Link>

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onEdit(customer)}
                    aria-label={`Edit ${customer.name}`}
                    className="inline-flex items-center gap-1.5
                               rounded-lg bg-blue-50 px-3 py-2
                               text-xs font-medium text-blue-700
                               hover:bg-blue-100
                               disabled:opacity-50"
                  >

                    <Pencil size={15} />

                    Edit

                  </button>

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onDelete(customer)}
                    aria-label={`Delete ${customer.name}`}
                    className="inline-flex items-center gap-1.5
                               rounded-lg bg-red-50 px-3 py-2
                               text-xs font-medium text-red-700
                               hover:bg-red-100
                               disabled:opacity-50"
                  >

                    <Trash2 size={15} />

                    Delete

                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
};

export default CustomerTable;