'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shell, Sidebar, TopBar, PageBody } from '@/components/layout/Sidebar'
import {
  Card, CardHeader, CardTitle, CardBody,
  StatCard, Badge, StatusBadge, Button, Table, Th, Td, EmptyState,
} from '@/components/ui'
import { mockCourses, mockSessions, mockEnrollments, mockRecordings, mockRefunds } from '@/data/mock'

const navItems = [
  { label: 'Dashboard', href: '/student', icon: '🏠' },
  { label: 'Recordings', href: '/student/recordings', icon: '🎬' },
  { label: 'Courses', href: '/courses', icon: '📚' },
]

// Smart Refund Gate: eligible if Lesson 1 attended AND Lesson 2 hasn't started
function isRefundEligible(refund: typeof mockRefunds[0]): boolean {
  if (refund.status !== 'open') return false
  return new Date(refund.expiresAt) > new Date()
}

function timeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  return h > 0 ? `${h}h ${m}m remaining` : `${m}m remaining`
}

// Join Live: allow entry 10 min before and during the session
function joinableWindow(startsAt: string, durationMin: number) {
  const start = new Date(startsAt).getTime()
  const end = start + durationMin * 60_000
  const now = Date.now()
  return now >= start - 10 * 60_000 && now <= end
}

export default function StudentDashboard() {
  const enrolledIds = mockEnrollments.map(e => e.courseId)
  const openRefunds = mockRefunds.filter(r => r.status === 'open' && r.studentId === 'u1')

  const mySessions = mockSessions.filter(s => enrolledIds.includes(s.courseId))
  const liveSessions = mySessions.filter(s => s.status === 'live')
  const upcoming = mySessions
    .filter(s => s.status === 'scheduled')
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 4)

  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set())
  const markWatched = (id: string) => setWatchedIds(prev => new Set([...prev, id]))

  // Refund state
  const [refundChoice, setRefundChoice] = useState<Record<string, 'cash' | 'credit' | null>>({})
  const [submitted, setSubmitted] = useState<Set<string>>(new Set())

  function submitRefund(rfId: string) {
    setSubmitted(prev => new Set([...prev, rfId]))
  }

  return (
    <Shell sidebar={<Sidebar role="student" userName="Ahmed Al-Rashid" userSub="Student" navItems={navItems} />}>
      <TopBar title="My Dashboard">
        <span className="text-sm text-gray-500">Spring Term 2025</span>
      </TopBar>

      <PageBody>
        {/* Smart Refund Gate banners */}
        {openRefunds.map(rf => {
          const eligible = isRefundEligible(rf)
          if (!eligible || submitted.has(rf.id)) return null
          return (
            <div key={rf.id} className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-amber-800 text-sm">
                    ⏳ Refund window open — {rf.courseTitle}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Amount: <strong>${rf.amount}</strong> · {timeUntil(rf.expiresAt)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Eligible: attended Lesson 1, Lesson 2 has not started yet.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    className="text-xs border border-gray-300 rounded-md px-2 py-1.5 bg-white"
                    value={refundChoice[rf.id] ?? ''}
                    onChange={e => setRefundChoice(p => ({ ...p, [rf.id]: e.target.value as 'cash' | 'credit' }))}
                  >
                    <option value="">Select type…</option>
                    <option value="credit">Platform credit</option>
                    <option value="cash">Cash refund</option>
                  </select>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!refundChoice[rf.id]}
                    onClick={() => submitRefund(rf.id)}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          )
        })}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Enrolled Courses" value={mockEnrollments.length} sub="Active" accent="bg-blue-500" />
          <StatCard label="Live Now" value={liveSessions.length} sub="Join from here" accent="bg-teal-500" />
          <StatCard label="Recordings" value={mockRecordings.length} sub="All available" accent="bg-purple-500" />
          <StatCard label="Upcoming" value={upcoming.length} sub="This week" accent="bg-amber-500" />
        </div>

        {/* 🔴 Live Now */}
        {liveSessions.length > 0 && (
          <div className="mb-6 space-y-3">
            {liveSessions.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-teal-300 bg-teal-50 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-teal-500" />
                  <div>
                    <p className="font-semibold text-gray-900">{s.courseTitle}</p>
                    <p className="text-xs text-gray-500">
                      Started {new Date(s.startsAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                      {' · '}{s.durationMin} min session
                    </p>
                  </div>
                </div>
                <a href={s.zoomLink} target="_blank" rel="noreferrer">
                  <Button variant="success" size="md">🎥 Join Live</Button>
                </a>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming sessions</CardTitle>
              <Badge variant="blue">{upcoming.length} scheduled</Badge>
            </CardHeader>
            <CardBody className="p-0">
              {upcoming.length === 0
                ? <EmptyState icon="📅" title="No upcoming sessions" sub="Check back later." />
                : upcoming.map((s, i) => {
                    const canJoin = joinableWindow(s.startsAt, s.durationMin)
                    return (
                      <div key={s.id} className={`flex items-center gap-3 px-5 py-4 ${i < upcoming.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <div className={`w-1.5 h-12 rounded-full flex-shrink-0 ${canJoin ? 'bg-teal-400' : 'bg-blue-200'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{s.courseTitle}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(s.startsAt).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                            {' · '}
                            {new Date(s.startsAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                            {' · '}{s.durationMin} min
                          </p>
                        </div>
                        {canJoin
                          ? <a href={s.zoomLink} target="_blank" rel="noreferrer">
                              <Button variant="success" size="sm">Join Now</Button>
                            </a>
                          : <span className="text-xs text-gray-400 whitespace-nowrap">Not open yet</span>
                        }
                      </div>
                    )
                  })
              }
            </CardBody>
          </Card>

          {/* Watch Previous — Late-Joiner: ALL recordings unlocked */}
          <Card>
            <CardHeader>
              <CardTitle>Watch previous sessions</CardTitle>
              <span className="text-xs text-gray-400">All recordings unlocked</span>
            </CardHeader>
            <CardBody className="p-0">
              {mockRecordings.map((r, i) => (
                <div key={r.id} className={`flex items-center gap-3 px-5 py-3.5 ${i < mockRecordings.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">▶</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-gray-900 truncate">{r.courseTitle}</p>
                      {r.isNew && !watchedIds.has(r.id) && <Badge variant="teal">NEW</Badge>}
                      {watchedIds.has(r.id) && <Badge variant="gray">Watched</Badge>}
                    </div>
                    <p className="text-xs text-gray-500">{r.date} · {r.durationMin} min</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => markWatched(r.id)}>▶ Watch</Button>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* My enrolled courses */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>My enrolled courses</CardTitle>
              <Link href="/courses" className="text-xs text-blue-600 hover:underline">Browse more →</Link>
            </CardHeader>
            <Table>
              <thead>
                <tr>
                  <Th>Course</Th><Th>Sessions attended</Th><Th>Progress</Th><Th>Status</Th><Th>Refund</Th>
                </tr>
              </thead>
              <tbody>
                {mockEnrollments.map(e => {
                  const course = mockCourses.find(c => c.id === e.courseId)
                  const pct = Math.round((e.sessionsAttended / e.totalSessions) * 100)
                  const refund = mockRefunds.find(r => r.enrollmentId === e.id && r.studentId === 'u1')
                  return (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <Td><span className="font-medium text-gray-900">{e.courseTitle}</span></Td>
                      <Td>{e.sessionsAttended} / {e.totalSessions}</Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2 w-24">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{pct}%</span>
                        </div>
                      </Td>
                      <Td><StatusBadge status={course?.status ?? 'in_progress'} /></Td>
                      <Td>
                        {refund
                          ? <StatusBadge status={refund.status} />
                          : <span className="text-xs text-gray-400">—</span>
                        }
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </Card>
        </div>
      </PageBody>
    </Shell>
  )
}
