import { Shell, Sidebar, TopBar, PageBody } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, Badge, StatusBadge, Button, Table, Th, Td } from '@/components/ui'
import { mockSessions } from '@/data/mock'

const navItems = [
  { label: 'Dashboard', href: '/teacher', icon: '🏠' },
  { label: 'My Sessions', href: '/teacher/sessions', icon: '📡' },
  { label: 'My Students', href: '/teacher/students', icon: '👥' },
  { label: 'Payments', href: '/teacher/payments', icon: '💰' },
  { label: 'Settings', href: '/teacher/settings', icon: '⚙️' },
]

export default function TeacherSessions() {
  const live = mockSessions.filter(s => s.status === 'live')
  const scheduled = mockSessions.filter(s => s.status === 'scheduled')
  const completed = mockSessions.filter(s => s.status === 'completed')

  return (
    <Shell sidebar={<Sidebar role="teacher" userName="Dr. Fatima Al-Zahra" userSub="Main Instructor" navItems={navItems} />}>
      <TopBar title="My Sessions">
        <Badge variant="teal">{live.length} live now</Badge>
      </TopBar>

      <PageBody>
        {/* Live alert */}
        {live.map(s => (
          <div key={s.id} className="mb-6 bg-teal-50 border border-teal-300 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-teal-800">🔴 Live now — {s.courseTitle}</p>
              <p className="text-sm text-teal-600 mt-0.5">Session started · {s.durationMin} min scheduled</p>
            </div>
            <a href={s.zoomLink} target="_blank" rel="noreferrer">
              <Button variant="success">Open Zoom →</Button>
            </a>
          </div>
        ))}

        {/* Upcoming */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Scheduled sessions</CardTitle>
            <Badge variant="blue">{scheduled.length}</Badge>
          </CardHeader>
          <Table>
            <thead>
              <tr><Th>Course</Th><Th>Date & Time</Th><Th>Duration</Th><Th>Status</Th><Th>Action</Th></tr>
            </thead>
            <tbody>
              {scheduled.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <Td><span className="font-medium">{s.courseTitle}</span></Td>
                  <Td className="text-sm text-gray-600">
                    {new Date(s.startsAt).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' · '}
                    {new Date(s.startsAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                  </Td>
                  <Td>{s.durationMin} min</Td>
                  <Td><StatusBadge status={s.status} /></Td>
                  <Td>
                    <a href={s.zoomLink} target="_blank" rel="noreferrer">
                      <Button variant="secondary" size="sm">Open link</Button>
                    </a>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        {/* Completed */}
        <Card>
          <CardHeader>
            <CardTitle>Completed sessions</CardTitle>
            <Badge variant="gray">{completed.length}</Badge>
          </CardHeader>
          <Table>
            <thead>
              <tr><Th>Course</Th><Th>Date</Th><Th>Duration</Th><Th>Recording</Th><Th>Payment</Th></tr>
            </thead>
            <tbody>
              {completed.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <Td><span className="font-medium">{s.courseTitle}</span></Td>
                  <Td className="text-sm text-gray-600">
                    {new Date(s.startsAt).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Td>
                  <Td>{s.durationMin} min</Td>
                  <Td>
                    {s.recordingUrl
                      ? <Badge variant="teal">Available</Badge>
                      : <Badge variant="gray">Processing</Badge>}
                  </Td>
                  <Td>
                    {s.attendedTeacherId === 'u4'
                      ? <Badge variant="green">Payment generated</Badge>
                      : <Badge variant="gray">Substitute covered</Badge>}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </PageBody>
    </Shell>
  )
}
