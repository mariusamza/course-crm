// types/index.ts
export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT'
export type EnrollmentStatus = 'INTERESTED' | 'FOLLOWING' | 'FINISHED'
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE' | 'LATE'
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE'
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER'
export type CourseStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED'

export interface User {
  id: string
  username: string
  email?: string | null
  role: Role
  createdAt: Date
  updatedAt: Date
  student?: Student | null
  trainer?: Trainer | null
}

export interface Student {
  id: string
  studentId: string
  firstName: string
  lastName: string
  cnp?: string | null
  phone?: string | null
  address?: string | null
  ciSeries?: string | null
  ciNumber?: string | null
  guardianName?: string | null
  guardianPhone?: string | null
  guardianEmail?: string | null
  userId: string
  user?: User
  createdAt: Date
  updatedAt: Date
  enrollments?: Enrollment[]
  documents?: StudentDocument[]
  notes?: StudentNote[]
  attendance?: Attendance[]
  finance?: Finance[]
}

export interface StudentDocument {
  id: string
  name: string
  type: string
  fileData: string
  mimeType: string
  size: number
  studentId: string
  createdAt: Date
}

export interface StudentNote {
  id: string
  content: string
  studentId: string
  authorId: string
  author?: User
  createdAt: Date
  updatedAt: Date
}

export interface Trainer {
  id: string
  trainerId: string
  firstName: string
  lastName: string
  phone?: string | null
  email?: string | null
  bio?: string | null
  userId: string
  user?: User
  createdAt: Date
  updatedAt: Date
  courses?: Course[]
}

export interface TimeSlot {
  day: string
  startTime: string
  endTime: string
}

export interface Course {
  id: string
  courseId: string
  name: string
  description?: string | null
  startDate: Date
  endDate: Date
  status: CourseStatus
  timeSlots: TimeSlot[]
  weekDays: string[]
  trainerId?: string | null
  trainer?: Trainer | null
  createdAt: Date
  updatedAt: Date
  enrollments?: Enrollment[]
  sessions?: CourseSession[]
  finance?: Finance[]
}

export interface Enrollment {
  id: string
  status: EnrollmentStatus
  enrollmentDate: Date
  completionDate?: Date | null
  notes?: string | null
  studentId: string
  student?: Student
  courseId: string
  course?: Course
  createdAt: Date
  updatedAt: Date
}

export interface CourseSession {
  id: string
  sessionDate: Date
  startTime: string
  endTime: string
  topic?: string | null
  notes?: string | null
  courseId: string
  course?: Course
  createdAt: Date
  updatedAt: Date
  attendance?: Attendance[]
}

export interface Attendance {
  id: string
  status: AttendanceStatus
  notes?: string | null
  sessionId: string
  session?: CourseSession
  studentId: string
  student?: Student
  markedById: string
  markedBy?: User
  createdAt: Date
  updatedAt: Date
}

export interface Finance {
  id: string
  totalAmount: number
  paidAmount: number
  status: PaymentStatus
  advanceAmount: number
  notes?: string | null
  studentId: string
  student?: Student
  courseId: string
  course?: Course
  createdAt: Date
  updatedAt: Date
  installments?: PaymentInstallment[]
}

export interface PaymentInstallment {
  id: string
  amount: number
  dueDate: Date
  paidDate?: Date | null
  method: PaymentMethod
  status: PaymentStatus
  notes?: string | null
  financeId: string
  createdAt: Date
  updatedAt: Date
}

// Dashboard stats
export interface DashboardStats {
  totalStudents: number
  totalTrainers: number
  totalCourses: number
  totalEnrollments: number
  enrollmentsByStatus: {
    interested: number
    following: number
    finished: number
  }
  coursesByStatus: {
    upcoming: number
    ongoing: number
    completed: number
  }
  recentStudents: Student[]
  recentCourses: Course[]
  totalRevenue: number
  pendingPayments: number
}

// Form types
export interface StudentFormData {
  firstName: string
  lastName: string
  cnp?: string
  phone?: string
  address?: string
  ciSeries?: string
  ciNumber?: string
  guardianName?: string
  guardianPhone?: string
  guardianEmail?: string
  username: string
  email?: string
  password?: string
}

export interface TrainerFormData {
  firstName: string
  lastName: string
  phone?: string
  email?: string
  bio?: string
  username: string
  password?: string
}

export interface CourseFormData {
  name: string
  description?: string
  startDate: string
  endDate: string
  timeSlots: TimeSlot[]
  weekDays: string[]
  trainerId?: string
}

export interface EnrollmentFormData {
  studentId: string
  courseId: string
  status: EnrollmentStatus
  notes?: string
}

export interface SessionFormData {
  courseId: string
  sessionDate: string
  startTime: string
  endTime: string
  topic?: string
  notes?: string
}

export interface FinanceFormData {
  studentId: string
  courseId: string
  totalAmount: number
  advanceAmount?: number
  notes?: string
}

export interface InstallmentFormData {
  amount: number
  dueDate: string
  method: PaymentMethod
  notes?: string
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
