import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { CAMPUS_URL, LOGO_URL, STUDENT_AVATARS } from "./branding";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <header className="sticky top-0 left-0 w-full z-50 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/40 md:bg-transparent md:backdrop-blur-none md:border-none md:fixed">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 md:px-6 md:py-6">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img alt="IEEE logo" className="h-7 w-auto shrink-0 object-contain md:h-8" src={LOGO_URL} />
          </Link>
          <nav className="flex shrink-0 gap-1 sm:gap-4 items-center font-label-md text-label-md">
            <Link
              to="/login"
              className="px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full flex relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none flex flex-wrap gap-12 justify-center items-center content-center overflow-hidden rotate-[-15deg] scale-125 select-none">
          {["school", "account_balance", "terminal", "science", "auto_stories", "engineering", "local_library"].map(
            (n) => (
              <Icon key={n} name={n} className="text-[120px]" />
            ),
          )}
        </div>

        <div className="flex flex-col w-full md:flex-row relative z-20">
          <div className="hidden md:flex md:w-1/2 relative bg-surface-container-low overflow-hidden group items-end p-8 lg:p-12">
            <div
              className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
              style={{ backgroundImage: `url('${CAMPUS_URL}')` }}
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent mix-blend-multiply" />
            <div className="relative z-20 w-full max-w-[36rem]">
              <div className="w-16 h-16 bg-surface/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 ring-1 ring-primary-fixed/30 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <img alt="IEEE logo" className="w-10 h-10 object-contain" src={LOGO_URL} />
              </div>
              <h2 className="text-display-lg text-on-primary mb-3 drop-shadow-md">
                Join a Global Network of Student Leaders.
              </h2>
              <p className="text-body-lg text-primary-fixed max-w-[24rem] drop-shadow">
                Empowering the next generation of technical leaders through community, innovation,
                and shared knowledge.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <div className="flex -space-x-4">
                  {STUDENT_AVATARS.map((src) => (
                    <img
                      key={src}
                      alt="Ambassador"
                      className="w-10 h-10 rounded-full border-2 border-primary object-cover shadow-sm"
                      src={src}
                    />
                  ))}
                </div>
                <span className="font-label-sm text-label-sm text-primary-fixed ml-3">
                  Join 10k+ Ambassadors
                </span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-4 py-8 sm:px-8 md:p-12 bg-surface relative md:min-h-screen">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="max-w-[28rem] w-full relative z-10 flex flex-col justify-center">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


export function Field({
  id,
  label,
  icon,
  children,
  trailing,
  labelAction,
}: {
  id: string;
  label: string;
  icon: string;
  children: ReactNode;
  trailing?: ReactNode;
  labelAction?: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="font-label-md text-label-md text-on-surface block" htmlFor={id}>
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative group">
        <Icon
          name={icon}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors"
        />
        {children}
        {trailing}
      </div>
    </div>
  );
}

export const inputClass =
  "w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm placeholder:text-on-surface-variant/40";
