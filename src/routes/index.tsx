import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import logo from "@/assets/studentos-logo.png";
import {
  Brain,
  Compass,
  FileSearch,
  Calendar,
  FileCheck2,
  Target,
  LineChart,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudentOS — Your AI Academic Operating System" },
      {
        name: "description",
        content:
          "6 AI modules for technical students: roadmaps, study plans, resume scoring, and notes analysis — in one chat.",
      },
    ],
  }),
  component: Landing,
});

const MODULES = [
  { icon: Compass, title: "Career Roadmap", desc: "Month-by-month plan to your target role." },
  { icon: FileSearch, title: "Paper Simplifier", desc: "Plain-English summaries and viva Q&A." },
  {
    icon: Calendar,
    title: "Study Planner",
    desc: "Spaced repetition timetable around your exams.",
  },
  { icon: FileCheck2, title: "Resume Analyzer", desc: "ATS score with rewrites and gap fixes." },
  {
    icon: Target,
    title: "Notes Gap Analyzer",
    desc: "Upload notes to scan for concept gaps, missing topics, or a clean bill of health.",
  },
  { icon: LineChart, title: "Analytics", desc: "Streak, readiness score, and learning velocity." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute left-1/2 top-0 -z-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-6 pt-24 pb-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs font-mono text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> v1.0 · 6 modules online
          </div>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            The <span className="text-gradient">academic operating system</span>
            <br />
            for serious students.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Mentor, study partner, career advisor, and placement coach — fused into one chat. Built
            for MCA, BCA, and B.Tech.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="glow-primary">
              <Link to="/auth">
                Launch StudentOS <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#modules">Explore 6 modules</a>
            </Button>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section id="modules" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">// modules</p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">
              Six tools. One chat.
            </h2>
          </div>
          <p className="hidden max-w-sm text-sm text-muted-foreground md:block">
            Every module shares your context — degree, skills, target role, exam dates — so nothing
            repeats.
          </p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {MODULES.map(({ icon: Icon, title, desc }, i) => {
            const isResumeAnalyzer = title === "Resume Analyzer";
            const isCareerRoadmap = title === "Career Roadmap";
            const CardContent = (
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
            );

            if (isResumeAnalyzer) {
              return (
                <a
                  key={title}
                  href="http://localhost:8502"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-surface p-6 transition-colors hover:bg-card block cursor-pointer"
                >
                  {CardContent}
                </a>
              );
            }

            if (isCareerRoadmap) {
              return (
                <a
                  key={title}
                  href="http://localhost:8501"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-surface p-6 transition-colors hover:bg-card block cursor-pointer"
                >
                  {CardContent}
                </a>
              );
            }

            return (
              <div
                key={title}
                className="group relative bg-surface p-6 transition-colors hover:bg-card"
              >
                {CardContent}
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="border-y border-border bg-surface/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-3">
          <div className="md:col-span-3 max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">// workflow</p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">
              A simple loop that keeps improving you.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Share your background once, then let StudentOS turn notes, goals, and tasks into
              concrete next moves.
            </p>
          </div>
          {[
            {
              step: "01",
              title: "Set your profile",
              desc: "Add your degree, current skills, target role, and exam dates.",
            },
            {
              step: "02",
              title: "Ask for help",
              desc: "Build a roadmap, scan notes for gaps, or get a topic explained in plain English.",
            },
            {
              step: "03",
              title: "Review the gap",
              desc: "StudentOS highlights missing concepts, weak areas, or the next best action.",
            },
            {
              step: "04",
              title: "Keep momentum",
              desc: "Every useful response updates your readiness and keeps the next step obvious.",
            },
          ].map((s) => (
            <div key={s.step}>
              <div className="font-mono text-sm text-primary">{s.step}</div>
              <h3 className="mt-2 font-display text-2xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STACK */}
      <section
        id="stack"
        className="mx-auto max-w-7xl px-6 py-20 border-y border-border bg-surface/10"
      >
        <div className="mx-auto max-w-4xl">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">// stack</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">Tech Stack</h2>
          <p className="mt-4 text-muted-foreground">
            Built with modern, fast tooling to keep StudentOS responsive and scalable:
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-card p-4 text-sm font-medium">React + TypeScript</div>
            <div className="rounded-lg bg-card p-4 text-sm font-medium">Vite</div>
            <div className="rounded-lg bg-card p-4 text-sm font-medium">Tailwind CSS</div>
            <div className="rounded-lg bg-card p-4 text-sm font-medium">Supabase</div>
            <div className="rounded-lg bg-card p-4 text-sm font-medium">
              TanStack Router & Query
            </div>
            <div className="rounded-lg bg-card p-4 text-sm font-medium">
              AI SDKs & Serverless funcs
            </div>
          </div>
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
            <Link to="/auth">
              Create your account <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
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
