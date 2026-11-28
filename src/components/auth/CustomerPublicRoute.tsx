import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  LoaderCircle,
} from "lucide-react";

import {
  useCustomerAuth,
} from "../../hooks/useCustomerAuth";

export default function CustomerPublicRoute() {
  const {
    loading,
    isAuthenticated,
  } = useCustomerAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <LoaderCircle
          size={36}
          className="animate-spin text-blue-600"
        />

        <p className="mt-4 text-sm text-gray-500">
          Checking customer session...
        </p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to="/customer/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}