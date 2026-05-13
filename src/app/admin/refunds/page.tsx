'use client'
import { useState } from 'react'
import { Shell, Sidebar, TopBar, PageBody } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, Badge, StatusBadge, Button, Table, Th, Td } from '@/components/ui'
import { mockRefunds } from '@/data/mock'
import { RefundRequest } from '@/types'

const navItems = [
  { label: 'Overview', href: '/admin', icon: '📊' },
  { label: 'Courses', href: '/admin/courses', icon: '📚' },
  { label: 'Payments', href: '/admin/payments', icon: '💳', badge: 3 },
  { label: 'Refunds', href: '/admin/refunds', icon: '↩️', badge: 2 },
  { label: 'Users', href: '/admin/users', icon: '👥' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
]

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState<RefundRequest[]>(mockRefunds)

  function process(id: string, action: 'approved' | 'rejected') {
    setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: action } : r))
  }

  const open = refunds.filter(r => r.status === 'open')
  const done = refunds.filter(r => r.status !== 'open')

  return (
    <Shell sidebar={<Sidebar role="admin" userName="Super Admin" userSub="Platform Owner" navItems={navItems} />}>
      <TopBar title="Refund Requests">
        <Badge variant="red">{open.length} open</Badge>
      </TopBar>

      <PageBody>
        {/* Policy reminder */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
          <strong>Policy:</strong> Refunds are only eligible after Lecture 1 and before Lecture 2 begins.
          The system auto-expires requests at <code className="bg-blue-100 px-1 rounded">lecture_2_starts_at</code>.
          Only eligible requests appear in this queue.
        </div>

        {/* Open */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Open refund requests</CardTitle>
            <Badge variant="red">{open.length} pending action</Badge>
          </CardHeader>
          <Table>
            <thead>
              <tr><Th>Student</Th><Th>Course</Th><Th>Requested</Th><Th>Type</Th><Th>Amount</Th><Th>Expires</Th><Th>Action</Th></tr>
            </thead>
            <tbody>
              {open.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <Td><span className="font-medium">{r.studentName}</span></Td>
                  <Td className="text-sm text-gray-600">{r.courseTitle}</Td>
                  <Td className="text-xs text-gray-500">{r.requestedAt}</Td>
                  <Td>
                    <Badge variant={r.type === 'cash' ? 'blue' : 'purple'}>
                      {r.type === 'cash' ? '💵 Cash back' : '💳 Credit'}
                    </Badge>
                  </Td>
                  <Td><span className="font-semibold">${r.amount}</span></Td>
                  <Td className="text-xs text-amber-600 font-medium">
                    {new Date(r.expiresAt).toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Td>
                  <Td>
                    <div className="flex gap-1.5">
                      <Button variant="success" size="sm" onClick={() => process(r.id, 'approved')}>✓ Approve</Button>
                      <Button variant="danger" size="sm" onClick={() => process(r.id, 'rejected')}>✗ Reject</Button>
                    </div>
                  </Td>
                </tr>
              ))}
              {open.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No open refund requests. ✓</td></tr>
              )}
            </tbody>
          </Table>
        </Card>

        {/* Processed */}
        {done.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Processed requests</CardTitle></CardHeader>
            <Table>
              <thead>
                <tr><Th>Student</Th><Th>Course</Th><Th>Type</Th><Th>Amount</Th><Th>Status</Th></tr>
              </thead>
              <tbody>
                {done.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <Td>{r.studentName}</Td>
                    <Td className="text-sm text-gray-600">{r.courseTitle}</Td>
                    <Td><Badge variant={r.type === 'cash' ? 'blue' : 'purple'}>{r.type}</Badge></Td>
                    <Td>${r.amount}</Td>
                    <Td><StatusBadge status={r.status} /></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}
      </PageBody>
    </Shell>
  )
}
