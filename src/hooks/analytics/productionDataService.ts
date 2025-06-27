
import { supabase } from '@/integrations/supabase/client';
import { AnalyticsData, ProductionEntry } from './types';

export const fetchProductionData = async (): Promise<{ data: AnalyticsData | null; useProduction: boolean }> => {
  try {
    // Check for recent production report
    const { data: latestReport, error: reportError } = await supabase
      .from('production_reports')
      .select('id, report_date')
      .order('report_date', { ascending: false })
      .limit(1)
      .single();

    if (reportError || !latestReport) {
      return { data: null, useProduction: false };
    }

    const reportDate = new Date(latestReport.report_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - reportDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Use production data if report is from today or yesterday
    if (diffDays > 1) {
      return { data: null, useProduction: false };
    }

    // Fetch production entries
    const { data: productionEntries, error: entriesError } = await supabase
      .from('production_report_entries')
      .select('*')
      .eq('report_id', latestReport.id);

    if (entriesError || !productionEntries || productionEntries.length === 0) {
      console.error('Error fetching production entries:', entriesError);
      return { data: null, useProduction: false };
    }

    // Calculate totals from production data
    const totalInterviews = productionEntries.reduce((sum, entry) => sum + (entry.interviews_scheduled || 0), 0);
    const totalOffers = productionEntries.reduce((sum, entry) => sum + (entry.offers_sent || 0), 0);
    const totalHires = productionEntries.reduce((sum, entry) => sum + (entry.hires_made || 0), 0);
    const successRate = totalInterviews > 0 ? Number(((totalHires / totalInterviews) * 100).toFixed(1)) : 0;

    // Create team data from production entries
    const teamData = productionEntries.map(entry => ({
      name: entry.employee_name,
      interviews: entry.interviews_scheduled || 0,
      offers: entry.offers_sent || 0,
      hires: entry.hires_made || 0,
      ratio: (entry.interviews_scheduled || 0) > 0 ? 
        Number(((entry.hires_made || 0) / (entry.interviews_scheduled || 0) * 100).toFixed(1)) : 0
    }));

    // For monthly trends with production data, use simplified approach
    const monthlyTrends = [{
      month: new Date().toLocaleDateString('en-US', { month: 'short' }),
      interviews: totalInterviews,
      offers: totalOffers,
      hires: totalHires
    }];

    return {
      data: {
        totalInterviews,
        totalOffers,
        totalHires,
        successRate,
        monthlyTrends,
        teamData
      },
      useProduction: true
    };
  } catch (error) {
    console.error('Error fetching production data:', error);
    return { data: null, useProduction: false };
  }
};
