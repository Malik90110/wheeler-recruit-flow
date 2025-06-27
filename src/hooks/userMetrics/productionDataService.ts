
import { User } from '@supabase/supabase-js';
import { ProductionDataResult } from './types';
import { fetchUserProfile } from './services/profileService';
import { fetchLatestProductionReport, isReportRecent } from './services/reportValidationService';
import { fetchProductionEntries, findMatchingEntry } from './services/entryMatchingService';

export const fetchProductionData = async (user: User): Promise<ProductionDataResult> => {
  try {
    // Get user profile first
    const profile = await fetchUserProfile(user);
    if (!profile) {
      return { found: false };
    }

    // Check for recent production data
    const latestReport = await fetchLatestProductionReport();
    if (!latestReport) {
      return { found: false };
    }

    if (!isReportRecent(latestReport.report_date)) {
      return { found: false };
    }

    // Get all production entries for this report
    const allEntries = await fetchProductionEntries(latestReport.id);
    if (allEntries.length === 0) {
      return { found: false };
    }

    // Try to find matching production entry
    const productionEntry = findMatchingEntry(allEntries, profile, user);

    if (productionEntry) {
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
      return { found: false };
    }
  } catch (error) {
    console.error('UserMetrics: Error fetching production data:', error);
    return { found: false };
  }
};
