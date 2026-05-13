import { NextRequest, NextResponse } from 'next/server';
import { enrollStudent, recordAttendance } from '@/lib/enrollment';
import { prisma } from '@/lib/prisma';

// POST /api/enrollments — manual enroll (for testing; production uses the Stripe webhook)
export async function POST(req: NextRequest) {
  const { studentId, courseId, paymentType } = (await req.json()) as {
    studentId: string;
    courseId: string;
    paymentType: 'SINGLE' | 'SUBSCRIPTION';
  };

  if (!studentId || !courseId || !paymentType) {
    return NextResponse.json({ error: 'studentId, courseId, and paymentType are required' }, { status: 400 });
  }

  const enrollment = await enrollStudent(studentId, courseId, paymentType);
  return NextResponse.json(enrollment, { status: 201 });
}

// PATCH /api/enrollments — record attendance for a lesson
export async function PATCH(req: NextRequest) {
  const { enrollmentId, lessonId, isLive } = (await req.json()) as {
    enrollmentId: string;
    lessonId: string;
    isLive: boolean;
  };

  if (!enrollmentId || !lessonId) {
    return NextResponse.json({ error: 'enrollmentId and lessonId are required' }, { status: 400 });
  }

  const attendance = await recordAttendance(enrollmentId, lessonId, isLive ?? false);
  return NextResponse.json(attendance);
}

// GET /api/enrollments?studentId=xxx — list a student's enrollments with progress
export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get('studentId');
  if (!studentId) return NextResponse.json({ error: 'studentId is required' }, { status: 400 });

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId, isActive: true },
    include: {
      course: {
        include: {
          lessons: { orderBy: { lessonNumber: 'asc' } },
          teachers: { include: { user: { select: { id: true, name: true } } } },
        },
      },
      attendances: true,
    },
    orderBy: { joinedAt: 'desc' },
  });

  return NextResponse.json(enrollments);
}
