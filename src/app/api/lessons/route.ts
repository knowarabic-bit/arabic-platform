import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/lessons?courseId=xxx
export async function GET(req: NextRequest) {
  const courseId = req.nextUrl.searchParams.get('courseId')
  if (!courseId) return NextResponse.json({ error: 'courseId is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('Lesson')
    .select('*')
    .eq('courseId', courseId)
    .order('lessonNumber', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/lessons — create a lesson
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { courseId, title, lessonNumber, scheduledAt, duration } = body

  if (!courseId || !title || !scheduledAt || !duration) {
    return NextResponse.json(
      { error: 'courseId, title, scheduledAt and duration are required' },
      { status: 400 }
    )
  }

  // Auto-number if not provided
  let number = lessonNumber
  if (!number) {
    const { data: existing } = await supabase
      .from('Lesson')
      .select('lessonNumber')
      .eq('courseId', courseId)
      .order('lessonNumber', { ascending: false })
      .limit(1)
    number = existing && existing.length > 0 ? existing[0].lessonNumber + 1 : 1
  }

  const { data, error } = await supabase
    .from('Lesson')
    .insert({
      courseId,
      title,
      lessonNumber: number,
      scheduledAt,
      duration: Number(duration),
      status: 'SCHEDULED',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// DELETE /api/lessons
export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  const { error } = await supabase.from('Lesson').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
