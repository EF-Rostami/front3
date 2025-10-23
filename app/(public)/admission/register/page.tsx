"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmissionStore } from '@/app/stores/admission.store';
import type { ParentAdmissionInput } from '@/app/types/admission.types';

export default function AdmissionRegisterPage() {
  const router = useRouter();
  const {
    verifiedAdmission,
    registrationData,
    updateRegistrationData,
    submitRegistration,
    isRegistering,
    registerError,
    registrationSuccess,
    currentStep,
    setCurrentStep,
    clearErrors,
  } = useAdmissionStore();

  // Redirect if not verified
  useEffect(() => {
    if (!verifiedAdmission) {
      router.push('/admission/verify');
    }
  }, [verifiedAdmission, router]);

  const [studentData, setStudentData] = useState({
    date_of_birth: '',
    place_of_birth: '',
    nationality: '',
  });

  const [addressData, setAddressData] = useState({
    address_street: '',
    address_city: '',
    address_postal_code: '',
    address_state: 'Germany',
  });

  const [parents, setParents] = useState<ParentAdmissionInput[]>([
    {
      first_name: '',
      last_name: '',
      email: '',
      mobile: '',
      occupation: '',
      relation_type: 'mother',
      is_primary_contact: true,
    },
  ]);

  const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleParentChange = (
    index: number,
    field: keyof ParentAdmissionInput,
    value: string | boolean
  ) => {
    const updated = [...parents];
    updated[index] = { ...updated[index], [field]: value };
    setParents(updated);
  };

  const addParent = () => {
    setParents([
      ...parents,
      {
        first_name: '',
        last_name: '',
        email: '',
        mobile: '',
        occupation: '',
        relation_type: 'father',
        is_primary_contact: false,
      },
    ]);
  };

  const removeParent = (index: number) => {
    if (parents.length > 1) {
      setParents(parents.filter((_, i) => i !== index));
    }
  };

  const nextStep = () => {
    clearErrors();
    setCurrentStep(currentStep + 1);
  };

  const previousStep = () => {
    clearErrors();
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    clearErrors();

    // Combine all data
    const completeData = {
      ...registrationData,
      ...studentData,
      ...addressData,
      parents,
    };
  // Log what you're sending
    console.log('Submitting data:', JSON.stringify(completeData, null, 2));
    updateRegistrationData(completeData);

    try {
      await submitRegistration();
      setCurrentStep(4); // Success step
 } catch (error: unknown) {
  console.error("Registration failed:", error);

    // If you're using Axios, errors are often AxiosError objects
    if (typeof error === "object" && error !== null && "response" in error) {
      const err = error as { response?: { data?: unknown} };
      console.error("Error response:", err.response);
      console.error("Error data:", err.response?.data);
    } else if (error instanceof Error) {
      console.error("Error message:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
  }
};

  if (!verifiedAdmission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (registrationSuccess && currentStep === 4) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Registration Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for completing the registration. We&apos;ll review your application
            and send you an email with the next steps.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/admission/status')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Check Application Status
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Student Registration
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Admission Number: <span className="font-semibold">{verifiedAdmission.admission_number}</span>
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {['Student Info', 'Address', 'Parents', 'Review'].map((label, idx) => (
              <div key={idx} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep > idx + 1
                      ? 'bg-green-500 border-green-500 text-white'
                      : currentStep === idx + 1
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > idx + 1 ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className="ml-2 text-xs font-medium text-gray-600 hidden sm:inline">
                  {label}
                </span>
                {idx < 3 && (
                  <div
                    className={`h-0.5 w-12 ml-2 ${
                      currentStep > idx + 1 ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-md rounded-lg p-6">
          {/* Step 1: Student Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Student Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={verifiedAdmission.child_first_name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={verifiedAdmission.child_last_name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={studentData.date_of_birth}
                    onChange={handleStudentChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Place of Birth *
                  </label>
                  <input
                    type="text"
                    name="place_of_birth"
                    value={studentData.place_of_birth}
                    onChange={handleStudentChange}
                    required
                    placeholder="City, Country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationality *
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={studentData.nationality}
                    onChange={handleStudentChange}
                    required
                    placeholder="e.g., German"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade Level
                  </label>
                  <input
                    type="text"
                    value={verifiedAdmission.grade_level}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={nextStep}
                  disabled={!studentData.date_of_birth || !studentData.place_of_birth || !studentData.nationality}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Address Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="address_street"
                  value={addressData.address_street}
                  onChange={handleAddressChange}
                  required
                  placeholder="Street and house number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="address_city"
                    value={addressData.address_city}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="address_postal_code"
                    value={addressData.address_postal_code}
                    onChange={handleAddressChange}
                    required
                    placeholder="e.g., 60311"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="address_state"
                    value={addressData.address_state}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={previousStep}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Previous
                </button>
                <button
                  onClick={nextStep}
                  disabled={!addressData.address_street || !addressData.address_city || !addressData.address_postal_code}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Parents/Guardians */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Parent/Guardian Information
                </h2>
                <button
                  onClick={addParent}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  + Add Parent
                </button>
              </div>

              {parents.map((parent, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                  {parents.length > 1 && (
                    <button
                      onClick={() => removeParent(index)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}

                  <h3 className="font-medium text-gray-900 mb-3">
                    Parent/Guardian {index + 1}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={parent.first_name}
                        onChange={(e) =>
                          handleParentChange(index, 'first_name', e.target.value)
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={parent.last_name}
                        onChange={(e) =>
                          handleParentChange(index, 'last_name', e.target.value)
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={parent.email}
                        onChange={(e) =>
                          handleParentChange(index, 'email', e.target.value)
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile *
                      </label>
                      <input
                        type="tel"
                        value={parent.mobile}
                        onChange={(e) =>
                          handleParentChange(index, 'mobile', e.target.value)
                        }
                        required
                        placeholder="+49..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relation *
                      </label>
                      <select
                        value={parent.relation_type}
                        onChange={(e) =>
                          handleParentChange(index, 'relation_type', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="mother">Mother</option>
                        <option value="father">Father</option>
                        <option value="guardian">Guardian</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Occupation
                      </label>
                      <input
                        type="text"
                        value={parent.occupation}
                        onChange={(e) =>
                          handleParentChange(index, 'occupation', e.target.value)
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center mt-6">
                      <input
                        type="checkbox"
                        checked={parent.is_primary_contact}
                        onChange={(e) =>
                          handleParentChange(index, 'is_primary_contact', e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Primary Contact
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              {registerError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  <p className="text-sm">{registerError}</p>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button
                  onClick={previousStep}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Previous
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isRegistering || parents.some(p => !p.first_name || !p.email || !p.mobile)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {isRegistering ? (
                    <>
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
                      Submitting...
                    </>
                  ) : (
                    'Submit Registration'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}