
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { loginAgent, getCurrentAgent } from "../api/auth.api";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginAgent({ email, password });

      sessionStorage.setItem(
        "access_token",
        result.access_token
      );

      const profile = await getCurrentAgent();

      if (!profile.is_active) {
        throw new Error("Account is inactive");
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      sessionStorage.removeItem("access_token");

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.status === 401
            ? "Invalid email or password"
            : "Unable to log in. Check the backend connection."
        );
      } else {
        setError("Unable to log in.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-md"
      >
        <h1 className="text-2xl font-bold mb-2">
          AI Support System
        </h1>

        <p className="text-slate-500 mb-6">
          Sign in to your support account
        </p>

        {error && (
          <p className="mb-4 text-red-600">{error}</p>
        )}

        <label className="block mb-2 font-medium">
          Email
        </label>

        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg p-3 mb-4"
          placeholder="agent@example.com"
        />

        <label className="block mb-2 font-medium">
          Password
        </label>

        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg p-3 mb-6"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg p-3 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
