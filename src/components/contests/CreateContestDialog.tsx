
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
import { CalendarIcon } from 'lucide-react';

interface CreateContestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: string;
}

export const CreateContestDialog = ({ open, onOpenChange, currentUser }: CreateContestDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rules: '',
    startDate: '',
    endDate: '',
    prize: '',
    targetMetrics: [] as string[]
  });

  const availableMetrics = [
    { id: 'interviews', label: 'Interviews Conducted' },
    { id: 'offers', label: 'Offers Sent' },
    { id: 'hires', label: 'Successful Hires' },
    { id: 'calls', label: 'Client Calls' },
    { id: 'candidates', label: 'New Candidates' }
  ];

  const handleMetricChange = (metricId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      targetMetrics: checked 
        ? [...prev.targetMetrics, metricId]
        : prev.targetMetrics.filter(m => m !== metricId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contest created:', { ...formData, createdBy: currentUser });
    // In real app, this would save to Supabase
    onOpenChange(false);
    setFormData({
      title: '',
      description: '',
      rules: '',
      startDate: '',
      endDate: '',
      prize: '',
      targetMetrics: []
    });
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
            <Button type="submit">
              Create Contest
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
