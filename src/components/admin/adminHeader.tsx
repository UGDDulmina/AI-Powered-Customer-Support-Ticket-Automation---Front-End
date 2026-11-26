import {
  useState,
  useEffect,
  useRef,
} from "react";

import {
  Menu,
  ChevronDown,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";


interface AdminHeaderProps {
  onMenuClick: () => void;
}


const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/agents": "Agent Management",
  "/admin/customers": "Customer Management",
  "/admin/tickets": "Ticket Management",
  "/admin/analytics": "AI Analytics",
  "/admin/automation": "AI Automation",
};


const AdminHeader = ({
  onMenuClick,
}: AdminHeaderProps) => {

  const { user, logout } = useAuth();

  const location = useLocation();

  const navigate = useNavigate();


  const [dropdownOpen, setDropdownOpen] =
    useState(false);


  const dropdownRef =
    useRef<HTMLDivElement>(null);

  const profileButtonRef =
    useRef<HTMLButtonElement>(null);


  // Determine the current page title

  const getPageTitle = (): string => {

    if (
      location.pathname.startsWith(
        "/admin/tickets/"
      )
    ) {
      return "Ticket Details";
    }

    return (
      pageTitles[location.pathname]
      || "Administration"
    );

  };


  const pageTitle = getPageTitle();


  // Generate profile initials

  const getInitials = (): string => {

    if (!user?.name?.trim()) {
      return "A";
    }

    return user.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();

  };


  // Close dropdown when clicking outside

  useEffect(() => {

    if (!dropdownOpen) return;

    const handleOutsideClick = (
      event: MouseEvent
    ) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {

        setDropdownOpen(false);

      }

    };


    const handleKeyDown = (
      event: KeyboardEvent
    ) => {

      if (event.key === "Escape") {

        setDropdownOpen(false);

        profileButtonRef.current?.focus();

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


  // Logout administrator

  const handleLogout = () => {

    setDropdownOpen(false);

    logout();

    navigate("/login", {
      replace: true,
    });

  };


  return (

    <header className="sticky top-0 z-30
                       flex min-h-20 items-center
                       justify-between gap-4
                       border-b border-slate-200
                       bg-white px-4 py-3
                       lg:px-6">

      {/* Left section */}

      <div className="flex min-w-0
                      items-center gap-3">

        {/* Mobile menu button */}

        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-lg p-2
                     text-slate-600
                     hover:bg-slate-100
                     lg:hidden"
        >

          <Menu size={24} />

        </button>


        {/* Dynamic page title */}

        <div className="min-w-0">

          <p className="truncate text-xs
                        text-slate-500">

            Administration / {pageTitle}

          </p>

          <h2 className="truncate text-lg
                         font-semibold
                         text-slate-900">

            {pageTitle}

          </h2>

        </div>

      </div>


      {/* Right section */}

      <div
        ref={dropdownRef}
        className="relative shrink-0"
      >

        {/* Profile button */}

        <button
          ref={profileButtonRef}
          type="button"
          aria-label="Administrator profile"
          aria-expanded={dropdownOpen}
          aria-controls="admin-profile-dropdown"
          onClick={() =>
            setDropdownOpen((previous) => !previous)
          }
          className="flex items-center gap-3
                     rounded-lg p-2
                     transition-colors
                     hover:bg-slate-100"
        >

          {/* Avatar */}

          <div className="flex h-10 w-10
                          items-center
                          justify-center
                          rounded-full
                          bg-blue-100
                          font-semibold
                          text-blue-700">

            {getInitials()}

          </div>


          {/* User information */}

          <div className="hidden max-w-40
                          text-left sm:block">

            <p className="truncate text-sm
                          font-semibold
                          text-slate-800">

              {user?.name || "Administrator"}

            </p>

            <p className="text-xs
                          text-slate-500">

              Administrator

            </p>

          </div>


          <ChevronDown
            size={16}
            className={`text-slate-500
                        transition-transform
                        ${
                          dropdownOpen
                            ? "rotate-180"
                            : ""
                        }`}
          />

        </button>


        {/* Profile dropdown */}

        {dropdownOpen && (

          <div
            id="admin-profile-dropdown"
            className="absolute right-0
                       top-full mt-2 w-64
                       max-w-[calc(100vw-2rem)]
                       overflow-hidden
                       rounded-xl border
                       border-slate-200
                       bg-white shadow-lg"
          >

            {/* Account information */}

            <div className="border-b
                            border-slate-100
                            p-4">

              <div className="mb-3 flex
                              items-center gap-3">

                <div className="flex h-10 w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-blue-50
                                text-blue-600">

                  <UserRound size={22} />

                </div>

                <div className="min-w-0">

                  <p className="truncate
                                text-sm
                                font-semibold
                                text-slate-900">

                    {user?.name}

                  </p>

                  <p className="truncate
                                text-xs
                                text-slate-500">

                    {user?.email}

                  </p>

                </div>

              </div>


              <span className="inline-flex
                               rounded-full
                               bg-blue-50
                               px-3 py-1
                               text-xs
                               font-medium
                               text-blue-700">

                Administrator

              </span>

            </div>


            {/* Account status */}

            <div className="flex items-center
                            gap-3 border-b
                            border-slate-100
                            px-4 py-3">

              <ShieldCheck
                size={18}
                className={
                  user?.is_active
                    ? "text-green-600"
                    : "text-red-600"
                }
              />

              <span className="text-sm
                               text-slate-600">

                {user?.is_active
                  ? "Account active"
                  : "Account inactive"}

              </span>

            </div>


            {/* Logout */}

            <div className="p-2">

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full
                           items-center gap-3
                           rounded-lg
                           px-3 py-3
                           text-sm font-medium
                           text-red-600
                           hover:bg-red-50"
              >

                <LogOut size={18} />

                Sign out

              </button>

            </div>

          </div>

        )}

      </div>

    </header>

  );

};


export default AdminHeader;