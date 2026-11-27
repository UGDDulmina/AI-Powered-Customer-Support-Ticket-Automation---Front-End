import { apiClient } from "./client";

import type {
  Customer,
  CustomerCreateRequest,
  CustomerUpdateRequest,
  CustomerFilters,
  CustomerManagementStats,
  CustomerTicketFilters,
  CustomerTicketListResponse,
  CustomerDetailsData,
  CustomerTicketStatistics,
} from "../types/customer.types";

const normalizeCustomerData = (
  payload: CustomerCreateRequest
): CustomerCreateRequest => {
  return {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone?.trim() || null,
  };
};

export const getCustomers = async (
  filters: CustomerFilters = {},
  signal?: AbortSignal
): Promise<Customer[]> => {
  const response = await apiClient.get<Customer[]>(
    "/customers",
    {
      params: {
        skip: filters.skip ?? 0,
        limit: filters.limit ?? 100,
      },
      signal,
    }
  );

  if (!Array.isArray(response.data)) {
    throw new Error("Invalid customer list response.");
  }

  return response.data;
};

export const getAllCustomers = async (
  signal?: AbortSignal
): Promise<Customer[]> => {
  const customers = new Map<number, Customer>();

  const limit = 100;

  let skip = 0;

  while (true) {
    const records = await getCustomers(
      { skip, limit },
      signal
    );

    let newRecords = 0;

    for (const customer of records) {
      if (!customers.has(customer.id)) {
        newRecords++;
      }

      customers.set(customer.id, customer);
    }

    if (records.length < limit) {
      break;
    }

    if (newRecords === 0) {
      throw new Error(
        "Customer pagination returned duplicate records."
      );
    }

    skip += limit;
  }

  return Array.from(customers.values());
};

export const getCustomerById = async (
  customerId: number,
  signal?: AbortSignal
): Promise<Customer> => {
  const response = await apiClient.get<Customer>(
    `/customers/${customerId}`,
    { signal }
  );

  return response.data;
};

export const createCustomer = async (
  payload: CustomerCreateRequest
): Promise<Customer> => {
  const response = await apiClient.post<Customer>(
    "/customers",
    normalizeCustomerData(payload)
  );

  return response.data;
};

export const updateCustomer = async (
  customerId: number,
  payload: CustomerUpdateRequest
): Promise<Customer> => {
  const response = await apiClient.put<Customer>(
    `/customers/${customerId}`,
    normalizeCustomerData(payload)
  );

  return response.data;
};

export const deleteCustomer = async (
  customerId: number
): Promise<void> => {
  await apiClient.delete(`/customers/${customerId}`);
};

export const getCustomerTickets = async (
  customerId: number,
  filters: CustomerTicketFilters = {},
  signal?: AbortSignal
): Promise<CustomerTicketListResponse> => {
  const response =
    await apiClient.get<CustomerTicketListResponse>(
      "/tickets",
      {
        params: {
          customer_id: customerId,
          page: filters.page ?? 1,
          limit: filters.limit ?? 10,
          status: filters.status,
        },
        signal,
      }
    );

  if (
    !Array.isArray(response.data.item) ||
    !Number.isInteger(response.data.total) ||
    response.data.total < response.data.item.length
  ) {
    throw new Error("Invalid customer ticket list response.");
  }

  return response.data;
};

export const getCustomerDetails = async (
  customerId: number,
  filters: CustomerTicketFilters = {},
  signal?: AbortSignal
): Promise<CustomerDetailsData> => {
  const [customer, tickets] = await Promise.all([
    getCustomerById(customerId, signal),
    getCustomerTickets(customerId, filters, signal),
  ]);

  return {
    customer,
    tickets,
  };
};

export const getCustomerTicketStatistics = async (
  customerId: number,
  signal?: AbortSignal
): Promise<CustomerTicketStatistics> => {
  const [open, inProgress, resolved, closed] =
    await Promise.all([
      getCustomerTickets(
        customerId,
        { page: 1, limit: 1, status: "open" },
        signal
      ),

      getCustomerTickets(
        customerId,
        { page: 1, limit: 1, status: "in_progress" },
        signal
      ),

      getCustomerTickets(
        customerId,
        { page: 1, limit: 1, status: "resolved" },
        signal
      ),

      getCustomerTickets(
        customerId,
        { page: 1, limit: 1, status: "closed" },
        signal
      ),
    ]);

  const active = open.total + inProgress.total;

  const completed = resolved.total + closed.total;

  return {
    total: active + completed,
    open: open.total,
    inProgress: inProgress.total,
    resolved: resolved.total,
    closed: closed.total,
    active,
    completed,
  };
};

export const calculateCustomerStats = (
  customers: Customer[]
): CustomerManagementStats => {
  const withPhone = customers.filter(
    (customer) => Boolean(customer.phone?.trim())
  ).length;

  return {
    total: customers.length,
    withPhone,
    withoutPhone: customers.length - withPhone,
  };
};