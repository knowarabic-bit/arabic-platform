import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createZoomMeeting } from '@/lib/zoom';

export async function POST(req: NextRequest) {
  const { lessonId } = (await req.json()) as { lessonId: string };

  if (!lessonId) {
    return NextResponse.json({ error: 'lessonId is required' }, { status: 400 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { course: { select: { title: true } } },
  });

  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  if (lesson.zoomMeetingId)
    return NextResponse.json({ error: 'Meeting already exists for this lesson' }, { status: 409 });

  const meeting = await createZoomMeeting(
    `${lesson.course.title} — Lesson ${lesson.lessonNumber}: ${lesson.title}`,
    new Date(lesson.scheduledAt),
    lesson.duration,
  );

  const updated = await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      zoomMeetingId: meeting.id,
      zoomJoinUrl: meeting.joinUrl,
      zoomStartUrl: meeting.startUrl,
    },
  });

  return NextResponse.json({ lesson: updated, meeting });
}
