export type Role = 'student' | 'teacher' | 'admin'

export type CourseStatus = 'upcoming' | 'in_progress' | 'completed'

export type PaymentStatus = 'pending' | 'approved' | 'paid' | 'disputed' | 'cancelled'

export type RefundStatus = 'open' | 'approved' | 'rejected' | 'expired'

export type RefundType = 'credit' | 'cash'

export type InstructorRole = 'main' | 'substitute'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
}

export interface Course {
  id: string
  title: string
  level: string
  status: CourseStatus
  termStart: string
  termEnd: string
  enrolledCount: number
  instructors: CourseInstructor[]
}

export interface CourseInstructor {
  userId: string
  name: string
  role: InstructorRole
}

export interface Session {
  id: string
  courseId: string
  courseTitle: string
  startsAt: string
  durationMin: number
  zoomLink: string
  status: 'scheduled' | 'live' | 'completed'
  recordingUrl?: string
  attendedTeacherId?: string
}

export interface Enrollment {
  id: string
  studentId: string
  courseId: string
  courseTitle: string
  enrolledAt: string
  sessionsAttended: number
  totalSessions: number
}

export interface Recording {
  id: string
  sessionId: string
  courseTitle: string
  date: string
  durationMin: number
  url: string
  isNew: boolean
}

export interface RefundRequest {
  id: string
  studentId: string
  studentName: string
  courseTitle: string
  enrollmentId: string
  type: RefundType
  amount: number
  status: RefundStatus
  requestedAt: string
  expiresAt: string
}

export interface TeacherPayment {
  id: string
  teacherId: string
  teacherName: string
  sessionId: string
  courseTitle: string
  sessionDate: string
  role: InstructorRole
  amount: number
  status: PaymentStatus
  zoomConfirmedAt?: string
  approvedAt?: string
}

export interface PayRate {
  teacherId: string
  role: InstructorRole
  amount: number
  currency: string
  effectiveFrom: string
}
