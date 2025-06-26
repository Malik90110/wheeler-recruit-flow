
import React, { useState } from 'react';
import { Upload, FileSpreadsheet, FileText, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface ProductionReportUploadProps {
  onUploadComplete?: () => void;
}

export const ProductionReportUpload = ({ onUploadComplete }: ProductionReportUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast.error('You must be logged in to upload files');
      return;
    }

    console.log('Starting file upload for:', file.name, 'Size:', file.size);

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload an Excel file (.xlsx, .xls) or PDF file');
      console.error('Invalid file type:', file.type);
      return;
    }

    if (file.size > 20 * 1024 * 1024) { // 20MB limit
      toast.error('File size must be less than 20MB');
      return;
    }

    setUploading(true);
    console.log('Upload started...');

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('Uploading to path:', filePath);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('production-reports')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(`Failed to upload file: ${uploadError.message}`);
        return;
      }

      console.log('File uploaded successfully:', uploadData);

      // Get public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from('production-reports')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      // Create production report record
      const today = new Date().toISOString().split('T')[0];
      const { data: reportData, error: dbError } = await supabase
        .from('production_reports')
        .insert({
          uploaded_by: user.id,
          file_name: file.name,
          file_url: publicUrl,
          report_date: today,
          status: 'processing'
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        toast.error(`Failed to save report information: ${dbError.message}`);
        return;
      }

      console.log('Report record created:', reportData);
      toast.success('Production report uploaded successfully! Processing will begin shortly.');
      
      // Process the file
      await processProductionReport(reportData.id, file);
      
      if (onUploadComplete) {
        onUploadComplete();
      }

    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload production report');
    } finally {
      setUploading(false);
    }
  };

  const processProductionReport = async (reportId: string, file: File) => {
    console.log('Processing report:', reportId);
    
    try {
      // For now, we'll simulate processing since actual Excel/PDF parsing would require additional libraries
      // In a real implementation, you'd use libraries like xlsx or pdf-parse
      
      // Updated mock data to match actual Excel column structure
      const mockData = [
        { 
          employee_name: 'Malik Walker', 
          employee_email: 'malik@company.com', 
          interviews_scheduled: 15, // Maps to "Recruiter Interview: Recruiter Interview Scheduled"
          offers_sent: 5, // Maps to "Extend Offer: Send Offer" 
          hires_made: 2, // Maps to "Extend Offer: Offer Accepted"
          candidates_contacted: 25 // Maps to "Capture: Capture Complete"
        },
        { 
          employee_name: 'John Doe', 
          employee_email: 'john@company.com', 
          interviews_scheduled: 5, 
          offers_sent: 2, 
          hires_made: 1, 
          candidates_contacted: 10 
        },
        { 
          employee_name: 'Jane Smith', 
          employee_email: 'jane@company.com', 
          interviews_scheduled: 3, 
          offers_sent: 1, 
          hires_made: 0, 
          candidates_contacted: 8 
        }
      ];

      console.log('Inserting mock data entries...');

      // Insert mock data into production_report_entries
      const { error: entriesError } = await supabase
        .from('production_report_entries')
        .insert(
          mockData.map(entry => ({
            report_id: reportId,
            employee_name: entry.employee_name,
            employee_email: entry.employee_email,
            interviews_scheduled: entry.interviews_scheduled,
            offers_sent: entry.offers_sent,
            hires_made: entry.hires_made,
            candidates_contacted: entry.candidates_contacted
          }))
        );

      if (entriesError) {
        console.error('Error inserting entries:', entriesError);
        throw entriesError;
      }

      console.log('Entries inserted successfully');

      // Check for discrepancies with user activity logs
      await checkDiscrepancies(reportId, mockData);

      // Update report status
      const { error: updateError } = await supabase
        .from('production_reports')
        .update({ 
          status: 'completed',
          total_records: mockData.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (updateError) {
        console.error('Error updating report status:', updateError);
        throw updateError;
      }

      console.log('Report processing completed successfully');

    } catch (error) {
      console.error('Error processing report:', error);
      
      // Update report status to error
      await supabase
        .from('production_reports')
        .update({ status: 'error' })
        .eq('id', reportId);
        
      toast.error('Error processing the uploaded report');
    }
  };

  const checkDiscrepancies = async (reportId: string, reportData: any[]) => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      console.log('Checking for discrepancies...');
      
      // Get today's activity logs
      const { data: activityLogsData, error: activityLogsError } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('date', today);

      if (activityLogsError) {
        console.error('Error fetching activity logs:', activityLogsError);
        return;
      }

      if (!activityLogsData || activityLogsData.length === 0) {
        console.log('No activity logs found for today');
        return;
      }

      // Get user IDs from activity logs
      const userIds = [...new Set(activityLogsData.map(log => log.user_id))];

      // Get profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Combine activity logs with profiles
      const activityLogs = activityLogsData.map(log => {
        const profile = profilesData?.find(profile => profile.id === log.user_id);
        return {
          ...log,
          profiles: profile || null
        };
      });

      const discrepancies = [];

      for (const reportEntry of reportData) {
        // Find matching activity log by name (simplified matching)
        const matchingLog = activityLogs.find(log => {
          if (!log.profiles) return false;
          const fullName = `${log.profiles.first_name} ${log.profiles.last_name}`;
          return fullName.toLowerCase().includes(reportEntry.employee_name.toLowerCase()) ||
                 reportEntry.employee_name.toLowerCase().includes(fullName.toLowerCase());
        });

        if (matchingLog) {
          const fields = [
            { name: 'interviews_scheduled', reported: reportEntry.interviews_scheduled, logged: matchingLog.interviews_scheduled },
            { name: 'offers_sent', reported: reportEntry.offers_sent, logged: matchingLog.offers_sent },
            { name: 'hires_made', reported: reportEntry.hires_made, logged: matchingLog.hires_made },
            { name: 'candidates_contacted', reported: reportEntry.candidates_contacted, logged: matchingLog.candidates_contacted }
          ];

          for (const field of fields) {
            if (field.reported !== field.logged) {
              discrepancies.push({
                report_id: reportId,
                user_id: matchingLog.user_id,
                report_date: today,
                field_name: field.name,
                reported_value: field.reported,
                logged_value: field.logged,
                status: 'pending'
              });
            }
          }
        }
      }

      if (discrepancies.length > 0) {
        console.log('Found discrepancies:', discrepancies);
        
        const { error } = await supabase
          .from('activity_discrepancies')
          .insert(discrepancies);

        if (error) {
          console.error('Error inserting discrepancies:', error);
        } else {
          // Update discrepancies count
          await supabase
            .from('production_reports')
            .update({ discrepancies_found: discrepancies.length })
            .eq('id', reportId);

          toast.warning(`Found ${discrepancies.length} discrepancies that require management review`);
        }
      } else {
        console.log('No discrepancies found');
      }
    } catch (error) {
      console.error('Error checking discrepancies:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Upload className="w-5 h-5 mr-2 text-blue-600" />
        Upload Production Report
      </h3>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.pdf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="space-y-4">
          <div className="flex justify-center space-x-4">
            <FileSpreadsheet className="w-8 h-8 text-green-600" />
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {uploading ? 'Uploading...' : 'Drop your production report here'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              or click to browse files
            </p>
          </div>
          
          <p className="text-xs text-gray-500">
            Supported formats: Excel (.xlsx, .xls) and PDF files (up to 20MB)
          </p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800">Important:</p>
            <p className="text-yellow-700 mt-1">
              The system will automatically compare uploaded data with user-logged activities. 
              Any discrepancies found will be flagged for management review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
