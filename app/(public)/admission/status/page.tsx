"use client";

import { useState } from 'react';
import { admissionApi } from '@/app/lib/api/admission';
import type { AdmissionStatusResponse } from '@/app/types/admission.types';
import { STATUS_LABELS, STATUS_COLORS } from '@/app/types/admission.types';

export default function AdmissionStatusPage() {
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [status, setStatus] = useState<AdmissionStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setStatus(null);

    try {
      const result = await admissionApi.checkStatus(admissionNumber);
      setStatus(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check status');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (statusValue: string) => {
    const colors = STATUS_COLORS as Record<string, string>;
    const color = colors[statusValue] || 'gray';
    
    const colorMap: Record<string, string> = {
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    
    return colorMap[color];
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Check Admission Status
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your admission number to check your application status
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleCheck} className="mt-8">
          <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
            <div>
              <label
                htmlFor="admissionNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Admission Number
              </label>
              <input
                id="admissionNumber"
                type="text"
                required
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                placeholder="e.g., G1-2025-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !admissionNumber}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Checking...
                </span>
              ) : (
                'Check Status'
              )}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Status Result */}
        {status && (
          <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Application Status
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                  status.status
                )}`}
              >
                {STATUS_LABELS[status.status]}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div>
                <p className="text-sm text-gray-500">Admission Number</p>
                <p className="text-sm font-medium text-gray-900">
                  {status.admission_number}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Student Name</p>
                <p className="text-sm font-medium text-gray-900">
                  {status.student_first_name} {status.student_last_name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Submitted On</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(status.submitted_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {status.approved_at && (
                <div>
                  <p className="text-sm text-gray-500">
                    {status.status === 'approved' ? 'Approved On' : 'Reviewed On'}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(status.approved_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Status-specific messages */}
            <div className="border-t border-gray-200 pt-4">
              {status.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Under Review
                      </h3>
                      <p className="mt-1 text-sm text-yellow-700">
                        Your application is currently being reviewed. You will receive an
                        email notification once a decision has been made.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {status.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Congratulations!
                      </h3>
                      <p className="mt-1 text-sm text-green-700">
                        Your application has been approved. You should have received an
                        email with login credentials and next steps.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {status.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Application Not Approved
                      </h3>
                      <p className="mt-1 text-sm text-red-700">
                        Unfortunately, your application was not approved at this time.
                        Please contact the school for more information.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Help Links */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a
              href="/contact"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Contact us
            </a>
          </p>
          <p className="mt-2 text-sm text-gray-600">
            <a
              href="/admission/verify"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Start new registration
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}