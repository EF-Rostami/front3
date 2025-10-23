// // types/auth.ts
// export interface User {
//   id: string;
//   email: string;
//   first_name: string;
//   last_name: string;
//   is_active: boolean;
//   is_verified: boolean;
//   created_at: string;
//   updated_at: string;
//   roles: string[];
// }

// export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// API Response Types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  roles: UserRole[];
}

export interface UserRole {
  assigned_at: string;
  role: {
    name: 'admin' | 'teacher' | 'parent' | 'student';
    description: string | null;
  };
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  student_number: string;
  date_of_birth: string;
  grade_level: GradeLevel;
  class_id: number | null;
}

export interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  employee_number: string;
  subject_specialization: string | null;
}

export interface Parent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone_number: string | null;
  address: string | null;
}

export interface Grade {
  grade_id: number;
  course_name: string | null;
  exam_title: string | null;
  score: number;
  grade_value: string | null;
  comments: string | null;
  graded_at: string;
}

export interface AttendanceRecord {
  id: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string | null;
}

export interface FeeRecord {
  id: number;
  amount: number;
  fee_type: string;
  due_date: string;
  paid_date: string | null;
  is_paid: boolean;
  payment_method: string | null;
  academic_year: string;
}

export interface Course {
  id: number;
  name: string;
  code: string;
  class_name: string | null;
  academic_year: string;
}

export interface Class {
  id: number;
  name: string;
  grade_level: GradeLevel;
  room_number: string | null;
  student_count: number;
  max_students: number;
}

export type GradeLevel = 'vorschule' | 'klasse_1' | 'klasse_2' | 'klasse_3' | 'klasse_4';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';


// export interface Role {
//   id: string;
//   name: string;
//   description?: string;
//   created_at: string;
// }

// export interface LoginCredentials {
//   email: string;
//   password: string;
// }

// export interface AuthTokens {
//   access_token: string;
//   refresh_token: string;
//   token_type: string;
// }

// export interface AuthResponse {
//   user: User;
//   success: boolean;
// }

// export interface RefreshToken {
//   id: string;
//   jti: string;
//   user_id: string;
//   token: string;
//   expires_at: string;
//   created_at: string;
//   device_info?: string;
//   ip_address?: string;
//   is_active: boolean;
// }

// // types/user.ts
// export interface UserCreate {
//   email: string;
//   first_name: string;
//   last_name: string;
//   password: string;
// }

// export interface UserUpdate {
//   first_name?: string;
//   last_name?: string;
//   email?: string;
// }

// export interface PasswordChange {
//   current_password: string;
//   new_password: string;
// }

// // types/registration.ts
// export interface RegistrationRequest {
//   id: string;
//   email: string;
//   first_name: string;
//   last_name: string;
//   requested_roles: string[];
//   role_specific_data?: Record<string, unknown>;
//   status: 'pending' | 'approved' | 'rejected';
//   admin_notes?: string;
//   approved_by_admin_id?: string;
//   approved_at?: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface RegistrationApprovalLog {
//   id: string;
//   registration_request_id: string;
//   admin_user_id: string;
//   action: 'approved' | 'rejected' | 'requested_changes';
//   notes?: string;
//   timestamp: string;
// }

// // types/academic.ts (Matching your FastAPI models exactly)
// export interface Student {
//   id: string;
//   user_id: string;
//   student_id: string;
//   date_of_birth?: string;
//   enrollment_date: string;
//   grade_level?: number;
//   section?: string;
//   user?: User;
// }

// export interface Teacher {
//   id: string;
//   user_id: string;
//   employee_id: string;
//   qualification?: string;
//   specialization?: string;
//   join_date: string;
//   user?: User;
// }

// export interface Parent {
//   id: string;
//   user_id: string;
//   phone_number?: string;
//   address?: string;
//   occupation?: string;
//   user?: User;
// }

// export interface Course {
//   id: string;
//   course_code: string;
//   name: string;
//   description?: string;
//   credits?: number;
//   teacher_id: string;
//   teacher?: Teacher;
// }

// export interface Class {
//   id: string;
//   class_code: string;
//   course_id: string;
//   teacher_id: string;
//   room_number?: string;
//   schedule?: string;
//   academic_year?: string;
//   semester?: string;
//   course?: Course;
//   teacher?: Teacher;
// }

// export interface ClassEnrollment {
//   id: string;
//   student_id: string;
//   class_id: string;
//   enrollment_date: string;
//   student?: Student;
//   class_?: Class;
// }

// export interface Exam {
//   id: string;
//   exam_code: string;
//   name: string;
//   course_id: string;
//   exam_date: string;
//   total_marks: number;
//   passing_marks: number;
//   course?: Course;
// }

// export interface Grade {
//   id: string;
//   student_id: string;
//   exam_id: string;
//   marks_obtained: number;
//   grade_letter?: string;
//   remarks?: string;
//   graded_date: string;
//   student?: Student;
//   exam?: Exam;
// }

// export interface Attendance {
//   id: string;
//   student_id: string;
//   class_id: string;
//   date: string;
//   status: 'present' | 'absent' | 'late' | 'excused';
//   remarks?: string;
//   student?: Student;
//   class_?: Class;
// }

// export interface FeeRecord {
//   id: string;
//   student_id: string;
//   fee_type: string;
//   amount: number;
//   due_date: string;
//   paid_date?: string;
//   status: 'pending' | 'paid' | 'overdue';
//   payment_method?: string;
//   transaction_id?: string;
//   student?: Student;
// }

// // types/api.ts
// export interface ApiError {
//   detail: string;
//   status_code?: number;
// }

// export interface ApiResponse<T = unknown> {
//   data?: T;
//   error?: string;
//   detail?: string;
//   message?: string;
//   success?: boolean;
// }

// export interface PaginatedResponse<T = unknown> {
//   items: T[];
//   total: number;
//   page: number;
//   size: number;
//   pages: number;
// }

// // types/statistics.ts
// export interface AttendanceStatistics {
//   student_id: string;
//   total_classes: number;
//   present_count: number;
//   absent_count: number;
//   late_count: number;
//   attendance_percentage: number;
// }

// export interface GradeStatistics {
//   student_id: string;
//   average_score: number;
//   total_exams: number;
//   highest_score: number;
//   lowest_score: number;
// }

// export interface ClassPerformance {
//   class_id: string;
//   average_score: number;
//   total_students: number;
//   pass_rate: number;
//   fail_rate: number;
// }

// // Utility types


// export interface SessionInfo {
//   id: string;
//   device_info?: string;
//   ip_address?: string;
//   created_at: string;
//   last_activity?: string;
//   is_current: boolean;
// }