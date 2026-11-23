
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentAgent,
  type AgentProfile,
} from "../api/auth.api";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [agent, setAgent] = useState<AgentProfile | null>(null);

  useEffect(() => {
    getCurrentAgent()
      .then(setAgent)
      .catch(() => {
        sessionStorage.removeItem("access_token");
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  function logout() {
    sessionStorage.removeItem("access_token");
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">
            Support Dashboard
          </h1>

          <button
            onClick={logout}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-3">
            Welcome, {agent?.name ?? "Agent"}
          </h2>

          <p>Email: {agent?.email ?? "Loading..."}</p>
          <p>Role: {agent?.role ?? "Loading..."}</p>

          <p className="mt-6 text-slate-500">
            Authentication is connected successfully.
            Ticket management and AI reply workflows
            will be added next.
          </p>
        </div>
      </div>
    </div>
  );
}
