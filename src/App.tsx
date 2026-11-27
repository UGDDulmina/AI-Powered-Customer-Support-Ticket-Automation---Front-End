import {
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TicketsPage from "./pages/TicketsPage";
import AdminAgentsPage from "./pages/AdminAgentPage";
import TicketDetailPage from "./components/tickets/TicketDetailPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleRoute from "./components/auth/RoleRoute";
import LoadingSpinner from "./components/common/LoadingSpinner";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminPlaceholderPage from "./pages/AdminPlaceholderPage";
import AdminCustomersPage from "./pages/AdminCustomersPage";
import AdminCustomerDetailsPage from "./pages/AdminCustomerDetailsPage";
import AdminTicketsPage from "./pages/AdminTicketsPage";
import AdminCreateTicketPage from "./pages/AdminCreateTicketPage";
import AdminTicketDetailPage from "./pages/AdminTicketDetailPage";

import { useAuth } from "./hooks/useAuth";

const DashboardRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <LoadingSpinner message="Loading dashboard..." />
    );
  }

  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user?.role === "agent") {
    return <Navigate to="/agent/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

const TicketRedirect = () => {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <Navigate to="/admin/tickets" replace />;
  }

  if (user?.role === "agent") {
    return <Navigate to="/agent/tickets" replace />;
  }

  return <Navigate to="/unauthorized" replace />;
};

const TicketDetailRedirect = () => {
  const { user } = useAuth();
  const { ticketId } = useParams();

  const id = Number(ticketId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return <TicketRedirect />;
  }

  if (user?.role === "admin") {
    return (
      <Navigate
        to={`/admin/tickets/${id}`}
        replace
      />
    );
  }

  if (user?.role === "agent") {
    return (
      <Navigate
        to={`/agent/tickets/${id}`}
        replace
      />
    );
  }

  return <Navigate to="/unauthorized" replace />;
};

const App = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage />}
      />

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
              element={
                <AdminPlaceholderPage
                  title="AI Analytics"
                  description="Monitor AI performance and insights."
                />
              }
            />

            <Route
              path="automation"
              element={
                <AdminPlaceholderPage
                  title="AI Automation"
                  description="Monitor automated ticket processing."
                />
              }
            />
          </Route>
        </Route>

        <Route
          element={<RoleRoute allowedRoles={["agent"]} />}
        >
          <Route
            path="/agent/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/agent/tickets"
            element={<TicketsPage />}
          />

          <Route
            path="/agent/tickets/:ticketId"
            element={<TicketDetailPage />}
          />
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