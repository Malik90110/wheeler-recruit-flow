
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreateContestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContestCreated: () => void;
}

export const CreateContestDialog = ({ open, onOpenChange, onContestCreated }: CreateContestDialogProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rules: '',
    startDate: '',
    endDate: '',
    prize: '',
    targetMetrics: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableMetrics = [
    { id: 'interviews_scheduled', label: 'Interviews Scheduled' },
    { id: 'offers_sent', label: 'Offers Sent' },
    { id: 'hires_made', label: 'Successful Hires' },
    { id: 'candidates_contacted', label: 'Candidates Contacted' },
    { id: 'onboarding_sent', label: 'Onboarding Sent' }
  ];

  const handleMetricChange = (metricId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      targetMetrics: checked 
        ? [...prev.targetMetrics, metricId]
        : prev.targetMetrics.filter(m => m !== metricId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      const rulesArray = formData.rules.split('\n').filter(rule => rule.trim() !== '');
      
      const { error } = await supabase
        .from('contests')
        .insert({
          title: formData.title,
          description: formData.description,
          rules: rulesArray,
          start_date: formData.startDate,
          end_date: formData.endDate,
          prize: formData.prize,
          target_metrics: formData.targetMetrics,
          created_by: user.id,
          status: 'upcoming'
        });

      if (error) {
        console.error('Error creating contest:', error);
        return;
      }

      // Reset form and close dialog
      setFormData({
        title: '',
        description: '',
        rules: '',
        startDate: '',
        endDate: '',
        prize: '',
        targetMetrics: []
      });
      
      onContestCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating contest:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Contest</DialogTitle>
          <DialogDescription>
            Set up a new team contest to drive engagement and performance.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Contest Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., December Interview Challenge"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the contest and what participants need to do..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Target Metrics</Label>
            <div className="grid grid-cols-2 gap-3">
              {availableMetrics.map((metric) => (
                <div key={metric.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={metric.id}
                    checked={formData.targetMetrics.includes(metric.id)}
                    onCheckedChange={(checked) => handleMetricChange(metric.id, checked as boolean)}
                  />
                  <Label htmlFor={metric.id} className="text-sm">
                    {metric.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prize">Prize/Recognition</Label>
            <Input
              id="prize"
              value={formData.prize}
              onChange={(e) => setFormData(prev => ({ ...prev, prize: e.target.value }))}
              placeholder="e.g., $500 bonus + recognition"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rules">Contest Rules</Label>
            <Textarea
              id="rules"
              value={formData.rules}
              onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
              placeholder="Enter each rule on a new line..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Contest'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
