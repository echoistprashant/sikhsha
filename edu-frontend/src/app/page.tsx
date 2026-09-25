'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BookOpen, GraduationCap, LayoutDashboard, LogIn, UserPlus, Presentation, ClipboardList, FileText, Library, MessageSquare, Target, CheckCircle, BarChart, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'

export default function LandingPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const isLoggedIn = isClient && localStorage.getItem('auth_token')

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-accent/20 opacity-20 blur-[100px]" />
      
      {/* Navbar */}
      <nav className="relative z-10 flex h-16 items-center justify-between px-6 border-b border-border bg-background/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
           <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-accent-foreground font-bold shadow-lg">
            E
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
            EduPlatform
          </span>
        </div>
        <div className="flex gap-3">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <LogIn className="w-4 h-4 mr-2" /> Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <UserPlus className="w-4 h-4 mr-2" /> Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center p-6 lg:p-12 relative z-10 space-y-24">
        
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-4xl mx-auto pt-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-badge inline-flex items-center rounded-full px-3 py-1 text-sm font-medium mb-4"
          >
            <span className="flex h-2 w-2 rounded-full bg-accent mr-2 animate-pulse"></span>
            System Operational
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-foreground"
          >
            AI-Powered Teaching & Learning System
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            A comprehensive educational platform that empowers teachers with AI-driven content generation tools and provides students with intelligent doubt-solving capabilities.
          </motion.p>
        </section>

        {/* Teacher Workspace - Dominant Section */}
        <section className="w-full max-w-6xl space-y-8">
          <div className="flex items-center gap-3 mb-8">
             <div className="glass-icon p-3 rounded-xl">
               <BookOpen className="w-8 h-8" />
             </div>
             <div>
               <h2 className="text-3xl font-bold text-foreground">Teacher Workspace</h2>
               <p className="text-muted-foreground">Generate comprehensive curriculum materials instantly</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-8 group relative overflow-hidden">
              <Presentation className="w-10 h-10 text-accent mb-4 group-hover:scale-110 transition-transform relative z-10" />
              <h3 className="text-2xl font-bold mb-2 relative z-10">AI Teaching Deck Generator</h3>
              <p className="text-muted-foreground relative z-10">Generate complete presentation decks from topic, subject, and grade level. Content is systematically saved as decks and slides in PostgreSQL.</p>
            </div>

            <div className="glass-card p-8 group relative overflow-hidden">
              <ClipboardList className="w-10 h-10 text-accent mb-4 group-hover:scale-110 transition-transform relative z-10" />
              <h3 className="text-2xl font-bold mb-2 relative z-10">AI Classroom Activity Generator</h3>
              <p className="text-muted-foreground relative z-10">Create hands-on classroom activities with necessary materials, step-by-step instructions, and clearly defined learning outcomes.</p>
            </div>

            <div className="glass-card p-8 group relative overflow-hidden">
              <FileText className="w-10 h-10 text-accent mb-4 group-hover:scale-110 transition-transform relative z-10" />
              <h3 className="text-2xl font-bold mb-2 relative z-10">AI Lesson Planner</h3>
              <p className="text-muted-foreground relative z-10">Generate structured, standards-aligned lesson plans featuring objectives, core concepts, learning sequence, assessments, and required resources.</p>
            </div>

            <div className="glass-card p-8 group relative overflow-hidden">
              <Library className="w-10 h-10 text-accent mb-4 group-hover:scale-110 transition-transform relative z-10" />
              <h3 className="text-2xl font-bold mb-2 relative z-10">Concept Library</h3>
              <p className="text-muted-foreground relative z-10">Browse and comprehensively search an expansive library of curriculum concepts, all backed by our robust structured data architecture.</p>
            </div>
          </div>
        </section>

        <div className="glass-divider w-full max-w-6xl" />

        {/* Student Learning Hub */}
        <section className="w-full max-w-6xl space-y-8">
          <div className="flex items-center gap-3 mb-8">
             <div className="glass-icon p-3 rounded-xl">
               <GraduationCap className="w-8 h-8" />
             </div>
             <div>
               <h2 className="text-3xl font-bold text-foreground">Student Learning Hub</h2>
               <p className="text-muted-foreground">Intelligent, 24/7 academic support and doubt resolution</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
              <MessageSquare className="w-8 h-8 text-foreground mb-4 relative z-10" />
              <h3 className="text-xl font-bold mb-2 relative z-10">Instant Text Doubt Solver</h3>
              <p className="text-sm text-muted-foreground relative z-10">AI-powered solutions with subject detection, related concepts, and context-aware follow-up capabilities.</p>
            </div>
            
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
              <Target className="w-8 h-8 text-foreground mb-4 relative z-10" />
              <h3 className="text-xl font-bold mb-2 relative z-10">Weak Area Identification</h3>
              <p className="text-sm text-muted-foreground relative z-10">Aggregates questions by subject to programmatically highlight areas where the student requires additional focus.</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
              <CheckCircle className="w-8 h-8 text-foreground mb-4 relative z-10" />
              <h3 className="text-xl font-bold mb-2 relative z-10">Similar Problems</h3>
              <p className="text-sm text-muted-foreground relative z-10">Suggests similar doubts and questions based on the identified subject, encouraging extensive practice.</p>
            </div>
          </div>
        </section>

        <div className="glass-divider w-full max-w-6xl" />

        {/* Management Dashboard */}
        <section className="w-full max-w-6xl space-y-8 pb-12">
           <div className="flex items-center gap-3 mb-8">
             <div className="glass-icon p-3 rounded-xl">
               <LayoutDashboard className="w-8 h-8" />
             </div>
             <div>
               <h2 className="text-3xl font-bold text-foreground">Management Dashboard</h2>
               <p className="text-muted-foreground">Comprehensive system oversight and analytics</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 flex items-start gap-4 rounded-2xl">
              <Users className="w-8 h-8 text-accent shrink-0" />
              <div>
                <h3 className="text-lg font-bold">Digital Attendance System</h3>
                <p className="text-sm text-muted-foreground">Record student attendance per class and date. Computes present, absent, late metrics, and overall attendance rates.</p>
              </div>
            </div>
            
            <div className="glass-panel p-6 flex items-start gap-4 rounded-2xl">
              <BarChart className="w-8 h-8 text-accent shrink-0" />
              <div>
                <h3 className="text-lg font-bold">Analytics Dashboard</h3>
                <p className="text-sm text-muted-foreground">Summaries for total users, generated decks, activities, doubts, and AI cost aggregations.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="w-full max-w-4xl mx-auto text-center pb-24 space-y-6">
           <h2 className="text-3xl font-bold text-foreground">Ready to Transform Education?</h2>
           <div className="flex justify-center gap-4">
             <div className="glass-button-wrap rounded-full w-48 h-12">
               <Link href="/signup" className="glass-button h-full">
                 <span className="glass-button-text">Get Started</span>
               </Link>
             </div>
             <div className="glass-button-wrap rounded-full w-48 h-12 opacity-80 hover:opacity-100">
               <Link href="/login" className="glass-button h-full">
                 <span className="glass-button-text">Sign In</span>
               </Link>
             </div>
           </div>
        </section>

      </main>
    </div>
  )
}
