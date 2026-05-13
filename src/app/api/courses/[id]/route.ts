import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const course = await prisma.course.update({
    where: { id },
    data: {
      ...(body.title && { title: body.title }),
      description: body.description ?? null,
      ...(body.category && { category: body.category }),
      ...(body.status && { status: body.status }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.startDate && { startDate: new Date(body.startDate) }),
      endDate: body.endDate ? new Date(body.endDate) : null,
    },
  })
  return NextResponse.json(course)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.course.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}
