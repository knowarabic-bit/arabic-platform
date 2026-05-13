import { Shell, Sidebar, TopBar, PageBody } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, Badge, Button, Table, Th, Td } from '@/components/ui'
import { mockRecordings } from '@/data/mock'

const navItems = [
  { label: 'Dashboard', href: '/student', icon: '🏠' },
  { label: 'My Courses', href: '/student/courses', icon: '📚' },
  { label: 'Recordings', href: '/student/recordings', icon: '🎬' },
  { label: 'Schedule', href: '/student/schedule', icon: '📅' },
  { label: 'Settings', href: '/student/settings', icon: '⚙️' },
]

export default function StudentRecordings() {
  return (
    <Shell sidebar={<Sidebar role="student" userName="Ahmed Al-Rashid" userSub="Student" navItems={navItems} />}>
      <TopBar title="My Recordings">
        <Badge variant="purple">{mockRecordings.length} available</Badge>
      </TopBar>

      <PageBody>
        <Card>
          <CardHeader>
            <CardTitle>All session recordings</CardTitle>
            <p className="text-xs text-gray-500">Recordings appear within 15 minutes of session end</p>
          </CardHeader>
          <Table>
            <thead>
              <tr><Th>Session</Th><Th>Date</Th><Th>Duration</Th><Th>{""}</Th></tr>
            </thead>
            <tbody>
              {mockRecordings.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <Td>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{r.courseTitle}</span>
                      {r.isNew && <Badge variant="teal">NEW</Badge>}
                    </div>
                  </Td>
                  <Td className="text-sm text-gray-500">{r.date}</Td>
                  <Td className="text-sm text-gray-500">{r.durationMin} min</Td>
                  <Td>
                    <a href={r.url}>
                      <Button variant="primary" size="sm">▶ Watch</Button>
                    </a>
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
