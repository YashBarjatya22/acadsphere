import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import logo from "@/assets/studentos-logo.png";
import { useState, useEffect } from "react";
import {
  Brain,
  Compass,
  Calendar,
  FileCheck2,
  LineChart,
  ArrowRight,
  Code,
  Volume2,
  Users,
  Sparkles,
  Award,
  Zap,
  Globe,
  Lock,
  Sun,
  Moon,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  LayoutDashboard,
  User,
  Settings
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AcadSphere — The Premium AI Academic Operating System" },
      {
        name: "description",
        content:
          "AcadSphere is a journey-driven AI platform for student success: career roadmaps, smart notes, viva simulators, placement tracking, and more.",
      },
    ],
  }),
  component: Landing,
});

const STATS = [
  { value: "45,000+", label: "AI queries resolved" },
  { value: "98.2%", label: "Placement readiness rate" },
  { value: "12,000+", label: "Hours of focused study logged" },
  { value: "15+", label: "Engineering institutions integrated" }
];

const FEATURES = [
  { icon: LayoutDashboard, title: "Dashboard",          desc: "A single command center showing attendance, deadlines, AI insights, and progress at a glance.",      color: "from-blue-500 to-indigo-600" },
  { icon: Sparkles,        title: "AI Study Assistant", desc: "Interactive contextual explanations tailored directly to your syllabus subjects.",                     color: "from-violet-500 to-purple-600" },
  { icon: BookOpen,        title: "Smart Notes",        desc: "AI-powered notes with auto-summarisation, keyword highlights, and topic clustering.",                  color: "from-teal-500 to-cyan-600" },
  { icon: Calendar,        title: "Study Planner",      desc: "Spaced repetition schedules mapped intelligently around your academic deadlines.",                    color: "from-green-500 to-emerald-600" },
  { icon: Code,            title: "Lab Buddy",          desc: "Upload lab manuals and receive clean code templates, verification tests, and walkthroughs.",           color: "from-orange-500 to-amber-600" },
  { icon: Volume2,         title: "Viva Simulator",     desc: "Simulate rigorous oral examinations with AI questions, audio feedback, and score logs.",              color: "from-rose-500 to-red-600" },
  { icon: FileCheck2,      title: "Resume Builder",     desc: "ATS score optimisation, placement gap suggestions, and bullet-point editing.",                       color: "from-blue-500 to-sky-600" },
  { icon: LineChart,       title: "Placement Hub",      desc: "Manage company drives, check roadmap milestones, and track offers in one clean dashboard.",          color: "from-indigo-500 to-violet-600" },
  { icon: CalendarDays,    title: "CIA Reminder",       desc: "Never miss a CIA date — smart alerts with countdown timers keyed to your academic calendar.",        color: "from-amber-500 to-yellow-600" },
  { icon: CheckCircle2,    title: "Attendance Tracker", desc: "Real-time attendance percentage, subject-wise risk flags, and bunk budget calculator.",              color: "from-emerald-500 to-green-600" },
  { icon: Users,           title: "Community",          desc: "Connect with batchmates, share resources, ask questions, and collaborate on projects.",              color: "from-pink-500 to-rose-600" },
  { icon: User,            title: "Profile",            desc: "Maintain your academic profile, skill tags, certifications, and placement preferences centrally.",   color: "from-slate-500 to-gray-600" },
  { icon: Settings,        title: "Settings",           desc: "Personalise themes, notification channels, AI tuning, and linked integrations.",                    color: "from-zinc-500 to-neutral-600" },
];

const TESTIMONIALS = [
  {
    quote: "AcadSphere turned my exam prep from pure chaos into a structured game plan. The Viva simulator is scary accurate to what my externals asked.",
    author: "Aditya Verma",
    role: "MCA Student, RV College of Engineering"
  },
  {
    quote: "With the Resume Builder and Career Roadmap, I went from applying blindly to landing three interview rounds. It's like having a senior developer coaching you 24/7.",
    author: "Neha Sharma",
    role: "B.Tech CSE, SRM University"
  }
];

function Landing() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative flex items-center justify-center p-0.5 rounded-xl bg-gradient-to-tr from-blue-600 via-teal-400 to-indigo-600 shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
              <img src={logo} alt="AcadSphere Logo" className="h-8 w-8 rounded-[10px] relative bg-background p-1" />
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-teal-500 bg-clip-text text-transparent">
              AcadSphere
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Modules</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Impact</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="bg-primary hover:bg-blue-700 text-white">
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)]" />

        <div className="relative mx-auto max-w-7xl px-6 grid gap-12 lg:grid-cols-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>Version 2.0 · Professional Academic Workspace</span>
            </div>
            
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground leading-[1.1]">
              The premium academic operating system <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                built for high achievers.
              </span>
            </h1>
            
            <p className="mt-6 max-w-xl text-base text-muted-foreground leading-relaxed">
              Consolidate notes, career roadmaps, lab manuals, and mock examinations into a single unified workspace. Engineered with beautiful aesthetics, clean layouts, and high-performance AI engines.
            </p>
            
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/10">
                <Link to="/auth">
                  Start Your Academic Journey <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#features">Explore Modules</a>
              </Button>
            </div>
          </div>

          {/* Right Column: Advanced Glowing Official Logo Showcase & Mini Dashboard */}
          <div className="lg:col-span-5 hidden lg:flex flex-col gap-6">
            
            {/* Glowing Official Logo Showcase Card */}
            <div className="relative overflow-hidden p-8 rounded-3xl border border-border bg-card shadow-2xl flex flex-col items-center justify-center text-center group min-h-[300px]">
              {/* Spinning / Glowing animated background gradients */}
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-tr from-blue-500/20 to-teal-500/20 blur-3xl group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-gradient-to-tr from-indigo-500/20 to-rose-500/20 blur-3xl group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 via-transparent to-indigo-600/5 opacity-40 rounded-3xl" />
              
              {/* Advanced Glowing Logo Wrapper */}
              <div className="relative flex items-center justify-center p-1.5 rounded-3xl bg-gradient-to-tr from-blue-600 via-teal-400 to-indigo-600 shadow-2xl shadow-blue-500/40 transform group-hover:rotate-6 group-hover:scale-105 transition-all duration-500 mb-4 z-10">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-blue-600 via-teal-400 to-indigo-600 opacity-60 blur-xl group-hover:opacity-90 transition-opacity duration-500" />
                <img src={logo} alt="Official AcadSphere Logo" className="h-28 w-28 rounded-[20px] relative bg-background p-2.5" />
              </div>

              {/* Title & Badge */}
              <div className="space-y-1.5 z-10">
                <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-bold uppercase tracking-widest bg-gradient-to-r from-blue-500/5 to-indigo-500/5">
                  Official AcadSphere Identity
                </span>
              </div>
            </div>

            {/* Dashboard Mockup Summary */}
            <div className="relative p-2 rounded-2xl border border-border bg-card shadow-xl">
              <div className="bg-muted/40 rounded-xl p-4 border border-border/40">
                <div className="flex gap-1.5 mb-3">
                  <div className="h-2 w-2 rounded-full bg-red-400" />
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                </div>
                
                <div className="space-y-2 text-left">
                  <div className="h-8 bg-card border border-border rounded-lg flex items-center px-3 justify-between">
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase">STUDENT SUCCESS PROFILE</span>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">92% ATS score</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-card border border-border rounded-lg space-y-1">
                      <span className="text-[8px] font-semibold text-muted-foreground uppercase block">Viva readiness</span>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: "85%" }} />
                      </div>
                    </div>
                    <div className="p-2.5 bg-card border border-border rounded-lg">
                      <span className="text-[8px] font-semibold text-muted-foreground uppercase block mb-0.5">Note gaps</span>
                      <span className="text-[9px] font-bold text-amber-500">2 flagged topics</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Feature Catalog */}
      <section id="features" className="py-24 border-t border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-primary uppercase">Unified Platform</h2>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              13 engineered modules for every stage
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              A comprehensive toolset sharing academic context to optimise learning, verify gaps, and boost placement readiness — all inside one platform.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="group relative p-6 rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-primary/30"
                >
                  {/* Subtle gradient glow on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`} />

                  {/* Icon bubble with gradient */}
                  <div className={`relative h-11 w-11 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>

                  <h3 className="text-sm font-bold text-foreground">{feat.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats" className="py-20 border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((stat) => (
              <div key={stat.label} className="space-y-2">
                <p className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
                  {stat.value}
                </p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 border-t border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-primary uppercase">User Testimonials</h2>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Loved by serious engineering students
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="p-8 rounded-2xl border border-border bg-card flex flex-col justify-between shadow-sm">
                <p className="text-sm italic text-muted-foreground leading-relaxed">
                  "{t.quote}"
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">
                    {t.author[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{t.author}</h4>
                    <p className="text-[10px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Call to Action */}
      <section className="py-28 border-t border-border text-center bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/5 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_100%,transparent_100%)]" />
        <div className="relative mx-auto max-w-4xl px-6 space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Redefine your learning speed today.
          </h2>
          <p className="max-w-md mx-auto text-sm text-muted-foreground">
            Register your profile, configure your syllabus target role, and let AcadSphere build your success framework.
          </p>
          <div className="pt-4">
            <Button asChild size="lg" className="bg-primary hover:bg-blue-700 text-white px-8 shadow-lg shadow-blue-500/10">
              <Link to="/auth">
                Create Account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between px-6 py-12 gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={logo} alt="AcadSphere" className="h-5 w-5 rounded-md" />
            <span className="font-semibold text-foreground">AcadSphere Inc.</span>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-foreground">Modules</a>
            <a href="#testimonials" className="hover:text-foreground">Testimonials</a>
            <a href="#stats" className="hover:text-foreground">Impact</a>
          </div>
          <p className="font-mono text-[10px]">© 2026 AcadSphere. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
