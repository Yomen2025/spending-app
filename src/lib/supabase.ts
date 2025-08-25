// Database types - re-export from main client

// Database types
export interface Trip {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Contributor {
  id: string;
  name: string;
  email?: string;
  user_id?: string;
  trip_id: string;
  created_at: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  trip_id: string;
  paid_by_contributor_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  contributors?: Contributor;
}

export interface ContributorBalance {
  contributor: Contributor;
  totalPaid: number;
  balance: number;
}
