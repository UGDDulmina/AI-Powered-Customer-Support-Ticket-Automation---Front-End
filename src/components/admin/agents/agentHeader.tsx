import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Menu,
  ChevronDown,
  UserRound,
  LogOut,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../../hooks/useAuth";

interface AgentHeaderProps {
  onMenuClick: () => void;
}

const getPageTitle = (pathname: string) => {
  if (pathname.startsWith("/agent/tickets/")) {
    return "Ticket Details";
  }

  if (pathname.startsWith("/agent/tickets")) {
    return "My Tickets";
  }

  if (pathname.startsWith("/agent/profile")) {
    return "My Profile";
  }

  return "Dashboard";
};

const AgentHeader = ({
  onMenuClick,
}: AgentHeaderProps) => {
  const { user, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] =
    useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const pageTitle = getPageTitle(location.pathname);

  const initials =
    user?.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase() || "SA";

  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dropdownOpen) {
        setDropdownOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [dropdownOpen]);

  const handleProfile = () => {
    setDropdownOpen(false);
    navigate("/agent/profile");
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={24} />
        </button>

        <div>
          <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">
            {pageTitle}
          </h1>

          <p className="hidden text-xs text-slate-500 sm:block">
            Support Agent Workspace
          </p>
        </div>
      </div>

      <div
        ref={dropdownRef}
        className="relative"
      >
        <button
          ref={triggerRef}
          type="button"
          aria-label="Open profile options"
          aria-expanded={dropdownOpen}
          aria-controls="agent-profile-dropdown"
          onClick={() =>
            setDropdownOpen((previous) => !previous)
          }
          className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
            {initials}
          </div>

          <div className="hidden max-w-40 text-left sm:block">
            <p className="truncate text-sm font-semibold text-slate-800">
              {user?.name || "Support Agent"}
            </p>

            <p className="text-xs text-slate-500">
              Support Agent
            </p>
          </div>

          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {dropdownOpen && (
          <div
            id="agent-profile-dropdown"
            className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
          >
            <div className="border-b border-slate-100 p-4">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.name}
              </p>

              <p className="mt-1 break-all text-xs text-slate-500">
                {user?.email}
              </p>
            </div>

            <div className="p-2">
              <button
                type="button"
                onClick={handleProfile}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                <UserRound size={18} />
                My Profile
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AgentHeader;