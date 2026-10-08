"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signOut } from "@/lib/auth-client";

const ease = [0.22, 1, 0.36, 1];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease } },
};

const line = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1, ease } },
};

export default function Content({ name = "Name", links }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const initial = name.charAt(0).toUpperCase();
  const activeHref = getActiveHref(pathname);
  function getActiveHref(pathname) {
    const matches = links.filter(
      (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
    );

    if (matches.length > 0) {
      matches.sort((a, b) => b.href.length - a.href.length);
      return matches[0].href;
    }

    if (pathname === "/admin") {
      return links.find((item) => item.isDefault).href;
    }

    return "";
  }

  // Close the pop-up with the Escape key
  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !loggingOut) setConfirmOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen, loggingOut]);

  const askLogout = () => {
    setLogoutError("");
    setConfirmOpen(true);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError("");

    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            setConfirmOpen(false);
            setOpen(false);
            router.push("/signin");
            router.refresh();
          },
          onError: (ctx) => {
            setLogoutError(
              ctx?.error?.message || "Could not log out. Please try again."
            );
            setLoggingOut(false);
          },
        },
      });
    } catch {
      setLogoutError("Network error. Check your connection and try again.");
      setLoggingOut(false);
    }
  };

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-[#0a0a0a] px-6 md:hidden">
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="font-poppins text-xs uppercase tracking-[0.15em]"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-svh w-64 border-r border-white/10 bg-[#0a0a0a] text-white transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex h-full flex-col px-5 py-6"
        >
          <motion.div
            variants={fadeUp}
            className="mb-8 flex items-center gap-4"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d4d4d4] text-xl font-semibold text-black">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate font-poppins md:mb-1 text-base font-semibold">
                {name}
              </p>
              <p className="font-poppins text-xs uppercase tracking-[0.2em] text-white/50">
                {links[0].label === "Post Product" ? "Admin" : "Regular User"}
              </p>
            </div>
          </motion.div>

          <div className="relative mb-6 h-px">
            <motion.div
              variants={line}
              className="absolute inset-0 origin-left bg-white/20"
            />
          </div>

          <nav className="flex flex-col gap-2">
            {links.map((item, i) => {
              const active = item.href === activeHref;

              return (
                <motion.div key={item.href} variants={fadeUp}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between px-4 py-3.5 font-poppins text-xs uppercase tracking-[0.1em] transition-colors duration-300 ${
                      active
                        ? "bg-[#d4d4d4] text-black"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item.label}
                    <span
                      className={active ? "text-black/60" : "text-white/30"}
                    >
                      0{i + 1}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <div className="mt-auto">
            <div className="relative mb-6 h-px">
              <motion.div
                variants={line}
                className="absolute inset-0 origin-left bg-white/20"
              />
            </div>

            <motion.button
              variants={fadeUp}
              onClick={askLogout}
              className="flex w-full items-center justify-between border border-white/30 px-4 py-3.5 font-poppins text-xs uppercase tracking-[0.1em] transition-colors duration-300 hover:border-[#d4d4d4] hover:text-[#d4d4d4]"
            >
              Logout
              <span className="text-base">→</span>
            </motion.button>
          </div>
        </motion.div>
      </aside>

      {/* Confirm pop-up */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-5"
          onClick={() => !loggingOut && setConfirmOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm border border-white/20 bg-[#0a0a0a] p-6 font-poppins text-white"
          >
            <h2
              id="logout-title"
              className="mb-2 text-xl font-semibold uppercase"
            >
              Log out?
            </h2>
            <p className="mb-6 text-sm leading-snug text-white/60">
              Are you sure you want to log out?
            </p>

            {logoutError && (
              <p className="mb-4 border-l-2 border-red-500 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {logoutError}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                autoFocus
                disabled={loggingOut}
                onClick={() => setConfirmOpen(false)}
                className="border border-white/40 px-4 py-3.5 text-xs uppercase tracking-[0.15em] transition-colors duration-300 hover:bg-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loggingOut}
                onClick={handleLogout}
                className="border border-[#d4d4d4] bg-[#d4d4d4] px-4 py-3.5 text-xs uppercase tracking-[0.15em] text-black transition-colors duration-300 hover:bg-transparent hover:text-[#d4d4d4] disabled:cursor-wait disabled:opacity-60"
              >
                {loggingOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}