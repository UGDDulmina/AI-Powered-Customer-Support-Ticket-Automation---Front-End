import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

import LoadingSpinner from "../common/LoadingSpinner";


const ProtectedRoute = () => {

  const {
    user,
    loading,
    isAuthenticated,
  } = useAuth();

  const location = useLocation();


  if (loading) {

    return (
      <LoadingSpinner
        message="Verifying authentication..."
      />
    );

  }


  if (!isAuthenticated || !user?.is_active) {

    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );

  }


  return <Outlet />;
};


export default ProtectedRoute;