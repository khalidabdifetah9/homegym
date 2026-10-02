"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const headline = "Your Entire Gym. Right at Home.";

const buttons = [
  { label: "Contact Us", href: "/contact_us", main: true },
  { label: "View Products", href: "/products", main: false },
];

const ease = [0.22, 1, 0.36, 1];

const section = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

const textBlock = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const headlineVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
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

export default function CTA() {
  const words = headline.split(" ");
  const router = useRouter();
  const [serial, setSerial] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = serial.trim();
    if (!value) return;
    router.push(`/workout-guide?serial=${encodeURIComponent(value)}`);
  };

  return (
    <motion.section
      variants={section}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="relative h-svh w-full overflow-hidden bg-[#0a0a0a] text-white"
    >
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/Benches/bench_three.avif"
          alt="Home gym"
          fill
          sizes="100vw"
          className="object-contain object-center md:object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/60" />
      </div>

      <motion.div
        variants={textBlock}
        className="absolute left-6 top-20 z-10 md:left-17.5 md:top-25"
      >
        <motion.p
          variants={fadeUp}
          className="mb-6 flex items-center gap-3 text-xl md:mb-10"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
          </span>
          Get Started
        </motion.p>

        <motion.h2
          variants={headlineVariants}
          className="max-w-4xl text-[11vw] font-semibold uppercase leading-none sm:text-[8vw] lg:text-[6vw]"
        >
          {words.map((w, i) => (
            <motion.span
              key={i}
              variants={word}
              className="mr-[0.25em] inline-block align-top"
            >
              {w}
            </motion.span>
          ))}
        </motion.h2>
      </motion.div>

      <div className="absolute inset-x-6 bottom-8 z-10 flex flex-col gap-8 md:inset-x-17.5 md:bottom-10 lg:flex-row lg:items-end lg:justify-between">
        <motion.div variants={textBlock} className="w-full max-w-md">
          <motion.p
            variants={fadeUp}
            className="mb-3 font-poppins text-xs uppercase tracking-[0.2em] text-white/70"
          >
            Already have a serial number?
          </motion.p>

          <motion.form
            variants={fadeUp}
            onSubmit={handleSubmit}
            className="relative"
          >
            <input
              type="text"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="Enter your serial number"
              aria-label="Serial number"
              autoComplete="off"
              required
              className="w-full border-b border-white/40 bg-transparent py-4 pr-14 font-poppins text-base uppercase tracking-[0.1em] text-white outline-none transition-colors duration-300 placeholder:normal-case placeholder:tracking-normal placeholder:text-white/50 focus:border-[#d4d4d4]"
            />
            <button
              type="submit"
              aria-label="Submit serial number"
              className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-[#d4d4d4] text-xl text-black transition-colors duration-300 hover:bg-white"
            >
              →
            </button>
          </motion.form>

          <motion.p
            variants={fadeUp}
            className="mt-4 font-poppins text-sm text-white/70"
          >
            Don&apos;t have one?{" "}
            <Link
              href="/register"
              className="text-[#d4d4d4] underline underline-offset-4 transition-colors duration-300 hover:text-white"
            >
              Register here
            </Link>
          </motion.p>
        </motion.div>

        <motion.div
          variants={textBlock}
          className="flex flex-col gap-3 sm:flex-row"
        >
          {buttons.map((item) => (
            <motion.div key={item.label} variants={fadeUp}>
              <Link
                href={item.href}
                className={`group flex items-center justify-between gap-10 border px-6 py-4 font-poppins text-xs uppercase tracking-[0.15em] transition-colors duration-300 md:py-5 md:text-sm ${
                  item.main
                    ? "border-[#d4d4d4] bg-[#d4d4d4] text-black hover:bg-transparent hover:text-white"
                    : "border-white/40 bg-black/20 backdrop-blur-md hover:border-[#d4d4d4] hover:text-[#d4d4d4]"
                }`}
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
