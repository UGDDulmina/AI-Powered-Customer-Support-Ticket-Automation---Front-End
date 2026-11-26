import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

import type {
  UserRole,
} from "../../types/auth.types";

import LoadingSpinner from "../common/LoadingSpinner";


interface RoleRouteProps {

  allowedRoles: UserRole[];

}


const RoleRoute = ({
  allowedRoles,
}: RoleRouteProps) => {

  const {
    user,
    loading,
    isAuthenticated,
  } = useAuth();

  const location = useLocation();


  if (loading) {

    return (
      <LoadingSpinner
        message="Checking permissions..."
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


  if (!allowedRoles.includes(user.role)) {

    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );

  }


  return <Outlet />;
};


export default RoleRoute;