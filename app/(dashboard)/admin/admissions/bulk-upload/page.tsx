/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmissionStore } from '@/app/stores/admission.store';
import { GRADE_LABELS, type GradeLevel } from '@/app/types/admission.types';
import { RoleGuard } from '@/app/components/RoleGuard';

interface ManualLetterRow {
  id: string;
  admission_number: string;
  child_first_name: string;
  child_last_name: string;
  grade_level: GradeLevel;
  academic_year: string;
}

export default function BulkAdmissionLettersPage() {
  const router = useRouter();
  const { createBulkLetters, isLoadingLetters, lettersError, clearErrors } = useAdmissionStore();
  
  
  const [activeTab, setActiveTab] = useState<'file' | 'manual'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [uploadResult, setUploadResult] = useState<any>(null);
  
  // Manual entry state
  const [manualRows, setManualRows] = useState<ManualLetterRow[]>([
    { id: '1', admission_number: '', child_first_name: '', child_last_name: '', grade_level: 'klasse_1', academic_year: '2025-2026' },
    { id: '2', admission_number: '', child_first_name: '', child_last_name: '', grade_level: 'klasse_1', academic_year: '2025-2026' },
    { id: '3', admission_number: '', child_first_name: '', child_last_name: '', grade_level: 'klasse_1', academic_year: '2025-2026' },
    { id: '4', admission_number: '', child_first_name: '', child_last_name: '', grade_level: 'klasse_1', academic_year: '2025-2026' },
    { id: '5', admission_number: '', child_first_name: '', child_last_name: '', grade_level: 'klasse_1', academic_year: '2025-2026' },
  ]);

  // Download CSV template
  const downloadTemplate = () => {
    const headers = ['admission_number', 'child_first_name', 'child_last_name', 'grade_level', 'academic_year'];
    const sampleData = [
      ['G1-2025-001', 'John', 'Doe', 'klasse_1', '2025-2026'],
      ['G2-2025-002', 'Jane', 'Smith', 'klasse_2', '2025-2026'],
    ];
    
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admission_letters_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Parse CSV file
  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }
    return data;
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFileError('');
    setUploadResult(null);
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
      setFileError('Please upload a CSV or Excel file');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
  };

  // Submit file upload
  const handleFileSubmit = async () => {
    if (!file) {
      setFileError('Please select a file');
      return;
    }
    
    clearErrors();
    setFileError('');
    setUploadResult(null);
    
    try {
      const text = await file.text();
      const parsedData = parseCSV(text);
      
      if (parsedData.length === 0) {
        setFileError('The file is empty or invalid');
        return;
      }
      
      // Validate required fields
      const requiredFields = ['admission_number', 'child_first_name', 'child_last_name', 'grade_level', 'academic_year'];
      const firstRow = parsedData[0];
      const missingFields = requiredFields.filter(field => !firstRow.hasOwnProperty(field));
      
      if (missingFields.length > 0) {
        setFileError(`Missing required columns: ${missingFields.join(', ')}`);
        return;
      }
      
      const result = await createBulkLetters({ letters: parsedData });
      setUploadResult(result);
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: any) {
      setFileError(error.message || 'Failed to process file');
    }
  };

  // Manual entry functions
  const addRow = () => {
    const newRow: ManualLetterRow = {
      id: Date.now().toString(),
      admission_number: '',
      child_first_name: '',
      child_last_name: '',
      grade_level: 'klasse_1',
      academic_year: '2025-2026',
    };
    setManualRows([...manualRows, newRow]);
  };

  const removeRow = (id: string) => {
    if (manualRows.length > 1) {
      setManualRows(manualRows.filter(row => row.id !== id));
    }
  };

  const updateRow = (id: string, field: keyof ManualLetterRow, value: string) => {
    setManualRows(manualRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setUploadResult(null);
    
    // Filter out empty rows
    const filledRows = manualRows.filter(row => 
      row.admission_number.trim() !== '' ||
      row.child_first_name.trim() !== '' ||
      row.child_last_name.trim() !== ''
    );
    
    if (filledRows.length === 0) {
      setFileError('Please fill in at least one row');
      return;
    }
    
    // Validate all filled rows have required fields
    const invalidRows = filledRows.filter(row => 
      !row.admission_number || !row.child_first_name || !row.child_last_name
    );
    
    if (invalidRows.length > 0) {
      setFileError('All filled rows must have Admission Number, First Name, and Last Name');
      return;
    }
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const letters = filledRows.map(({ id, ...rest }) => rest);
      const result = await createBulkLetters({ letters });
      setUploadResult(result);
      
      // Reset form
      setManualRows([
        { id: '1', admission_number: '', child_first_name: '', child_last_name: '', grade_level: 'klasse_1', academic_year: '2025-2026' },
        { id: '2', admission_number: '', child_first_name: '', child_last_name: '', grade_level: 'klasse_1', academic_year: '2025-2026' },
        { id: '3', admission_number: '', child_first_name: '', child_last_name: '', grade_level: 'klasse_1', academic_year: '2025-2026' },
        { id: '4', admission_number: '', child_first_name: '', child_last_name: '', grade_level: 'klasse_1', academic_year: '2025-2026' },
        { id: '5', admission_number: '', child_first_name: '', child_last_name: '', grade_level: 'klasse_1', academic_year: '2025-2026' },
      ]);
    } catch (error: any) {
      setFileError(error.message || 'Failed to create letters');
    }
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-700 mb-2 flex items-center text-sm"
            >
              ← Back to Letters
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Bulk Create Admission Letters</h1>
            <p className="mt-1 text-sm text-gray-600">
              Upload a CSV file or manually enter multiple admission letters at once
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('file')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'file'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                File Upload
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'manual'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manual Entry
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* File Upload Tab */}
            {activeTab === 'file' && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Upload CSV or Excel File</h3>
                    <button
                      onClick={downloadTemplate}
                      className="text-sm text-blue-600 hover:text-blue-700 underline"
                    >
                      Download Template
                    </button>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          {file ? file.name : 'Click to upload or drag and drop'}
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          CSV or Excel files up to 10MB
                        </span>
                        <input
                          id="file-upload"
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>

                  {fileError && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                      <p className="text-sm">{fileError}</p>
                    </div>
                  )}

                  {lettersError && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                      <p className="text-sm">{lettersError}</p>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleFileSubmit}
                      disabled={!file || isLoadingLetters}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isLoadingLetters ? 'Processing...' : 'Upload and Create Letters'}
                    </button>
                  </div>
                </div>

                {/* File format guide */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">File Format Guide</h4>
                  <p className="text-sm text-blue-700 mb-2">Your CSV file should have these columns:</p>
                  <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                    <li><strong>admission_number</strong> - Unique admission number (e.g., G1-2025-001)</li>
                    <li><strong>child_first_name</strong> - Child&apos;s first name</li>
                    <li><strong>child_last_name</strong> - Child&apos;s last name</li>
                    <li><strong>grade_level</strong> - Grade level (klasse_1, klasse_2, etc.)</li>
                    <li><strong>academic_year</strong> - Academic year (e.g., 2025-2026)</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Manual Entry Tab */}
            {activeTab === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Enter Letters Manually</h3>
                    <button
                      type="button"
                      onClick={addRow}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      + Add Row
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Admission Number *
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            First Name *
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Last Name *
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Grade Level *
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Academic Year *
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {manualRows.map((row) => (
                          <tr key={row.id}>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={row.admission_number}
                                onChange={(e) => updateRow(row.id, 'admission_number', e.target.value)}
                                placeholder="G1-2025-001"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={row.child_first_name}
                                onChange={(e) => updateRow(row.id, 'child_first_name', e.target.value)}
                                placeholder="John"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={row.child_last_name}
                                onChange={(e) => updateRow(row.id, 'child_last_name', e.target.value)}
                                placeholder="Doe"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={row.grade_level}
                                onChange={(e) => updateRow(row.id, 'grade_level', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                {Object.entries(GRADE_LABELS).map(([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={row.academic_year}
                                onChange={(e) => updateRow(row.id, 'academic_year', e.target.value)}
                                placeholder="2025-2026"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                onClick={() => removeRow(row.id)}
                                disabled={manualRows.length === 1}
                                className="text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {fileError && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                      <p className="text-sm">{fileError}</p>
                    </div>
                  )}

                  {lettersError && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                      <p className="text-sm">{lettersError}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoadingLetters}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {isLoadingLetters ? 'Creating...' : 'Create All Letters'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Results Section */}
        {uploadResult && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Results</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700">{uploadResult.success_count}</div>
                <div className="text-sm text-green-600">Successfully Created</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-700">{uploadResult.error_count}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
            </div>

            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Errors:</h3>
                <div className="bg-red-50 border border-red-200 rounded-md p-4 max-h-60 overflow-y-auto">
                  <ul className="text-sm text-red-700 space-y-2">
                    {uploadResult.errors.map((error: any, idx: number) => (
                      <li key={idx}>
                        <strong>Row {error.index + 1}</strong> ({error.admission_number}): {error.error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => router.push('/admin/admissions/letters')}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                View All Letters
              </button>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}