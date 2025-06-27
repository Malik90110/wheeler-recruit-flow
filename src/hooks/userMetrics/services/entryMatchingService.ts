
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserProfile } from './profileService';

export interface ProductionEntry {
  employee_name: string;
  employee_email?: string;
  interviews_scheduled?: number;
  offers_sent?: number;
  hires_made?: number;
  onboarding_sent?: number;
}

export const fetchProductionEntries = async (reportId: string): Promise<ProductionEntry[]> => {
  const { data: allEntries, error: allEntriesError } = await supabase
    .from('production_report_entries')
    .select('*')
    .eq('report_id', reportId);

  console.log('UserMetrics: All production entries for report:', allEntries);
  console.log('UserMetrics: All available names in production report:', 
    allEntries?.map(entry => entry.employee_name) || []);

  return allEntries || [];
};

export const findMatchingEntry = (
  entries: ProductionEntry[], 
  profile: UserProfile, 
  user: User
): ProductionEntry | null => {
  if (entries.length === 0) {
    return null;
  }

  const fullName = `${profile.first_name} ${profile.last_name}`;
  let productionEntry = null;
  
  // Try exact match first
  productionEntry = entries.find(entry => 
    entry.employee_name.toLowerCase() === fullName.toLowerCase()
  );
  
  // If no exact match, try partial matches
  if (!productionEntry) {
    const firstName = profile.first_name.toLowerCase();
    const lastName = profile.last_name.toLowerCase();
    
    productionEntry = entries.find(entry => {
      const entryName = entry.employee_name.toLowerCase();
      return entryName.includes(firstName) && entryName.includes(lastName);
    });
  }
  
  // If still no match, try email matching
  if (!productionEntry) {
    const userEmail = user.email?.toLowerCase() || '';
    productionEntry = entries.find(entry => {
      const entryEmail = entry.employee_email?.toLowerCase() || '';
      return entryEmail === userEmail;
    });
  }

  console.log('UserMetrics: Production entry found:', productionEntry);

  if (productionEntry) {
    console.log('UserMetrics: FOUND PRODUCTION ENTRY:', productionEntry);
  } else {
    console.log('UserMetrics: No matching production entry found');
    console.log('UserMetrics: User full name to match:', fullName);
    console.log('UserMetrics: User email to match:', user.email);
    console.log('UserMetrics: Available names in report:', 
      entries?.map(entry => `"${entry.employee_name}" (${entry.employee_email})`) || []);
  }

  return productionEntry;
};
