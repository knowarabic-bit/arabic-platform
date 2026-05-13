import { Shell, Sidebar, TopBar, PageBody } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, StatCard, Badge, StatusBadge, Button, Table, Th, Td } from '@/components/ui'
import { mockPayments, mockRefunds, mockCourses } from '@/data/mock'
import Link from 'next/link'

const navItems = [
  { label: 'Overview', href: '/admin', icon: '📊' },
  { label: 'Courses', href: '/admin/courses', icon: '📚' },
  { label: 'Payments', href: '/admin/payments', icon: '💳', badge: 3 },
  { label: 'Refunds', href: '/admin/refunds', icon: '↩️', badge: 2 },
  { label: 'Users', href: '/admin/users', icon: '👥' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
]

export default function AdminDashboard() {
  const pending = mockPayments.filter(p => p.status === 'pending')
  const paidTotal = mockPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const openRefunds = mockRefunds.filter(r => r.status === 'open')

  return (
    <Shell sidebar={<Sidebar role="admin" userName="Super Admin" userSub="Platform Owner" navItems={navItems} />}>
      <TopBar title="Admin Overview">
        <Badge variant="purple">Spring Term 2025</Badge>
      </TopBar>

      <PageBody>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Pending Payments" value={pending.length} sub="Awaiting approval" accent="bg-amber-500" />
          <StatCard label="Paid This Month" value={`$${paidTotal}`} sub="Confirmed transfers" accent="bg-teal-500" />
          <StatCard label="Open Refunds" value={openRefunds.length} sub="Require action" accent="bg-red-500" />
          <StatCard label="Active Subscriptions" value="142" sub="All-access pass" accent="bg-purple-500" />
        </div>

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
                    <Td className="text-xs text-gray-500">{p.courseTitle}</Td>
                    <Td><Badge variant={p.role === 'main' ? 'blue' : 'purple'}>{p.role}</Badge></Td>
                    <Td><span className="font-semibold text-teal-700">${p.amount}</span></Td>
                    <Td><Button variant="success" size="sm">✓ Approve</Button></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>

          {/* Refund Queue */}
          <Card>
            <CardHeader>
              <CardTitle>Refund requests</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="red">{openRefunds.length} open</Badge>
                <Link href="/admin/refunds">
                  <Button variant="secondary" size="sm">View all →</Button>
                </Link>
              </div>
            </CardHeader>
            <Table>
              <thead>
                <tr><Th>Student</Th><Th>Course</Th><Th>Type</Th><Th>Amount</Th><Th>Action</Th></tr>
              </thead>
              <tbody>
                {openRefunds.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <Td><span className="font-medium text-sm">{r.studentName}</span></Td>
                    <Td className="text-xs text-gray-500 max-w-[140px] truncate">{r.courseTitle}</Td>
                    <Td><Badge variant={r.type === 'cash' ? 'blue' : 'purple'}>{r.type}</Badge></Td>
                    <Td><span className="font-semibold">${r.amount}</span></Td>
                    <Td>
                      <div className="flex gap-1">
                        <Button variant="success" size="sm">✓</Button>
                        <Button variant="danger" size="sm">✗</Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>

          {/* Courses Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>All courses</CardTitle>
              <Link href="/admin/courses">
                <Button variant="primary" size="sm">+ New course</Button>
              </Link>
            </CardHeader>
            <Table>
              <thead>
                <tr><Th>Title</Th><Th>Level</Th><Th>Status</Th><Th>Enrolled</Th><Th>Instructors</Th><Th>Action</Th></tr>
              </thead>
              <tbody>
                {mockCourses.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <Td><span className="font-medium">{c.title}</span></Td>
                    <Td><Badge variant="gray">{c.level}</Badge></Td>
                    <Td><StatusBadge status={c.status} /></Td>
                    <Td>{c.enrolledCount} students</Td>
                    <Td>
                      <div className="flex gap-1 flex-wrap">
                        {c.instructors.map(i => (
                          <Badge key={i.userId} variant={i.role === 'main' ? 'blue' : 'purple'}>{i.name.split(' ')[0]}</Badge>
                        ))}
                      </div>
                    </Td>
                    <Td><Button variant="ghost" size="sm">Edit</Button></Td>
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
