'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shell, Sidebar, TopBar, PageBody } from '@/components/layout/Sidebar'
import {
  Card, CardHeader, CardTitle, CardBody,
  StatCard, Badge, StatusBadge, Button, Table, Th, Td, EmptyState,
} from '@/components/ui'
import { mockPayments, mockRefunds, mockCourses, mockUsers, mockSessions } from '@/data/mock'

const navItems = [
  { label: 'Overview', href: '/admin', icon: '📊' },
  { label: 'Courses', href: '/admin/courses', icon: '📚' },
  { label: 'Payments', href: '/admin/payments', icon: '💳', badge: 3 },
  { label: 'Refunds', href: '/admin/refunds', icon: '↩️', badge: 2 },
  { label: 'Users', href: '/admin/users', icon: '👥' },
]

const teachers = mockUsers.filter(u => u.role === 'teacher')

// Smart Refund Gate check (mirrors backend logic using mock data)
function isRefundGateOpen(refund: typeof mockRefunds[0]): boolean {
  return new Date(refund.expiresAt) > new Date()
}

// System event log (static for demo — in production pulled from DB audit table)
const systemLog = [
  { time: '19:22', event: 'Zoom confirmed', detail: 'Arabic Foundations S6 · Dr. Fatima · 80 min', level: 'ok' },
  { time: '18:05', event: 'Enrollment', detail: 'Late-joiner rule triggered for Sara Mohammed (Tajweed)', level: 'info' },
  { time: '17:44', event: 'Refund submitted', detail: 'Ahmed Al-Rashid · Arabic Foundations · $60 cash', level: 'warn' },
  { time: '16:30', event: 'Payment approved', detail: 'Ahmad Karimi · $45 · Arabic Intermediate', level: 'ok' },
  { time: '15:00', event: 'Course status updated', detail: 'Quranic Tafseer → UPCOMING', level: 'info' },
]

export default function AdminDashboard() {
  const pending = mockPayments.filter(p => p.status === 'pending')
  const paidTotal = mockPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const openRefunds = mockRefunds.filter(r => r.status === 'open')
  const disputed = mockPayments.filter(p => p.status === 'disputed')

  // Refund approval state
  const [refundStatus, setRefundStatus] = useState<Record<string, 'approved' | 'rejected' | null>>({})
  function actOnRefund(id: string, action: 'approved' | 'rejected') {
    setRefundStatus(p => ({ ...p, [id]: action }))
  }

  // Teacher assignment state
  const [assignments, setAssignments] = useState<Record<string, { teacherId: string; role: string }[]>>(
    Object.fromEntries(mockCourses.map(c => [c.id, c.instructors.map(i => ({ teacherId: i.userId, role: i.role }))]))
  )
  const [assignTeacher, setAssignTeacher] = useState<Record<string, string>>({})
  const [assignRole, setAssignRole] = useState<Record<string, string>>({})

  function addInstructor(courseId: string) {
    const tid = assignTeacher[courseId]
    const role = assignRole[courseId] ?? 'substitute'
    if (!tid) return
    setAssignments(prev => {
      const existing = prev[courseId] ?? []
      if (existing.find(a => a.teacherId === tid)) return prev
      return { ...prev, [courseId]: [...existing, { teacherId: tid, role }] }
    })
    setAssignTeacher(p => ({ ...p, [courseId]: '' }))
  }

  function removeInstructor(courseId: string, teacherId: string) {
    setAssignments(prev => ({
      ...prev,
      [courseId]: (prev[courseId] ?? []).filter(a => a.teacherId !== teacherId),
    }))
  }

  return (
    <Shell sidebar={<Sidebar role="admin" userName="Super Admin" userSub="Platform Owner" navItems={navItems} />}>
      <TopBar title="Admin — Operational Hub">
        <Badge variant="purple">Spring Term 2025</Badge>
      </TopBar>

      <PageBody>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Pending Payments" value={pending.length} sub="Awaiting approval" accent="bg-amber-500" />
          <StatCard label="Paid This Month" value={`$${paidTotal}`} sub="Confirmed" accent="bg-teal-500" />
          <StatCard label="Open Refunds" value={openRefunds.length} sub="Require action" accent="bg-red-500" />
          <StatCard label="Disputed" value={disputed.length} sub="Need review" accent="bg-purple-500" />
        </div>

        {/* System Status Log — for IT Director */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>⚙️ System event log</CardTitle>
            <Badge variant="green">All systems operational</Badge>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-gray-100">
              {systemLog.map((entry, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3">
                  <span className="font-mono text-xs text-gray-400 w-12 flex-shrink-0">{entry.time}</span>
                  <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${entry.level === 'ok' ? 'bg-teal-400' : entry.level === 'warn' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                  <span className="text-xs font-semibold text-gray-700 w-36 flex-shrink-0">{entry.event}</span>
                  <span className="text-xs text-gray-500 truncate">{entry.detail}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Queue */}
          <Card>
            <CardHeader>
              <CardTitle>Payment queue</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="amber">{pending.length} pending</Badge>
                <Link href="/admin/payments">
                  <Button variant="primary" size="sm">View all →</Button>
                </Link>
              </div>
            </CardHeader>
            <Table>
              <thead>
                <tr><Th>Teacher</Th><Th>Course</Th><Th>Role</Th><Th>Amount</Th><Th>Action</Th></tr>
              </thead>
              <tbody>
                {pending.slice(0, 4).map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <Td><span className="font-medium text-sm">{p.teacherName}</span></Td>
                    <Td className="text-xs text-gray-500 max-w-[120px] truncate">{p.courseTitle}</Td>
                    <Td><Badge variant={p.role === 'main' ? 'blue' : 'purple'}>{p.role}</Badge></Td>
                    <Td><span className="font-semibold text-teal-700">${p.amount}</span></Td>
                    <Td><Button variant="success" size="sm">✓ Approve</Button></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>

          {/* Smart Refund Queue */}
          <Card>
            <CardHeader>
              <CardTitle>Refund queue</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="red">{openRefunds.filter(r => !refundStatus[r.id]).length} open</Badge>
                <Link href="/admin/refunds">
                  <Button variant="secondary" size="sm">View all →</Button>
                </Link>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {openRefunds.length === 0
                ? <EmptyState icon="✅" title="No open refunds" />
                : <div className="divide-y divide-gray-100">
                    {openRefunds.map(r => {
                      const action = refundStatus[r.id]
                      const gateOpen = isRefundGateOpen(r)
                      return (
                        <div key={r.id} className="px-5 py-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-sm text-gray-900">{r.studentName}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[180px]">{r.courseTitle}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={r.type === 'cash' ? 'blue' : 'purple'}>{r.type}</Badge>
                                <span className="text-xs font-semibold">${r.amount}</span>
                                {!gateOpen && <Badge variant="red">Gate closed</Badge>}
                                {gateOpen && <Badge variant="green">Gate open</Badge>}
                              </div>
                            </div>
                            {action
                              ? <Badge variant={action === 'approved' ? 'green' : 'red'}>
                                  {action === 'approved' ? '✓ Approved' : '✗ Rejected'}
                                </Badge>
                              : <div className="flex gap-1 flex-shrink-0">
                                  <Button
                                    variant="success"
                                    size="sm"
                                    disabled={!gateOpen}
                                    onClick={() => actOnRefund(r.id, 'approved')}
                                  >
                                    ✓
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => actOnRefund(r.id, 'rejected')}
                                  >
                                    ✗
                                  </Button>
                                </div>
                            }
                          </div>
                          {!gateOpen && !action && (
                            <p className="text-xs text-red-500 mt-1">
                              Lesson 2 has already started — system rules block approval.
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
              }
            </CardBody>
          </Card>

          {/* Multi-Instructor Assignment */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Course instructor assignment</CardTitle>
              <Badge variant="blue">Multi-instructor supported</Badge>
            </CardHeader>
            <div className="divide-y divide-gray-100">
              {mockCourses.map(course => {
                const courseAssignments = assignments[course.id] ?? []
                return (
                  <div key={course.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-gray-900 text-sm">{course.title}</p>
                          <StatusBadge status={course.status} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {courseAssignments.map(a => {
                            const teacher = teachers.find(t => t.id === a.teacherId)
                            if (!teacher) return null
                            return (
                              <div key={a.teacherId} className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
                                <span className="text-xs font-medium text-gray-700">{teacher.name.split(' ')[0]}</span>
                                <Badge variant={a.role === 'main' ? 'blue' : 'purple'}>{a.role}</Badge>
                                <button
                                  onClick={() => removeInstructor(course.id, a.teacherId)}
                                  className="ml-1 text-gray-400 hover:text-red-500 text-xs leading-none"
                                >
                                  ×
                                </button>
                              </div>
                            )
                          })}
                          {courseAssignments.length === 0 && (
                            <span className="text-xs text-gray-400">No instructors assigned</span>
                          )}
                        </div>
                      </div>
                      {/* Assign new teacher */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <select
                          className="text-xs border border-gray-300 rounded-md px-2 py-1.5 bg-white"
                          value={assignTeacher[course.id] ?? ''}
                          onChange={e => setAssignTeacher(p => ({ ...p, [course.id]: e.target.value }))}
                        >
                          <option value="">Add teacher…</option>
                          {teachers
                            .filter(t => !courseAssignments.find(a => a.teacherId === t.id))
                            .map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                          }
                        </select>
                        <select
                          className="text-xs border border-gray-300 rounded-md px-2 py-1.5 bg-white"
                          value={assignRole[course.id] ?? 'substitute'}
                          onChange={e => setAssignRole(p => ({ ...p, [course.id]: e.target.value }))}
                        >
                          <option value="main">Main</option>
                          <option value="substitute">Substitute</option>
                        </select>
                        <Button variant="primary" size="sm" onClick={() => addInstructor(course.id)}>
                          + Assign
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Session Status Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Session status overview</CardTitle>
              <Link href="/admin/courses">
                <Button variant="ghost" size="sm">View all sessions →</Button>
              </Link>
            </CardHeader>
            <Table>
              <thead>
                <tr>
                  <Th>Course</Th><Th>Date</Th><Th>Duration</Th><Th>Status</Th><Th>Zoom</Th><Th>Recording</Th>
                </tr>
              </thead>
              <tbody>
                {mockSessions.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <Td><span className="font-medium">{s.courseTitle}</span></Td>
                    <Td className="text-xs text-gray-500">
                      {new Date(s.startsAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      {' '}
                      {new Date(s.startsAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </Td>
                    <Td>{s.durationMin} min</Td>
                    <Td><StatusBadge status={s.status} /></Td>
                    <Td>
                      {s.zoomLink
                        ? <a href={s.zoomLink} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Link ↗</a>
                        : <span className="text-xs text-gray-400">—</span>
                      }
                    </Td>
                    <Td>
                      {s.recordingUrl
                        ? <Badge variant="green">Available</Badge>
                        : s.status === 'completed'
                        ? <Badge variant="amber">Processing</Badge>
                        : <Badge variant="gray">—</Badge>
                      }
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      </PageBody>
    </Shell>
  )
}
