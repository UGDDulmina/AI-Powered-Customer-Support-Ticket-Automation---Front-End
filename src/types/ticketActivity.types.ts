export type TicketActivityAction =
  | "created"
  | "assigned"
  | "reassigned"
  | "status_changed"
  | "priority_changed";

export interface TicketActivity {
  id: number;
  ticket_id: number;
  action: TicketActivityAction;
  old_value: string | null;
  new_value: string | null;
  performed_by: string;
  created_at: string;
}

export type TicketActivityFilter =
  | "all"
  | TicketActivityAction;

export type TicketActivitySort =
  | "newest"
  | "oldest";