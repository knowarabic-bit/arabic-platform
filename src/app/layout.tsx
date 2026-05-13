import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ArabicLearn — Live Group Classes',
  description: 'Arabic Language & Quranic Studies Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
