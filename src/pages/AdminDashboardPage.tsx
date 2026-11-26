import {
  Ticket,
  Users,
  ContactRound,
  Workflow,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";


const quickActions = [
  {
    title: "Manage Agents",
    description: "Register and manage support agents.",
    path: "/admin/agents",
    icon: Users,
  },
  {
    title: "Manage Customers",
    description: "View and manage customer records.",
    path: "/admin/customers",
    icon: ContactRound,
  },
  {
    title: "Manage Tickets",
    description: "Monitor customer support tickets.",
    path: "/admin/tickets",
    icon: Ticket,
  },
  {
    title: "AI Automation",
    description: "Monitor automated support workflows.",
    path: "/admin/automation",
    icon: Workflow,
  },
];


const AdminDashboardPage = () => {

  const { user } = useAuth();


  return (

    <div className="space-y-6">

      <div>

        <h1 className="text-2xl font-bold
                       text-slate-900">

          Admin Dashboard

        </h1>

        <p className="mt-1 text-slate-500">

          Welcome back, {user?.name}.

        </p>

      </div>


      {/* Welcome section */}

      <div className="rounded-2xl bg-blue-600
                      p-6 text-white">

        <h2 className="text-xl font-semibold">

          AI Customer Support System

        </h2>

        <p className="mt-2 text-blue-100">

          Manage support agents, customers,
          tickets and AI automation from
          your administrator portal.

        </p>

      </div>


      {/* Quick actions */}

      <section>

        <h2 className="mb-4 text-lg font-semibold
                       text-slate-800">

          Quick Actions

        </h2>

        <div className="grid grid-cols-1 gap-4
                        md:grid-cols-2
                        xl:grid-cols-4">

          {quickActions.map((action) => {

            const Icon = action.icon;

            return (

              <Link
                key={action.path}
                to={action.path}
                className="rounded-xl border
                           border-slate-200
                           bg-white p-5
                           shadow-sm transition
                           hover:border-blue-300
                           hover:shadow-md"
              >

                <div className="mb-4 inline-flex
                                rounded-lg
                                bg-blue-50 p-3
                                text-blue-600">

                  <Icon size={24} />

                </div>

                <h3 className="font-semibold
                               text-slate-800">

                  {action.title}

                </h3>

                <p className="mt-2 text-sm
                              text-slate-500">

                  {action.description}

                </p>

              </Link>

            );

          })}

        </div>

      </section>

    </div>

  );

};


export default AdminDashboardPage;