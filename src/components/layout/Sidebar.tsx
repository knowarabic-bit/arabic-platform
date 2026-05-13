'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { ReactNode } from 'react'

interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
}

interface SidebarProps {
  role: 'student' | 'teacher' | 'admin'
  userName: string
  userSub: string
  navItems: NavItem[]
}

const roleTheme = {
  student: { bg: 'bg-slate-900', activeBg: 'bg-blue-600', logo: '🕌', accent: 'text-blue-400' },
  teacher: { bg: 'bg-teal-900',  activeBg: 'bg-teal-700', logo: '📖', accent: 'text-teal-300' },
  admin:   { bg: 'bg-gray-900',  activeBg: 'bg-blue-600', logo: '⚙️',  accent: 'text-blue-400' },
}

export function Sidebar({ role, userName, userSub, navItems }: SidebarProps) {
  const pathname = usePathname()
  const theme = roleTheme[role]

  return (
    <aside className={clsx('w-56 flex-shrink-0 flex flex-col h-screen sticky top-0', theme.bg)}>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{theme.logo}</span>
          <div>
            <p className="text-white font-bold text-sm leading-tight">ArabicLearn</p>
            <p className={clsx('text-xs', theme.accent)}>
              {role === 'student' ? 'Student Portal' : role === 'teacher' ? 'Teacher Portal' : 'Admin Console'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                active
                  ? clsx(theme.activeBg, 'text-white font-medium')
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {userName[0]}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{userName}</p>
            <p className={clsx('text-xs truncate', theme.accent)}>{userSub}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

// ── Shell wrapping sidebar + main ────────────────────────────────
export function Shell({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebar}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  )
}

// ── Top bar ──────────────────────────────────────────────────────
export function TopBar({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-10">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </header>
  )
}

// ── Page body ────────────────────────────────────────────────────
export function PageBody({ children }: { children: ReactNode }) {
  return <main className="flex-1 p-6 overflow-auto">{children}</main>
}
