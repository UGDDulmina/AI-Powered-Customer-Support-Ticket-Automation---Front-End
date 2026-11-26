import { useState } from "react";
import type { FormEvent } from "react";

import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import { useAuth } from "../hooks/useAuth";

import LoadingSpinner from
  "../components/common/LoadingSpinner";


const LoginPage = () => {

  const navigate = useNavigate();

  const {
    user,
    login,
    loading: authLoading,
  } = useAuth();


  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);


  const handleLogin = async (
    event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    if (loading) return;

    setError("");

    setLoading(true);

    try {

      const currentUser = await login({
        email: email.trim(),
        password,
      });


      if (currentUser.role === "admin") {

        navigate("/admin/dashboard", {
          replace: true,
        });

      } else if (currentUser.role === "agent") {

        navigate("/agent/dashboard", {
          replace: true,
        });

      } else {

        setError("Unsupported user role.");

      }

    } catch (err: unknown) {

      if (axios.isAxiosError(err)) {

        if (err.response?.status === 401) {

          setError(
            "Invalid email or password, or inactive account."
          );

        } else if (err.response?.status === 403) {

          setError(
            "You do not have permission to access this system."
          );

        } else if (err.response?.status === 422) {

          setError(
            "Please enter a valid email and password."
          );

        } else if (!err.response) {

          setError(
            "Unable to connect to the server."
          );

        } else {

          setError(
            "Login failed. Please try again."
          );

        }

      } else {

        setError(
          "Unable to complete authentication."
        );

      }

    } finally {

      setLoading(false);

    }

  };


  // Wait until session restoration is completed
  if (authLoading) {

    return (
      <LoadingSpinner
        message="Checking authentication..."
      />
    );

  }


  // Redirect already authenticated users
  if (user?.is_active && user.role === "admin") {

    return (
      <Navigate
        to="/admin/dashboard"
        replace
      />
    );

  }


  if (user?.is_active && user.role === "agent") {

    return (
      <Navigate
        to="/agent/dashboard"
        replace
      />
    );

  }


  return (

    <div className="min-h-screen flex items-center
                    justify-center bg-slate-100 p-6">

      <div className="w-full max-w-md bg-white
                      rounded-2xl shadow-xl p-8">

        <div className="text-center mb-8">

          <div className="mx-auto mb-4 flex h-14
                          w-14 items-center justify-center
                          rounded-xl bg-blue-600
                          text-white text-xl font-bold">

            AI

          </div>

          <h1 className="text-2xl font-bold
                         text-slate-800">

            AI Support System

          </h1>

          <p className="text-slate-500 mt-2">

            Sign in to your staff account

          </p>

        </div>


        {error && (

          <div
            role="alert"
            className="mb-5 rounded-lg border
                       border-red-200 bg-red-50
                       p-3 text-sm text-red-700"
          >

            {error}

          </div>

        )}


        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <div>

            <label
              htmlFor="email"
              className="block text-sm font-medium
                         text-slate-700 mb-2"
            >

              Email Address

            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              autoComplete="email"
              required
              disabled={loading}
              className="w-full rounded-lg border
                         border-slate-300 px-4 py-3
                         outline-none focus:border-blue-500
                         focus:ring-2 focus:ring-blue-100"
            />

          </div>


          <div>

            <label
              htmlFor="password"
              className="block text-sm font-medium
                         text-slate-700 mb-2"
            >

              Password

            </label>

            <div className="relative">

              <input
                id="password"
                type={
                  showPassword ? "text" : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={loading}
                className="w-full rounded-lg border
                           border-slate-300 px-4 py-3
                           pr-16 outline-none
                           focus:border-blue-500
                           focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-1/2
                           -translate-y-1/2 text-sm
                           text-blue-600"
              >

                {showPassword ? "Hide" : "Show"}

              </button>

            </div>

          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600
                       px-4 py-3 font-medium text-white
                       hover:bg-blue-700
                       disabled:opacity-60
                       disabled:cursor-not-allowed"
          >

            {loading ? "Signing in..." : "Sign In"}

          </button>

        </form>


        <div className="mt-6 border-t
                        border-slate-200 pt-5
                        text-center text-sm
                        text-slate-500">

          Authorized administrators and support
          agents only.

        </div>

      </div>

    </div>

  );
};


export default LoginPage;