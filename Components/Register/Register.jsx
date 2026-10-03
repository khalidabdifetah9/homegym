"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Field, { inputClass } from "./Field";
import PasswordField from "./PasswordField";
import { useRouter } from "next/navigation";
const initialForm = {
  fullName: "",
  phone: "",
  serialNumber: "",
  email: "",
  password: "",
};

function normalizeEthiopianPhone(input) {
  const cleaned = String(input).replace(/[\s\-()]/g, "");
  const match = cleaned.match(/^(?:\+251|251|0)?([79]\d{8})$/);
  return match ? `+251${match[1]}` : null;
}

function getPasswordError(password) {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(password))
    return "Password must include at least one letter.";
  if (!/[^A-Za-z]/.test(password))
    return "Password must include at least one number or symbol.";
  return "";
}

export default function Register({ initialSerial = "" }) {
  const [form, setForm] = useState({
    ...initialForm,
    serialNumber: initialSerial,
  });
  const [status, setStatus] = useState({ type: "idle", message: "" });
  useEffect(() => {
    if (!status.message) return;

    const timer = setTimeout(() => {
      setStatus({ type: "idle", message: "" });
    }, 8000);

    return () => clearTimeout(timer);
  }, [status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "serialNumber" ? value.toUpperCase() : value,
    }));
  };
  const route = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phone = normalizeEthiopianPhone(form.phone);
    if (!phone) {
      setStatus({
        type: "error",
        message: "Enter a valid Ethiopian phone number, like 0912 345 678.",
      });
      return;
    }

    const passwordError = getPasswordError(form.password);
    if (passwordError) {
      setStatus({ type: "error", message: passwordError });
      return;
    }

    setStatus({ type: "loading", message: "" });

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.message ||
            "Registration failed. Check your details and try again.",
        );
      }

      setStatus({
        type: "success",
        message: "Account created. Your bench is registered.",
      });
      route.push("/workout_guide");
      route.refresh();
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
              placeholder="09XX XXX XXX"
              maxLength={17}
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

          <PasswordField value={form.password} onChange={handleChange} />

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
            {status.type === "loading"
              ? "Creating account..."
              : "Create account"}
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
