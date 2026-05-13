import { Shell, Sidebar, TopBar, PageBody } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardBody, StatCard, Badge, StatusBadge, Button, Table, Th, Td } from '@/components/ui'
import { mockSessions, mockCourses, mockPayments } from '@/data/mock'
import Link from 'next/link'

const navItems = [
  { label: 'Dashboard', href: '/teacher', icon: '🏠' },
  { label: 'My Sessions', href: '/teacher/sessions', icon: '📡' },
  { label: 'My Students', href: '/teacher/students', icon: '👥' },
  { label: 'Payments', href: '/teacher/payments', icon: '💰' },
  { label: 'Settings', href: '/teacher/settings', icon: '⚙️' },
]

const TEACHER_ID = 'u4'

export default function TeacherDashboard() {
  const myCourses = mockCourses.filter(c => c.instructors.some(i => i.userId === TEACHER_ID))
  const myPayments = mockPayments.filter(p => p.teacherId === TEACHER_ID)
  const pending = myPayments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const paid = myPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)

  const students = [
    { name: 'Ahmed Al-Rashid', att: '6/6', pct: 100, good: true },
    { name: 'Sara Mohammed', att: '5/6', pct: 83, good: true },
    { name: 'Omar Khalil', att: '4/6', pct: 67, good: false },
    { name: 'Nour Ibrahim', att: '6/6', pct: 100, good: true },
    { name: 'Khalid Yusuf', att: '2/6', pct: 33, good: false },
  ]

  return (
    <Shell sidebar={<Sidebar role="teacher" userName="Dr. Fatima Al-Zahra" userSub="Main Instructor" navItems={navItems} />}>
      <TopBar title="Teacher Dashboard">
        <Badge variant="teal">Spring Term 2025</Badge>
      </TopBar>

      <PageBody>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Sessions This Term" value="24" sub="All courses" accent="bg-teal-500" />
          <StatCard label="Total Students" value="87" sub="Across courses" accent="bg-blue-500" />
          <StatCard label="Pending Payments" value={`$${pending}`} sub="Awaiting approval" accent="bg-amber-500" />
          <StatCard label="Paid This Month" value={`$${paid}`} sub="Confirmed" accent="bg-green-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Management */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>My sessions</CardTitle>
              <Link href="/teacher/sessions" className="text-xs text-teal-600 hover:underline">View all →</Link>
            </CardHeader>
            <Table>
              <thead>
                <tr>
                  <Th>Course</Th><Th>Date & Time</Th><Th>Students</Th><Th>Status</Th><Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {mockSessions.slice(0, 5).map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <Td><span className="font-medium text-sm">{s.courseTitle}</span></Td>
                    <Td className="text-xs text-gray-500">
                      {new Date(s.startsAt).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' '}{new Date(s.startsAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </Td>
                    <Td>28</Td>
                    <Td><StatusBadge status={s.status} /></Td>
                    <Td>
                      {s.status === 'live' || s.status === 'scheduled' ? (
                        <a href={s.zoomLink} target="_blank" rel="noreferrer">
                          <Button variant="success" size="sm">Start →</Button>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">Completed</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>

          {/* Student Roster */}
          <Card>
            <CardHeader>
              <CardTitle>Student attendance</CardTitle>
              <Link href="/teacher/students" className="text-xs text-teal-600 hover:underline">All →</Link>
            </CardHeader>
            <CardBody className="p-0">
              {students.map((s, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < students.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${s.good ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
                    {s.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.att} sessions</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${s.good ? 'text-teal-600' : 'text-amber-600'}`}>{s.pct}%</p>
                    {!s.good && <span className="text-xs text-red-500">⚠ Low</span>}
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* My Courses */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>My assigned courses</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
              {myCourses.map(c => {
                const myRole = c.instructors.find(i => i.userId === TEACHER_ID)?.role
                return (
                  <div key={c.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <StatusBadge status={c.status} />
                      <Badge variant={myRole === 'main' ? 'blue' : 'purple'}>{myRole}</Badge>
                    </div>
                    <p className="font-semibold text-sm text-gray-900 mt-2">{c.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{c.level} · {c.enrolledCount} students</p>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </PageBody>
    </Shell>
  )
}
