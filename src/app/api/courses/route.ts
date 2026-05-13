import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/courses?status=IN_PROGRESS&category=ARABIC
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const status = searchParams.get('status') ?? undefined
  const category = searchParams.get('category') ?? undefined

  const courses = await prisma.course.findMany({
    where: {
      ...(status && { status: status as never }),
      ...(category && { category: category as never }),
    },
    include: {
      teachers: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      _count: { select: { enrollments: true, lessons: true } },
    },
    orderBy: { startDate: 'asc' },
  })

  return NextResponse.json(courses)
}

// POST /api/courses — create
export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.title || !body.category || body.price === undefined || !body.startDate) {
    return NextResponse.json({ error: 'title, category, price and startDate are required' }, { status: 400 })
  }

  const course = await prisma.course.create({
    data: {
      title: body.title,
      description: body.description ?? null,
      category: body.category,
      status: body.status ?? 'UPCOMING',
      price: body.price,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
    },
  })
  return NextResponse.json(course, { status: 201 })
}

// PUT /api/courses — update existing course
export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const course = await prisma.course.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      description: data.description ?? null,
      ...(data.category && { category: data.category }),
      ...(data.status && { status: data.status }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      endDate: data.endDate ? new Date(data.endDate) : null,
    },
  })
  return NextResponse.json(course)
}

// DELETE /api/courses
export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  await prisma.course.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}

// PATCH /api/courses — assign/remove teacher (multi-instructor)
export async function PATCH(req: NextRequest) {
  const { courseId, teacherId, role, action } = (await req.json()) as {
    courseId: string
    teacherId: string
    role?: string
    action: 'assign' | 'remove'
  }

  if (action === 'remove') {
    await prisma.courseTeacher.deleteMany({ where: { courseId, userId: teacherId } })
    return NextResponse.json({ removed: true })
  }

  const ct = await prisma.courseTeacher.upsert({
    where: { courseId_userId: { courseId, userId: teacherId } },
    create: { courseId, userId: teacherId, role: role ?? 'main' },
    update: { role: role ?? 'main' },
  })

  return NextResponse.json(ct)
}
