"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Contact Us", href: "/contact_us" },
  { label: "Register", href: "/register" },
];

const ease = [0.22, 1, 0.36, 1];

const menu = {
  hidden: { clipPath: "inset(0 0 100% 0)" },
  visible: {
    clipPath: "inset(0 0 0% 0)",
    transition: {
      duration: 0.9,
      ease,
      delayChildren: 0.35,
      staggerChildren: 0.12,
    },
  },
};

const list = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const row = {
  hidden: {},
  visible: {},
};

const word = {
  hidden: { clipPath: "inset(0 100% 0 0)", x: -24, opacity: 0 },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    x: 0,
    opacity: 1,
    transition: { duration: 0.7, ease },
  },
};

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease } },
};

const line = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1, ease } },
};

export default function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.nav
            variants={menu}
            initial="hidden"
            animate="visible"
            exit={{
              clipPath: "inset(0 0 100% 0)",
              transition: { duration: 0.7, ease },
            }}
            className="fixed inset-0 z-40 flex h-svh flex-col justify-between overflow-y-auto bg-[#d4d4d4] px-6 pb-8 pt-6 text-white md:px-17.5 md:pb-10"
          >
            <motion.div variants={fadeUp}>
              <Link href="/" onClick={() => setOpen(false)} aria-label="Home">
                <Image
                  src="/logo_black.svg"
                  alt="Logo"
                  width={56}
                  height={56}
                  className="h-10 w-10 object-contain md:h-14 md:w-14"
                />
              </Link>
            </motion.div>

            <motion.ul variants={list} className="my-10">
              {links.map((item, i) => (
                <motion.li key={item.label} variants={row} className="relative">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between py-4 md:py-5"
                  >
                    <span className="flex items-baseline gap-4 md:gap-6">
                      <span className="font-poppins text-sm text-black/70">
                        0{i + 1}
                      </span>
                      <motion.span
                        variants={word}
                        className="inline-block text-4xl font-semibold uppercase leading-none transition-transform duration-300 group-hover:translate-x-3 group-hover:text-black md:text-7xl"
                      >
                        {item.label}
                      </motion.span>
                    </span>
                  </Link>

                  <motion.div
                    variants={line}
                    className="absolute bottom-0 left-0 h-px w-full origin-left bg-white/40"
                  />
                </motion.li>
              ))}
            </motion.ul>

            <motion.p
              variants={fadeUp}
              className="font-poppins text-[11px] font-light tracking-[0.15em] text-black/80"
            >
              BUILD YOUR GYM ONCE. TRAIN FOR LIFE.
            </motion.p>
          </motion.nav>
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center">
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: "0%" }}
          transition={{ duration: 0.9, ease, delay: 0.6 }}
          className="pointer-events-auto relative"
        >
          <span
            className="absolute right-full top-0 h-4 w-4"
            style={{
              background:
                "radial-gradient(circle at 0 100%, transparent 16px, #de322d 16.5px)",
            }}
          />
          <span
            className="absolute left-full top-0 h-4 w-4"
            style={{
              background:
                "radial-gradient(circle at 100% 100%, transparent 16px, #de322d 16.5px)",
            }}
          />

          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-10 w-36 items-center justify-center rounded-b-2xl bg-[#d4d4d4] md:h-11 md:w-40"
          >
            <span className="flex flex-col gap-1.25">
              <span
                className={`block h-0.5 w-6 bg-black transition-transform duration-300 ${
                  open ? "translate-y-1.75 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-black transition-opacity duration-300 ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-black transition-transform duration-300 ${
                  open ? "-translate-y-1.75 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </motion.div>
      </div>
    </>
  );
}