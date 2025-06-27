
import { Resend } from "npm:resend@2.0.0";
import type { DailyReportData } from "./types.ts";
import { fetchManagerEmails } from "./data-service.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

export function generateEmailHtml(data: DailyReportData): string {
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
}

export async function sendReportToManagers(reportData: DailyReportData) {
  console.log("Fetching manager emails...");
  
  const managerEmails = await fetchManagerEmails();

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
}
