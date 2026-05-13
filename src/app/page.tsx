import Link from 'next/link'

export default function Home() {
  const portals = [
    { role: 'Student', icon: '🎓', href: '/student', desc: 'View courses, join live sessions, access recordings', color: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50' },
    { role: 'Teacher', icon: '📖', href: '/teacher', desc: 'Manage sessions, view students, track payments', color: 'border-teal-200 hover:border-teal-400 hover:bg-teal-50' },
    { role: 'Admin', icon: '⚙️', href: '/admin', desc: 'Manage courses, instructors, refunds and payments', color: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50' },
  ]
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="mb-10 text-center">
        <div className="text-5xl mb-4">🕌</div>
        <h1 className="text-3xl font-bold text-gray-900">ArabicLearn</h1>
        <p className="text-gray-500 mt-2">Live-group Arabic Language & Quranic Studies Platform</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
        {portals.map(({ role, icon, href, desc, color }) => (
          <Link key={role} href={href}
            className={`bg-white rounded-2xl border-2 p-6 transition-all cursor-pointer shadow-sm ${color}`}>
            <div className="text-4xl mb-3">{icon}</div>
            <h2 className="font-bold text-gray-900 text-lg">{role} Portal</h2>
            <p className="text-sm text-gray-500 mt-1">{desc}</p>
          </Link>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-8">Demo — click any portal to explore</p>
    </div>
  )
}
