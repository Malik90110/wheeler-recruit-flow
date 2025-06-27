
import type { DailyReportData, ProductionEntry, ActivityLog, Profile } from "./types.ts";
import { 
  fetchProfiles, 
  fetchLatestProductionReport, 
  fetchProductionEntries, 
  fetchActivityLogs, 
  fetchYesterdayActivityLogs 
} from "./data-service.ts";

export async function generateDailyReport(): Promise<DailyReportData> {
  console.log("Generating daily report...");
  
  // Get all profiles for user count
  const profiles = await fetchProfiles();
  
  // Check if we have recent production data
  const productionReport = await fetchLatestProductionReport();
  
  if (productionReport) {
    return await generateFromProductionData(profiles, productionReport);
  } else {
    return await generateFromActivityLogs(profiles);
  }
}

async function generateFromProductionData(
  profiles: Profile[], 
  productionReport: { reportId: string; dataSource: string }
): Promise<DailyReportData> {
  console.log('Using production data for daily report');
  
  const productionEntries = await fetchProductionEntries(productionReport.reportId);

  // Calculate totals from production data
  const totalInterviews = productionEntries.reduce((sum, entry) => sum + (entry.interviews_scheduled || 0), 0);
  const totalOffers = productionEntries.reduce((sum, entry) => sum + (entry.offers_sent || 0), 0);
  const totalHires = productionEntries.reduce((sum, entry) => sum + (entry.hires_made || 0), 0);
  const successRate = totalInterviews > 0 ? Number(((totalHires / totalInterviews) * 100).toFixed(1)) : 0;

  // Create team performance from production data
  const topPerformers = productionEntries
    .map((entry: ProductionEntry) => ({
      name: entry.employee_name,
      interviews: entry.interviews_scheduled || 0,
      offers: entry.offers_sent || 0,
      hires: entry.hires_made || 0,
      ratio: (entry.interviews_scheduled || 0) > 0 ? 
        Number(((entry.hires_made || 0) / (entry.interviews_scheduled || 0) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.hires - a.hires)
    .slice(0, 5);

  // For yesterday's activity, use production data as well
  const yesterdayActivity = productionEntries.map((entry: ProductionEntry) => ({
    name: entry.employee_name,
    interviews: entry.interviews_scheduled || 0,
    offers: entry.offers_sent || 0,
    hires: entry.hires_made || 0,
    candidates_contacted: entry.candidates_contacted || 0
  }));

  return {
    totalUsers: profiles.length,
    totalInterviews,
    totalOffers,
    totalHires,
    successRate,
    topPerformers,
    yesterdayActivity,
    dataSource: productionReport.dataSource
  };
}

async function generateFromActivityLogs(profiles: Profile[]): Promise<DailyReportData> {
  console.log('Using activity logs data for daily report');
  
  const activityLogs = await fetchActivityLogs(30);
  const yesterdayLogs = await fetchYesterdayActivityLogs();

  // Create a map of user IDs to names
  const userMap = new Map();
  profiles.forEach(profile => {
    userMap.set(profile.id, `${profile.first_name} ${profile.last_name}`);
  });

  // Calculate totals from all logs
  const totalInterviews = activityLogs.reduce((sum, log) => sum + (log.interviews_scheduled || 0), 0);
  const totalOffers = activityLogs.reduce((sum, log) => sum + (log.offers_sent || 0), 0);
  const totalHires = activityLogs.reduce((sum, log) => sum + (log.hires_made || 0), 0);
  const successRate = totalInterviews > 0 ? Number(((totalHires / totalInterviews) * 100).toFixed(1)) : 0;

  // Calculate team performance
  const teamPerformance = new Map();
  
  activityLogs.forEach((log: ActivityLog) => {
    const name = userMap.get(log.user_id) || 'Unknown User';
    
    if (!teamPerformance.has(name)) {
      teamPerformance.set(name, {
        name,
        interviews: 0,
        offers: 0,
        hires: 0
      });
    }
    
    const member = teamPerformance.get(name);
    member.interviews += log.interviews_scheduled || 0;
    member.offers += log.offers_sent || 0;
    member.hires += log.hires_made || 0;
  });

  // Convert to array and add ratio, sort by performance
  const topPerformers = Array.from(teamPerformance.values())
    .map((member: any) => ({
      ...member,
      ratio: member.interviews > 0 ? Number(((member.hires / member.interviews) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.hires - a.hires)
    .slice(0, 5);

  // Yesterday's activity
  const yesterdayActivity = yesterdayLogs.map((log: ActivityLog) => ({
    name: userMap.get(log.user_id) || 'Unknown User',
    interviews: log.interviews_scheduled || 0,
    offers: log.offers_sent || 0,
    hires: log.hires_made || 0,
    candidates_contacted: log.candidates_contacted || 0
  }));

  return {
    totalUsers: profiles.length,
    totalInterviews,
    totalOffers,
    totalHires,
    successRate,
    topPerformers,
    yesterdayActivity,
    dataSource: 'Activity Logs (Last 30 Days)'
  };
}
