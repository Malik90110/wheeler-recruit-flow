
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { generateDailyReport } from "./report-generator.ts";
import { sendReportToManagers } from "./email-service.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
