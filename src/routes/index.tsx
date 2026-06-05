import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import logo from "@/assets/studentos-logo.png";
import {
  Brain,
  Compass,
  FileSearch,
  Calendar,
  FolderSearch,
  FileCheck2,
  MessagesSquare,
  Target,
  Layers,
  Briefcase,
  GraduationCap,
  LineChart,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudentOS — Your AI Academic Operating System" },
      { name: "description", content: "12 AI modules for technical students: roadmaps, study plans, resume scoring, mock interviews, projects, and placement prep — in one chat." },
    ],
  }),
  component: Landing,
});

const MODULES = [
  { icon: Compass, title: "Career Roadmap", desc: "Month-by-month plan to your target role." },
  { icon: Brain, title: "YouTube Assistant", desc: "Notes, flashcards, and quizzes from any video." },
  { icon: FileSearch, title: "Paper Simplifier", desc: "Plain-English summaries and viva Q&A." },
  { icon: Calendar, title: "Study Planner", desc: "Spaced repetition timetable around your exams." },
  { icon: FolderSearch, title: "Notes Vault", desc: "Semantic search across everything you save." },
  { icon: FileCheck2, title: "Resume Analyzer", desc: "ATS score with rewrites and gap fixes." },
  { icon: MessagesSquare, title: "Mock Interview", desc: "Adaptive HR, technical & aptitude rounds." },
  { icon: Target, title: "Skill Gap Analyzer", desc: "Visual gap matrix vs target role." },
  { icon: Layers, title: "Project Ideas", desc: "Recruiter-impressive builds with architecture." },
  { icon: Briefcase, title: "Placement Hub", desc: "Track applications, OAs, rounds, and offers." },
  { icon: GraduationCap, title: "Academic Tutor", desc: "DBMS, OS, CN, DAA, ML — explained for exams." },
  { icon: LineChart, title: "Analytics", desc: "Streak, readiness score, and learning velocity." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="StudentOS" width={32} height={32} className="h-8 w-8" />
            <span className="font-display text-lg font-semibold tracking-tight">StudentOS</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#modules" className="hover:text-foreground">Modules</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#stack" className="hover:text-foreground">Stack</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
            <Button asChild size="sm"><Link to="/auth">Get started</Link></Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute left-1/2 top-0 -z-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-6 pt-24 pb-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs font-mono text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> v1.0 · 12 modules online
          </div>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            The <span className="text-gradient">academic operating system</span>
            <br />for serious students.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Mentor, study partner, career advisor, and placement coach — fused into one chat.
            Built for MCA, BCA, and B.Tech.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="glow-primary">
              <Link to="/auth">Launch StudentOS <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#modules">Explore 12 modules</a>
            </Button>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section id="modules" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">// modules</p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">Twelve tools. One chat.</h2>
          </div>
          <p className="hidden max-w-sm text-sm text-muted-foreground md:block">
            Every module shares your context — degree, skills, target role, exam dates — so nothing repeats.
          </p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {MODULES.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="group relative bg-surface p-6 transition-colors hover:bg-card">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    M{String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-1 font-display text-lg font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="border-y border-border bg-surface/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-3">
          {[
            { step: "01", title: "Tell it about you", desc: "Degree, current skills, target role, exam dates." },
            { step: "02", title: "Ask any module", desc: "“Build my placement roadmap.” “Score my resume.” “Mock interview me.”" },
            { step: "03", title: "Compound progress", desc: "Every answer raises your placement readiness score." },
          ].map((s) => (
            <div key={s.step}>
              <div className="font-mono text-sm text-primary">{s.step}</div>
              <h3 className="mt-2 font-display text-2xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-28 text-center">
        <h2 className="font-display text-4xl font-semibold md:text-5xl">
          Your next interview starts <span className="text-gradient">today</span>.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Free to start. No credit card. Just a sharper version of you, one chat at a time.
        </p>
        <div className="mt-8">
          <Button asChild size="lg" className="glow-primary">
            <Link to="/auth">Create your account <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" width={20} height={20} className="h-5 w-5" />
            <span>StudentOS</span>
          </div>
          <span className="font-mono text-xs">v1.0 · built for students</span>
        </div>
      </footer>
    </div>
  );
}
