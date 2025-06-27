
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { ProductionDataResult } from './types';

export const fetchProductionData = async (user: User): Promise<ProductionDataResult> => {
  try {
    // Get user profile first
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();

    if (!profile) {
      console.log('UserMetrics: No profile found');
      return { found: false };
    }

    const fullName = `${profile.first_name} ${profile.last_name}`;
    console.log('UserMetrics: User full name:', fullName);

    // Check for recent production data
    const { data: latestReport, error: reportError } = await supabase
      .from('production_reports')
      .select('id, report_date')
      .order('report_date', { ascending: false })
      .limit(1)
      .single();

    if (reportError || !latestReport) {
      console.log('UserMetrics: No recent production report found');
      return { found: false };
    }

    const reportDate = new Date(latestReport.report_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - reportDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    console.log('UserMetrics: Latest report date:', latestReport.report_date, 'Days diff:', diffDays);
    
    if (diffDays > 1) {
      console.log('UserMetrics: Production report too old');
      return { found: false };
    }

    // Get all production entries for this report
    const { data: allEntries, error: allEntriesError } = await supabase
      .from('production_report_entries')
      .select('*')
      .eq('report_id', latestReport.id);

    console.log('UserMetrics: All production entries for report:', allEntries);
    console.log('UserMetrics: All available names in production report:', 
      allEntries?.map(entry => entry.employee_name) || []);

    if (!allEntries || allEntries.length === 0) {
      return { found: false };
    }

    // Try to find production data with flexible name matching
    let productionEntry = null;
    
    // Try exact match first
    productionEntry = allEntries.find(entry => 
      entry.employee_name.toLowerCase() === fullName.toLowerCase()
    );
    
    // If no exact match, try partial matches
    if (!productionEntry) {
      const firstName = profile.first_name.toLowerCase();
      const lastName = profile.last_name.toLowerCase();
      
      productionEntry = allEntries.find(entry => {
        const entryName = entry.employee_name.toLowerCase();
        return entryName.includes(firstName) && entryName.includes(lastName);
      });
    }
    
    // If still no match, try email matching
    if (!productionEntry) {
      const userEmail = user.email?.toLowerCase() || '';
      productionEntry = allEntries.find(entry => {
        const entryEmail = entry.employee_email?.toLowerCase() || '';
        return entryEmail === userEmail;
      });
    }

    console.log('UserMetrics: Production entry found:', productionEntry);

    if (productionEntry) {
      console.log('UserMetrics: FOUND PRODUCTION ENTRY:', productionEntry);
      return {
        found: true,
        metrics: {
          totalInterviews: productionEntry.interviews_scheduled || 0,
          totalOffers: productionEntry.offers_sent || 0,
          totalHires: productionEntry.hires_made || 0,
          totalOnboarding: productionEntry.onboarding_sent || 0,
        }
      };
    } else {
      console.log('UserMetrics: No matching production entry found');
      console.log('UserMetrics: User full name to match:', fullName);
      console.log('UserMetrics: User email to match:', user.email);
      console.log('UserMetrics: Available names in report:', 
        allEntries?.map(entry => `"${entry.employee_name}" (${entry.employee_email})`) || []);
      return { found: false };
    }
  } catch (error) {
    console.error('UserMetrics: Error fetching production data:', error);
    return { found: false };
  }
};
