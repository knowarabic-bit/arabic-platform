'use client'

import { useEffect, useState } from 'react'
import { Shell, Sidebar, TopBar, PageBody } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, Badge, Button, Table, Th, Td, EmptyState } from '@/components/ui'

const navItems = [
  { label: 'Overview', href: '/admin', icon: '📊' },
  { label: 'Courses', href: '/admin/courses', icon: '📚' },
  { label: 'Payments', href: '/admin/payments', icon: '💳', badge: 3 },
  { label: 'Refunds', href: '/admin/refunds', icon: '↩️', badge: 2 },
  { label: 'Users', href: '/admin/users', icon: '👥' },
]

type User = {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'TEACHER' | 'ADMIN'
  avatar?: string
  createdAt: string
}

const roleVariant: Record<string, 'blue' | 'teal' | 'purple'> = {
  STUDENT: 'blue',
  TEACHER: 'teal',
  ADMIN: 'purple',
}

const emptyForm = { name: '', email: '', password: '', role: 'STUDENT' }

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')

  async function loadUsers() {
    setLoading(true)
    const res = await fetch('/api/users')
    const data = await res.json()
    setUsers(data)
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  function openNew() {
    setForm(emptyForm)
    setError('')
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.role) {
      setError('All fields are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
      setShowModal(false)
      setForm(emptyForm)
      loadUsers()
    } finally {
      setSaving(false)
    }
  }

  async function deleteUser(id: string) {
    if (!confirm('Delete this user? All their enrollments and data will be removed.')) return
    await fetch('/api/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadUsers()
  }

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  const students = users.filter(u => u.role === 'STUDENT').length
  const teachers = users.filter(u => u.role === 'TEACHER').length
  const admins   = users.filter(u => u.role === 'ADMIN').length

  return (
    <Shell sidebar={<Sidebar role="admin" userName="Super Admin" userSub="Platform Owner" navItems={navItems} />}>
      <TopBar title="User Management">
        <Button variant="primary" size="sm" onClick={openNew}>+ New User</Button>
      </TopBar>

      <PageBody>
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Users', value: users.length, color: 'text-gray-800' },
            { label: 'Students', value: students, color: 'text-blue-600' },
            { label: 'Teachers', value: teachers, color: 'text-teal-600' },
            { label: 'Admins', value: admins, color: 'text-purple-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All users</CardTitle>
            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <input
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
                placeholder="Search name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {['ALL', 'STUDENT', 'TEACHER', 'ADMIN'].map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    roleFilter === r ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {r === 'ALL' ? 'All' : r.charAt(0) + r.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </CardHeader>

          {loading ? (
            <div className="p-10 text-center text-gray-400 text-sm">Loading…</div>
          ) : filtered.length === 0 ? (
            <EmptyState icon="👥" title="No users found" sub={users.length === 0 ? "Click '+ New User' to add one." : "No users match your search."} />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Joined</Th><Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{u.name}</span>
                      </div>
                    </Td>
                    <Td className="text-sm text-gray-600">{u.email}</Td>
                    <Td><Badge variant={roleVariant[u.role] ?? 'gray'}>{u.role.charAt(0) + u.role.slice(1).toLowerCase()}</Badge></Td>
                    <Td className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</Td>
                    <Td>
                      <Button variant="danger" size="sm" onClick={() => deleteUser(u.id)}>Delete</Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </PageBody>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-semibold text-gray-900">New User</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">{error}</p>}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Ahmed Al-Rashid"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Role *</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" size="md" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" size="md" disabled={saving}>
                  {saving ? 'Creating…' : 'Create User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  )
}
