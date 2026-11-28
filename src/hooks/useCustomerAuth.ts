import { useContext } from "react";

import {
  CustomerAuthContext,
} from "../context/customerAuthContext";

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);

  if (context === undefined) {
    throw new Error(
      "useCustomerAuth must be used within CustomerAuthProvider"
    );
  }

  return context;
};