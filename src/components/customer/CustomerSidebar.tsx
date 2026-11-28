import { NavLink } from "react-router-dom";

import {
  Headset,
  LayoutDashboard,
  Ticket,
  PlusCircle,
  UserRound,
  LogOut,
  X,
} from "lucide-react";

import {
  useCustomerAuth,
} from "../../hooks/useCustomerAuth";

interface CustomerSidebarProps {
  onClose?: () => void;
}

const navigationItems = [
  {
    label: "Dashboard",
    path: "/customer/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Tickets",
    path: "/customer/tickets",
    icon: Ticket,
  },
  {
    label: "New Ticket",
    path: "/customer/tickets/create",
    icon: PlusCircle,
  },
  {
    label: "My Profile",
    path: "/customer/profile",
    icon: UserRound,
  },
];

export default function CustomerSidebar({
  onClose,
}: CustomerSidebarProps) {
  const { customer, logout } = useCustomerAuth();

  return (
    <aside className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="flex items-center gap-3 border-b border-gray-800 px-5 py-6">
        <div className="rounded-xl bg-blue-600 p-2.5">
          <Headset size={25} />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-bold">
            Support Portal
          </h1>

          <p className="mt-1 text-xs text-gray-400">
            Customer Workspace
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="text-gray-400 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-6">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Workspace
        </p>

        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <Icon size={19} />

              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-gray-800 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold">
            {customer?.name.charAt(0).toUpperCase() || "C"}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {customer?.name}
            </p>

            <p className="truncate text-xs text-gray-400">
              Customer Account
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onClose?.();
            logout();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={18} />

          Logout
        </button>
      </div>
    </aside>
  );
}