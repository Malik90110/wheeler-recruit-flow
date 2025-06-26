
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  switchText: string;
  onSwitchClick: () => void;
}

export const AuthLayout = ({ title, description, children, switchText, onSwitchClick }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Wheeler Staffing</h1>
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onSwitchClick}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {switchText}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
