"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const initialForm = {
  email: "",
  password: "",
};

const inputClass =
  "w-full border-0 border-b border-white/20 bg-transparent pb-3 pt-2.5 text-[0.98rem] font-light text-white outline-none transition-colors " +
  "placeholder:text-white/30 focus:border-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white " +
  "[&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#050505]";

export default function SignIn() {
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const router = useRouter()
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "loading", message: "" });

    try {
      // TODO: point this at your own endpoint
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.message || "Sign in failed. Check your email and password.",
        );
      }

      setStatus({ type: "success", message: "Signed in. Redirecting..." });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black font-poppins text-white">
      <section className="flex w-full max-w-[480px] flex-col gap-9 border-white/20 bg-[#050505] px-6 py-12 sm:border sm:px-12">
        <header>
          <h1 className="mb-2.5 text-[1.6rem] font-medium tracking-[0.01em]">
            Sign in
          </h1>
          <p className="max-w-[34ch] text-sm font-light leading-relaxed text-white/60">
            Welcome back. Sign in to access your training guide.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[22px]">
          <Field label="Email">
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </Field>

          <Field label="Password">
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                required
                className={`${inputClass} pr-14`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute bottom-3 right-0 text-[0.78rem] text-white/60 hover:text-white focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </Field>

          {status.message && (
            <p
              role="status"
              className={`border-l-2 px-3.5 py-3 text-sm ${
                status.type === "error"
                  ? "border-red-500 text-red-300"
                  : "border-emerald-500 text-emerald-200"
              }`}
            >
              {status.message}
            </p>
          )}

          <button
            type="submit"
            disabled={status.type === "loading"}
            className="mt-1.5 border border-[#d9d9d9] bg-[#d9d9d9] px-6 py-4 text-[0.78rem] font-medium uppercase tracking-[0.16em] text-[#111] transition-colors hover:bg-transparent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60 disabled:hover:bg-[#d9d9d9] disabled:hover:text-[#111]"
          >
            {status.type === "loading" ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-sm font-light text-white/60">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-white underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Register here
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.68rem] uppercase tracking-[0.16em] text-white/60">
        {label}
      </span>
      {children}
    </label>
  );
}
