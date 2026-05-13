import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const status   = searchParams.get('status')
  const category = searchParams.get('category')

  let query = supabase
    .from('Course')
    .select('*, teachers:CourseTeacher(role, user:User(id, name, avatar))')
    .order('startDate', { ascending: true })

  if (status)   query = query.eq('status', status)
  if (category) query = query.eq('category', category)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.title || !body.category || body.price === undefined || !body.startDate) {
    return NextResponse.json({ error: 'title, category, price and startDate are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('Course')
    .insert({
      title:       body.title,
      description: body.description ?? null,
      category:    body.category,
      status:      body.status ?? 'UPCOMING',
      price:       body.price,
      startDate:   body.startDate,
      endDate:     body.endDate ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { error } = await supabase.from('Course').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}

export async function PATCH(req: NextRequest) {
  const { courseId, teacherId, role, action } = await req.json()

  if (action === 'remove') {
    const { error } = await supabase
      .from('CourseTeacher')
      .delete()
      .eq('courseId', courseId)
      .eq('userId', teacherId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ removed: true })
  }

  const { data, error } = await supabase
    .from('CourseTeacher')
    .upsert({ courseId, userId: teacherId, role: role ?? 'main' }, { onConflict: 'courseId,userId' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
