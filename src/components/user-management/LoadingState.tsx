
import React from 'react';

export const LoadingState = () => {
  return (
    <div className="text-center py-8">
      <div className="w-8 h-8 bg-blue-600 rounded-lg mx-auto mb-4 animate-pulse"></div>
      <p className="text-gray-600">Loading users...</p>
    </div>
  );
};
