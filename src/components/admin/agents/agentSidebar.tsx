import {
  Headset,
  LayoutDashboard,
  Ticket,
  UserRound,
  LogOut,
  X,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../../hooks/useAuth";

interface AgentSidebarProps {
  onClose?: () => void;
}

const navigationItems = [
  {
    label: "Dashboard",
    path: "/agent/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Tickets",
    path: "/agent/tickets",
    icon: Ticket,
  },
  {
    label: "My Profile",
    path: "/agent/profile",
    icon: UserRound,
  },
];

const AgentSidebar = ({
  onClose,
}: AgentSidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate("/login", { replace: true });
  };

  const initials =
    user?.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase() || "SA";

  return (
    <aside className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-20 items-center justify-between border-b border-slate-800 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
            <Headset size={24} />
          </div>

          <div>
            <h1 className="text-base font-semibold">
              AI Support
            </h1>

            <p className="text-xs text-slate-400">
              Agent Portal
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Workspace
        </p>

        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-800 p-4">
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-800 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {user?.name || "Support Agent"}
            </p>

            <p className="truncate text-xs text-slate-400">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AgentSidebar;