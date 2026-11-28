import {
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";

import { LoaderCircle } from "lucide-react";
import CustomerLayout from "./components/layout/CustomerLayout";
import { useAuth } from "./hooks/useAuth";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleRoute from "./components/auth/RoleRoute";

import AdminLayout from "./components/layout/AdminLayout";
import AgentLayout from "./components/layout/AgentLayout";

import LoginPage from "./pages/LoginPage";
import AgentDashboardPage from "./pages/AgentDashboardPage";

import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminAgentsPage from "./pages/AdminAgentPage";
import AdminCustomersPage from "./pages/AdminCustomersPage";
import AdminCustomerDetailsPage from "./pages/AdminCustomerDetailsPage";
import AdminTicketsPage from "./pages/AdminTicketsPage";
import AdminCreateTicketPage from "./pages/AdminCreateTicketPage";
import AdminTicketDetailPage from "./pages/AdminTicketDetailPage";

import AgentProfilePage from "./pages/AgentProfilePage";

import AgentTicketsPage from "./pages/AgentTicketsPage";
import AgentTicketDetailPage from "./pages/AgentTicketDetailPage";

import AdminAIAnalyticsPage from "./pages/AdminAIAnalyticsPage";

import AdminAutomationPage from "./pages/AdminAutomationPage";
import CustomerRegisterPage from "./pages/CustomerRegisterPage";

import CustomerLoginPage from "./pages/CustomerLoginPage";
import CustomerDashboardPage from "./pages/CustomerDashboardPage";
import CustomerProtectedRoute from "./components/auth/CustomerProtectedRoute";
import CustomerPublicRoute from "./components/auth/CustomerPublicRoute";


const RouteLoading = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50">
    <LoaderCircle
      size={32}
      className="animate-spin text-blue-600"
    />
  </div>
);

const DashboardRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <RouteLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === "agent") {
    return <Navigate to="/agent/dashboard" replace />;
  }

  return <Navigate to="/unauthorized" replace />;
};

const TicketRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <RouteLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin/tickets" replace />;
  }

  if (user.role === "agent") {
    return <Navigate to="/agent/tickets" replace />;
  }

  return <Navigate to="/unauthorized" replace />;
};

const TicketDetailRedirect = () => {
  const { ticketId } = useParams();
  const { user, loading } = useAuth();

  if (loading) {
    return <RouteLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const numericTicketId = Number(ticketId);

  if (
    !Number.isSafeInteger(numericTicketId) ||
    numericTicketId <= 0
  ) {
    return <TicketRedirect />;
  }

  if (user.role === "admin") {
    return (
      <Navigate
        to={`/admin/tickets/${numericTicketId}`}
        replace
      />
    );
  }

  if (user.role === "agent") {
    return (
      <Navigate
        to={`/agent/tickets/${numericTicketId}`}
        replace
      />
    );
  }

  return <Navigate to="/unauthorized" replace />;
};

const UnauthorizedPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-3xl font-bold text-red-600">
        403
      </h1>

      <h2 className="mt-4 text-xl font-semibold text-slate-900">
        Access Denied
      </h2>

      <p className="mt-3 text-sm text-slate-500">
        You do not have permission to access this page.
      </p>

      <a
        href="/dashboard"
        className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
      >
        Return to Dashboard
      </a>
    </div>
  </div>
);

const App = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage />}
      />

     <Route element={<CustomerPublicRoute />}>
          <Route
            path="/customer/register"
            element={<CustomerRegisterPage />}
          />

          <Route
            path="/customer/login"
            element={<CustomerLoginPage />}
          />
        </Route>

        <Route element={<CustomerProtectedRoute />}>
          <Route
            path="/customer"
            element={<CustomerLayout />}
          >
            <Route
              index
              element={
                <Navigate
                  to="dashboard"
                  replace
                />
              }
            />

    <Route
      path="dashboard"
      element={<CustomerDashboardPage />}
    />

    <Route
      path="tickets"
      element={
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">
            My Tickets
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Ticket tracking will be available in Phase 19.3.
          </p>
        </div>
      }
    />

    <Route
      path="tickets/create"
      element={
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">
            Create Support Ticket
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Ticket creation will be available in Phase 19.2.
          </p>
        </div>
      }
    />

    <Route
      path="tickets/:ticketId"
      element={
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">
            Ticket Details
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Ticket details will be available in Phase 19.3.
          </p>
        </div>
      }
    />

    <Route
      path="profile"
      element={
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">
            My Profile
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Profile management will be available in Phase 19.5.
          </p>
        </div>
      }
    />
  </Route>
</Route>
      <Route element={<ProtectedRoute />}>
        <Route
          path="/unauthorized"
          element={<UnauthorizedPage />}
        />

        <Route
          path="/dashboard"
          element={<DashboardRedirect />}
        />

        <Route
          path="/tickets"
          element={<TicketRedirect />}
        />

        <Route
          path="/tickets/:ticketId"
          element={<TicketDetailRedirect />}
        />

        <Route
          element={<RoleRoute allowedRoles={["admin"]} />}
        >
          <Route
            path="/admin"
            element={<AdminLayout />}
          >
            <Route
              index
              element={<Navigate to="dashboard" replace />}
            />

            <Route
              path="dashboard"
              element={<AdminDashboardPage />}
            />

            <Route
              path="agents"
              element={<AdminAgentsPage />}
            />

            <Route
              path="customers"
              element={<AdminCustomersPage />}
            />

            <Route
              path="customers/:customerId"
              element={<AdminCustomerDetailsPage />}
            />

            <Route
              path="tickets"
              element={<AdminTicketsPage />}
            />

            <Route
              path="tickets/create"
              element={<AdminCreateTicketPage />}
            />

            <Route
              path="tickets/:ticketId"
              element={<AdminTicketDetailPage />}
            />

             <Route
                path="analytics"
                element={<AdminAIAnalyticsPage />}
              />

              <Route
                  path="automation"
                  element={<AdminAutomationPage />}
                />

          </Route>
        </Route>
       <Route element={<RoleRoute allowedRoles={["agent"]} />}>
          <Route path="/agent" element={<AgentLayout />}>
            <Route
              index
              element={<Navigate to="dashboard" replace />}
            />

            <Route
              path="dashboard"
              element={<AgentDashboardPage />}
            />

            <Route
              path="tickets"
              element={<AgentTicketsPage />}
            />

            <Route
              path="tickets/:ticketId"
              element={<AgentTicketDetailPage />}
            />

            <Route
              path="profile"
              element={<AgentProfilePage />}
            />
          </Route>
        </Route> 
         
      </Route>

      <Route
        path="/"
        element={<DashboardRedirect />}
      />

      <Route
        path="*"
        element={<DashboardRedirect />}
      />
    </Routes>
  );
};

export default App;