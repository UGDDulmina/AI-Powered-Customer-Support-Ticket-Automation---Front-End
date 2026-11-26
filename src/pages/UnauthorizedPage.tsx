import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";


const UnauthorizedPage = () => {

  const navigate = useNavigate();

  const { user, logout } = useAuth();


  const handleGoBack = () => {

    if (user?.role === "admin") {

      navigate("/admin/dashboard", {
        replace: true,
      });

    } else if (user?.role === "agent") {

      navigate("/agent/dashboard", {
        replace: true,
      });

    } else {

      logout();

      navigate("/login", {
        replace: true,
      });

    }

  };


  const handleLogout = () => {

    logout();

    navigate("/login", {
      replace: true,
    });

  };


  return (

    <div className="min-h-screen flex items-center
                    justify-center bg-slate-100 p-6">

      <div className="w-full max-w-md rounded-2xl
                      bg-white p-8 shadow-lg text-center">

        <div className="text-6xl font-bold
                        text-red-500 mb-4">

          403

        </div>

        <h1 className="text-2xl font-bold
                       text-slate-800 mb-3">

          Access Denied

        </h1>

        <p className="text-slate-500 mb-6">

          You do not have permission to access
          this page.

        </p>

        <div className="rounded-lg bg-slate-50
                        p-4 mb-6 text-sm">

          <p className="text-slate-600">

            Current Role:

            <span className="ml-2 font-semibold
                             capitalize">

              {user?.role ?? "Unknown"}

            </span>

          </p>

        </div>

        <div className="flex flex-col gap-3">

          <button
            onClick={handleGoBack}
            className="rounded-lg bg-blue-600
                       px-4 py-3 text-white
                       font-medium hover:bg-blue-700"
          >

            Go to Dashboard

          </button>

          <button
            onClick={handleLogout}
            className="rounded-lg border
                       border-slate-300 px-4 py-3
                       text-slate-700 hover:bg-slate-50"
          >

            Logout

          </button>

        </div>

      </div>

    </div>

  );
};


export default UnauthorizedPage;