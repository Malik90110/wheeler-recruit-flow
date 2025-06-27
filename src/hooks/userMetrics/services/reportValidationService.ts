
import { supabase } from '@/integrations/supabase/client';

export interface ProductionReport {
  id: string;
  report_date: string;
}

export const fetchLatestProductionReport = async (): Promise<ProductionReport | null> => {
  const { data: latestReport, error: reportError } = await supabase
    .from('production_reports')
    .select('id, report_date')
    .order('report_date', { ascending: false })
    .limit(1)
    .single();

  if (reportError || !latestReport) {
    console.log('UserMetrics: No recent production report found');
    return null;
  }

  return latestReport;
};

export const isReportRecent = (reportDate: string): boolean => {
  const reportDateObj = new Date(reportDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - reportDateObj.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  console.log('UserMetrics: Latest report date:', reportDate, 'Days diff:', diffDays);
  
  if (diffDays > 1) {
    console.log('UserMetrics: Production report too old');
    return false;
  }

  return true;
};
