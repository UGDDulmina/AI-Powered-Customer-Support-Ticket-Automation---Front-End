export interface TicketOverviewStats {
  total_tickets: number;
  active_tickets: number;
  completed_tickets: number;
  resolution_rate: number;
}

export interface TicketStatusStats {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
}

export interface TicketPriorityStats {
  low: number;
  medium: number;
  high: number;
  urgent: number;
}

export interface DashboardStatsResponse {
  overview: TicketOverviewStats;
  by_status: TicketStatusStats;
  by_priority: TicketPriorityStats;
}

export interface SupportAgent {
  id: number;
  name: string;
  email: string;
  role: "admin" | "agent";
  is_active: boolean;
  has_password: boolean;
  created_at: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  created_at: string;
}

export interface AgentWorkload {
  agent_id: number;
  agent_name: string;
  is_active: boolean;
  active_tickets: number;
}

export interface AgentStats {
  total: number;
  active: number;
  inactive: number;
  login_ready: number;
}

export interface AdminDashboardData {
  tickets: DashboardStatsResponse;
  agents: AgentStats;
  totalCustomers: number;
  agentWorkload: AgentWorkload[];
}