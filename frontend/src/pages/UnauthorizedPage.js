import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4">
      <div className="card w-full max-w-md text-center">
        <div className="mb-6">
          <AlertCircle className="text-red-600 mx-auto mb-4" size={64} />
          <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">You don't have permission to access this resource.</p>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary w-full"
        >
          Go to Dashboard
        </button>

        <button
          onClick={() => navigate(-1)}
          className="btn-secondary w-full mt-3"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};
