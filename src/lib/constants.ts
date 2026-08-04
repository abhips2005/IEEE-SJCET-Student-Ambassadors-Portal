/** Single source of truth for all dropdown options */

export const DEPARTMENTS: { value: string; label: string; short: string }[] = [
  { value: "cs",    label: "Computer Science",                short: "CS"     },
  { value: "cs-ai", label: "Computer Science (AI)",           short: "CS-AI"  },
  { value: "cs-cy", label: "Computer Science (Cyber Security)", short: "CS-CY" },
  { value: "ad",    label: "Artificial Intelligence & DS",    short: "AD"     },
  { value: "ec",    label: "Electronics & Communication",     short: "EC"     },
  { value: "er",    label: "Electronics & Robotics",          short: "ER"     },
  { value: "eee",   label: "Electrical & Electronics",        short: "EEE"    },
  { value: "me",    label: "Mechanical Engineering",          short: "ME"     },
  { value: "ce",    label: "Civil Engineering",               short: "CE"     },
];

export const DEPT_MAP: Record<string, string> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.value, d.label])
);

export const DEPT_SHORT_MAP: Record<string, string> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.value, d.short])
);

export const SECTIONS = ["A", "B", "C"] as const;
export type Section = (typeof SECTIONS)[number];

export const ROLES: { value: string; label: string; color: string }[] = [
  { value: "ambassador",     label: "Class Ambassador",  color: "bg-primary/10 text-primary"          },
  { value: "dept_ambassador",label: "Dept Ambassador",   color: "bg-secondary/10 text-secondary"      },
  { value: "reviewer",       label: "Reviewer",          color: "bg-tertiary/10 text-on-tertiary-fixed-variant" },
  { value: "admin",          label: "Admin",             color: "bg-error/10 text-error"              },
];

export const ROLE_MAP: Record<string, string> = Object.fromEntries(
  ROLES.map((r) => [r.value, r.label])
);

export const TARGET_ROLES = [
  { value: "all",             label: "All Ambassadors"   },
  { value: "class_ambassador",label: "Class Ambassadors" },
  { value: "dept_ambassador", label: "Dept Ambassadors"  },
] as const;
