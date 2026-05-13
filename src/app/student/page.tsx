import { Shell, Sidebar, TopBar, PageBody } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardBody, StatCard, Badge, StatusBadge, Button, Table, Th, Td } from '@/components/ui'
import { mockEnrollments, mockSessions, mockRecordings, mockRefunds } from '@/data/mock'
import Link from 'next/link'

const navItems = [
  { label: 'Dashboard', href: '/student', icon: '🏠' },
  { label: 'My Courses', href: '/student/courses', icon: '📚' },
  { label: 'Recordings', href: '/student/recordings', icon: '🎬' },
  { label: 'Schedule', href: '/student/schedule', icon: '📅' },
  { label: 'Settings', href: '/student/settings', icon: '⚙️' },
]

export default function StudentDashboard() {
  const upcoming = mockSessions.filter(s => s.status === 'scheduled' || s.status === 'live').slice(0, 3)
  const recordings = mockRecordings.slice(0, 4)
  const openRefund = mockRefunds.find(r => r.status === 'open')

  return (
    <Shell sidebar={<Sidebar role="student" userName="Ahmed Al-Rashid" userSub="Student" navItems={navItems} />}>
      <TopBar title="Good morning, Ahmed 👋">
        <span className="text-sm text-gray-500">Spring Term 2025</span>
        <div className="relative">
          <span className="text-xl cursor-pointer">🔔</span>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
        </div>
      </TopBar>

      <PageBody>
        {/* Refund Banner */}
        {openRefund && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-amber-800 text-sm">⏳ Refund window open — {openRefund.courseTitle}</p>
              <p className="text-xs text-amber-700 mt-1">
                You can withdraw before Lecture 2 starts. This option expires soon. Amount: ${openRefund.amount}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="primary" size="sm">Get credit</Button>
              <Button variant="secondary" size="sm">Cash back</Button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Enrolled Courses" value={mockEnrollments.length} sub="Active" accent="bg-blue-500" />
          <StatCard label="Upcoming Sessions" value={upcoming.length} sub="This week" accent="bg-teal-500" />
          <StatCard label="Recordings" value={mockRecordings.length} sub="Available" accent="bg-purple-500" />
          <StatCard label="Wallet Credit" value="$25.00" sub="Available balance" accent="bg-amber-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming live sessions</CardTitle>
              <Link href="/student/schedule" className="text-xs text-blue-600 hover:underline">View all →</Link>
            </CardHeader>
            <CardBody className="p-0">
              {upcoming.map((s, i) => (
                <div key={s.id} className={`flex items-center gap-3 px-5 py-4 ${i < upcoming.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className={`w-2 h-12 rounded-full flex-shrink-0 ${s.status === 'live' ? 'bg-teal-500' : 'bg-blue-200'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{s.courseTitle}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(s.startsAt).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' · '}
                      {new Date(s.startsAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <StatusBadge status={s.status} />
                  </div>
                  {s.status === 'live' && (
                    <a href={s.zoomLink} target="_blank" rel="noreferrer">
                      <Button variant="success" size="sm">Join now →</Button>
                    </a>
                  )}
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Recent Recordings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent recordings</CardTitle>
              <Link href="/student/recordings" className="text-xs text-blue-600 hover:underline">View all →</Link>
            </CardHeader>
            <CardBody className="p-0">
              {recordings.map((r, i) => (
                <div key={r.id} className={`flex items-center gap-3 px-5 py-3.5 ${i < recordings.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">▶</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-gray-900 truncate">{r.courseTitle}</p>
                      {r.isNew && <Badge variant="teal">NEW</Badge>}
                    </div>
                    <p className="text-xs text-gray-500">{r.date} · {r.durationMin}m</p>
                  </div>
                  <Button variant="ghost" size="sm">Watch</Button>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* My Courses */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>My enrolled courses</CardTitle>
              <Link href="/student/courses" className="text-xs text-blue-600 hover:underline">View all →</Link>
            </CardHeader>
            <Table>
              <thead>
                <tr>
                  <Th>Course</Th><Th>Sessions attended</Th><Th>Progress</Th><Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {mockEnrollments.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <Td><span className="font-medium text-gray-900">{e.courseTitle}</span></Td>
                    <Td>{e.sessionsAttended} / {e.totalSessions}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2 w-24">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(e.sessionsAttended / e.totalSessions) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{Math.round((e.sessionsAttended / e.totalSessions) * 100)}%</span>
                      </div>
                    </Td>
                    <Td><Badge variant="teal">Active</Badge></Td>
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
