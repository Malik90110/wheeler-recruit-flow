
import React from 'react';
import { Shield } from 'lucide-react';

export const AccessRestricted = () => {
  return (
    <div className="text-center py-8">
      <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
      <p className="text-gray-500">You need manager or admin privileges to access user management.</p>
    </div>
  );
};
