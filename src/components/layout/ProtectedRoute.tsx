
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentAgent } from "../../api/auth.api";

export default function ProtectedRoute() {
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
      setStatus("unauthenticated");
      return;
    }

    getCurrentAgent()
      .then(() => setStatus("authenticated"))
      .catch(() => {
        sessionStorage.removeItem("access_token");
        setStatus("unauthenticated");
      });
  }, []);

  if (status === "loading") {
    return <div className="p-8">Checking session...</div>;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
