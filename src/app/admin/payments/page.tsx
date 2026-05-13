'use client'
import { useState } from 'react'
import { Shell, Sidebar, TopBar, PageBody } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, Badge, StatusBadge, Button, Table, Th, Td } from '@/components/ui'
import { mockPayments } from '@/data/mock'
import { TeacherPayment } from '@/types'

const navItems = [
  { label: 'Overview', href: '/admin', icon: '📊' },
  { label: 'Courses', href: '/admin/courses', icon: '📚' },
  { label: 'Payments', href: '/admin/payments', icon: '💳', badge: 3 },
  { label: 'Refunds', href: '/admin/refunds', icon: '↩️', badge: 2 },
  { label: 'Users', href: '/admin/users', icon: '👥' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
]

const statusFilters = ['all', 'pending', 'approved', 'paid', 'disputed']

export default function AdminPayments() {
  const [payments, setPayments] = useState<TeacherPayment[]>(mockPayments)
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter)
  const pending = payments.filter(p => p.status === 'pending')

  function approve(id: string) {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' as const } : p))
  }
  function approveAll() {
    setPayments(prev => prev.map(p => p.status === 'pending' ? { ...p, status: 'approved' as const } : p))
  }

  return (
    <Shell sidebar={<Sidebar role="admin" userName="Super Admin" userSub="Platform Owner" navItems={navItems} />}>
      <TopBar title="Payment Management">
        <Button variant="secondary" size="sm">Export CSV</Button>
        {pending.length > 0 && (
          <Button variant="success" size="sm" onClick={approveAll}>
            ✓ Approve all ({pending.length})
          </Button>
        )}
      </TopBar>

      <PageBody>
        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {['pending','approved','paid','disputed'].map(s => {
            const count = payments.filter(p => p.status === s).length
            const total = payments.filter(p => p.status === s).reduce((acc, p) => acc + p.amount, 0)
            const variantMap: Record<string, string> = { pending:'amber', approved:'green', paid:'teal', disputed:'red' }
            return (
              <div key={s} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex justify-between items-start">
                  <StatusBadge status={s} />
                  <span className="text-xl font-bold text-gray-900">{count}</span>
                </div>
                <p className="text-lg font-semibold text-gray-800 mt-2">${total}</p>
                <p className="text-xs text-gray-400">total amount</p>
              </div>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All teacher payments</CardTitle>
            {/* Filter tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {statusFilters.map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${filter === s ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                  {s}
                </button>
              ))}
            </div>
          </CardHeader>

          <Table>
            <thead>
              <tr>
                <Th>Teacher</Th><Th>Course</Th><Th>Date</Th><Th>Role</Th>
                <Th>Rate</Th><Th>Amount</Th><Th>Zoom confirmed</Th><Th>Status</Th><Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <Td><span className="font-medium text-sm">{p.teacherName}</span></Td>
                  <Td className="text-xs text-gray-600 max-w-[140px]">{p.courseTitle}</Td>
                  <Td className="text-xs text-gray-500">{p.sessionDate}</Td>
                  <Td><Badge variant={p.role === 'main' ? 'blue' : 'purple'}>{p.role}</Badge></Td>
                  <Td className="text-xs text-gray-500">${p.amount}/session</Td>
                  <Td><span className="font-semibold text-teal-700">${p.amount}</span></Td>
                  <Td className="text-xs text-gray-400">
                    {p.zoomConfirmedAt
                      ? new Date(p.zoomConfirmedAt).toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </Td>
                  <Td><StatusBadge status={p.status} /></Td>
                  <Td>
                    {p.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button variant="success" size="sm" onClick={() => approve(p.id)}>✓ Approve</Button>
                      </div>
                    )}
                    {p.status === 'disputed' && (
                      <Button variant="danger" size="sm">Review</Button>
                    )}
                    {p.status === 'approved' && (
                      <Button variant="secondary" size="sm">Mark paid</Button>
                    )}
                    {p.status === 'paid' && <span className="text-xs text-gray-400">—</span>}
                  </Td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-gray-400 text-sm">No payments for this filter.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </PageBody>
    </Shell>
  )
}
