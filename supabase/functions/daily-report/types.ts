
export interface DailyReportData {
  totalUsers: number;
  totalInterviews: number;
  totalOffers: number;
  totalHires: number;
  successRate: number;
  topPerformers: Array<{
    name: string;
    interviews: number;
    offers: number;
    hires: number;
    ratio: number;
  }>;
  yesterdayActivity: Array<{
    name: string;
    interviews: number;
    offers: number;
    hires: number;
    candidates_contacted: number;
  }>;
  dataSource: string;
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
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
}
