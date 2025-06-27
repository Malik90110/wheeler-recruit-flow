
export interface AnalyticsData {
  totalInterviews: number;
  totalOffers: number;
  totalHires: number;
  successRate: number;
  monthlyTrends: Array<{
    month: string;
    interviews: number;
    offers: number;
    hires: number;
  }>;
  teamData: Array<{
    name: string;
    interviews: number;
    offers: number;
    hires: number;
    ratio: number;
  }>;
}

export interface ProductionEntry {
  employee_name: string;
  employee_email?: string;
  interviews_scheduled?: number;
  offers_sent?: number;
  hires_made?: number;
  candidates_contacted?: number;
}

export interface ActivityLog {
  user_id: string;
  date: string;
  interviews_scheduled?: number;
  offers_sent?: number;
  hires_made?: number;
  candidates_contacted?: number;
  profiles: {
    first_name: string;
    last_name: string;
  };
}
