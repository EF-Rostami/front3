"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmissionStore } from '@/app/stores/admission.store';
import { GRADE_LABELS, type GradeLevel } from '@/app/types/admission.types';
import { RoleGuard } from '@/app/components/RoleGuard';
import { AdmissionLetterPDFButton } from '@/app/components/AdmissionLetterPDF';

export default function AdminAdmissionLettersPage() {
  const router = useRouter();
  const {
    letters,
    isLoadingLetters,
    lettersError,
    fetchLetters,
    createLetter,
    clearErrors,
  } = useAdmissionStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<{
    grade_level?: GradeLevel;
    academic_year?: string;
    is_used?: boolean;
  }>({});

  const [formData, setFormData] = useState({
    admission_number: '',
    child_first_name: '',
    child_last_name: '',
    grade_level: 'klasse_1' as GradeLevel,
    academic_year: '2025-2026',
  });

  useEffect(() => {
    fetchLetters(filter);
  }, [fetchLetters, filter]);

  const handleCreateLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    try {
      await createLetter(formData);
      setShowCreateForm(false);
      setFormData({
        admission_number: '',
        child_first_name: '',
        child_last_name: '',
        grade_level: 'klasse_1',
        academic_year: '2025-2026',
      });
    } catch (error) {
      console.error('Failed to create letter:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilter(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }));
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admission Letters</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create and manage admission letters
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push('/admin/admission/bulk-upload')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Bulk Upload
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : '+ Create Letter'}
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Create New Admission Letter
          </h2>
          <form onSubmit={handleCreateLetter} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admission Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.admission_number}
                  onChange={(e) =>
                    setFormData({ ...formData, admission_number: e.target.value })
                  }
                  placeholder="e.g., G1-2025-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year *
                </label>
                <input
                  type="text"
                  required
                  value={formData.academic_year}
                  onChange={(e) =>
                    setFormData({ ...formData, academic_year: e.target.value })
                  }
                  placeholder="2025-2026"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Child First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.child_first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, child_first_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Child Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.child_last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, child_last_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade Level *
                </label>
                <select
                  required
                  value={formData.grade_level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      grade_level: e.target.value as GradeLevel,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(GRADE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {lettersError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <p className="text-sm">{lettersError}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoadingLetters}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isLoadingLetters ? 'Creating...' : 'Create Letter'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade Level
            </label>
            <select
              value={filter.grade_level || 'all'}
              onChange={(e) => handleFilterChange('grade_level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Grades</option>
              {Object.entries(GRADE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={
                filter.is_used === undefined ? 'all' : filter.is_used ? 'used' : 'available'
              }
              onChange={(e) =>
                handleFilterChange(
                  'is_used',
                  e.target.value === 'all'
                    ? 'all'
                    : e.target.value === 'used'
                    ? 'true'
                    : 'false'
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="used">Used</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year
            </label>
            <input
              type="text"
              placeholder="e.g., 2025-2026"
              value={filter.academic_year || ''}
              onChange={(e) => handleFilterChange('academic_year', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Letters Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {isLoadingLetters ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : letters.length === 0 ? (
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No letters found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first admission letter to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admission Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Child Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Academic Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {letters.map((letter) => (
                  <tr key={letter.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {letter.admission_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {letter.child_first_name} {letter.child_last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {GRADE_LABELS[letter.grade_level]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {letter.academic_year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          letter.is_used
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {letter.is_used ? 'Used' : 'Available'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(letter.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <AdmissionLetterPDFButton letter={letter} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </RoleGuard>
  );
}