"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmissionStore } from '@/app/stores/admission.store';

export default function AdmissionVerifyPage() {
  const router = useRouter();
  const { verifyAdmission, isVerifying, verifyError, clearErrors } = useAdmissionStore();
  
  const [formData, setFormData] = useState({
    admissionNumber: '',
    childFirstName: '',
    childLastName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    try {
      await verifyAdmission(
        formData.admissionNumber,
        formData.childFirstName,
        formData.childLastName
      );
      
      // Success - redirect to registration page
      router.push('/admission/register');
    } catch (error) {
      // Error is already set in store
      console.error('Verification failed:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Verify Admission Letter
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your admission number and child&apos;s name to begin registration
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
            {/* Admission Number */}
            <div>
              <label
                htmlFor="admissionNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Admission Number
              </label>
              <input
                id="admissionNumber"
                name="admissionNumber"
                type="text"
                required
                value={formData.admissionNumber}
                onChange={handleChange}
                placeholder="e.g., G1-2025-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isVerifying}
              />
              <p className="mt-1 text-xs text-gray-500">
                As shown on your admission letter
              </p>
            </div>

            {/* Child First Name */}
            <div>
              <label
                htmlFor="childFirstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Child&apos;s First Name
              </label>
              <input
                id="childFirstName"
                name="childFirstName"
                type="text"
                required
                value={formData.childFirstName}
                onChange={handleChange}
                placeholder="First name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isVerifying}
              />
            </div>

            {/* Child Last Name */}
            <div>
              <label
                htmlFor="childLastName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Child&apos;s Last Name
              </label>
              <input
                id="childLastName"
                name="childLastName"
                type="text"
                required
                value={formData.childLastName}
                onChange={handleChange}
                placeholder="Last name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isVerifying}
              />
            </div>

            {/* Error Message */}
            {verifyError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <p className="text-sm">{verifyError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
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
                  Verifying...
                </span>
              ) : (
                'Verify & Continue'
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an admission letter?{' '}
            <a
              href="/admission/requestInfo"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Request information
            </a>
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Already registered?{' '}
            <a
              href="/admission/status"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Check status
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}