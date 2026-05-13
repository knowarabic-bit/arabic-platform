import { Shell, Sidebar, TopBar, PageBody } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardBody, StatCard, Badge, StatusBadge, Button, Table, Th, Td } from '@/components/ui'
import { mockPayments, mockPayRates, monthlyEarnings } from '@/data/mock'

const navItems = [
  { label: 'Dashboard', href: '/teacher', icon: '🏠' },
  { label: 'My Sessions', href: '/teacher/sessions', icon: '📡' },
  { label: 'My Students', href: '/teacher/students', icon: '👥' },
  { label: 'Payments', href: '/teacher/payments', icon: '💰' },
  { label: 'Settings', href: '/teacher/settings', icon: '⚙️' },
]

const TEACHER_ID = 'u4'

export default function TeacherPayments() {
  const myPayments = mockPayments.filter(p => p.teacherId === TEACHER_ID)
  const myRates = mockPayRates.filter(r => r.teacherId === TEACHER_ID)
  const pending = myPayments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const paid = myPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const total = myPayments.reduce((s, p) => s + p.amount, 0)
  const maxEarning = Math.max(...monthlyEarnings.map(e => e.amount))

  return (
    <Shell sidebar={<Sidebar role="teacher" userName="Dr. Fatima Al-Zahra" userSub="Main Instructor" navItems={navItems} />}>
      <TopBar title="My Payments">
        <Badge variant="blue">May 2025</Badge>
        <Button variant="secondary" size="sm">Export CSV</Button>
      </TopBar>

      <PageBody>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Earned (all time)" value={`$${total}`} accent="bg-teal-500" />
          <StatCard label="Paid This Month" value={`$${paid}`} sub="Confirmed" accent="bg-green-500" />
          <StatCard label="Pending Approval" value={`$${pending}`} sub="Awaiting admin" accent="bg-amber-500" />
          <StatCard label="Sessions Attended" value={myPayments.length} accent="bg-blue-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Bar chart */}
          <Card>
            <CardHeader><CardTitle>Monthly earnings — 2025</CardTitle></CardHeader>
            <CardBody>
              <div className="flex items-end gap-3 h-36">
                {monthlyEarnings.map((m, i) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500 font-medium">${m.amount}</span>
                    <div
                      className={`w-full rounded-t-md transition-all ${i === monthlyEarnings.length - 1 ? 'bg-teal-500' : 'bg-blue-200'}`}
                      style={{ height: `${(m.amount / maxEarning) * 96}px` }}
                    />
                    <span className="text-xs text-gray-400">{m.month}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Pay Rates */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>My configured pay rates</CardTitle></CardHeader>
            <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myRates.map(r => (
                <div key={r.role} className={`rounded-xl p-4 border-l-4 ${r.role === 'main' ? 'bg-blue-50 border-blue-500' : 'bg-purple-50 border-purple-500'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={r.role === 'main' ? 'blue' : 'purple'}>{r.role} teacher</Badge>
                    <Badge variant="green">Active</Badge>
                  </div>
                  <p className={`text-2xl font-bold mt-2 ${r.role === 'main' ? 'text-blue-700' : 'text-purple-700'}`}>
                    ${r.amount}<span className="text-sm font-normal text-gray-500"> / session</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Effective from {r.effectiveFrom}</p>
                </div>
              ))}
              <p className="text-xs text-gray-400 sm:col-span-2">Contact admin to update your rates.</p>
            </CardBody>
          </Card>
        </div>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment history</CardTitle>
            <Badge variant="teal">{myPayments.length} records</Badge>
          </CardHeader>
          <Table>
            <thead>
              <tr>
                <Th>Course</Th><Th>Session date</Th><Th>Role</Th>
                <Th>Amount</Th><Th>Zoom confirmed</Th><Th>Status</Th><Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {myPayments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <Td><span className="font-medium">{p.courseTitle}</span></Td>
                  <Td className="text-xs text-gray-500">{p.sessionDate}</Td>
                  <Td><Badge variant={p.role === 'main' ? 'blue' : 'purple'}>{p.role}</Badge></Td>
                  <Td><span className="font-semibold text-teal-700">${p.amount}</span></Td>
                  <Td className="text-xs text-gray-400">
                    {p.zoomConfirmedAt ? new Date(p.zoomConfirmedAt).toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </Td>
                  <Td><StatusBadge status={p.status} /></Td>
                  <Td>
                    {p.status === 'disputed' && <Button variant="danger" size="sm">Flag issue</Button>}
                    {p.status === 'pending' && <span className="text-xs text-gray-400">Awaiting…</span>}
                    {(p.status === 'paid' || p.status === 'approved') && <span className="text-xs text-green-600">✓</span>}
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
