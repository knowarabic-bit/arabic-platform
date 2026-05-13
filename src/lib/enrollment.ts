import { prisma } from './prisma';

/**
 * Late-Joiner Rule:
 * When a student buys an IN_PROGRESS course, automatically grant access
 * (via Attendance records) to every lesson that already has a recordingUrl.
 */
export async function enrollStudent(
  studentId: string,
  courseId: string,
  paymentType: 'SINGLE' | 'SUBSCRIPTION',
) {
  const course = await prisma.course.findUniqueOrThrow({
    where: { id: courseId },
    include: {
      lessons: {
        where: { recordingUrl: { not: null } },
        orderBy: { lessonNumber: 'asc' },
      },
    },
  });

  const enrollment = await prisma.enrollment.create({
    data: { studentId, courseId, paymentType },
  });

  if (course.status === 'IN_PROGRESS' && course.lessons.length > 0) {
    await prisma.attendance.createMany({
      data: course.lessons.map((lesson) => ({
        enrollmentId: enrollment.id,
        lessonId: lesson.id,
        isLive: false,
      })),
      skipDuplicates: true,
    });
  }

  return enrollment;
}

export async function recordAttendance(
  enrollmentId: string,
  lessonId: string,
  isLive: boolean,
) {
  return prisma.attendance.upsert({
    where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
    create: { enrollmentId, lessonId, isLive },
    update: { watchedAt: new Date() },
  });
}
