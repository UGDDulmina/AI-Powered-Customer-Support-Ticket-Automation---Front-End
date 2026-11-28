import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  Menu,
  ChevronDown,
} from "lucide-react";

import {
  useCustomerAuth,
} from "../../hooks/useCustomerAuth";

interface CustomerHeaderProps {
  onMenuClick: () => void;
}

function getPageTitle(pathname: string): string {
  if (pathname === "/customer/dashboard") {
    return "Dashboard";
  }

  if (pathname === "/customer/tickets/create") {
    return "Create Support Ticket";
  }

  if (pathname === "/customer/tickets") {
    return "My Tickets";
  }

  if (pathname.startsWith("/customer/tickets/")) {
    return "Ticket Details";
  }

  if (pathname === "/customer/profile") {
    return "My Profile";
  }

  return "Customer Portal";
}

export default function CustomerHeader({
  onMenuClick,
}: CustomerHeaderProps) {
  const location = useLocation();

  const { customer } = useCustomerAuth();

  return (
    <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        >
          <Menu size={24} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
            {getPageTitle(location.pathname)}
          </h1>

          <p className="hidden text-xs text-gray-500 sm:block">
            Customer Support Workspace
          </p>
        </div>
      </div>

      <Link
        to="/customer/profile"
        className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-gray-50"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
          {customer?.name.charAt(0).toUpperCase() || "C"}
        </div>

        <div className="hidden max-w-40 text-left sm:block">
          <p className="truncate text-sm font-semibold text-gray-800">
            {customer?.name}
          </p>

          <p className="text-xs text-gray-500">
            Customer
          </p>
        </div>

        <ChevronDown
          size={16}
          className="hidden text-gray-400 sm:block"
        />
      </Link>
    </header>
  );
}