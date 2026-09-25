import {
  BarChart3,
  BookOpenCheck,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  HelpCircle,
  Layers3,
  Mail,
  Presentation,
  School,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

const verifiedSources = [
  "EDU teacher workspace",
  "EDU student learning hub",
  "EDU management dashboard",
  "StudentERP school operations",
];

const platformFeatures = [
  {
    icon: Users,
    title: "Admissions and user records",
    copy: "Manage schools, users, roles, classes, student records, guardians, documents, and tenant-specific access from one platform.",
  },
  {
    icon: CalendarCheck,
    title: "Attendance and class operations",
    copy: "Record attendance by class and date, review attendance statistics, and keep daily school operations tied to the right school account.",
  },
  {
    icon: BarChart3,
    title: "Analytics for school teams",
    copy: "View summaries for users, teaching content, student doubts, attendance, feature usage, popular topics, and AI cost tracking.",
  },
  {
    icon: UserCog,
    title: "Role-based workspaces",
    copy: "Give super admins, school admins, teachers, and students only the workspace and data their role is allowed to access.",
  },
];

const teacherFeatures = [
  {
    icon: Presentation,
    title: "AI teaching decks",
    copy: "Generate and store structured teaching decks from topic, subject, grade level, and slide requirements.",
  },
  {
    icon: BookOpenCheck,
    title: "Lesson planning",
    copy: "Create lesson plans with objectives, concepts, teaching sequence, assessments, and resources.",
  },
  {
    icon: ClipboardList,
    title: "Classroom activities",
    copy: "Generate activity ideas with materials, steps, duration, learning outcomes, and classroom instructions.",
  },
  {
    icon: FileText,
    title: "Question generation",
    copy: "Use curriculum-aware teacher tools for question generation and content preparation workflows.",
  },
];

const studentFeatures = [
  "Text-based doubt solving with subject detection and related concepts",
  "Follow-up questions on previous doubts using stored context",
  "Doubt history for students to revisit past explanations",
  "Weak-area signals and similar problems for extra practice",
];

const productionNotes = [
  "Image and voice doubt endpoints exist, but OCR/transcription solving is not marketed here as production-ready.",
  "Bulk user import is present as an admin workflow but should be described carefully until final CSV import handling is complete.",
  "The page avoids invented school names, customer counts, fee totals, attendance percentages, and unsupported testimonials.",
];

const replacementMap = [
  ["Fee registers and receipts", "StudentERP fees workflows with online/offline payment support"],
  ["Attendance sheets", "Digital class/date attendance records and statistics"],
  ["Disconnected AI tools", "Teacher content generation saved to the school account"],
  ["Repeated student explanations", "Doubt history, follow-ups, weak areas, and similar problems"],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fbfcfe] text-[#101828]">
      <Navbar />

      <section className="scroll-mt-24 border-b border-[#d7dde7] bg-[#f6f8fb] pt-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-14 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:pb-16">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase text-[#1f6feb]">
              School ERP and AI learning platform
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-[#0b1220] sm:text-5xl lg:text-6xl">
              Sikhsha connects school operations with practical AI for teachers and students.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#526070]">
              Run attendance, user management, school analytics, teacher content generation, lesson planning, and student text-doubt support from role-based workspaces built for real school workflows.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="mailto:sales@sikhsha.ai?subject=Sikhsha%20product%20walkthrough"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#0b1220] px-6 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(16,24,40,0.18)] transition hover:bg-[#172033] focus:outline-none focus:ring-2 focus:ring-[#1f6feb] focus:ring-offset-2"
              >
                <Mail size={18} aria-hidden="true" />
                Book a walkthrough
              </a>
              <a
                href="/sikhsha-brochure.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[#1f6feb] bg-white px-6 text-sm font-semibold text-[#1f6feb] transition hover:bg-[#eef5ff] focus:outline-none focus:ring-2 focus:ring-[#1f6feb] focus:ring-offset-2"
              >
                <FileText size={18} aria-hidden="true" />
                Open brochure
              </a>
              <a
                href="#features"
                className="inline-flex h-12 items-center justify-center rounded-md border border-[#b9c2d0] bg-white px-6 text-sm font-semibold text-[#101828] transition hover:border-[#0b1220] focus:outline-none focus:ring-2 focus:ring-[#1f6feb] focus:ring-offset-2"
              >
                Review features
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-2" aria-label="Feature sources used for this page">
              {verifiedSources.map((source) => (
                <span key={source} className="rounded-md border border-[#cdd6e3] bg-white px-3 py-2 text-sm font-medium text-[#475467]">
                  {source}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#cad3df] bg-white p-5 shadow-[0_24px_70px_rgba(16,24,40,0.12)]">
            <div className="flex items-start gap-3 border-b border-[#e4e8ee] pb-5">
              <School className="mt-1 text-[#1f6feb]" size={24} aria-hidden="true" />
              <div>
                <h2 className="text-xl font-semibold text-[#101828]">What a school can run in Sikhsha</h2>
                <p className="mt-2 text-sm leading-6 text-[#667085]">
                  A production-safe snapshot of supported workflows, without fabricated dashboards or vanity numbers.
                </p>
              </div>
            </div>
            <div className="grid gap-3 py-5 sm:grid-cols-2">
              {["School setup", "Users and roles", "Attendance", "Analytics", "Decks", "Lesson plans", "Activities", "Text doubts"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-md border border-[#e1e6ee] bg-[#fbfcfe] px-4 py-3 text-sm font-semibold text-[#344054]">
                  <CheckCircle2 className="shrink-0 text-[#0f766e]" size={18} aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
            <div className="rounded-md border border-[#d8e4ff] bg-[#f6f9ff] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1d3d7c]">
                <Layers3 size={18} aria-hidden="true" />
                Connected workflow
              </div>
              <p className="mt-3 text-sm leading-6 text-[#344054]">
                Admins manage schools and users, teachers generate and store learning content, students ask text doubts and follow-ups, and school leaders review attendance, usage, and learning activity.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <h2 className="text-3xl font-semibold leading-tight text-[#0b1220] sm:text-4xl">
              Features grounded in the existing product.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#526070]">
              The page now talks about what the EDU and StudentERP codebases actually support, keeping unfinished capabilities out of the main sales promise.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {platformFeatures.map((feature) => (
              <article key={feature.title} className="rounded-md border border-[#dde3ec] bg-white p-6 shadow-sm">
                <feature.icon className="text-[#1f6feb]" size={24} aria-hidden="true" />
                <h3 className="mt-5 text-xl font-semibold text-[#101828]">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5f6c7b]">{feature.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="ai" className="scroll-mt-24 border-y border-[#d7dde7] bg-[#102033] text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <div>
            <GraduationCap size={34} className="text-[#9fe7d7]" aria-hidden="true" />
            <h2 className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl">
              AI support where it belongs: inside teaching and learning work.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#c7d0dc]">
              Sikhsha keeps AI practical: help teachers prepare lessons and help students continue learning through text doubts, follow-ups, and practice prompts.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {teacherFeatures.map((feature) => (
              <article key={feature.title} className="rounded-md border border-white/15 bg-white/7 p-5">
                <feature.icon className="text-[#9fe7d7]" size={23} aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#d9e2ed]">{feature.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="student" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <HelpCircle className="text-[#1f6feb]" size={32} aria-hidden="true" />
            <h2 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
              Student support without overstating unfinished AI.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#526070]">
              The safe production promise is text-first doubt support with history, follow-ups, weak-area tracking, and similar practice problems.
            </p>
          </div>
          <div className="space-y-3">
            {studentFeatures.map((feature) => (
              <div key={feature} className="flex gap-4 rounded-md border border-[#dde3ec] bg-white p-5 shadow-sm">
                <CheckCircle2 className="mt-0.5 shrink-0 text-[#0f766e]" size={20} aria-hidden="true" />
                <p className="text-base leading-7 text-[#344054]">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="buyers" className="scroll-mt-24 border-y border-[#d7dde7] bg-[#eef3f8] px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="text-3xl font-semibold leading-tight text-[#0b1220] sm:text-4xl">
              What Sikhsha replaces.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#526070]">
              The sales message is now anchored in operational pain buyers already understand, then connects that pain to existing product workflows.
            </p>
          </div>
          <div className="overflow-hidden rounded-md border border-[#ccd6e3] bg-white">
            {replacementMap.map(([oldWay, newWay]) => (
              <div key={oldWay} className="grid gap-3 border-t border-[#e4e8ee] p-5 first:border-t-0 sm:grid-cols-[0.85fr_1.15fr]">
                <div className="text-sm font-semibold text-[#667085]">{oldWay}</div>
                <div className="text-sm leading-6 text-[#344054]">{newWay}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="readiness" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <ShieldCheck className="text-[#0f766e]" size={32} aria-hidden="true" />
            <h2 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
              Production copy guardrails.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#526070]">
              A production landing page should build trust by being specific, restrained, and honest about what is ready now.
            </p>
          </div>
          <div className="grid gap-4">
            {productionNotes.map((note) => (
              <div key={note} className="rounded-md border border-[#dde3ec] bg-white p-5 shadow-sm">
                <p className="text-base leading-7 text-[#344054]">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="scroll-mt-24 bg-[#0b1220] px-5 py-16 text-white sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Walk through the real product, not a staged story.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#c7d0dc]">
              Use the demo to show school setup, role-based access, attendance, analytics, teacher AI workflows, and text-doubt support with the current product state.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <a
              href="mailto:sales@sikhsha.ai?subject=Sikhsha%20product%20walkthrough"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-6 text-sm font-semibold text-[#0b1220] transition hover:bg-[#edf2f7] focus:outline-none focus:ring-2 focus:ring-[#9fe7d7] focus:ring-offset-2 focus:ring-offset-[#0b1220]"
            >
              <Mail size={18} aria-hidden="true" />
              Book walkthrough
            </a>
            <a
              href="/sikhsha-brochure.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/45 px-6 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#9fe7d7] focus:ring-offset-2 focus:ring-offset-[#0b1220]"
            >
              <FileText size={18} aria-hidden="true" />
              Open brochure
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#d7dde7] bg-white px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-[#667085] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-semibold text-[#101828]">
            <GraduationCap size={20} aria-hidden="true" />
            Sikhsha
          </div>
          <div>School ERP, AI teaching tools, and text-based student learning support.</div>
        </div>
      </footer>
    </main>
  );
}
