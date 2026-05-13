import { NextRequest, NextResponse } from 'next/server';
import { canRequestRefund, createRefundRequest } from '@/lib/refunds';
import { prisma } from '@/lib/prisma';

// GET /api/refunds/check?studentId=&courseId= — eligibility check
// GET /api/refunds?status=PENDING — list (admin)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  if (searchParams.has('studentId') && searchParams.has('courseId')) {
    const result = await canRequestRefund(
      searchParams.get('studentId')!,
      searchParams.get('courseId')!,
    );
    return NextResponse.json(result);
  }

  const status = searchParams.get('status') ?? undefined;
  const refunds = await prisma.refundRequest.findMany({
    where: status ? { status: status as never } : undefined,
    include: {
      student: { select: { id: true, name: true, email: true } },
      enrollment: { include: { course: { select: { id: true, title: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(refunds);
}

// POST /api/refunds — student submits refund request
export async function POST(req: NextRequest) {
  const { studentId, enrollmentId, refundType, reason } = (await req.json()) as {
    studentId: string;
    enrollmentId: string;
    refundType: 'CREDIT' | 'CASH';
    reason?: string;
  };

  if (!studentId || !enrollmentId || !refundType) {
    return NextResponse.json({ error: 'studentId, enrollmentId, and refundType are required' }, { status: 400 });
  }

  try {
    const refund = await createRefundRequest(studentId, enrollmentId, refundType, reason);
    return NextResponse.json(refund, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not create refund';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}

// PATCH /api/refunds — admin approves or rejects
export async function PATCH(req: NextRequest) {
  const { refundId, action, reviewedBy } = (await req.json()) as {
    refundId: string;
    action: 'APPROVE_CREDIT' | 'APPROVE_CASH' | 'REJECT';
    reviewedBy: string;
  };

  const statusMap = {
    APPROVE_CREDIT: 'APPROVED_CREDIT',
    APPROVE_CASH: 'APPROVED_CASH',
    REJECT: 'REJECTED',
  } as const;

  const updated = await prisma.refundRequest.update({
    where: { id: refundId },
    data: {
      status: statusMap[action],
      reviewedAt: new Date(),
      reviewedBy,
    },
  });

  return NextResponse.json(updated);
}
