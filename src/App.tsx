import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";

import DashboardPage from "./pages/DashboardPage";

import TicketsPage from "./pages/TicketsPage";

import AdminAgentsPage from
  "./pages/AdminAgentPage";

import TicketDetailPage from
  "./components/tickets/TicketDetailPage";

import UnauthorizedPage from
  "./pages/UnauthorizedPage";

import ProtectedRoute from
  "./components/auth/ProtectedRoute";

import RoleRoute from
  "./components/auth/RoleRoute";

import LoadingSpinner from
  "./components/common/LoadingSpinner";

import AdminLayout from "./components/layout/AdminLayout";

import AdminDashboardPage from
  "./pages/AdminDashboardPage";

import AdminPlaceholderPage from
  "./pages/AdminPlaceholderPage";

import { useAuth } from "./hooks/useAuth";


const DashboardRedirect = () => {

  const { user, loading } = useAuth();

  if (loading) {

    return (
      <LoadingSpinner
        message="Loading dashboard..."
      />
    );

  }

  if (user?.role === "admin") {

    return (
      <Navigate
        to="/admin/dashboard"
        replace
      />
    );

  }

  if (user?.role === "agent") {

    return (
      <Navigate
        to="/agent/dashboard"
        replace
      />
    );

  }

  return <Navigate to="/login" replace />;

};


const TicketRedirect = () => {

  const { user } = useAuth();

  return (
    <Navigate
      to={
        user?.role === "admin"
          ? "/admin/tickets"
          : "/agent/tickets"
      }
      replace
    />
  );

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
          element={<TicketDetailPage />}
        />


        <Route
          element={
            <RoleRoute allowedRoles={["admin"]} />
          }
        >

          <Route
            path="/admin"
            element={<AdminLayout />}
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
              element={<AdminDashboardPage />}
            />

             <Route
                path="agents"
                element={<AdminAgentsPage />}
              />

            <Route
              path="customers"
              element={
                <AdminPlaceholderPage
                  title="Customer Management"
                  description="Manage customer records."
                />
              }
            />

            <Route
              path="tickets"
              element={<TicketsPage />}
            />

            <Route
              path="tickets/:ticketId"
              element={<TicketDetailPage />}
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
          element={
            <RoleRoute allowedRoles={["agent"]} />
          }
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