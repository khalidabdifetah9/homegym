"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Noto_Sans_Ethiopic } from "next/font/google";

const ethiopic = Noto_Sans_Ethiopic({ subsets: ["ethiopic"] });

const buttons = [
  { label: "Back Home", href: "/", main: true },
  { label: "View Products", href: "/products", main: false },
];

const ease = [0.22, 1, 0.36, 1];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

const numberVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
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
  visible: { scaleX: 1, transition: { duration: 1.2, ease } },
};

export default function NotFound() {
  return (
    <motion.main
      variants={container}
      initial="hidden"
      animate="visible"
      className="flex min-h-svh flex-col justify-center bg-[#0a0a0a] px-6 py-28 text-white md:px-17.5"
    >
      <motion.p
        variants={fadeUp}
        className="mb-8 flex items-center gap-3 text-xl md:mb-10"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d4d4d4] opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d4d4d4]"></span>
        </span>
        Error 404
      </motion.p>

      <motion.h1
        variants={numberVariants}
        aria-label="404"
        className="mb-8 flex items-center text-[34vw] font-extrabold leading-none md:mb-12 md:text-[20vw]"
      >
        <motion.span
          variants={word}
          aria-hidden="true"
          className="inline-block"
        >
          4
        </motion.span>

        <motion.span
          variants={word}
          aria-hidden="true"
          className="mx-[0.04em] inline-block"
        >
          <span className="relative block h-[0.7em] w-[0.7em] rounded-full border-[0.07em] border-[#d4d4d4]">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity }}
              className="absolute inset-[0.07em] rounded-full border-[0.025em] border-dashed border-[#d4d4d4]/60"
            />
            <span className="absolute left-1/2 top-1/2 h-[0.12em] w-[0.12em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d4d4d4]" />
          </span>
        </motion.span>

        <motion.span
          variants={word}
          aria-hidden="true"
          className="inline-block"
        >
          4
        </motion.span>
      </motion.h1>

      <div className="relative max-w-xl pt-8">
        <motion.div
          variants={line}
          className="absolute left-0 top-0 h-px w-full origin-left bg-white/30"
        />

        <motion.p
          variants={fadeUp}
          className={`${ethiopic.className} mb-3 text-2xl font-black text-[#d4d4d4] md:text-3xl`}
        >
          ገጹ አልተገኘም
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="mb-8 font-poppins text-base leading-snug text-white/70 md:mb-10 md:text-lg"
        >
          This page skipped its rep and is nowhere to be found. Head back and
          get back to training.
        </motion.p>

        <div className="flex flex-col gap-3 sm:flex-row">
          {buttons.map((item) => (
            <motion.div key={item.label} variants={fadeUp}>
              <Link
                href={item.href}
                className={`group flex items-center justify-between gap-10 border px-6 py-4 font-poppins text-xs uppercase tracking-[0.15em] transition-colors duration-300 md:text-sm ${
                  item.main
                    ? "border-[#d4d4d4] bg-[#d4d4d4] text-black hover:bg-white"
                    : "border-white/40 hover:border-[#d4d4d4] hover:text-[#d4d4d4]"
                }`}
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.main>
  );
}
