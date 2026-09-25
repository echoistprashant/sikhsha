'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'

// Dashboard components
import Sidebar from '@/components/dashboard/sidebar'
import ProfileDropdown from '@/components/dashboard/profile-dropdown'
import AiFab from '@/components/dashboard/ai-fab'
import WidgetCard from '@/components/dashboard/widget-card'

// Widgets
import WeakAreasWidget from '@/components/dashboard/widgets/weak-areas-widget'
import AttendanceWidget from '@/components/dashboard/widgets/attendance-widget'
import AnalyticsWidget from '@/components/dashboard/widgets/analytics-widget'
import UpcomingLessonWidget from '@/components/dashboard/widgets/upcoming-lesson-widget'
import TeacherAttendanceWidget from '@/components/dashboard/widgets/teacher-attendance-widget'
import StudentAttendanceWidget from '@/components/dashboard/widgets/student-attendance-widget'

// UI components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  GraduationCap,
  BookOpen,
  FileText,
  User,
  Search,
  Sparkles,
  Clock,
  HelpCircle,
  School,
  ClipboardList,
  ArrowRight,
  Zap,
  Target,
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()
  const [doubtQuery, setDoubtQuery] = useState('')

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) router.push("/login");
  }, [router]);


  if (!user) {
    return null
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const getRoleMessage = () => {
    switch (user.role) {
      case 'teacher':
        return 'Ready to create your next lesson?'
      case 'student':
        return 'Ready to learn something new?'
      case 'admin':
        return 'Here\'s what\'s happening today.'
      default:
        return 'Welcome back!'
    }
  }

  const handleDoubtSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (doubtQuery.trim()) {
      router.push(`/student/doubt-solver?q=${encodeURIComponent(doubtQuery)}`)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#E5E1DD] dark:bg-zinc-950">
      {/* Sidebar */}
      <Sidebar role={user.role as 'student' | 'teacher' | 'admin'} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#E5E1DD]/80 backdrop-blur-md dark:bg-zinc-950/80">
          <div className="flex items-center justify-between px-8 py-6">
            {/* Title */}
            <h1 className="text-2xl font-bold tracking-tight text-[#1F1F1F] dark:text-white">
              Dashboard
            </h1>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  className="pl-9 w-64 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-full"
                />
              </div>
              <ProfileDropdown />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 lg:p-8">
          {/* Student Dashboard */}
          {user.role === 'student' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Quick Ask Input */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-[#1F1F1F] rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative bg-gradient-to-r from-[#18181B] via-[#27272A] to-[#18181B] rounded-2xl p-8 text-white shadow-2xl border border-zinc-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-emerald-500/20 rounded-xl backdrop-blur-sm border border-emerald-500/30">
                      <Sparkles className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-wide">AI Doubt Solver</h2>
                      <p className="text-zinc-300 text-sm font-medium">Powered by advanced AI</p>
                    </div>
                  </div>
                  <form onSubmit={handleDoubtSubmit} className="relative">
                    <Input
                      type="text"
                      value={doubtQuery}
                      onChange={(e) => setDoubtQuery(e.target.value)}
                      placeholder="What do you want to learn today? Paste your doubt here..."
                      className="w-full h-16 pl-6 pr-16 !bg-white !text-slate-900 font-medium border-2 border-emerald-500/40 rounded-xl shadow-xl placeholder:!text-slate-500 focus-visible:ring-4 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 text-lg transition-all"
                    />
                    <Button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 p-0 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                  </form>
                  <p className="text-zinc-300 text-sm mt-4 flex items-center gap-2 font-medium">
                    <Zap className="h-4 w-4 text-emerald-400" />
                    Get instant explanations, step-by-step solutions, and personalized help
                  </p>
                </div>
              </div>

              {/* Widgets Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <WeakAreasWidget />

                <WidgetCard
                  title="Doubt History"
                  icon={<Clock className="h-4 w-4" />}
                  href="/student/history"
                >
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-700 flex items-center justify-center shadow-sm">
                      <HelpCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white text-lg">View Past Questions</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Review your doubt history</p>
                    </div>
                  </div>
                </WidgetCard>

                <WidgetCard
                  title="Quick Topics"
                  icon={<BookOpen className="h-4 w-4" />}
                  href="/student/doubt-solver"
                >
                  <div className="flex flex-wrap gap-2">
                    {['Math', 'Physics', 'Chemistry', 'Biology'].map((topic) => (
                      <Link
                        key={topic}
                        href={`/student/doubt-solver?subject=${topic.toLowerCase()}`}
                        className="px-4 py-2 text-sm font-medium bg-zinc-900 dark:bg-zinc-700 text-white rounded-full transition-all hover:scale-105 hover:bg-zinc-800 dark:hover:bg-zinc-600"
                      >
                        {topic}
                      </Link>
                    ))}
                  </div>
                </WidgetCard>
              </div>
            </div>
          )}

          {/* Admin Dashboard */}
          {user.role === 'admin' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Widgets Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnalyticsWidget />
                <AttendanceWidget />
                <StudentAttendanceWidget />

                <ModernCard
                  title="User Management"
                  description="Add, edit, or remove users"
                  icon={<User className="h-6 w-6" />}
                  href="/admin/users"
                  gradient="from-[#1F1F1F] to-[#2D2D2D]"
                />

                <ModernCard
                  title="Teacher Content"
                  description="Lesson plans & decks created"
                  icon={<FileText className="h-6 w-6" />}
                  href="/admin/teacher-content"
                  gradient="from-[#1F1F1F] to-[#2D2D2D]"
                />

                <ModernCard
                  title="Class Management"
                  description="Assign teachers to classes"
                  icon={<School className="h-6 w-6" />}
                  href="/admin/classes"
                  gradient="from-[#1F1F1F] to-[#2D2D2D]"
                />
              </div>
            </div>
          )}

          {/* Teacher Dashboard */}
          {user.role === 'teacher' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <TeacherAttendanceWidget />
              </div>

              {/* Widgets Grid */}
              <div>
                <h3 className="text-xl font-bold text-[#1F1F1F] dark:text-white mb-6 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#4CAF50]" />
                  Your Creative Tools
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ModernCard
                    title="Lesson Planner"
                    description="AI-powered lesson planning"
                    icon={<FileText className="h-6 w-6" />}
                    href="/teacher/lesson-planner"
                    gradient="from-[#1F1F1F] to-[#2D2D2D]"
                    badge="Popular"
                  />

                  <ModernCard
                    title="Deck Generator"
                    description="Create Flashcards"
                    icon={<GraduationCap className="h-6 w-6" />}
                    href="/teacher/deck-generator"
                    gradient="from-[#1F1F1F] to-[#2D2D2D]"
                  />

                  <ModernCard
                    title="Activity Generator"
                    description="Engaging classroom activities"
                    icon={<BookOpen className="h-6 w-6" />}
                    href="/teacher/activity-generator"
                    gradient="from-[#1F1F1F] to-[#2D2D2D]"
                  />

                  <ModernCard
                    title="Question Generator"
                    description="Create question papers & PDFs"
                    icon={<ClipboardList className="h-6 w-6" />}
                    href="/teacher/question-generator"
                    gradient="from-[#1F1F1F] to-[#2D2D2D]"
                    badge="New"
                  />

                  {/* <ModernCard
                    title="Topic Planner"
                    description="Generate topic teaching plans"
                    icon={<BookOpen className="h-6 w-6" />}
                    href="/teacher/topic-planner"
                    gradient="from-[#1F1F1F] to-[#2D2D2D]"
                  /> */}

                  <ModernCard
                    title="My Content"
                    description="View all your created content"
                    icon={<FileText className="h-6 w-6" />}
                    href="/teacher/my-content"
                    gradient="from-[#1F1F1F] to-[#2D2D2D]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* AI Floating Action Button */}
      <AiFab userRole={user.role} />
    </div>
  )
}

// Modern Card Component
function ModernCard({
  title,
  description,
  icon,
  href,
  gradient,
  badge,
}: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  gradient: string
  badge?: string
}) {
  return (
    <Link href={href} className="group relative">
      <div className="relative bg-white dark:bg-zinc-900 rounded-3xl p-7 shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden">
        {/* Glass overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {badge && (
          <div className="absolute top-5 right-5 z-10">
            <span className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white bg-[#4CAF50] rounded-full shadow-lg shadow-emerald-500/20">
              {badge}
            </span>
          </div>
        )}

        <div className="flex items-start justify-between mb-6">
          <div className={`p-3.5 rounded-2xl bg-[#1F1F1F] dark:bg-white shadow-xl group-hover:scale-110 transition-all duration-500 group-hover:shadow-[#4CAF50]/20`}>
            <div className="text-white dark:text-[#1F1F1F]">
              {icon}
            </div>
          </div>
          <ArrowRight className="h-6 w-6 text-zinc-300 transform group-hover:text-[#4CAF50] group-hover:translate-x-2 transition-all duration-300" />
        </div>

        <h3 className="text-xl font-bold text-[#1F1F1F] dark:text-white mb-2 group-hover:text-[#4CAF50] transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
          {description}
        </p>

        <div className="mt-6 pt-5 border-t border-zinc-100/80 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center text-[#4CAF50] font-bold text-sm tracking-tight opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <span>Get Started</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-200 group-hover:bg-[#4CAF50] transition-colors" />
        </div>
      </div>
    </Link>
  )
}
