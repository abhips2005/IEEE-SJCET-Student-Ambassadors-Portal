import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout, Field, inputClass } from "@/components/AuthLayout";
import { Icon } from "@/components/Icon";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { DEPARTMENTS, SECTIONS } from "@/lib/constants";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Register | IEEE Student Ambassador Portal" },
      {
        name: "description",
        content:
          "Create your IEEE Student Ambassador account and join a global community of student technical leaders.",
      },
      { property: "og:title", content: "Register | IEEE Student Ambassador Portal" },
      { property: "og:description", content: "Become an IEEE Student Ambassador in a few minutes." },
    ],
  }),
});

const selectClass =
  "w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-body-md rounded-lg py-3 pl-12 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm";

function RegisterPage() {
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [ieeeId, setIeeeId] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (!/^\+?[0-9]{10,15}$/.test(mobile.replace(/\s/g, ""))) {
      setErrorMsg("Please enter a valid mobile number.");
      return;
    }

    setSubmitting(true);

    const { error } = await signUp(email, password, {
      full_name: fullName,
      department,
      semester: parseInt(semester, 10),
      section,
      mobile_number: mobile,
      ...(ieeeId !== "" ? { ieee_member_id: ieeeId } : {}),
    });

    if (error) {
      setErrorMsg(error);
      setSubmitting(false);
      return;
    }

    toast.success("Registration submitted!");
    setRegistered(true);
    setSubmitting(false);
  };

  if (registered) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center gap-4 py-8">
          <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center">
            <Icon name="check_circle" className="text-secondary text-[40px]" />
          </div>
          <h1 className="text-headline-lg text-on-surface">Registration Submitted!</h1>
          <p className="text-body-md text-on-surface-variant max-w-sm">
            Your ambassador application has been received. An administrator will review and approve
            your account. Stay tuned!
          </p>
          <Link
            to="/login"
            className="mt-4 px-6 py-3 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Back to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-6">
        <h1 className="text-headline-lg text-on-surface mb-2">Become an Ambassador</h1>
        <p className="text-body-md text-on-surface-variant">
          Join our global community of student leaders.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-error-container text-on-error-container rounded-lg p-3 mb-4 flex items-start gap-2 text-body-sm">
          <Icon name="error" className="shrink-0 mt-0.5 text-[18px]" />
          {errorMsg}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleRegister}>
        <Field id="fullName" label="Full Name" icon="person">
          <input
            className={inputClass}
            id="fullName"
            placeholder="Jane Doe"
            required
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </Field>

        <Field id="email" label="Email Address" icon="mail">
          <input
            className={inputClass}
            id="email"
            placeholder="jane.doe@gmail.com"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field id="mobile" label="Mobile Number" icon="phone">
          <input
            className={inputClass}
            id="mobile"
            placeholder="+91 9876543210"
            required
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            id="department"
            label="Department"
            icon="account_balance"
            trailing={
              <Icon
                name="expand_more"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
              />
            }
          >
            <select
              className={selectClass}
              id="department"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option disabled value="">
                Select Dept
              </option>
              {DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="semester"
            label="Semester"
            icon="date_range"
            trailing={
              <Icon
                name="expand_more"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
              />
            }
          >
            <select
              className={selectClass}
              id="semester"
              required
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              <option disabled value="">
                Select Sem
              </option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                  {n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"} Semester
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          id="section"
          label="Section"
          icon="group_work"
          trailing={
            <Icon
              name="expand_more"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
            />
          }
        >
          <select
            className={selectClass}
            id="section"
            required
            value={section}
            onChange={(e) => setSection(e.target.value)}
          >
            <option disabled value="">
              Select Section
            </option>
            {SECTIONS.map((s) => (
              <option key={s} value={s}>
                Section {s}
              </option>
            ))}
          </select>
        </Field>

        <Field id="ieeeId" label="IEEE Membership ID (Optional)" icon="badge">
          <input
            className={`${inputClass} font-mono tracking-wider`}
            id="ieeeId"
            placeholder="12345678 (leave blank if not a member)"
            type="text"
            value={ieeeId}
            onChange={(e) => setIeeeId(e.target.value)}
          />
        </Field>

        <Field
          id="password"
          label="Password"
          icon="lock"
          trailing={
            <button
              type="button"
              aria-label="Toggle password visibility"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-on-surface-variant/60 hover:text-on-surface rounded-full hover:bg-surface-container transition-colors"
            >
              <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-[20px]" />
            </button>
          }
        >
          <input
            className={`${inputClass} pr-12`}
            id="password"
            placeholder="••••••••"
            required
            minLength={6}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group relative overflow-hidden disabled:opacity-75"
          >
            <div className="absolute inset-0 bg-on-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            {submitting && <Icon name="progress_activity" className="animate-spin text-[20px]" />}
            <span className="relative z-10">{submitting ? "Registering..." : "Register"}</span>
            <Icon
              name="arrow_forward"
              className="relative z-10 group-hover:translate-x-1 transition-transform text-[20px]"
            />
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
        <p className="text-body-md text-on-surface-variant">
          Already have an account?
          <Link
            to="/login"
            className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors ml-1 underline underline-offset-4 decoration-primary/30 hover:decoration-primary"
          >
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
