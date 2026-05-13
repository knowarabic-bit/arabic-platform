'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shell, Sidebar, TopBar, PageBody } from '@/components/layout/Sidebar'
import {
  Card, CardHeader, CardTitle, CardBody,
  Badge, StatusBadge, Button, EmptyState,
} from '@/components/ui'
import { mockCourses, mockSessions } from '@/data/mock'

const navItems = [
  { label: 'Dashboard', href: '/student', icon: '🏠' },
  { label: 'Courses', href: '/courses', icon: '📚' },
  { label: 'Recordings', href: '/student/recordings', icon: '🎬' },
]

type FilterType = 'all' | 'live' | 'starting_soon' | 'upcoming' | 'completed'
type CategoryFilter = 'all' | 'arabic' | 'quran'

function isLiveNow(courseId: string): boolean {
  return mockSessions.some(s => s.courseId === courseId && s.status === 'live')
}

function nextSession(courseId: string) {
  return mockSessions
    .filter(s => s.courseId === courseId && s.status === 'scheduled')
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0]
}

function isStartingSoon(courseId: string): boolean {
  const next = nextSession(courseId)
  if (!next) return false
  const diffH = (new Date(next.startsAt).getTime() - Date.now()) / 3_600_000
  return diffH >= 0 && diffH <= 48
}

function categoryOf(course: typeof mockCourses[0]): 'arabic' | 'quran' {
  const lower = course.title.toLowerCase()
  return lower.includes('quran') || lower.includes('tajweed') || lower.includes('tafseer') ? 'quran' : 'arabic'
}

function daysUntilStart(termStart: string): number {
  return Math.ceil((new Date(termStart).getTime() - Date.now()) / 86_400_000)
}

const filterLabels: Record<FilterType, string> = {
  all: 'All Courses',
  live: '🔴 Live Now',
  starting_soon: '⏰ Starting Soon',
  upcoming: '📅 Upcoming',
  completed: '✅ Completed',
}

export default function CoursesDiscovery() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set(['c1', 'c2', 'c3']))

  const filtered = mockCourses.filter(c => {
    const catMatch = category === 'all' || categoryOf(c) === category

    let typeMatch = false
    if (filter === 'all') typeMatch = true
    else if (filter === 'live') typeMatch = isLiveNow(c.id)
    else if (filter === 'starting_soon') typeMatch = isStartingSoon(c.id)
    else if (filter === 'upcoming') typeMatch = c.status === 'upcoming'
    else if (filter === 'completed') typeMatch = c.status === 'completed'

    return catMatch && typeMatch
  })

  const liveCount = mockCourses.filter(c => isLiveNow(c.id)).length
  const soonCount = mockCourses.filter(c => isStartingSoon(c.id)).length

  return (
    <Shell sidebar={<Sidebar role="student" userName="Ahmed Al-Rashid" userSub="Student" navItems={navItems} />}>
      <TopBar title="Course Discovery">
        <Badge variant="blue">{mockCourses.length} courses available</Badge>
      </TopBar>

      <PageBody>
        {/* Live alert bar */}
        {liveCount > 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-teal-300 bg-teal-50 px-5 py-3">
            <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-teal-500" />
            <p className="text-sm font-medium text-teal-800">
              {liveCount} session{liveCount > 1 ? 's' : ''} happening right now!
            </p>
            <button
              onClick={() => setFilter('live')}
              className="ml-auto text-xs font-semibold text-teal-700 hover:underline"
            >
              View live →
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {/* Type filters */}
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(filterLabels) as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterLabels[f]}
                {f === 'live' && liveCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-teal-500 px-1.5 text-white">{liveCount}</span>
                )}
                {f === 'starting_soon' && soonCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 text-white">{soonCount}</span>
                )}
              </button>
            ))}
          </div>

          {/* Category filters */}
          <div className="ml-auto flex gap-2">
            {(['all', 'arabic', 'quran'] as CategoryFilter[]).map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  category === c
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                {c === 'all' ? 'All' : c === 'arabic' ? '🌙 Arabic' : '📖 Quran'}
              </button>
            ))}
          </div>
        </div>

        {/* Course grid */}
        {filtered.length === 0 ? (
          <EmptyState icon="🔍" title="No courses match this filter" sub="Try a different filter or check back later." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map(course => {
              const live = isLiveNow(course.id)
              const soon = isStartingSoon(course.id)
              const next = nextSession(course.id)
              const isEnrolled = enrolled.has(course.id)
              const cat = categoryOf(course)
              const daysLeft = daysUntilStart(course.termStart)

              return (
                <Card key={course.id} className="flex flex-col overflow-hidden">
                  {/* Colour band */}
                  <div className={`h-1.5 ${cat === 'quran' ? 'bg-purple-500' : 'bg-blue-500'}`} />

                  <CardBody className="flex flex-col flex-1 gap-3">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 leading-snug">{course.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{course.level}</p>
                      </div>
                      {live && (
                        <span className="flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-700 flex-shrink-0">
                          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500" /> LIVE
                        </span>
                      )}
                      {!live && soon && <Badge variant="amber">Starting soon</Badge>}
                      {!live && !soon && <StatusBadge status={course.status} />}
                    </div>

                    {/* Instructors */}
                    <div className="flex flex-wrap gap-1">
                      {course.instructors.map(i => (
                        <span key={i.userId} className="text-xs text-gray-600 bg-gray-100 rounded-full px-2 py-0.5">
                          {i.name.split(' ').slice(-1)[0]}
                          {i.role === 'main' ? '' : ' (sub)'}
                        </span>
                      ))}
                    </div>

                    {/* Meta */}
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <p>👥 {course.enrolledCount} enrolled</p>
                      {live && next && (
                        <p className="text-teal-600 font-medium">
                          🎥 Live now · join with Zoom
                        </p>
                      )}
                      {!live && soon && next && (
                        <p className="text-amber-600 font-medium">
                          ⏰ Next: {new Date(next.startsAt).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                          {' '}at{' '}
                          {new Date(next.startsAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                      {!live && !soon && course.status === 'upcoming' && daysLeft > 0 && (
                        <p>📅 Starts in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</p>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-auto pt-2">
                      {isEnrolled ? (
                        live
                          ? <a
                              href={mockSessions.find(s => s.courseId === course.id && s.status === 'live')?.zoomLink ?? '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="block w-full"
                            >
                              <Button variant="success" className="w-full justify-center">🎥 Join Live Now</Button>
                            </a>
                          : <Button variant="secondary" className="w-full justify-center" disabled>
                              ✓ Enrolled
                            </Button>
                      ) : (
                        <Button
                          variant="primary"
                          className="w-full justify-center"
                          onClick={() => setEnrolled(p => new Set([...p, course.id]))}
                        >
                          Enrol Now
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        )}
      </PageBody>
    </Shell>
  )
}
