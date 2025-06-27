
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
import type { ProductionEntry, ActivityLog, Profile } from "./types.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function fetchProfiles(): Promise<Profile[]> {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*');
  
  if (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }
  
  return profiles || [];
}

export async function fetchLatestProductionReport(): Promise<{ reportId: string; dataSource: string } | null> {
  const { data: latestReport, error } = await supabase
    .from('production_reports')
    .select('id, report_date')
    .order('report_date', { ascending: false })
    .limit(1)
    .single();

  if (error || !latestReport) {
    return null;
  }

  const reportDate = new Date(latestReport.report_date);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - reportDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Use production data if report is from today or yesterday
  if (diffDays <= 1) {
    return {
      reportId: latestReport.id,
      dataSource: `Production Report (${latestReport.report_date})`
    };
  }

  return null;
}

export async function fetchProductionEntries(reportId: string): Promise<ProductionEntry[]> {
  const { data: entries, error } = await supabase
    .from('production_report_entries')
    .select('*')
    .eq('report_id', reportId);

  if (error) {
    console.error('Error fetching production entries:', error);
    throw error;
  }

  return entries || [];
}

export async function fetchActivityLogs(daysBack: number = 30): Promise<ActivityLog[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  
  const { data: logs, error } = await supabase
    .from('activity_logs')
    .select('*')
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }

  return logs || [];
}

export async function fetchYesterdayActivityLogs(): Promise<ActivityLog[]> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const { data: logs, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('date', yesterdayStr);

  if (error) {
    console.error('Error fetching yesterday logs:', error);
    throw error;
  }

  return logs || [];
}

export async function fetchManagerEmails(): Promise<string[]> {
  // Get all managers and admins
  const { data: managerRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id, role')
    .in('role', ['manager', 'admin']);

  if (rolesError) {
    console.error('Error fetching manager roles:', rolesError);
    throw rolesError;
  }

  if (!managerRoles || managerRoles.length === 0) {
    return [];
  }

  // Get user emails from auth.users (using service key)
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching auth users:', authError);
    throw authError;
  }

  const managerUserIds = managerRoles.map(role => role.user_id);
  const managerEmails = authUsers.users
    .filter(user => managerUserIds.includes(user.id))
    .map(user => user.email)
    .filter(email => email);

  return managerEmails;
}
