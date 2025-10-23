// app/lib/api/admission.ts

/**
 * Admission API Service
 * Uses Next.js API proxy routes for authenticated requests
 * Public endpoints go directly to backend
 */

import type {
  AdmissionLetter,
  CreateAdmissionLetterInput,
  BulkAdmissionLetterInput,
  BulkAdmissionLetterResponse,
  AdmissionVerifyInput,
  AdmissionVerifyResponse,
  AdmissionRegisterInput,
  AdmissionRegisterResponse,
  AdmissionStatusResponse,
  StudentAdmission,
  AdmissionApprovalInput,
  AdmissionApprovalResponse,
  AdmissionRejectionInput,
  AdmissionRejectionResponse,
  GradeLevel,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  RegistrationStatus,
} from '@/app/types/admission.types';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Admission API Service
 * Handles all admission-related API calls
 */
export const admissionApi = {
  // ============================================================
  // PUBLIC ENDPOINTS (Direct to backend - No Auth Required)
  // ============================================================

  /**
   * Verify admission number and child name
   * Public endpoint - parents use this first
   */
  async verifyAdmission(
    data: AdmissionVerifyInput
  ): Promise<AdmissionVerifyResponse> {
    const response = await fetch(`${BACKEND_URL}/admission/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Verification failed');
    }

    return response.json();
  },

  /**
   * Register student with verified admission number
   * Public endpoint - parents complete registration
   */
  async registerStudent(
    data: AdmissionRegisterInput
  ): Promise<AdmissionRegisterResponse> {
    const response = await fetch(`${BACKEND_URL}/admission/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
  },

  /**
   * Check admission status by admission number
   * Public endpoint - anyone can check status
   */
  async checkStatus(
    admissionNumber: string
  ): Promise<AdmissionStatusResponse> {
    const response = await fetch(
      `${BACKEND_URL}/admission/status/${admissionNumber}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to check status');
    }

    return response.json();
  },

  // ============================================================
  // ADMIN ENDPOINTS (Via Next.js proxy - Auth Required)
  // ============================================================

  /**
   * Create a single admission letter
   * Admin only - uses proxy
   */
  async createLetter(
    data: CreateAdmissionLetterInput
  ): Promise<AdmissionLetter> {
    const response = await fetch('/api/admission/letters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.error || 'Failed to create letter');
    }

    return response.json();
  },

  /**
   * Create multiple admission letters at once
   * Admin only - uses proxy
   */
  async createBulkLetters(
    data: BulkAdmissionLetterInput
  ): Promise<BulkAdmissionLetterResponse> {
    const response = await fetch('/api/admission/letters/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.error || 'Failed to create letters');
    }

    return response.json();
  },

  /**
   * Get all admission letters with optional filters
   * Admin only - uses proxy
   */
  async getLetters(params?: {
    skip?: number;
    limit?: number;
    grade_level?: GradeLevel;
    academic_year?: string;
    is_used?: boolean;
  }): Promise<AdmissionLetter[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.grade_level) queryParams.append('grade_level', params.grade_level);
    if (params?.academic_year) queryParams.append('academic_year', params.academic_year);
    if (params?.is_used !== undefined) queryParams.append('is_used', params.is_used.toString());

    const url = `/api/admission/letters${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.error || 'Failed to fetch letters');
    }

    return response.json();
  },

  /**
   * Get specific admission letter by ID
   * Admin only - uses proxy
   */
  async getLetter(letterId: number): Promise<AdmissionLetter> {
    const response = await fetch(`/api/admission/letters/${letterId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.error || 'Failed to fetch letter');
    }

    return response.json();
  },

  /**
   * Get all pending admission registrations
   * Admin only - uses proxy
   */
  async getPendingAdmissions(params?: {
    skip?: number;
    limit?: number;
  }): Promise<StudentAdmission[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/api/admission/pending${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      // Try to parse error as JSON, fallback to text
      let errorMessage = `HTTP ${response.status}`;
      try {
        const error = await response.json();
        errorMessage = error.detail || error.error || errorMessage;
      } catch {
        // If not JSON, get text
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  /**
   * Approve admission and create user accounts
   * Admin only - uses proxy
   */
  async approveAdmission(
    data: AdmissionApprovalInput
  ): Promise<AdmissionApprovalResponse> {
    const response = await fetch('/api/admission/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.error || 'Failed to approve admission');
    }

    return response.json();
  },

  /**
   * Reject admission with reason
   * Admin only - uses proxy
   */
  async rejectAdmission(
    data: AdmissionRejectionInput
  ): Promise<AdmissionRejectionResponse> {
    const response = await fetch('/api/admission/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.error || 'Failed to reject admission');
    }

    return response.json();
  },
  
};

/**
 * Export individual functions for convenience
 */
export const {
  verifyAdmission,
  registerStudent,
  checkStatus,
  createLetter,
  createBulkLetters,
  getLetters,
  getLetter,
  getPendingAdmissions,
  approveAdmission,
  rejectAdmission,
} = admissionApi;