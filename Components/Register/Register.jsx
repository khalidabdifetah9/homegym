"use client";

import { useState } from "react";
import Link from "next/link";

const initialForm = {
  fullName: "",
  phone: "",
  serialNumber: "",
  email: "",
  password: "",
};

const inputClass =
  "w-full border-0 border-b border-white/20 bg-transparent pb-3 pt-2.5 text-[0.98rem] font-light text-white outline-none transition-colors " +
  "placeholder:text-white/30 focus:border-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white " +
  "[&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#050505]";

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "serialNumber" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "loading", message: "" });

    try {
      // TODO: point this at your own endpoint
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.message || "Registration failed. Check your details and try again."
        );
      }

      setStatus({
        type: "success",
        message: "Account created. Your bench is registered.",
      });
      setForm(initialForm);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black font-poppins text-white">
      <section className="flex w-full max-w-[480px] flex-col gap-9 border-white/20 bg-[#050505] px-6 py-12 sm:border sm:px-12">
        <header>
          <h1 className="mb-2.5 text-[1.6rem] font-medium tracking-[0.01em]">
            Create your account
          </h1>
          <p className="max-w-[34ch] text-sm font-light leading-relaxed text-white/60">
            Register your bench to unlock your training guide and support.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[22px]">
          <Field label="Full name">
            <input
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Abebe Kebede"
              value={form.fullName}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </Field>

          <Field label="Phone number">
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+251 9XX XXX XXX"
              pattern="[+0-9\s\-]{9,16}"
              value={form.phone}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </Field>

          <Field label="Serial number on your purchased product">
            <input
              name="serialNumber"
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="WNDA-8294-X9"
              value={form.serialNumber}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </Field>

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
                autoComplete="new-password"
                placeholder="At least 8 characters"
                minLength={8}
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
            {status.type === "loading" ? "Creating account..." : "Create account"}
          </button>

          <p className="text-sm font-light text-white/60">
            Already registered?{" "}
            <Link
              href="/signin"
              className="text-white underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Log in
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