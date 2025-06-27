import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DailyReportData {
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

const generateDailyReport = async (): Promise<DailyReportData> => {
  console.log("Generating daily report...");
  
  // Get yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Get all profiles for user count
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');
  
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    throw profilesError;
  }

  // Check if we have recent production data
  const { data: latestReport, error: reportError } = await supabase
    .from('production_reports')
    .select('id, report_date')
    .order('report_date', { ascending: false })
    .limit(1)
    .single();

  let useProductionData = false;
  let reportId = null;
  let dataSource = 'Activity Logs (Last 30 Days)';

  if (!reportError && latestReport) {
    const reportDate = new Date(latestReport.report_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - reportDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Use production data if report is from today or yesterday
    if (diffDays <= 1) {
      useProductionData = true;
      reportId = latestReport.id;
      dataSource = `Production Report (${latestReport.report_date})`;
    }
  }

  if (useProductionData && reportId) {
    console.log('Using production data for daily report');
    
    // Get production report entries
    const { data: productionEntries, error: entriesError } = await supabase
      .from('production_report_entries')
      .select('*')
      .eq('report_id', reportId);

    if (entriesError) {
      console.error('Error fetching production entries:', entriesError);
      throw entriesError;
    }

    // Calculate totals from production data
    const totalInterviews = productionEntries?.reduce((sum, entry) => sum + (entry.interviews_scheduled || 0), 0) || 0;
    const totalOffers = productionEntries?.reduce((sum, entry) => sum + (entry.offers_sent || 0), 0) || 0;
    const totalHires = productionEntries?.reduce((sum, entry) => sum + (entry.hires_made || 0), 0) || 0;
    const successRate = totalInterviews > 0 ? Number(((totalHires / totalInterviews) * 100).toFixed(1)) : 0;

    // Create team performance from production data
    const topPerformers = productionEntries?.map((entry: any) => ({
      name: entry.employee_name,
      interviews: entry.interviews_scheduled || 0,
      offers: entry.offers_sent || 0,
      hires: entry.hires_made || 0,
      ratio: (entry.interviews_scheduled || 0) > 0 ? 
        Number(((entry.hires_made || 0) / (entry.interviews_scheduled || 0) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.hires - a.hires)
    .slice(0, 5) || [];

    // For yesterday's activity, we'll use production data as well
    const yesterdayActivity = productionEntries?.map((entry: any) => ({
      name: entry.employee_name,
      interviews: entry.interviews_scheduled || 0,
      offers: entry.offers_sent || 0,
      hires: entry.hires_made || 0,
      candidates_contacted: entry.candidates_contacted || 0
    })) || [];

    return {
      totalUsers: profiles?.length || 0,
      totalInterviews,
      totalOffers,
      totalHires,
      successRate,
      topPerformers,
      yesterdayActivity,
      dataSource
    };
  } else {
    console.log('Using activity logs data for daily report');
    
    // Fall back to activity logs data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: activityLogs, error: logsError } = await supabase
      .from('activity_logs')
      .select('*')
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (logsError) {
      console.error('Error fetching activity logs:', logsError);
      throw logsError;
    }

    // Get yesterday's specific activity
    const { data: yesterdayLogs, error: yesterdayError } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('date', yesterdayStr);

    if (yesterdayError) {
      console.error('Error fetching yesterday logs:', yesterdayError);
      throw yesterdayError;
    }

    // Create a map of user IDs to names
    const userMap = new Map();
    profiles?.forEach(profile => {
      userMap.set(profile.id, `${profile.first_name} ${profile.last_name}`);
    });

    // Calculate totals from all logs
    const totalInterviews = activityLogs?.reduce((sum, log) => sum + (log.interviews_scheduled || 0), 0) || 0;
    const totalOffers = activityLogs?.reduce((sum, log) => sum + (log.offers_sent || 0), 0) || 0;
    const totalHires = activityLogs?.reduce((sum, log) => sum + (log.hires_made || 0), 0) || 0;
    const successRate = totalInterviews > 0 ? Number(((totalHires / totalInterviews) * 100).toFixed(1)) : 0;

    // Calculate team performance
    const teamPerformance = new Map();
    
    activityLogs?.forEach((log: any) => {
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
      .slice(0, 5); // Top 5 performers

    // Yesterday's activity
    const yesterdayActivity = yesterdayLogs?.map((log: any) => ({
      name: userMap.get(log.user_id) || 'Unknown User',
      interviews: log.interviews_scheduled || 0,
      offers: log.offers_sent || 0,
      hires: log.hires_made || 0,
      candidates_contacted: log.candidates_contacted || 0
    })) || [];

    return {
      totalUsers: profiles?.length || 0,
      totalInterviews,
      totalOffers,
      totalHires,
      successRate,
      topPerformers,
      yesterdayActivity,
      dataSource
    };
  }
};

const generateEmailHtml = (data: DailyReportData): string => {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .metric-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 10px 0; }
          .metric-value { font-size: 24px; font-weight: bold; color: #2563eb; }
          .metric-label { font-size: 14px; color: #64748b; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th, .table td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
          .table th { background-color: #f1f5f9; }
          .section-title { font-size: 18px; font-weight: bold; margin: 20px 0 10px 0; color: #1e293b; }
          .data-source { font-size: 12px; color: #64748b; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Daily Analytics Report</h1>
          <p>${today}</p>
          <p class="data-source">Data Source: ${data.dataSource}</p>
        </div>
        
        <div class="content">
          <h2 class="section-title">📊 Overall Performance</h2>
          
          <div style="display: flex; flex-wrap: wrap; gap: 15px;">
            <div class="metric-card" style="flex: 1; min-width: 200px;">
              <div class="metric-value">${data.totalUsers}</div>
              <div class="metric-label">Total Users</div>
            </div>
            <div class="metric-card" style="flex: 1; min-width: 200px;">
              <div class="metric-value">${data.totalInterviews}</div>
              <div class="metric-label">Total Interviews</div>
            </div>
            <div class="metric-card" style="flex: 1; min-width: 200px;">
              <div class="metric-value">${data.totalOffers}</div>
              <div class="metric-label">Total Offers</div>
            </div>
            <div class="metric-card" style="flex: 1; min-width: 200px;">
              <div class="metric-value">${data.totalHires}</div>
              <div class="metric-label">Total Hires</div>
            </div>
            <div class="metric-card" style="flex: 1; min-width: 200px;">
              <div class="metric-value">${data.successRate}%</div>
              <div class="metric-label">Success Rate</div>
            </div>
          </div>

          <h2 class="section-title">🏆 Top Performers</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Interviews</th>
                <th>Offers</th>
                <th>Hires</th>
                <th>Success Rate</th>
              </tr>
            </thead>
            <tbody>
              ${data.topPerformers.map(performer => `
                <tr>
                  <td>${performer.name}</td>
                  <td>${performer.interviews}</td>
                  <td>${performer.offers}</td>
                  <td>${performer.hires}</td>
                  <td>${performer.ratio}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2 class="section-title">📅 Recent Activity</h2>
          ${data.yesterdayActivity.length > 0 ? `
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Interviews</th>
                  <th>Offers</th>
                  <th>Hires</th>
                  <th>Candidates Contacted</th>
                </tr>
              </thead>
              <tbody>
                ${data.yesterdayActivity.map(activity => `
                  <tr>
                    <td>${activity.name}</td>
                    <td>${activity.interviews}</td>
                    <td>${activity.offers}</td>
                    <td>${activity.hires}</td>
                    <td>${activity.candidates_contacted}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p>No recent activity recorded.</p>'}
          
          <div style="margin-top: 30px; padding: 15px; background-color: #f8fafc; border-radius: 8px;">
            <p style="margin: 0; font-size: 12px; color: #64748b;">
              This report is automatically generated daily. Data source: ${data.dataSource}. For questions or issues, please contact your system administrator.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const sendReportToManagers = async (reportData: DailyReportData) => {
  console.log("Fetching manager emails...");
  
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
    console.log("No managers found to send report to");
    return;
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

  if (managerEmails.length === 0) {
    console.log("No manager emails found");
    return;
  }

  console.log(`Sending report to ${managerEmails.length} managers`);

  const emailHtml = generateEmailHtml(reportData);
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'WorkHub Reports <onboarding@resend.dev>',
      to: managerEmails,
      subject: `Daily Analytics Report - ${new Date().toLocaleDateString()}`,
      html: emailHtml
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    console.log('Daily report sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send daily report:', error);
    throw error;
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting daily report generation...");
    
    const body = await req.json().catch(() => ({}));
    const displayOnly = body.displayOnly || false;
    
    // Generate the report data
    const reportData = await generateDailyReport();
    
    // If displayOnly is true, just return the data without sending emails
    if (displayOnly) {
      console.log("Display-only mode: returning report data without sending emails");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Report data generated successfully",
          reportData 
        }), 
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Send to managers (original functionality)
    await sendReportToManagers(reportData);
    
    console.log("Daily report completed successfully");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Daily report sent successfully",
        reportData 
      }), 
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in daily-report function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
