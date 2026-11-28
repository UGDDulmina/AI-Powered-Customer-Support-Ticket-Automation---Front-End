import {
  customerApiClient,
} from "./customerAuth.api";

import type {
  CustomerDashboardData,
} from "../types/customerDashboard.types";

export const getCustomerDashboard = async (
  signal?: AbortSignal
): Promise<CustomerDashboardData> => {
  const response =
    await customerApiClient.get<CustomerDashboardData>(
      "/customer-portal/dashboard",
      { signal }
    );

  if (
    !response.data.statistics ||
    !Array.isArray(response.data.recent_tickets)
  ) {
    throw new Error(
      "Invalid customer dashboard response."
    );
  }

  return response.data;
};