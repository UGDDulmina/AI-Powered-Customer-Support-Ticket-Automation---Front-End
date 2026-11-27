export interface TicketAssignmentRequest {
  agent_id: number;
}

export interface AssignableAgent {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  has_password: boolean;
  activeTickets: number | null;
}

export interface TicketAssignmentData {
  agents: AssignableAgent[];
  workloadAvailable: boolean;
}