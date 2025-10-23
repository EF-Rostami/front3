// app/stores/admission.store.ts
"use client";

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { admissionApi } from '@/app/lib/api/admission';
import type {
  AdmissionVerifyResponse,
  AdmissionRegisterInput,
  StudentAdmission,
  AdmissionLetter,
  GradeLevel,
  BulkAdmissionLetterInput,
  BulkAdmissionLetterResponse,
  AdmissionStatusResponse,
} from '@/app/types/admission.types';

// Admission state interface
export interface AdmissionState {
  // Verification flow
  verifiedAdmission: AdmissionVerifyResponse | null;
  isVerifying: boolean;
  verifyError: string | null;
  
  // Registration flow
  registrationData: Partial<AdmissionRegisterInput> | null;
  isRegistering: boolean;
  registerError: string | null;
  registrationSuccess: boolean;
  
  // Admin - Letters
  letters: AdmissionLetter[];
  isLoadingLetters: boolean;
  lettersError: string | null;
  
  // Admin - Pending admissions
  pendingAdmissions: StudentAdmission[];
  isLoadingAdmissions: boolean;
  admissionsError: string | null;
  
  // UI state
  currentStep: number;
  _hasHydrated: boolean;
}

// Admission store interface with all methods
interface AdmissionStore extends AdmissionState {
  // Hydration
  setHasHydrated: (state: boolean) => void;
  
  // Public actions - Verification
  verifyAdmission: (
    admissionNumber: string,
    childFirstName: string,
    childLastName: string
  ) => Promise<AdmissionVerifyResponse>;
  clearVerification: () => void;
  
  // Public actions - Registration
  updateRegistrationData: (data: Partial<AdmissionRegisterInput>) => void;
  submitRegistration: () => Promise<void>;
  clearRegistration: () => void;
  
  // Public actions - Status check
  checkStatus: (admissionNumber: string) => Promise<AdmissionStatusResponse>;
  
  // Admin actions - Letters
  fetchLetters: (filters?: {
    grade_level?: GradeLevel;
    academic_year?: string;
    is_used?: boolean;
  }) => Promise<void>;
  createLetter: (data: {
    admission_number: string;
    child_first_name: string;
    child_last_name: string;
    grade_level: GradeLevel;
    academic_year: string;
  }) => Promise<void>;
  createBulkLetters: (data: BulkAdmissionLetterInput) => Promise<BulkAdmissionLetterResponse>;
  
  // Admin actions - Admissions
  fetchPendingAdmissions: () => Promise<void>;
  approveAdmission: (admissionId: number) => Promise<void>;
  rejectAdmission: (admissionId: number, reason: string) => Promise<void>;
  
  // UI helpers
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  clearErrors: () => void;
  reset: () => void;
}

export const useAdmissionStore = create<AdmissionStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        verifiedAdmission: null,
        isVerifying: false,
        verifyError: null,
        
        registrationData: null,
        isRegistering: false,
        registerError: null,
        registrationSuccess: false,
        
        letters: [],
        isLoadingLetters: false,
        lettersError: null,
        
        pendingAdmissions: [],
        isLoadingAdmissions: false,
        admissionsError: null,
        
        currentStep: 1,
        _hasHydrated: false,

        // Hydration
        setHasHydrated: (state: boolean) => {
          set({ _hasHydrated: state });
        },

        // ============================================================
        // PUBLIC ACTIONS - VERIFICATION
        // ============================================================

        verifyAdmission: async (admissionNumber, childFirstName, childLastName) => {
          set({ isVerifying: true, verifyError: null });
          
          try {
            const result = await admissionApi.verifyAdmission({
              admission_number: admissionNumber,
              child_first_name: childFirstName,
              child_last_name: childLastName,
            });

            set({
              verifiedAdmission: result,
              isVerifying: false,
              verifyError: null,
              currentStep: 1,
              registrationData: {
                admission_number: result.admission_number,
                student_first_name: result.child_first_name,
                student_last_name: result.child_last_name,
              },
            });

            return result;
          } catch (error) {
            const errorMessage = error instanceof Error 
              ? error.message 
              : 'Verification failed';
            
            set({
              verifiedAdmission: null,
              isVerifying: false,
              verifyError: errorMessage,
            });
            
            throw error;
          }
        },

        clearVerification: () => {
          set({
            verifiedAdmission: null,
            verifyError: null,
            currentStep: 1,
          });
        },

        // ============================================================
        // PUBLIC ACTIONS - REGISTRATION
        // ============================================================

        updateRegistrationData: (data) => {
          const { registrationData } = get();
          set({
            registrationData: { ...registrationData, ...data },
          });
        },

        submitRegistration: async () => {
          set({ isRegistering: true, registerError: null });
          
          try {
            const state = get();
            const response = await fetch('http://localhost:8000/admission/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(state.registrationData),
            });

            if (!response.ok) {
              const errorData = await response.json();
              console.error('Backend validation error:', errorData);
              
              // Format the error message properly
              let errorMessage = 'Registration failed';
              
              if (errorData.detail) {
                if (Array.isArray(errorData.detail)) {
                  // FastAPI validation errors
                  errorMessage = errorData.detail
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map((err: any) => `${err.loc.join(' → ')}: ${err.msg}`)
                    .join('\n');
                } else if (typeof errorData.detail === 'string') {
                  errorMessage = errorData.detail;
                }
              }
              
              set({ registerError: errorMessage, isRegistering: false });
              throw new Error(errorMessage);
            }

            const data = await response.json();
            set({ 
              registrationSuccess: true, 
              isRegistering: false,
              registrationData: data 
            });
            
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            console.error('Submit error:', error);
            set({ 
              registerError: error.message || 'Network error occurred',
              isRegistering: false 
            });
            throw error;
          }
        },

        clearRegistration: () => {
          set({
            registrationData: null,
            registerError: null,
            registrationSuccess: false,
          });
        },

        // ============================================================
        // PUBLIC ACTIONS - STATUS CHECK
        // ============================================================

        checkStatus: async (admissionNumber) => {
          try {
            const status = await admissionApi.checkStatus(admissionNumber);
            // You can store status in state if needed
            return status;
          } catch (error) {
            throw error;
          }
        },

        // ============================================================
        // ADMIN ACTIONS - LETTERS
        // ============================================================

        fetchLetters: async (filters) => {
          set({ isLoadingLetters: true, lettersError: null });

          try {
            const letters = await admissionApi.getLetters(filters);
            set({
              letters,
              isLoadingLetters: false,
              lettersError: null,
            });
          } catch (error) {
            const errorMessage = error instanceof Error 
              ? error.message 
              : 'Failed to fetch letters';
            
            set({
              letters: [],
              isLoadingLetters: false,
              lettersError: errorMessage,
            });
          }
        },

        createLetter: async (data) => {
          set({ isLoadingLetters: true, lettersError: null });

          try {
            await admissionApi.createLetter(data);
            // Refresh the list
            await get().fetchLetters();
          } catch (error) {
            const errorMessage = error instanceof Error 
              ? error.message 
              : 'Failed to create letter';
            
            set({
              isLoadingLetters: false,
              lettersError: errorMessage,
            });
            
            throw error;
          }
        },

        createBulkLetters: async (data) => {
          set({ isLoadingLetters: true, lettersError: null });
          
          try {
            const result = await admissionApi.createBulkLetters(data);
            
            // Refresh the letters list after successful creation
            await get().fetchLetters();
            
            set({ isLoadingLetters: false });
            return result;
          } catch (error) {
            const errorMessage = error instanceof Error 
              ? error.message 
              : 'Failed to create bulk letters';
            
            set({ 
              isLoadingLetters: false, 
              lettersError: errorMessage 
            });
            
            throw error;
          }
        },

        // ============================================================
        // ADMIN ACTIONS - ADMISSIONS
        // ============================================================

        fetchPendingAdmissions: async () => {
          set({ isLoadingAdmissions: true, admissionsError: null });

          try {
            const admissions = await admissionApi.getPendingAdmissions();
            set({
              pendingAdmissions: admissions,
              isLoadingAdmissions: false,
              admissionsError: null,
            });
          } catch (error) {
            const errorMessage = error instanceof Error 
              ? error.message 
              : 'Failed to fetch admissions';
            
            set({
              pendingAdmissions: [],
              isLoadingAdmissions: false,
              admissionsError: errorMessage,
            });
          }
        },

        approveAdmission: async (admissionId) => {
          set({ isLoadingAdmissions: true, admissionsError: null });

          try {
            await admissionApi.approveAdmission({ admission_id: admissionId });
            // Refresh the list
            await get().fetchPendingAdmissions();
          } catch (error) {
            const errorMessage = error instanceof Error 
              ? error.message 
              : 'Failed to approve admission';
            
            set({
              isLoadingAdmissions: false,
              admissionsError: errorMessage,
            });
            
            throw error;
          }
        },

        rejectAdmission: async (admissionId, reason) => {
          set({ isLoadingAdmissions: true, admissionsError: null });

          try {
            await admissionApi.rejectAdmission({
              admission_id: admissionId,
              reason,
            });
            // Refresh the list
            await get().fetchPendingAdmissions();
          } catch (error) {
            const errorMessage = error instanceof Error 
              ? error.message 
              : 'Failed to reject admission';
            
            set({
              isLoadingAdmissions: false,
              admissionsError: errorMessage,
            });
            
            throw error;
          }
        },

        // ============================================================
        // UI HELPERS
        // ============================================================

        setCurrentStep: (step) => {
          set({ currentStep: step });
        },

        nextStep: () => {
          const { currentStep } = get();
          set({ currentStep: currentStep + 1 });
        },

        previousStep: () => {
          const { currentStep } = get();
          if (currentStep > 1) {
            set({ currentStep: currentStep - 1 });
          }
        },

        clearErrors: () => {
          set({
            verifyError: null,
            registerError: null,
            lettersError: null,
            admissionsError: null,
          });
        },

        reset: () => {
          set({
            verifiedAdmission: null,
            isVerifying: false,
            verifyError: null,
            registrationData: null,
            isRegistering: false,
            registerError: null,
            registrationSuccess: false,
            currentStep: 1,
          });
        },
      }),
      {
        name: 'admission-store',
        partialize: (state) => ({
          verifiedAdmission: state.verifiedAdmission,
          registrationData: state.registrationData,
          currentStep: state.currentStep,
        }),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      }
    ),
    { name: 'admission-store' }
  )
);