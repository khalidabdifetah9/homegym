"use client";

import { motion } from "framer-motion";

const headline =
  "We design and build heavy duty, multi functional equipments that brings the essentials of a complete training setup into your home giving you the freedom to train on your own time, in your own space.";
const ease = [0.22, 1, 0.36, 1];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const headlineVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.025 } },
};

const word = {
  hidden: { clipPath: "inset(0 100% 0 0)", x: -24, opacity: 0 },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    x: 0,
    opacity: 1,
    transition: { duration: 0.45, ease },
  },
};

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease } },
};

const line = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1, ease } },
};

export default function BrandOverview() {
  const words = headline.split(" ");

  return (
    <motion.section
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="flex min-h-[85vh] flex-col justify-end bg-[#0a0a0a] -mt-30 px-6 text-white md:px-[70px] md:pb-[150px]"
    >
      <motion.p
        variants={fadeUp}
        className="mb-10 flex items-center gap-3 text-xl"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
        </span>
        Brand Overview
      </motion.p>

      <motion.h2
        variants={headlineVariants}
        className="mb-20 text-[clamp(1.5rem,2.8vw,3.25rem)] font-semibold uppercase leading-[1.1]"
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
    </motion.section>
  );
}