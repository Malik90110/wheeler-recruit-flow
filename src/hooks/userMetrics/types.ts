
export interface UserMetrics {
  totalInterviews: number;
  totalOffers: number;
  totalHires: number;
  totalOnboarding: number;
  dataSource: 'production' | 'activity_logs';
}

export interface ProductionDataResult {
  found: boolean;
  metrics?: Omit<UserMetrics, 'dataSource'>;
}
