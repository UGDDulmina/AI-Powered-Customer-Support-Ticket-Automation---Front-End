import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  LoaderCircle,
  AlertCircle,
  RefreshCw,
  LogOut,
} from "lucide-react";

import {
  useCustomerAuth,
} from "../../hooks/useCustomerAuth";

export default function CustomerProtectedRoute() {
  const location = useLocation();

  const {
    loading,
    error,
    isAuthenticated,
    refreshCustomer,
    logout,
  } = useCustomerAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <LoaderCircle
          size={36}
          className="animate-spin text-blue-600"
        />

        <p className="mt-4 text-sm text-gray-500">
          Verifying customer session...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <AlertCircle
            size={38}
            className="mx-auto text-red-500"
          />

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            Unable to Verify Session
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => void refreshCustomer()}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            <RefreshCw size={16} />

            Try Again
          </button>

          <button
            type="button"
            onClick={logout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <LogOut size={16} />

            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/customer/login"
        replace
        state={{
          from: location.pathname + location.search,
        }}
      />
    );
  }

  return <Outlet />;
}