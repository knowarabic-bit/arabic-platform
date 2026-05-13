'use client'

import { useEffect, useState, useCallback } from 'react'
import { Shell, Sidebar, TopBar, PageBody } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, Badge, StatusBadge, Table, Th, Td, EmptyState } from '@/components/ui'

const navItems = [
  { label: 'Overview',  href: '/admin',          icon: '📊' },
  { label: 'Courses',   href: '/admin/courses',   icon: '📚' },
  { label: 'Payments',  href: '/admin/payments',  icon: '💳', badge: 3 },
  { label: 'Refunds',   href: '/admin/refunds',   icon: '↩️', badge: 2 },
  { label: 'Users',     href: '/admin/users',     icon: '👥' },
]

// ── Types ──────────────────────────────────────────────────────────
type Course = {
  id: string; title: string; description?: string; category: string
  status: string; price: number; startDate: string; endDate?: string
  teachers?: { role: string; user: { id: string; name: string } }[]
}
type Teacher = { id: string; name: string; email: string }
type Lesson  = {
  id: string; courseId: string; title: string; lessonNumber: number
  scheduledAt: string; duration: number; status: string; zoomJoinUrl?: string
}

// ── Helpers ────────────────────────────────────────────────────────
const emptyCourse = { title: '', description: '', category: 'ARABIC', status: 'UPCOMING', price: '', startDate: '', endDate: '' }
const emptyLesson  = { title: '', scheduledAt: '', time: '', duration: '60' }

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 flex-shrink-0">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

// ── Page ───────────────────────────────────────────────────────────
export default function AdminCourses() {
  const [courses,  setCourses]  = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [lessons,  setLessons]  = useState<Lesson[]>([])
  const [loading,  setLoading]  = useState(true)

  // Modal states
  const [modal, setModal] = useState<'course' | 'teacher' | 'lesson' | null>(null)
  const [activeCourse, setActiveCourse] = useState<Course | null>(null)

  // Forms
  const [courseForm, setCourseForm] = useState(emptyCourse)
  const [editId,     setEditId]     = useState<string | null>(null)
  const [teacherSelect, setTeacherSelect] = useState('')
  const [teacherRole,   setTeacherRole]   = useState('main')
  const [lessonForm, setLessonForm] = useState(emptyLesson)

  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  // ── Loaders ──
  const loadCourses = useCallback(async () => {
    setLoading(true)
    const res  = await fetch('/api/courses')
    const data = await res.json()
    setCourses(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  const loadTeachers = useCallback(async () => {
    const res  = await fetch('/api/users')
    const data = await res.json()
    setTeachers((Array.isArray(data) ? data : []).filter((u: Teacher & { role: string }) => u.role === 'TEACHER'))
  }, [])

  const loadLessons = useCallback(async (courseId: string) => {
    const res  = await fetch(`/api/lessons?courseId=${courseId}`)
    const data = await res.json()
    setLessons(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => { loadCourses(); loadTeachers() }, [loadCourses, loadTeachers])

  // ── Open modals ──
  function openNewCourse() {
    setCourseForm(emptyCourse); setEditId(null); setError(''); setModal('course')
  }
  function openEditCourse(c: Course) {
    setCourseForm({
      title: c.title, description: c.description ?? '', category: c.category,
      status: c.status, price: String(c.price),
      startDate: c.startDate?.slice(0, 10) ?? '', endDate: c.endDate?.slice(0, 10) ?? '',
    })
    setEditId(c.id); setError(''); setModal('course')
  }
  function openTeachers(c: Course) { setActiveCourse(c); setTeacherSelect(''); setTeacherRole('main'); setError(''); setModal('teacher') }
  function openLessons(c: Course)  { setActiveCourse(c); setLessonForm(emptyLesson); setError(''); loadLessons(c.id); setModal('lesson') }
  function closeModal() { setModal(null); setActiveCourse(null); setError('') }

  // ── Course submit ──
  async function saveCourse(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!courseForm.title || !courseForm.category || !courseForm.price || !courseForm.startDate) {
      setError('Title, category, price and start date are required.'); return
    }
    setSaving(true); setError('')
    try {
      const body = {
        title:       courseForm.title,
        description: courseForm.description || null,
        category:    courseForm.category,
        status:      courseForm.status,
        price:       parseFloat(courseForm.price),
        startDate:   courseForm.startDate,
        endDate:     courseForm.endDate || null,
      }
      const url    = editId ? `/api/courses/${editId}` : '/api/courses'
      const method = editId ? 'PUT' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data   = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
      closeModal(); loadCourses()
    } finally { setSaving(false) }
  }

  // ── Assign teacher ──
  async function assignTeacher(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!teacherSelect || !activeCourse) { setError('Please select a teacher.'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/courses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: activeCourse.id, teacherId: teacherSelect, role: teacherRole, action: 'assign' }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to assign teacher'); return }
      loadCourses()
      // refresh active course teachers
      const updated = await fetch('/api/courses').then(r => r.json())
      const fresh = (Array.isArray(updated) ? updated : []).find((c: Course) => c.id === activeCourse.id)
      if (fresh) setActiveCourse(fresh)
      setTeacherSelect('')
    } finally { setSaving(false) }
  }

  async function removeTeacher(teacherId: string) {
    if (!activeCourse) return
    await fetch('/api/courses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: activeCourse.id, teacherId, action: 'remove' }),
    })
    loadCourses()
    const updated = await fetch('/api/courses').then(r => r.json())
    const fresh = (Array.isArray(updated) ? updated : []).find((c: Course) => c.id === activeCourse.id)
    if (fresh) setActiveCourse(fresh)
  }

  // ── Add lesson ──
  async function addLesson(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!lessonForm.title || !lessonForm.scheduledAt || !lessonForm.time || !lessonForm.duration) {
      setError('Title, date, time and duration are required.'); return
    }
    if (!activeCourse) return
    setSaving(true); setError('')
    try {
      const scheduledAt = `${lessonForm.scheduledAt}T${lessonForm.time}:00`
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: activeCourse.id, title: lessonForm.title, scheduledAt, duration: lessonForm.duration }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to add lesson'); return }
      setLessonForm(emptyLesson)
      loadLessons(activeCourse.id)
    } finally { setSaving(false) }
  }

  async function deleteLesson(id: string) {
    if (!confirm('Delete this lesson?')) return
    await fetch('/api/lessons', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (activeCourse) loadLessons(activeCourse.id)
  }

  async function deleteCourse(id: string) {
    if (!confirm('Delete this course? All lessons and enrollments will also be removed.')) return
    await fetch(`/api/courses/${id}`, { method: 'DELETE' })
    loadCourses()
  }

  const upcoming   = courses.filter(c => c.status === 'UPCOMING').length
  const inProgress = courses.filter(c => c.status === 'IN_PROGRESS').length

  // Teachers not yet assigned to activeCourse
  const assignedIds = new Set((activeCourse?.teachers ?? []).map(t => t.user.id))
  const availableTeachers = teachers.filter(t => !assignedIds.has(t.id))

  return (
    <Shell sidebar={<Sidebar role="admin" userName="Super Admin" userSub="Platform Owner" navItems={navItems} />}>
      <TopBar title="Course Management">
        <button type="button" onClick={openNewCourse}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
          + New Course
        </button>
      </TopBar>

      <PageBody>
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Courses', value: courses.length,  color: 'text-blue-600'   },
            { label: 'In Progress',   value: inProgress,      color: 'text-teal-600'   },
            { label: 'Upcoming',      value: upcoming,        color: 'text-amber-600'  },
            { label: 'Teachers',      value: teachers.length, color: 'text-purple-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All courses</CardTitle>
            <Badge variant="gray">{courses.length} total</Badge>
          </CardHeader>
          {loading ? (
            <div className="p-10 text-center text-gray-400 text-sm animate-pulse">Loading…</div>
          ) : courses.length === 0 ? (
            <EmptyState icon="📚" title="No courses yet" sub="Click '+ New Course' to create one." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Title</Th><Th>Category</Th><Th>Status</Th><Th>Price</Th>
                  <Th>Start Date</Th><Th>Teachers</Th><Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <Td>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{c.title}</p>
                        {c.description && <p className="text-xs text-gray-400 truncate max-w-[180px]">{c.description}</p>}
                      </div>
                    </Td>
                    <Td><Badge variant={c.category === 'QURAN' ? 'purple' : 'blue'}>{c.category}</Badge></Td>
                    <Td><StatusBadge status={c.status.toLowerCase().replace('_', ' ')} /></Td>
                    <Td><span className="font-semibold text-teal-700">${c.price}</span></Td>
                    <Td className="text-xs text-gray-500">
                      {new Date(c.startDate).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {(c.teachers ?? []).length === 0
                          ? <span className="text-xs text-gray-400">None</span>
                          : (c.teachers ?? []).map(t => (
                            <Badge key={t.user.id} variant={t.role === 'main' ? 'blue' : 'purple'}>
                              {t.user.name.split(' ')[0]}
                            </Badge>
                          ))
                        }
                      </div>
                    </Td>
                    <Td>
                      <div className="flex gap-1 flex-wrap">
                        <button type="button" onClick={() => openEditCourse(c)}
                          className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">Edit</button>
                        <button type="button" onClick={() => openTeachers(c)}
                          className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 hover:bg-teal-100">👤 Teachers</button>
                        <button type="button" onClick={() => openLessons(c)}
                          className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">📅 Lessons</button>
                        <button type="button" onClick={() => deleteCourse(c.id)}
                          className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100">Delete</button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </PageBody>

      {/* ── Add / Edit Course Modal ── */}
      {modal === 'course' && (
        <Modal title={editId ? 'Edit Course' : 'New Course'} onClose={closeModal}>
          <form onSubmit={saveCourse} className="px-6 py-5 space-y-4">
            {error && <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">{error}</p>}

            <Field label="Title *">
              <input className={inputCls} placeholder="e.g. Arabic Foundations Level 1"
                value={courseForm.title} onChange={e => setCourseForm(p => ({ ...p, title: e.target.value }))} />
            </Field>

            <Field label="Description">
              <textarea className={inputCls + ' resize-none'} rows={2} placeholder="Short description…"
                value={courseForm.description} onChange={e => setCourseForm(p => ({ ...p, description: e.target.value }))} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Category *">
                <select className={inputCls} value={courseForm.category}
                  onChange={e => setCourseForm(p => ({ ...p, category: e.target.value }))}>
                  <option value="ARABIC">Arabic</option>
                  <option value="QURAN">Quran</option>
                </select>
              </Field>
              <Field label="Status *">
                <select className={inputCls} value={courseForm.status}
                  onChange={e => setCourseForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Price (USD) *">
                <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00"
                  value={courseForm.price} onChange={e => setCourseForm(p => ({ ...p, price: e.target.value }))} />
              </Field>
              <Field label="Start Date *">
                <input type="date" className={inputCls}
                  value={courseForm.startDate} onChange={e => setCourseForm(p => ({ ...p, startDate: e.target.value }))} />
              </Field>
            </div>

            <Field label="End Date (optional)">
              <input type="date" className={inputCls}
                value={courseForm.endDate} onChange={e => setCourseForm(p => ({ ...p, endDate: e.target.value }))} />
            </Field>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button type="button" onClick={closeModal}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Cancel</button>
              <button type="submit" disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Course'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Assign Teachers Modal ── */}
      {modal === 'teacher' && activeCourse && (
        <Modal title={`Teachers — ${activeCourse.title}`} onClose={closeModal}>
          <div className="px-6 py-5 space-y-5">
            {/* Current teachers */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Assigned teachers</p>
              {(activeCourse.teachers ?? []).length === 0
                ? <p className="text-sm text-gray-400">No teachers assigned yet.</p>
                : <div className="space-y-2">
                    {(activeCourse.teachers ?? []).map(t => (
                      <div key={t.user.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold">
                            {t.user.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{t.user.name}</span>
                          <Badge variant={t.role === 'main' ? 'blue' : 'purple'}>{t.role}</Badge>
                        </div>
                        <button type="button" onClick={() => removeTeacher(t.user.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                      </div>
                    ))}
                  </div>
              }
            </div>

            {/* Assign new teacher */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Assign new teacher</p>
              {error && <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 mb-3">{error}</p>}
              {availableTeachers.length === 0
                ? <p className="text-sm text-gray-400">All teachers are already assigned, or no teachers exist. Add teachers in the Users page first.</p>
                : (
                  <form onSubmit={assignTeacher} className="space-y-3">
                    <Field label="Select teacher *">
                      <select className={inputCls} value={teacherSelect}
                        onChange={e => setTeacherSelect(e.target.value)}>
                        <option value="">Choose a teacher…</option>
                        {availableTeachers.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Role">
                      <select className={inputCls} value={teacherRole} onChange={e => setTeacherRole(e.target.value)}>
                        <option value="main">Main instructor</option>
                        <option value="substitute">Substitute</option>
                      </select>
                    </Field>
                    <div className="flex justify-end">
                      <button type="submit" disabled={saving || !teacherSelect}
                        className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">
                        {saving ? 'Assigning…' : 'Assign Teacher'}
                      </button>
                    </div>
                  </form>
                )
              }
            </div>
          </div>
        </Modal>
      )}

      {/* ── Add Lesson Modal ── */}
      {modal === 'lesson' && activeCourse && (
        <Modal title={`Lessons — ${activeCourse.title}`} onClose={closeModal}>
          <div className="px-6 py-5 space-y-5">
            {/* Existing lessons */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Lessons ({lessons.length})
              </p>
              {lessons.length === 0
                ? <p className="text-sm text-gray-400">No lessons yet. Add the first one below.</p>
                : <div className="space-y-2">
                    {lessons.map(l => (
                      <div key={l.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            <span className="text-gray-400 mr-2">#{l.lessonNumber}</span>{l.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(l.scheduledAt).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' })}
                            {' at '}
                            {new Date(l.scheduledAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                            {' · '}{l.duration} min
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={l.status.toLowerCase()} />
                          <button type="button" onClick={() => deleteLesson(l.id)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium">×</button>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>

            {/* Add new lesson */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Add new lesson</p>
              {error && <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 mb-3">{error}</p>}
              <form onSubmit={addLesson} className="space-y-3">
                <Field label="Lesson title *">
                  <input className={inputCls} placeholder="e.g. Introduction to Arabic Letters"
                    value={lessonForm.title} onChange={e => setLessonForm(p => ({ ...p, title: e.target.value }))} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date *">
                    <input type="date" className={inputCls}
                      value={lessonForm.scheduledAt} onChange={e => setLessonForm(p => ({ ...p, scheduledAt: e.target.value }))} />
                  </Field>
                  <Field label="Time *">
                    <input type="time" className={inputCls}
                      value={lessonForm.time} onChange={e => setLessonForm(p => ({ ...p, time: e.target.value }))} />
                  </Field>
                </div>
                <Field label="Duration (minutes) *">
                  <select className={inputCls} value={lessonForm.duration}
                    onChange={e => setLessonForm(p => ({ ...p, duration: e.target.value }))}>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                    <option value="75">75 min</option>
                    <option value="90">90 min</option>
                    <option value="120">120 min</option>
                  </select>
                </Field>
                <div className="flex justify-end">
                  <button type="submit" disabled={saving}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    {saving ? 'Adding…' : '+ Add Lesson'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </Shell>
  )
}
