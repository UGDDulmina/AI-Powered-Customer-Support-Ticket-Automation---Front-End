import {
  LayoutDashboard,
  Users,
  ContactRound,
  Ticket,
  ChartNoAxesCombined,
  Workflow,
  LogOut,
  X,
  Headset,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";


interface AdminSidebarProps {
  onClose?: () => void;
}


const navigationItems = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Agents",
    path: "/admin/agents",
    icon: Users,
  },
  {
    name: "Customers",
    path: "/admin/customers",
    icon: ContactRound,
  },
  {
    name: "Tickets",
    path: "/admin/tickets",
    icon: Ticket,
  },
  {
    name: "AI Analytics",
    path: "/admin/analytics",
    icon: ChartNoAxesCombined,
  },
  {
    name: "Automation",
    path: "/admin/automation",
    icon: Workflow,
  },
];


const AdminSidebar = ({
  onClose,
}: AdminSidebarProps) => {

  const navigate = useNavigate();

  const { user, logout } = useAuth();


  const handleLogout = () => {

    logout();

    navigate("/login", {
      replace: true,
    });

  };


  return (

    <aside className="flex h-full w-64 flex-col
                      bg-slate-900 text-white">

      {/* Logo */}

      <div className="flex items-center gap-3
                      border-b border-slate-700
                      px-5 py-6">

        <div className="rounded-xl bg-blue-600 p-2">

          <Headset size={25} />

        </div>

        <div className="flex-1">

          <h1 className="font-bold text-lg">
            AI Support
          </h1>

          <p className="text-xs text-slate-400">
            Administrator Portal
          </p>

        </div>

        {onClose && (

          <button
            onClick={onClose}
            className="lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>

        )}

      </div>


      {/* Navigation */}

      <nav className="flex-1 overflow-y-auto
                      px-3 py-6">

        <p className="mb-4 px-3 text-xs
                      font-semibold tracking-wider
                      text-slate-400">

          ADMINISTRATION

        </p>


        <div className="space-y-2">

          {navigationItems.map((item) => {

            const Icon = item.icon;

            return (

              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3
                   rounded-lg px-4 py-3
                   text-sm font-medium
                   transition-colors
                   ${
                     isActive
                       ? "bg-blue-600 text-white"
                       : "text-slate-300 hover:bg-slate-800 hover:text-white"
                   }`
                }
              >

                <Icon size={20} />

                <span>{item.name}</span>

              </NavLink>

            );

          })}

        </div>

      </nav>


      {/* User profile */}

      <div className="border-t border-slate-700
                      p-4">

        <div className="mb-4 flex items-center
                        gap-3">

          <div className="flex h-10 w-10
                          shrink-0 items-center
                          justify-center rounded-full
                          bg-blue-600 font-semibold">

            {user?.name?.charAt(0).toUpperCase()
              || "A"}

          </div>

          <div className="min-w-0">

            <p className="truncate text-sm
                          font-semibold">

              {user?.name || "Administrator"}

            </p>

            <p className="truncate text-xs
                          text-slate-400">

              {user?.email}

            </p>

          </div>

        </div>


        <button
          onClick={handleLogout}
          className="flex w-full items-center
                     gap-3 rounded-lg px-4 py-3
                     text-sm font-medium
                     text-red-400
                     hover:bg-slate-800"
        >

          <LogOut size={20} />

          Logout

        </button>

      </div>

    </aside>

  );

};


export default AdminSidebar;