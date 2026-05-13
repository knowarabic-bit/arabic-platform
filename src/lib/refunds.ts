import { prisma } from './prisma';

export interface RefundEligibility {
  eligible: boolean;
  reason?: string;
}

/**
 * Smart Refund Gate:
 * Returns true ONLY when:
 *   1. The student has attended OR watched the first lesson.
 *   2. The scheduled start time of the second lesson has NOT yet passed.
 */
export async function canRequestRefund(
  studentId: string,
  courseId: string,
): Promise<RefundEligibility> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    include: {
      attendances: true,
      refunds: {
        where: { status: { not: 'REJECTED' } },
      },
    },
  });

  if (!enrollment) return { eligible: false, reason: 'Not enrolled in this course.' };
  if (!enrollment.isActive) return { eligible: false, reason: 'Enrollment is no longer active.' };
  if (enrollment.refunds.length > 0)
    return { eligible: false, reason: 'A refund request already exists for this enrollment.' };

  const lessons = await prisma.lesson.findMany({
    where: { courseId },
    orderBy: { lessonNumber: 'asc' },
    take: 2,
  });

  if (lessons.length < 2)
    return { eligible: false, reason: 'Course does not yet have two scheduled lessons.' };

  const [firstLesson, secondLesson] = lessons;

  const attendedFirst = enrollment.attendances.some((a) => a.lessonId === firstLesson.id);
  if (!attendedFirst)
    return {
      eligible: false,
      reason: 'You must attend or watch Lesson 1 before requesting a refund.',
    };

  const now = new Date();
  if (new Date(secondLesson.scheduledAt) <= now)
    return {
      eligible: false,
      reason: 'The refund window has closed — Lesson 2 has already started.',
    };

  return { eligible: true };
}

export async function createRefundRequest(
  studentId: string,
  enrollmentId: string,
  refundType: 'CREDIT' | 'CASH',
  reason?: string,
) {
  const [studentIdFromEnrollment, courseId] = await prisma.enrollment
    .findUniqueOrThrow({ where: { id: enrollmentId }, select: { studentId: true, courseId: true } })
    .then((e) => [e.studentId, e.courseId]);

  const eligibility = await canRequestRefund(studentIdFromEnrollment as string, courseId as string);
  if (!eligibility.eligible) throw new Error(eligibility.reason);

  return prisma.refundRequest.create({
    data: { enrollmentId, studentId, refundType, reason, status: 'PENDING' },
  });
}
