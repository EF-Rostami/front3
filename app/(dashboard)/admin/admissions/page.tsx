"use client";

import { useEffect, useState } from 'react';
import { useAdmissionStore } from '@/app/stores/admission.store';
import { GRADE_LABELS, STATUS_LABELS } from '@/app/types/admission.types';
import type { StudentAdmission } from '@/app/types/admission.types';
import { RoleGuard } from '@/app/components/RoleGuard';

export default function AdminAdmissionsPage() {
  const {
    pendingAdmissions,
    isLoadingAdmissions,
    admissionsError,
    fetchPendingAdmissions,
    approveAdmission,
    rejectAdmission,
    clearErrors,
  } = useAdmissionStore();

  const [selectedAdmission, setSelectedAdmission] = useState<StudentAdmission | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingAdmissions();
  }, [fetchPendingAdmissions]);

  const handleApprove = async (admissionId: number) => {
    if (confirm('Are you sure you want to approve this admission? This will create user accounts.')) {
      clearErrors();
      try {
        await approveAdmission(admissionId);
        setSelectedAdmission(null);
        alert('Admission approved successfully! User accounts have been created.');
      } catch (error) {
        console.error('Failed to approve:', error);
      }
    }
  };

  const handleRejectClick = (admission: StudentAdmission) => {
    setSelectedAdmission(admission);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const handleRejectSubmit = async () => {
    if (!selectedAdmission || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    clearErrors();
    try {
      await rejectAdmission(selectedAdmission.id, rejectionReason);
      setShowRejectModal(false);
      setSelectedAdmission(null);
      setRejectionReason('');
      alert('Admission rejected successfully.');
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pending Admissions</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review and approve student admission applications
        </p>
      </div>

      {/* Error Message */}
      {admissionsError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">{admissionsError}</p>
        </div>
      )}

      {/* Admissions List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {isLoadingAdmissions ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : pendingAdmissions.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending admissions</h3>
            <p className="mt-1 text-sm text-gray-500">
              All admissions have been reviewed.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pendingAdmissions.map((admission) => (
              <div
                key={admission.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Student Info */}
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xl font-semibold text-blue-600">
                            {admission.student_first_name[0]}
                            {admission.student_last_name[0]}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {admission.student_first_name} {admission.student_last_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Admission #{admission.admission_number}
                        </p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Date of Birth</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(admission.date_of_birth)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Grade Level</p>
                        <p className="text-sm font-medium text-gray-900">
                          {GRADE_LABELS[admission.grade_level]}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Nationality</p>
                        <p className="text-sm font-medium text-gray-900">
                          {admission.nationality || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Address</p>
                        <p className="text-sm font-medium text-gray-900">
                          {admission.address_street}, {admission.address_city}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Submitted</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(admission.submitted_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Status</p>
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {STATUS_LABELS[admission.status]}
                        </span>
                      </div>
                    </div>

                    {/* Parents Info */}
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 uppercase mb-2">Parents/Guardians</p>
                      <div className="space-y-2">
                        {admission.parents.map((parent, idx) => (
                          <div
                            key={idx}
                            className="flex items-center space-x-4 text-sm bg-gray-50 rounded-md p-3"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {parent.first_name} {parent.last_name}
                                {parent.is_primary_contact && (
                                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                                    Primary
                                  </span>
                                )}
                              </p>
                              <p className="text-gray-600">
                                {parent.relation_type.charAt(0).toUpperCase() + parent.relation_type.slice(1)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-900">{parent.email}</p>
                              <p className="text-gray-600">{parent.mobile}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-6 flex-shrink-0 flex flex-col space-y-2">
                    <button
                      onClick={() => handleApprove(admission.id)}
                      disabled={isLoadingAdmissions}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectClick(admission)}
                      disabled={isLoadingAdmissions}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setSelectedAdmission(
                        selectedAdmission?.id === admission.id ? null : admission
                      )}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200"
                    >
                      {selectedAdmission?.id === admission.id ? 'Hide' : 'Details'}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedAdmission?.id === admission.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900 mb-2">Additional Information</p>
                        <dl className="space-y-1">
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Place of Birth:</dt>
                            <dd className="text-gray-900">{admission.place_of_birth || 'N/A'}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Postal Code:</dt>
                            <dd className="text-gray-900">{admission.address_postal_code}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-500">State:</dt>
                            <dd className="text-gray-900">{admission.address_state}</dd>
                          </div>
                        </dl>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 mb-2">Application Details</p>
                        <dl className="space-y-1">
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Application ID:</dt>
                            <dd className="text-gray-900">#{admission.id}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Submitted:</dt>
                            <dd className="text-gray-900">
                              {new Date(admission.submitted_at).toLocaleString()}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Reject Admission
                </h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {selectedAdmission && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    You are about to reject the admission for:
                  </p>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {selectedAdmission.student_first_name} {selectedAdmission.student_last_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Admission #{selectedAdmission.admission_number}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  placeholder="Please provide a reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  This reason will be sent to the parent via email.
                </p>
              </div>

              {admissionsError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  <p className="text-sm">{admissionsError}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  disabled={isLoadingAdmissions}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={isLoadingAdmissions || !rejectionReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoadingAdmissions ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </RoleGuard>
  );
}