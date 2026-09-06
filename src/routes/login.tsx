import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout, Field, inputClass } from "@/components/AuthLayout";
import { Icon } from "@/components/Icon";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Login | IEEE Student Ambassador Programme" },
      {
        name: "description",
        content:
          "Sign in to the IEEE Student Ambassador Portal to stay connected, access resources, and keep track of your Ambassador journey.",
      },
      { property: "og:title", content: "Login | IEEE Student Ambassador Programme" },
      { property: "og:description", content: "Access your IEEE Ambassador dashboard." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    const { error } = await signIn(email, password);
    if (error) {
      setErrorMsg(error);
      setSubmitting(false);
      return;
    }

    // Fetch profile to check status & role
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("status, role")
        .eq("id", user.id)
        .single() as { data: { status: string; role: string } | null };

      if (profile?.status === "pending") {
        setErrorMsg("Your account is pending admin approval. Please check back later.");
        await supabase.auth.signOut();
        setSubmitting(false);
        return;
      }

      if (profile?.status === "suspended") {
        setErrorMsg("Your account has been suspended. Contact an administrator.");
        await supabase.auth.signOut();
        setSubmitting(false);
        return;
      }

      toast.success("Welcome back!");
      if (profile?.role === "admin") {
        navigate({ to: "/admin" });
      } else if (profile?.role === "reviewer") {
        navigate({ to: "/reviewer" });
      } else {
        navigate({ to: "/dashboard" });
      }
    }
    setSubmitting(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail);
    if (error) {
      toast.error(error.message);
    } else {
      setForgotSent(true);
      toast.success("Password reset email sent!");
    }
  };

  if (showForgot) {
    return (
      <AuthLayout>
        <div className="mb-6">
          <button
            onClick={() => {
              setShowForgot(false);
              setForgotSent(false);
            }}
            className="flex items-center gap-1 text-primary font-label-md text-label-md mb-4 hover:underline"
          >
            <Icon name="arrow_back" className="text-[18px]" /> Back to Login
          </button>
          <h1 className="text-headline-lg text-on-surface mb-2">Reset Password</h1>
          <p className="text-body-md text-on-surface-variant">
            Enter your email and we'll send you a password reset link.
          </p>
        </div>
        {forgotSent ? (
          <div className="bg-secondary-container text-on-secondary-container rounded-lg p-4 text-body-md">
            <Icon name="check_circle" className="text-secondary mr-2" />
            Check your email for the reset link. You can close this page.
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <Field id="forgotEmail" label="Email Address" icon="mail">
              <input
                className={inputClass}
                id="forgotEmail"
                placeholder="your@email.com"
                required
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </Field>
            <button
              type="submit"
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Send Reset Link
            </button>
          </form>
        )}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full mb-4">
          <Icon name="vpn_key" className="text-primary text-[14px]" />
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
            IEEE SB SJCET
          </span>
        </div>
        <h1 className="text-headline-lg text-on-surface mb-2">Welcome Back, Ambassador</h1>
        <p className="text-body-md text-on-surface-variant">
          Sign in to your portal to stay connected, access resources, keep track of your journey, and make the most of the opportunities ahead.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-error-container text-on-error-container rounded-lg p-3 mb-4 flex items-start gap-2 text-body-sm">
          <Icon name="error" className="shrink-0 mt-0.5 text-[18px]" />
          {errorMsg}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleLogin}>
        <Field id="email" label="Email Address" icon="mail">
          <input
            className={inputClass}
            id="email"
            placeholder="student@gmail.com"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field
          id="password"
          label="Password"
          icon="lock"
          labelAction={
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors underline-offset-2 hover:underline"
            >
              Forgot Password?
            </button>
          }
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
            <span className="relative z-10">{submitting ? "Authenticating..." : "Access Portal"}</span>
            <Icon
              name="arrow_forward"
              className="relative z-10 group-hover:translate-x-1 transition-transform text-[20px]"
            />
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
        <p className="text-body-md text-on-surface-variant">
          Don't have an ambassador account?
          <Link
            to="/register"
            className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors ml-1 underline underline-offset-4 decoration-primary/30 hover:decoration-primary"
          >
            Register Now
          </Link>
        </p>
      </div>

      <div className="mt-4 text-center">
        <p className="font-label-sm text-label-sm text-outline tracking-tight">
          Secured by Supabase Auth
        </p>
      </div>
    </AuthLayout>
  );
}
