import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import { usePublicLeaderboard } from "@/hooks/use-profiles";
import { DEPT_MAP } from "@/lib/constants";
import {
  CONFERENCE_URL,
  HERO_URL,
  LOGO_URL,
  STUDENT_AVATARS,
} from "@/components/branding";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "IEEE Student Ambassador Program | Lead Your Campus" },
      {
        name: "description",
        content:
          "Become an IEEE Student Ambassador: build leadership skills, join 2,000+ ambassadors worldwide and earn global recognition.",
      },
      { property: "og:title", content: "IEEE Student Ambassador Program" },
      {
        property: "og:description",
        content:
          "Empower your student community, gain leadership skills and earn recognition with IEEE.",
      },
      { property: "og:image", content: HERO_URL },
      { name: "twitter:image", content: HERO_URL },
    ],
  }),
});

const STATS = [
  { value: "500+", label: "Active Volunteers" },
  { value: "1.2k+", label: "Tasks Completed" },
  { value: "50+", label: "Global Regions" },
  { value: "10k+", label: "Impacted Students" },
];

const BENEFITS = [
  {
    icon: "hub",
    title: "Professional Networking",
    body: "Connect with industry leaders, distinguished lecturers, and fellow passionate students from across the globe.",
    cta: "Explore Network",
  },
  {
    icon: "trending_up",
    title: "Skill Development",
    body: "Hone your leadership, communication, and project management skills by organizing local and regional events.",
    cta: "View Training",
  },
  {
    icon: "workspace_premium",
    title: "Global Recognition",
    body: "Earn official certificates, digital badges, and exclusive awards that highlight your dedication on your resume.",
    cta: "See Awards",
  },
  {
    icon: "library_books",
    title: "Exclusive Resources",
    body: "Gain access to premium IEEE publications, technical standards, and career development tools to accelerate your path.",
    cta: "Browse Library",
  },
];

function Landing() {
  return (
    <div className="bg-surface text-on-surface">
      <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 max-w-7xl mx-auto px-4 lg:px-[40px] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:flex md:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <img alt="IEEE Student Ambassador logo" className="h-8 w-auto shrink-0 object-contain" src={LOGO_URL} />
            <span className="truncate text-headline-md font-semibold text-primary">
              <span className="sm:hidden">IEEE SA</span>
              <span className="hidden sm:inline">IEEE Ambassador</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-label-md text-label-md">
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#benefits">
              Benefits
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors" href="#stats">
              Stats
            </a>
            <Link className="text-on-surface-variant hover:text-primary transition-colors" to="/gallery">
              Gallery
            </Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors" to="/dashboard">
              Portal
            </Link>
          </nav>
          <div className="flex shrink-0 items-center gap-1 sm:gap-3 font-label-md text-label-md">
            <Link
              to="/login"
              className="text-on-surface-variant px-3 py-2 rounded-lg hover:text-primary hover:bg-surface-container transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-primary text-on-primary px-4 sm:px-6 py-2 rounded-lg shadow-sm hover:bg-primary-container transition-all"
            >
              Register
            </Link>
          </div>
        </div>
      </header>


      <main className="w-full pt-16">
        <div className="flex flex-col w-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[60vw] max-w-[800px] aspect-square bg-primary-fixed/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[55vw] max-w-[600px] aspect-square bg-secondary-fixed/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

          <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-[40px] pt-10 pb-12 lg:pt-[120px] lg:pb-[100px] flex flex-col lg:flex-row items-center gap-10 lg:gap-12 z-10">
            <div className="w-full lg:w-1/2 flex flex-col gap-5 items-start">
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary-fixed rounded-full text-on-primary-fixed font-label-sm text-label-sm uppercase tracking-wider">
                <Icon name="stars" className="text-[16px]" />
                <span>Global Student Network</span>
              </div>
              <h1 className="text-display-lg text-on-surface text-balance">
                Become an
                <span className="text-primary block mt-1">IEEE Student Ambassador.</span>
              </h1>
              <p className="text-body-md sm:text-body-lg text-on-surface-variant max-w-[32rem]">
                Empower your student community, gain leadership skills, and earn recognition through
                the world's largest technical professional organization.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto mt-2 font-label-md text-label-md">
                <Link
                  to="/register"
                  className="bg-primary hover:bg-primary-container text-on-primary px-6 sm:px-8 py-3.5 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  Register Now
                  <Icon name="arrow_forward" className="text-[20px]" />
                </Link>
                <a
                  href="#benefits"
                  className="bg-surface hover:bg-surface-container text-primary px-6 sm:px-8 py-3.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ring-1 ring-primary/20 flex items-center justify-center"
                >
                  Learn More
                </a>
              </div>
              <div className="mt-6 flex items-center gap-4 border-t border-outline-variant pt-6 w-full max-w-[28rem]">
                <div className="flex -space-x-3 sm:-space-x-4 shrink-0">
                  {STUDENT_AVATARS.map((src) => (
                    <img
                      key={src}
                      alt="IEEE student ambassador"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-surface object-cover shadow-sm"
                      src={src}
                    />
                  ))}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-surface bg-surface-container-high flex items-center justify-center text-on-surface-variant font-label-sm text-label-sm shadow-sm">
                    +2k
                  </div>
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                    Join 2,000+ Ambassadors
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Worldwide network
                  </span>
                </div>
              </div>
            </div>



            <div className="w-full lg:w-1/2 relative mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-2xl rotate-3 scale-105 pointer-events-none" />
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl group">
                <img
                  alt="Engineering students collaborating in a university innovation center"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src={HERO_URL}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 bg-surface/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-outline-variant/40 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                      <Icon name="school" />
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-semibold">
                        Shape the Future
                      </p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        Lead initiatives on your campus
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="stats" className="w-full bg-surface-container-lowest py-10 sm:py-12 relative z-10 border-y border-outline-variant/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-[40px]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
                {STATS.map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col items-center md:items-start text-center md:text-left rounded-xl bg-surface-container/60 md:bg-transparent p-4 md:p-0"
                  >
                    <span className="text-display-lg text-primary mb-1">{s.value}</span>
                    <span className="font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-on-surface-variant uppercase tracking-wide">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            id="benefits"
            className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-[40px] py-12 lg:py-[100px] relative z-10"
          >
            <div className="flex flex-col items-center text-center mb-8 lg:mb-12 max-w-[42rem] mx-auto">
              <h2 className="text-headline-lg text-on-surface mb-3 text-balance">Why Become an Ambassador?</h2>
              <p className="text-body-md text-on-surface-variant">
                Unlock a world of opportunities to grow personally and professionally while making a
                tangible impact on the engineering community.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

              {BENEFITS.map((b) => (
                <div
                  key={b.title}
                  className="group bg-surface-container rounded-xl p-6 flex flex-col gap-4 hover:bg-surface-container-high hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    <Icon name={b.icon} filled />
                  </div>
                  <h3 className="text-headline-md text-on-surface">{b.title}</h3>
                  <p className="text-body-md text-on-surface-variant grow">{b.body}</p>
                  <div className="mt-auto pt-4 border-t border-outline-variant/50">
                    <span className="font-label-sm text-label-sm text-primary group-hover:underline flex items-center gap-1">
                      {b.cta}
                      <Icon name="chevron_right" className="text-[14px]" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Public Leaderboard ──────────────────────────── */}
          <PublicLeaderboardSection />

          <section className="w-full relative min-h-[340px] py-16 lg:h-[500px] overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${CONFERENCE_URL}')` }}
            />
            <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
            <div className="relative lg:absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 z-10">
              <img
                alt="IEEE Student Ambassador logo"
                className="h-16 sm:h-24 w-auto mb-5 sm:mb-6 drop-shadow-lg"
                src={LOGO_URL}
              />
              <h2 className="text-headline-lg text-on-primary max-w-[48rem] text-balance drop-shadow-md">
                "Being an ambassador connected me with mentors who changed the trajectory of my
                career."
              </h2>
              <p className="font-label-sm sm:font-label-md text-label-sm sm:text-label-md text-primary-fixed mt-4 tracking-wider uppercase">
                Sarah J. — Region 8 Ambassador
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full bg-surface-container-low py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-[40px]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-5 border-b border-outline-variant pb-6 mb-6">
            <img alt="IEEE logo" className="h-6 w-auto grayscale opacity-70" src={LOGO_URL} />
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 sm:gap-8 text-body-md">
              <a className="text-on-surface-variant hover:text-primary" href="#">
                Privacy
              </a>
              <a className="text-on-surface-variant hover:text-primary" href="#">
                Terms
              </a>
              <a className="text-on-surface-variant hover:text-primary" href="https://www.ieee.org">
                IEEE.org
              </a>
            </div>
          </div>
          <div className="text-center font-label-sm text-label-sm text-on-surface-variant text-balance">
            © 2024 IEEE. All rights reserved. Professional organization for advancement of technology.
          </div>
        </div>
      </footer>

    </div>
  );
}

function PublicLeaderboardSection() {
  const { data, isLoading, isError, error } = usePublicLeaderboard();

  if (isLoading) {
    return (
      <section className="w-full py-16 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-[40px]">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface-container rounded w-64 mx-auto" />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64 bg-surface-container rounded-xl" />
              <div className="h-64 bg-surface-container rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // RLS or network error — show a subtle notice instead of vanishing
  if (isError) {
    console.error("[PublicLeaderboard] Failed to load:", error);
    return (
      <section id="leaderboard" className="w-full py-16 bg-surface-container-low/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-[40px] text-center">
          <p className="text-body-sm text-on-surface-variant opacity-60">
            Leaderboard temporarily unavailable. Please check back soon.
          </p>
        </div>
      </section>
    );
  }

  const topClass = data?.class ?? [];
  const topDept = data?.dept?.[0];

  if (topClass.length === 0 && !topDept) return null;

  return (
    <section id="leaderboard" className="w-full py-16 bg-surface-container-low/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-[40px]">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary-fixed rounded-full text-on-primary-fixed font-label-sm text-label-sm uppercase tracking-wider mb-4">
            <Icon name="leaderboard" className="text-[16px]" />
            <span>Top Ambassadors</span>
          </div>
          <h2 className="text-headline-lg text-on-surface">Our Rising Stars</h2>
          <p className="text-body-md text-on-surface-variant mt-2 max-w-2xl mx-auto">
            Recognizing our most active and dedicated ambassadors making a difference.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Top 5 Class Ambassadors */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/50 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="school" className="text-primary" />
              <h3 className="text-headline-md text-on-surface">Class Ambassadors</h3>
            </div>
            <div className="space-y-3">
              {topClass.map((p, i) => {
                const initials = (p.full_name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-surface-container/50 transition-colors"
                  >
                    <span className="w-8 text-center font-bold text-on-surface-variant shrink-0">
                      {i < 3 ? medals[i] : <span className="text-body-md">{i + 1}</span>}
                    </span>
                    {p.avatar_url ? (
                      <img alt={p.full_name} className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-surface-variant" src={p.avatar_url} />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-label-sm font-bold shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-body-md text-on-surface font-semibold truncate">{p.full_name}</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {DEPT_MAP[p.department] || p.department} · Sem {p.semester}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-primary font-bold shrink-0">
                      <Icon name="stars" className="text-[16px]" />
                      <span className="text-body-md">{p.points.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Dept Ambassador */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/50 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="domain" className="text-secondary" />
              <h3 className="text-headline-md text-on-surface">Department Ambassador</h3>
            </div>
            {topDept ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <div className="relative mb-4">
                  {topDept.avatar_url ? (
                    <img
                      alt={topDept.full_name}
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-secondary/30"
                      src={topDept.avatar_url}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary text-2xl font-bold ring-4 ring-secondary/30">
                      {(topDept.full_name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -top-1 -right-1 text-2xl">🏆</span>
                </div>
                <h4 className="text-headline-md text-on-surface font-bold">{topDept.full_name}</h4>
                <p className="text-body-md text-on-surface-variant mt-1">
                  {DEPT_MAP[topDept.department] || topDept.department}
                </p>
                {topDept.ambassador_id && (
                  <p className="font-label-sm text-label-sm text-secondary font-mono mt-1">{topDept.ambassador_id}</p>
                )}
                <div className="flex items-center gap-1 text-secondary font-bold mt-3 text-headline-md">
                  <Icon name="stars" className="text-[20px]" />
                  {topDept.points.toLocaleString()} pts
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-on-surface-variant opacity-50">
                <p className="text-body-md">No department ambassadors yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

