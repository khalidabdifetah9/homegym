"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

const links = [
  { label: "Post Product", href: "/admin", isDefault: true },
  { label: "Products", href: "/admin/products" },
  { label: "Generate QR Code", href: "/admin/generate_qr" },
];

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

export default function Sidebar({ name = "Admin Name" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const initial = name.charAt(0).toUpperCase();
  const activeHref = getActiveHref(pathname);

  const handleLogout = () => {
    setOpen(false);
    router.push("/login");
  };

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-[#0a0a0a] px-6 md:hidden">
        <p className="flex items-center gap-3 text-lg">
          <span className="h-2 w-2 rounded-full bg-[#d4d4d4]"></span>
          Admin Panel
        </p>
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
          <motion.p
            variants={fadeUp}
            className="mb-8 flex items-center gap-3 text-lg"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d4d4d4] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d4d4d4]"></span>
            </span>
            Admin Panel
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mb-8 flex items-center gap-4"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d4d4d4] text-xl font-semibold text-black">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate font-poppins text-base font-semibold">
                {name}
              </p>
              <p className="font-poppins text-xs uppercase tracking-[0.2em] text-white/50">
                Admin
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
              onClick={handleLogout}
              className="flex w-full items-center justify-between border border-white/30 px-4 py-3.5 font-poppins text-xs uppercase tracking-[0.1em] transition-colors duration-300 hover:border-[#d4d4d4] hover:text-[#d4d4d4]"
            >
              Logout
              <span className="text-base">→</span>
            </motion.button>
          </div>
        </motion.div>
      </aside>
    </>
  );
}
