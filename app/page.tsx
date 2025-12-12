import Link from "next/link";
import {
  ArrowUpRight,
  Github,
  Linkedin,
  Rocket,
  Sparkle,
  Wrench,
} from "lucide-react";
import { Metadata } from "next";

const pillars = [
  {
    title: "Crafting With Purpose",
    description:
      "Every project is designed with clarity, performance, and accessibility in mind — no filler, just thoughtful experiences.",
    icon: Rocket,
  },
  {
    title: "Building In Public",
    description:
      "From architecture notes to debugging wins, follow the journey as I share what I learn in real time.",
    icon: Sparkle,
  },
  {
    title: "Engineering Momentum",
    description:
      "Expect deep dives into React, Next.js, and the tooling I rely on to ship polished digital products.",
    icon: Wrench,
  },
];

const milestones = [
  {
    label: "Phase 01",
    title: "Personal brand refresh",
    detail: "Visual identity, typography system, and component language",
    status: "in-progress",
  },
  {
    label: "Phase 02",
    title: "Project case studies",
    detail: "Narratives that unpack design process, architecture, and impact",
    status: "queued",
  },
  {
    label: "Phase 03",
    title: "Interactive playground",
    detail: "Live demos, code snippets, and tooling experiments",
    status: "queued",
  },
];

export const metadata = {
  title: "Home",
  description: "Portfolio website of Hardik Desai",
};

export default function Page() {
  return (
    <div className="relative overflow-hidden bg-vista-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(69,123,157,0.12),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom,_rgba(230,57,70,0.08),_transparent_60%)]" />

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <header className="relative overflow-hidden rounded-3xl border border-oxford-navy/10 bg-white/90 p-10 text-center shadow-xl backdrop-blur">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-honeydew via-transparent to-frosted-blue/20" />
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-cerulean shadow-sm ring-1 ring-cerulean/10">
            In Construction Mode
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-oxford-navy sm:text-5xl">
            A refreshed portfolio experience is on its way
          </h1>
          <p className="mt-4 text-lg text-oxford-navy/70 sm:text-xl">
            I&apos;m rebuilding my digital home from the ground up — thoughtful
            case studies, living style guides, and stories from the trenches.
            Until everything is in place, you can still explore the latest
            articles and notes over in the blog.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-oxford-navy/70">
            <div className="rounded-full bg-honeydew/60 px-4 py-2 shadow-sm ring-1 ring-cerulean/10">
              Currently polishing the layout system and interactions
            </div>
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 rounded-full border border-cerulean/30 bg-white/80 px-5 py-2 text-sm font-semibold text-cerulean transition-colors hover:border-cerulean/50 hover:text-punch-red"
            >
              Visit the blog while I build
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {pillars.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-oxford-navy/10 bg-white/80 p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-honeydew via-transparent to-frosted-blue/30 opacity-0 transition duration-300 group-hover:opacity-100" />
                <Icon className="h-8 w-8 text-cerulean" aria-hidden />
                <h2 className="mt-4 text-xl font-semibold text-oxford-navy">
                  {title}
                </h2>
                <p className="mt-2 text-sm text-oxford-navy/70">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </header>

        <section className="mt-16 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div className="relative overflow-hidden rounded-3xl border border-oxford-navy/10 bg-white/95 p-8 shadow-lg backdrop-blur">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-honeydew/40 to-frosted-blue/20" />
            <h2 className="text-2xl font-semibold text-oxford-navy">
              What&apos;s shipping first
            </h2>
            <p className="mt-3 text-oxford-navy/70">
              I&apos;m layering this build in focused sprints. Here&apos;s how
              the roadmap is shaping up.
            </p>

            <div className="mt-8 space-y-6">
              {milestones.map(({ label, title, detail, status }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-cerulean/15 bg-white/80 p-6 shadow-sm transition duration-300 hover:border-cerulean/30"
                >
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-oxford-navy/60">
                    <span>{label}</span>
                    <span
                      className={
                        status === "in-progress"
                          ? "text-cerulean"
                          : "text-oxford-navy/40"
                      }
                    >
                      {status === "in-progress" ? "In progress" : "Queued"}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-oxford-navy">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm text-oxford-navy/70">{detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-oxford-navy/10 bg-white/95 p-6 shadow-lg backdrop-blur">
              <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-punch-red/10 via-transparent to-transparent" />
              <h2 className="text-xl font-semibold text-oxford-navy">
                Stay looped in
              </h2>
              <p className="mt-3 text-sm text-oxford-navy/70">
                The quickest way to see progress snapshots, code drops, and new
                articles as they land.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <a
                  href="https://github.com/hardik-143"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between rounded-xl border border-cerulean/20 bg-white/80 px-4 py-3 text-sm font-semibold text-oxford-navy transition hover:border-cerulean/40 hover:text-cerulean"
                >
                  <span className="flex items-center gap-2">
                    <Github className="h-4 w-4" aria-hidden />
                    GitHub
                  </span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href="https://www.linkedin.com/in/thehardik143/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between rounded-xl border border-cerulean/20 bg-white/80 px-4 py-3 text-sm font-semibold text-oxford-navy transition hover:border-cerulean/40 hover:text-cerulean"
                >
                  <span className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" aria-hidden />
                    LinkedIn
                  </span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-dashed border-cerulean/25 bg-white/90 p-6 text-center shadow-sm">
              <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-honeydew/40 via-transparent to-frosted-blue/30" />
              <p className="text-sm font-semibold uppercase tracking-wide text-cerulean">
                A quick peek ahead
              </p>
              <p className="mt-4 text-oxford-navy/70">
                This space will evolve into a living hub — expect animations,
                project timelines, and hands-on demos.
              </p>
              <p className="mt-4 text-xs text-oxford-navy/50">
                You&apos;re early. Thanks for being here.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
