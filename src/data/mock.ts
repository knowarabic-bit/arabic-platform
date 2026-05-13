import {
  User, Course, Session, Enrollment, Recording,
  RefundRequest, TeacherPayment, PayRate
} from '@/types'

export const mockUsers: User[] = [
  { id: 'u1', name: 'Ahmed Al-Rashid', email: 'ahmed@example.com', role: 'student' },
  { id: 'u2', name: 'Sara Mohammed', email: 'sara@example.com', role: 'student' },
  { id: 'u3', name: 'Omar Khalil', email: 'omar@example.com', role: 'student' },
  { id: 'u4', name: 'Dr. Fatima Al-Zahra', email: 'fatima@example.com', role: 'teacher' },
  { id: 'u5', name: 'Ahmad Karimi', email: 'karimi@example.com', role: 'teacher' },
  { id: 'u6', name: 'Sara Qadri', email: 'sqadri@example.com', role: 'teacher' },
  { id: 'u7', name: 'Super Admin', email: 'admin@example.com', role: 'admin' },
]

export const mockCourses: Course[] = [
  {
    id: 'c1', title: 'Arabic Foundations — Level 1', level: 'Beginner',
    status: 'in_progress', termStart: '2025-03-01', termEnd: '2025-06-30',
    enrolledCount: 28,
    instructors: [
      { userId: 'u4', name: 'Dr. Fatima Al-Zahra', role: 'main' },
      { userId: 'u5', name: 'Ahmad Karimi', role: 'substitute' },
    ],
  },
  {
    id: 'c2', title: 'Tajweed Intensive', level: 'Intermediate',
    status: 'in_progress', termStart: '2025-03-15', termEnd: '2025-06-15',
    enrolledCount: 15,
    instructors: [{ userId: 'u5', name: 'Ahmad Karimi', role: 'main' }],
  },
  {
    id: 'c3', title: 'Quranic Tafseer', level: 'Advanced',
    status: 'upcoming', termStart: '2025-06-01', termEnd: '2025-09-30',
    enrolledCount: 22,
    instructors: [
      { userId: 'u4', name: 'Dr. Fatima Al-Zahra', role: 'main' },
      { userId: 'u6', name: 'Sara Qadri', role: 'substitute' },
    ],
  },
  {
    id: 'c4', title: 'Arabic Intermediate — Level 2', level: 'Intermediate',
    status: 'upcoming', termStart: '2025-07-01', termEnd: '2025-10-31',
    enrolledCount: 19,
    instructors: [{ userId: 'u5', name: 'Ahmad Karimi', role: 'main' }],
  },
]

export const mockSessions: Session[] = [
  { id: 's1', courseId: 'c1', courseTitle: 'Arabic Foundations — Level 1', startsAt: '2025-05-13T19:00:00', durationMin: 80, zoomLink: 'https://zoom.us/j/111', status: 'live', attendedTeacherId: 'u4' },
  { id: 's2', courseId: 'c2', courseTitle: 'Tajweed Intensive', startsAt: '2025-05-15T18:00:00', durationMin: 60, zoomLink: 'https://zoom.us/j/222', status: 'scheduled' },
  { id: 's3', courseId: 'c3', courseTitle: 'Quranic Tafseer', startsAt: '2025-05-17T17:00:00', durationMin: 90, zoomLink: 'https://zoom.us/j/333', status: 'scheduled' },
  { id: 's4', courseId: 'c1', courseTitle: 'Arabic Foundations — Level 1', startsAt: '2025-05-10T19:00:00', durationMin: 84, zoomLink: 'https://zoom.us/j/444', status: 'completed', recordingUrl: '/recordings/s4', attendedTeacherId: 'u4' },
  { id: 's5', courseId: 'c2', courseTitle: 'Tajweed Intensive', startsAt: '2025-05-08T18:00:00', durationMin: 58, zoomLink: 'https://zoom.us/j/555', status: 'completed', recordingUrl: '/recordings/s5', attendedTeacherId: 'u5' },
  { id: 's6', courseId: 'c3', courseTitle: 'Quranic Tafseer', startsAt: '2025-05-04T17:00:00', durationMin: 95, zoomLink: 'https://zoom.us/j/666', status: 'completed', recordingUrl: '/recordings/s6', attendedTeacherId: 'u6' },
]

export const mockEnrollments: Enrollment[] = [
  { id: 'e1', studentId: 'u1', courseId: 'c1', courseTitle: 'Arabic Foundations — Level 1', enrolledAt: '2025-03-01', sessionsAttended: 6, totalSessions: 6 },
  { id: 'e2', studentId: 'u1', courseId: 'c2', courseTitle: 'Tajweed Intensive', enrolledAt: '2025-03-15', sessionsAttended: 5, totalSessions: 6 },
  { id: 'e3', studentId: 'u1', courseId: 'c3', courseTitle: 'Quranic Tafseer', enrolledAt: '2025-05-01', sessionsAttended: 3, totalSessions: 6 },
]

export const mockRecordings: Recording[] = [
  { id: 'r1', sessionId: 's4', courseTitle: 'Arabic Foundations — Session 6', date: 'May 10', durationMin: 84, url: '#', isNew: true },
  { id: 'r2', sessionId: 's5', courseTitle: 'Tajweed — Makharij Rules', date: 'May 8', durationMin: 58, url: '#', isNew: false },
  { id: 'r3', sessionId: 's6', courseTitle: 'Quranic Tafseer — Surah Al-Baqarah', date: 'May 4', durationMin: 95, url: '#', isNew: false },
  { id: 'r4', sessionId: 's4', courseTitle: 'Arabic Foundations — Session 5', date: 'May 1', durationMin: 78, url: '#', isNew: false },
]

export const mockRefunds: RefundRequest[] = [
  { id: 'rf1', studentId: 'u1', studentName: 'Ahmed Al-Rashid', courseTitle: 'Arabic Foundations — Level 1', enrollmentId: 'e1', type: 'cash', amount: 60, status: 'open', requestedAt: '2025-05-11', expiresAt: '2025-05-15T19:00:00' },
  { id: 'rf2', studentId: 'u2', studentName: 'Sara Mohammed', courseTitle: 'Tajweed Intensive', enrollmentId: 'e2', type: 'credit', amount: 45, status: 'open', requestedAt: '2025-05-11', expiresAt: '2025-05-15T18:00:00' },
  { id: 'rf3', studentId: 'u3', studentName: 'Omar Khalil', courseTitle: 'Arabic Intermediate', enrollmentId: 'e3', type: 'cash', amount: 50, status: 'approved', requestedAt: '2025-05-10', expiresAt: '2025-05-14T19:00:00' },
]

export const mockPayments: TeacherPayment[] = [
  { id: 'p1', teacherId: 'u4', teacherName: 'Dr. Fatima Al-Zahra', sessionId: 's1', courseTitle: 'Arabic Foundations Lv1', sessionDate: 'May 13, 2025', role: 'main', amount: 50, status: 'pending', zoomConfirmedAt: '2025-05-13T20:22:00' },
  { id: 'p2', teacherId: 'u5', teacherName: 'Ahmad Karimi', sessionId: 's2', courseTitle: 'Tajweed Intensive', sessionDate: 'May 10, 2025', role: 'main', amount: 45, status: 'pending', zoomConfirmedAt: '2025-05-10T19:20:00' },
  { id: 'p3', teacherId: 'u6', teacherName: 'Sara Qadri', sessionId: 's3', courseTitle: 'Quranic Tafseer', sessionDate: 'May 8, 2025', role: 'substitute', amount: 35, status: 'approved', zoomConfirmedAt: '2025-05-08T18:35:00' },
  { id: 'p4', teacherId: 'u4', teacherName: 'Dr. Fatima Al-Zahra', sessionId: 's4', courseTitle: 'Arabic Foundations Lv1', sessionDate: 'May 6, 2025', role: 'main', amount: 50, status: 'paid', zoomConfirmedAt: '2025-05-06T19:18:00', approvedAt: '2025-05-07T10:00:00' },
  { id: 'p5', teacherId: 'u5', teacherName: 'Ahmad Karimi', sessionId: 's5', courseTitle: 'Tajweed Intensive', sessionDate: 'Apr 25, 2025', role: 'substitute', amount: 35, status: 'pending', zoomConfirmedAt: '2025-04-25T18:05:00' },
  { id: 'p6', teacherId: 'u4', teacherName: 'Dr. Fatima Al-Zahra', sessionId: 's6', courseTitle: 'Arabic Foundations Lv1', sessionDate: 'Apr 22, 2025', role: 'main', amount: 50, status: 'disputed', zoomConfirmedAt: '2025-04-22T19:03:00' },
  { id: 'p7', teacherId: 'u5', teacherName: 'Ahmad Karimi', sessionId: 's2', courseTitle: 'Arabic Intermediate', sessionDate: 'May 7, 2025', role: 'main', amount: 45, status: 'paid', zoomConfirmedAt: '2025-05-07T19:01:00', approvedAt: '2025-05-08T09:00:00' },
  { id: 'p8', teacherId: 'u6', teacherName: 'Sara Qadri', sessionId: 's3', courseTitle: 'Tajweed Intensive', sessionDate: 'May 3, 2025', role: 'substitute', amount: 35, status: 'approved', zoomConfirmedAt: '2025-05-03T17:08:00' },
]

export const mockPayRates: PayRate[] = [
  { teacherId: 'u4', role: 'main', amount: 50, currency: 'USD', effectiveFrom: '2025-01-01' },
  { teacherId: 'u4', role: 'substitute', amount: 35, currency: 'USD', effectiveFrom: '2025-01-01' },
  { teacherId: 'u5', role: 'main', amount: 45, currency: 'USD', effectiveFrom: '2025-01-01' },
  { teacherId: 'u5', role: 'substitute', amount: 30, currency: 'USD', effectiveFrom: '2025-01-01' },
  { teacherId: 'u6', role: 'main', amount: 45, currency: 'USD', effectiveFrom: '2025-01-01' },
  { teacherId: 'u6', role: 'substitute', amount: 35, currency: 'USD', effectiveFrom: '2025-01-01' },
]

export const monthlyEarnings = [
  { month: 'Jan', amount: 180 },
  { month: 'Feb', amount: 210 },
  { month: 'Mar', amount: 160 },
  { month: 'Apr', amount: 240 },
  { month: 'May', amount: 200 },
]
