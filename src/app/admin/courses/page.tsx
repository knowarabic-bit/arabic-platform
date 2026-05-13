'use client'

import { useEffect, useState } from 'react'
import { Shell, Sidebar, TopBar, PageBody } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, Badge, StatusBadge, Button, Table, Th, Td, EmptyState } from '@/components/ui'

const navItems = [
  { label: 'Overview', href: '/admin', icon: '📊' },
  { label: 'Courses', href: '/admin/courses', icon: '📚' },
  { label: 'Payments', href: '/admin/payments', icon: '💳', badge: 3 },
  { label: 'Refunds', href: '/admin/refunds', icon: '↩️', badge: 2 },
  { label: 'Users', href: '/admin/users', icon: '👥' },
]

type Course = {
  id: string
  title: string
  description?: string
  category: string
  status: string
  price: number
  startDate: string
  endDate?: string
  _count?: { enrollments: number; lessons: number }
  teachers?: { role: string; user: { id: string; name: string } }[]
}

const emptyForm = {
  title: '',
  description: '',
  category: 'ARABIC',
  status: 'UPCOMING',
  price: '',
  startDate: '',
  endDate: '',
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState<string | null>(null)

  async function loadCourses() {
    setLoading(true)
    const res = await fetch('/api/courses')
    const data = await res.json()
    setCourses(data)
    setLoading(false)
  }

  useEffect(() => { loadCourses() }, [])

  function openNew() {
    setForm(emptyForm)
    setEditId(null)
    setError('')
    setShowModal(true)
  }

  function openEdit(c: Course) {
    setForm({
      title: c.title,
      description: c.description ?? '',
      category: c.category,
      status: c.status,
      price: String(c.price),
      startDate: c.startDate ? c.startDate.slice(0, 10) : '',
      endDate: c.endDate ? c.endDate.slice(0, 10) : '',
    })
    setEditId(c.id)
    setError('')
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form.title || !form.category || !form.price || !form.startDate) {
      setError('Title, category, price and start date are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const body = {
        title: form.title,
        description: form.description || undefined,
        category: form.category,
        status: form.status,
        price: parseFloat(form.price),
        startDate: form.startDate,
        endDate: form.endDate || undefined,
      }
      const res = await fetch(
        editId ? `/api/courses/${editId}` : '/api/courses',
        {
          method: editId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      )
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
      setShowModal(false)
      loadCourses()
    } finally {
      setSaving(false)
    }
  }

  async function deleteCourse(id: string) {
    if (!confirm('Delete this course? This cannot be undone.')) return
    await fetch('/api/courses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadCourses()
  }

  const upcoming = courses.filter(c => c.status === 'UPCOMING').length
  const inProgress = courses.filter(c => c.status === 'IN_PROGRESS').length
  const totalStudents = courses.reduce((s, c) => s + (c._count?.enrollments ?? 0), 0)

  return (
    <Shell sidebar={<Sidebar role="admin" userName="Super Admin" userSub="Platform Owner" navItems={navItems} />}>
      <TopBar title="Course Management">
        <Button variant="primary" size="sm" onClick={openNew}>+ New Course</Button>
      </TopBar>

      <PageBody>
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Courses', value: courses.length, color: 'text-blue-600' },
            { label: 'In Progress', value: inProgress, color: 'text-teal-600' },
            { label: 'Upcoming', value: upcoming, color: 'text-amber-600' },
            { label: 'Total Students', value: totalStudents, color: 'text-purple-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Course table */}
        <Card>
          <CardHeader>
            <CardTitle>All courses</CardTitle>
            <Badge variant="gray">{courses.length} total</Badge>
          </CardHeader>
          {loading ? (
            <div className="p-10 text-center text-gray-400 text-sm">Loading…</div>
          ) : courses.length === 0 ? (
            <EmptyState icon="📚" title="No courses yet" sub="Click '+ New Course' to add one." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Title</Th><Th>Category</Th><Th>Status</Th><Th>Price</Th>
                  <Th>Start Date</Th><Th>Students</Th><Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <Td>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{c.title}</p>
                        {c.description && <p className="text-xs text-gray-400 truncate max-w-[200px]">{c.description}</p>}
                      </div>
                    </Td>
                    <Td><Badge variant={c.category === 'QURAN' ? 'purple' : 'blue'}>{c.category}</Badge></Td>
                    <Td><StatusBadge status={c.status.toLowerCase()} /></Td>
                    <Td><span className="font-semibold text-teal-700">${c.price}</span></Td>
                    <Td className="text-xs text-gray-500">{new Date(c.startDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</Td>
                    <Td>{c._count?.enrollments ?? 0}</Td>
                    <Td>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => deleteCourse(c.id)}>Delete</Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </PageBody>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-900">{editId ? 'Edit Course' : 'New Course'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">{error}</p>}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Arabic Foundations Level 1"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                  placeholder="Short description of the course"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  >
                    <option value="ARABIC">Arabic</option>
                    <option value="QURAN">Quran</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Price (USD) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.startDate}
                    onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">End Date (optional)</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.endDate}
                  onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" size="md" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" size="md" disabled={saving}>
                  {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Course'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  )
}
