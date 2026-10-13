"use client";

import { useState, useEffect } from "react";

const STATUS = {
  active: {
    label: "Active",
    badge: "border-green-500 bg-green-500/10 text-green-400",
    bar: "bg-green-400",
  },
  expiring: {
    label: "Expiring soon",
    badge: "border-yellow-500 bg-yellow-500/10 text-yellow-400",
    bar: "bg-yellow-400",
  },
  expired: {
    label: "Expired",
    badge: "border-red-500 bg-red-500/10 text-red-400",
    bar: "bg-red-400",
  },
  void: {
    label: "Void (deactivated)",
    badge: "border-zinc-500 bg-zinc-500/10 text-zinc-300",
    bar: "bg-zinc-400",
  },
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Africa/Addis_Ababa",
  });

function timeLeftText(w) {
  if (w.status === "void") return "Warranty is void";
  if (w.status === "expired") return "Expired";
  const { months, days } = w.timeLeft;
  const parts = [];
  if (months) parts.push(`${months} ${months === 1 ? "month" : "months"}`);
  if (days || !months) parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  return `${parts.join(" ")} left`;
}

export default function WarrantyCheck() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null); // last search result
  const [searched, setSearched] = useState("");
  const [toast, setToast] = useState({ type: "", text: "" });
  const [visible, setVisible] = useState(false);

  // Message fades in, fades out, and is removed after 3 seconds
  useEffect(() => {
    if (!toast.text) return;
    const show = setTimeout(() => setVisible(true), 20);
    const fade = setTimeout(() => setVisible(false), 2700);
    const clear = setTimeout(() => setToast({ type: "", text: "" }), 3000);
    return () => {
      clearTimeout(show);
      clearTimeout(fade);
      clearTimeout(clear);
    };
  }, [toast]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setVisible(false);
    setToast({ type: "", text: "" });

    const q = query.trim();
    if (q.length < 6) {
      setToast({ type: "error", text: "Enter a phone number or a serial number." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/warranty?q=${encodeURIComponent(q)}`);
      let body = null;
      try {
        body = await res.json();
      } catch {
        // no JSON body
      }

      if (!res.ok) {
        setToast({
          type: "error",
          text: body?.message || `Request failed (${res.status})`,
        });
        return;
      }

      setData(body);
      setSearched(q);
    } catch (err) {
      setToast({
        type: "error",
        text:
          err instanceof TypeError
            ? "Network error. Check your connection and try again."
            : err.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  const isEmpty =
    data && data.results.length === 0 && !data.unregistered;

  return (
    <section className="px-5 pb-16 pt-24 font-poppins text-white md:ml-64 md:px-10 md:pt-12">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="mb-8 text-2xl font-semibold uppercase leading-none sm:text-3xl md:mb-10 md:text-4xl">
          Warranty check
        </h1>

        <form onSubmit={handleSearch} noValidate>
          <label
            htmlFor="warranty-q"
            className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/50"
          >
            Phone number or serial number
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="warranty-q"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              maxLength={40}
              autoComplete="off"
              spellCheck={false}
              placeholder="0912 345 678 or WNDA-K7M2P-9XQ4T"
              className="w-full border-b border-white/40 bg-transparent py-3 text-base text-white outline-none transition-colors duration-300 placeholder:text-white/30 focus:border-[#d4d4d4] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading}
              className="shrink-0 border border-[#d4d4d4] bg-[#d4d4d4] px-8 py-4 text-xs uppercase tracking-[0.15em] text-black transition-colors duration-300 hover:bg-transparent hover:text-[#d4d4d4] disabled:opacity-50 sm:py-3"
            >
              {loading ? "Checking..." : "Check"}
            </button>
          </div>

          {toast.text && (
            <div
              role="alert"
              className={`mt-4 flex items-start gap-3 border-l-2 px-4 py-3 text-sm transition-all duration-300 ${
                visible ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
              } ${
                toast.type === "success"
                  ? "border-green-500 bg-green-500/10 text-green-400"
                  : "border-red-500 bg-red-500/10 text-red-400"
              }`}
            >
              <p className="flex-1 leading-snug">{toast.text}</p>
            </div>
          )}
        </form>

        {/* Results */}
        <div className="mt-8 flex flex-col gap-3">
          {isEmpty && (
            <div className="border border-white/20 p-6 text-center">
              <p className="mb-1 text-lg font-semibold uppercase">Nothing found</p>
              <p className="text-sm text-white/60">
                No registered product matches &quot;{searched}&quot;.
              </p>
            </div>
          )}

          {data?.unregistered && (
            <div className="border border-white/20 p-5">
              <span
                className={`mb-4 inline-block border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
                  data.unregistered.deactivated
                    ? STATUS.void.badge
                    : "border-sky-500 bg-sky-500/10 text-sky-400"
                }`}
              >
                {data.unregistered.deactivated ? "Deactivated" : "Not registered"}
              </span>
              <p className="mb-4 text-sm leading-snug text-white/70">
                This serial number is valid but has not been registered by an owner,
                so no warranty has started yet.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Info label="Serial number" value={data.unregistered.serial} mono />
                <Info label="Product type" value={data.unregistered.productType} />
                <Info label="Batch" value={data.unregistered.batchNumber || "—"} />
              </div>
            </div>
          )}

          {data?.searchType === "phone" && data.results.length > 1 && (
            <p className="text-xs uppercase tracking-[0.15em] text-white/50">
              {data.results.length} registered products found
            </p>
          )}

          {data?.results.map((r) => {
            const s = STATUS[r.warranty.status];
            return (
              <article key={r.serial} className="border border-white/20 p-5">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <span
                    className={`border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${s.badge}`}
                  >
                    {s.label}
                  </span>
                  <span className="text-xl font-semibold">
                    {timeLeftText(r.warranty)}
                  </span>
                </div>

                <div className="mb-1 h-2 w-full bg-white/10">
                  <div
                    className={`h-full transition-all duration-700 ${s.bar}`}
                    style={{ width: `${r.warranty.usedPct}%` }}
                  />
                </div>
                <div className="mb-5 flex justify-between text-[10px] uppercase tracking-[0.15em] text-white/40">
                  <span>{formatDate(r.warranty.startsAt)}</span>
                  <span>{formatDate(r.warranty.expiresAt)}</span>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Info label="Owner" value={r.owner.name} />
                  <Info
                    label="Phone"
                    value={r.owner.phone || "—"}
                    href={r.owner.phone ? `tel:${r.owner.phone}` : null}
                  />
                  <Info label="Email" value={r.owner.email} />
                  <Info label="Serial number" value={r.serial} mono />
                  <Info label="Product type" value={r.productType} />
                  <Info label="Batch" value={r.batchNumber || "—"} />
                  <Info label="Registered on" value={formatDate(r.warranty.startsAt)} />
                  <Info label="Expires on" value={formatDate(r.warranty.expiresAt)} />
                  <Info
                    label="Coverage"
                    value={`${r.warranty.durationMonths} months`}
                  />
                  <Info label="Times scanned" value={r.scanCount} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Info({ label, value, mono, href }) {
  const content = (
    <p
      className={`truncate text-sm text-white ${mono ? "font-mono" : ""} ${
        href ? "underline underline-offset-4" : ""
      }`}
      title={String(value)}
    >
      {value}
    </p>
  );
  return (
    <div className="bg-[#141414] p-3">
      <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/40">
        {label}
      </p>
      {href ? <a href={href}>{content}</a> : content}
    </div>
  );
}