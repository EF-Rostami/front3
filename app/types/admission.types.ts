// app/types/admission.types.ts

export type GradeLevel = 
  | "vorschule" 
  | "klasse_1" 
  | "klasse_2" 
  | "klasse_3" 
  | "klasse_4";

export type RegistrationStatus = "pending" | "approved" | "rejected";

export type RelationType = "mother" | "father" | "guardian";

// ============================================================
// ADMISSION LETTER TYPES
// ============================================================

export interface AdmissionLetter {
  id: number;
  admission_number: string;
  child_first_name: string;
  child_last_name: string;
  grade_level: GradeLevel;
  academic_year: string;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
  created_by: number;
}

export interface CreateAdmissionLetterInput {
  admission_number: string;
  child_first_name: string;
  child_last_name: string;
  grade_level: GradeLevel;
  academic_year: string;
}

export interface BulkAdmissionLetterInput {
  letters: CreateAdmissionLetterInput[];
}

export interface BulkAdmissionLetterResponse {
  success_count: number;
  error_count: number;
  created_letters: AdmissionLetter[];
  errors: Array<{
    index: number;
    admission_number: string;
    error: string;
  }>;
}

// ============================================================
// ADMISSION VERIFICATION TYPES
// ============================================================

export interface AdmissionVerifyInput {
  admission_number: string;
  child_first_name: string;
  child_last_name: string;
}

export interface AdmissionVerifyResponse {
  valid: boolean;
  admission_number: string;
  child_first_name: string;
  child_last_name: string;
  grade_level: GradeLevel;
  academic_year: string;
}

// ============================================================
// PARENT INFORMATION
// ============================================================

export interface ParentAdmissionInput {
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  occupation: string;
  relation_type: RelationType;
  is_primary_contact: boolean;
}

export interface ParentAdmission {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  occupation: string;
  relation_type: RelationType;
  is_primary_contact: boolean;
  user_id: number | null;
}

// ============================================================
// STUDENT REGISTRATION
// ============================================================

export interface AdmissionRegisterInput {
  admission_number: string;
  student_first_name: string;
  student_last_name: string;
  date_of_birth: string; // ISO date format
  place_of_birth: string;
  nationality: string;
  address_street: string;
  address_city: string;
  address_postal_code: string;
  address_state: string;
  parents: ParentAdmissionInput[];
}

export interface AdmissionRegisterResponse {
  success: boolean;
  admission_id: number;
  admission_number: string;
  status: RegistrationStatus;
  message: string;
}

// ============================================================
// ADMISSION STATUS
// ============================================================

export interface AdmissionStatusResponse {
  admission_number: string;
  student_first_name: string;
  student_last_name: string;
  status: RegistrationStatus;
  submitted_at: string;
  approved_at: string | null;
}

// ============================================================
// FULL STUDENT ADMISSION (Admin View)
// ============================================================

export interface StudentAdmission {
  id: number;
  admission_number: string;
  student_first_name: string;
  student_last_name: string;
  date_of_birth: string;
  place_of_birth: string | null;
  nationality: string | null;
  grade_level: GradeLevel;
  address_street: string;
  address_city: string;
  address_postal_code: string;
  address_state: string;
  status: RegistrationStatus;
  submitted_at: string;
  approved_at: string | null;
  approved_by: number | null;
  rejection_reason: string | null;
  parents: ParentAdmission[];
}

// ============================================================
// ADMIN APPROVAL/REJECTION
// ============================================================

export interface AdmissionApprovalInput {
  admission_id: number;
}

export interface AdmissionApprovalResponse {
  success: boolean;
  admission_id: number;
  student_user_id: number;
  parent_user_ids: number[];
  student_username: string;
  parent_usernames: string[];
  message: string;
}

export interface AdmissionRejectionInput {
  admission_id: number;
  reason: string;
}

export interface AdmissionRejectionResponse {
  success: boolean;
  admission_id: number;
  message: string;
}

// ============================================================
// UI STATE TYPES
// ============================================================

export interface AdmissionFormState {
  currentStep: number;
  verifiedAdmission: AdmissionVerifyResponse | null;
  formData: Partial<AdmissionRegisterInput>;
  isSubmitting: boolean;
  error: string | null;
}

export interface AdmissionFilters {
  status?: RegistrationStatus;
  grade_level?: GradeLevel;
  search?: string;
  date_from?: string;
  date_to?: string;
}

// ============================================================
// HELPER TYPES
// ============================================================

export const GRADE_LABELS: Record<GradeLevel, string> = {
  vorschule: "Vorschule (Pre-School)",
  klasse_1: "Klasse 1 (Grade 1)",
  klasse_2: "Klasse 2 (Grade 2)",
  klasse_3: "Klasse 3 (Grade 3)",
  klasse_4: "Klasse 4 (Grade 4)",
};

export const STATUS_LABELS: Record<RegistrationStatus, string> = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
};

export const STATUS_COLORS: Record<RegistrationStatus, string> = {
  pending: "yellow",
  approved: "green",
  rejected: "red",
};