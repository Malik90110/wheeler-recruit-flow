
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Calendar } from 'lucide-react';

export const DailyReportTrigger = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const triggerDailyReport = async () => {
    setIsLoading(true);
    
    try {
      console.log('Triggering daily report...');
      
      const { data, error } = await supabase.functions.invoke('daily-report', {
        body: { manual: true }
      });

      if (error) {
        console.error('Error triggering daily report:', error);
        throw error;
      }

      console.log('Daily report response:', data);
      
      toast({
        title: "Daily Report Sent",
        description: "The daily analytics report has been sent to all managers successfully.",
      });
    } catch (error: any) {
      console.error('Failed to trigger daily report:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send daily report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Daily Report
        </CardTitle>
        <CardDescription>
          Manually trigger the daily analytics report to be sent to all managers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={triggerDailyReport} 
          disabled={isLoading}
          className="w-full"
        >
          <Calendar className="w-4 h-4 mr-2" />
          {isLoading ? 'Sending Report...' : 'Send Daily Report Now'}
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          Scheduled to run automatically every day at 8:00 AM UTC
        </p>
      </CardContent>
    </Card>
  );
};
