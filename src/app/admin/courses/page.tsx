import { Shell, Sidebar, TopBar, PageBody } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, Badge, StatusBadge, Button, Table, Th, Td } from '@/components/ui'
import { mockCourses } from '@/data/mock'

const navItems = [
  { label: 'Overview', href: '/admin', icon: '📊' },
  { label: 'Courses', href: '/admin/courses', icon: '📚' },
  { label: 'Payments', href: '/admin/payments', icon: '💳', badge: 3 },
  { label: 'Refunds', href: '/admin/refunds', icon: '↩️', badge: 2 },
  { label: 'Users', href: '/admin/users', icon: '👥' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
]

export default function AdminCourses() {
  return (
    <Shell sidebar={<Sidebar role="admin" userName="Super Admin" userSub="Platform Owner" navItems={navItems} />}>
      <TopBar title="Course Management">
        <Button variant="primary" size="sm">+ New Course</Button>
      </TopBar>

      <PageBody>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{mockCourses.filter(c=>c.status==='upcoming').length}</p>
            <p className="text-xs text-gray-500 mt-1">Upcoming</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-teal-600">{mockCourses.filter(c=>c.status==='in_progress').length}</p>
            <p className="text-xs text-gray-500 mt-1">In Progress</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{mockCourses.reduce((s,c)=>s+c.enrolledCount,0)}</p>
            <p className="text-xs text-gray-500 mt-1">Total Students</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{new Set(mockCourses.flatMap(c=>c.instructors.map(i=>i.userId))).size}</p>
            <p className="text-xs text-gray-500 mt-1">Active Teachers</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All courses</CardTitle>
            <Badge variant="gray">{mockCourses.length} total</Badge>
          </CardHeader>
          <Table>
            <thead>
              <tr>
                <Th>Title</Th><Th>Level</Th><Th>Status</Th><Th>Term</Th>
                <Th>Enrolled</Th><Th>Main Instructor</Th><Th>Substitute</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {mockCourses.map(c => {
                const main = c.instructors.find(i => i.role === 'main')
                const sub  = c.instructors.find(i => i.role === 'substitute')
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <Td><span className="font-semibold text-sm text-gray-900">{c.title}</span></Td>
                    <Td><Badge variant="gray">{c.level}</Badge></Td>
                    <Td><StatusBadge status={c.status} /></Td>
                    <Td className="text-xs text-gray-500">{c.termStart} → {c.termEnd}</Td>
                    <Td>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">{c.enrolledCount}</span>
                        <span className="text-xs text-gray-400">students</span>
                      </div>
                    </Td>
                    <Td>
                      {main ? <Badge variant="blue">{main.name}</Badge> : <span className="text-gray-300">—</span>}
                    </Td>
                    <Td>
                      {sub ? <Badge variant="purple">{sub.name}</Badge> : <span className="text-gray-300">None</span>}
                    </Td>
                    <Td>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm">Sessions</Button>
                      </div>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </Card>
      </PageBody>
    </Shell>
  )
}
