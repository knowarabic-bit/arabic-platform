import { clsx } from 'clsx'
import { ReactNode } from 'react'

// ── Badge ────────────────────────────────────────────────────────
type BadgeVariant = 'blue' | 'teal' | 'amber' | 'purple' | 'red' | 'green' | 'gray'

const badgeStyles: Record<BadgeVariant, string> = {
  blue:   'bg-blue-100 text-blue-800',
  teal:   'bg-teal-100 text-teal-800',
  amber:  'bg-amber-100 text-amber-800',
  purple: 'bg-purple-100 text-purple-800',
  red:    'bg-red-100 text-red-800',
  green:  'bg-green-100 text-green-800',
  gray:   'bg-gray-100 text-gray-600',
}

export function Badge({ children, variant = 'gray' }: { children: ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', badgeStyles[variant])}>
      {children}
    </span>
  )
}

// ── Status Badge ─────────────────────────────────────────────────
const statusMap: Record<string, BadgeVariant> = {
  upcoming: 'blue', in_progress: 'teal', completed: 'gray',
  pending: 'amber', approved: 'green', paid: 'teal', disputed: 'red', cancelled: 'gray',
  open: 'amber', rejected: 'red', expired: 'gray',
  scheduled: 'blue', live: 'teal',
  main: 'blue', substitute: 'purple',
}

export function StatusBadge({ status }: { status: string }) {
  const variant = statusMap[status] ?? 'gray'
  const label = status.replace(/_/g, ' ')
  return <Badge variant={variant}>{label}</Badge>
}

// ── Button ───────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'

const btnStyles: Record<ButtonVariant, string> = {
  primary:   'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200',
  danger:    'bg-red-600 hover:bg-red-700 text-white',
  ghost:     'hover:bg-gray-100 text-gray-600',
  success:   'bg-teal-600 hover:bg-teal-700 text-white',
}

export function Button({
  children, variant = 'primary', size = 'md', onClick, disabled, className
}: {
  children: ReactNode
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  const sizeClasses = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
        btnStyles[variant], sizeClasses[size], className
      )}
    >
      {children}
    </button>
  )
}

// ── Card ─────────────────────────────────────────────────────────
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('bg-white rounded-xl border border-gray-200 shadow-sm', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="font-semibold text-gray-900 text-sm">{children}</h3>
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('px-5 py-4', className)}>{children}</div>
}

// ── Stat Card ────────────────────────────────────────────────────
export function StatCard({
  label, value, sub, accent
}: {
  label: string; value: string | number; sub?: string; accent: string
}) {
  return (
    <Card className="overflow-hidden">
      <div className={clsx('h-1', accent)} />
      <CardBody className="pt-3">
        <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </CardBody>
    </Card>
  )
}

// ── Table ────────────────────────────────────────────────────────
export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={clsx('px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50', className)}>
      {children}
    </th>
  )
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={clsx('px-4 py-3 text-gray-700 border-t border-gray-100', className)}>
      {children}
    </td>
  )
}

// ── Empty state ──────────────────────────────────────────────────
export function EmptyState({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="text-center py-10 text-gray-400">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="font-medium text-gray-600">{title}</p>
      {sub && <p className="text-sm mt-1">{sub}</p>}
    </div>
  )
}

// ── Section heading ──────────────────────────────────────────────
export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-semibold text-gray-900 mb-4">{children}</h2>
}
