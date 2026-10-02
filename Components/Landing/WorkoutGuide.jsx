"use client";

import { motion } from "framer-motion";
import {steps} from "@/lib/ActivationSteps"
const headline = "Start training in three steps";



const includes = [
  "Step-by-step exercises",
  "Sets and reps for every level",
  "Built for home training",
];

const ease = [0.22, 1, 0.36, 1];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

const headlineVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
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

const step = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const line = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1.2, ease } },
};

const dot = {
  hidden: { scale: 0 },
  visible: { scale: 1, transition: { duration: 0.4, ease } },
};

export default function WorkoutGuide() {
  const words = headline.split(" ");

  return (
    <section className="bg-[#0a0a0a] px-6 py-16 text-white md:px-17.5 md:py-25">
      {/* Header */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.p
          variants={fadeUp}
          className="mb-10 flex items-center gap-3 text-xl"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d4d4d4] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d4d4d4]"></span>
          </span>
          Activation Guide
        </motion.p>

        <motion.h2
          variants={headlineVariants}
          className="mb-8 max-w-5xl text-5xl font-semibold uppercase leading-none md:text-7xl"
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

        <motion.p
          variants={fadeUp}
          className="mb-16 max-w-130 font-poppins text-base leading-snug text-white/75 md:mb-24 md:text-lg"
        >
          Every bench comes with a workout guide. Activate it in a few minutes
          and start your first session.
        </motion.p>
      </motion.div>

      <div className="mb-16 flex flex-col gap-12 md:mb-24 md:gap-16">
        {steps.map((item) => (
          <motion.div
            key={item.number}
            variants={step}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className={`relative w-[85%] pt-8 md:w-[40%] ${item.offset}`}
          >
            <motion.div
              variants={line}
              className="absolute left-0 top-0 h-px w-full origin-left bg-white/40"
            />

            <motion.p
              variants={fadeUp}
              className="mb-6 text-7xl font-semibold leading-none text-[#d4d4d4] md:text-8xl"
            >
              {item.number}
            </motion.p>

            <motion.h3
              variants={fadeUp}
              className="mb-4 text-2xl font-semibold uppercase leading-tight md:text-3xl"
            >
              {item.title}
            </motion.h3>

            <motion.p
              variants={fadeUp}
              className="max-w-sm font-poppins text-base leading-snug text-white/70"
            >
              {item.text}
            </motion.p>
          </motion.div>
        ))}
      </div>

      {/* What is inside the guide */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        className="relative grid grid-cols-1 gap-6 pt-8 md:grid-cols-3"
      >
        <motion.div
          variants={line}
          className="absolute left-0 top-0 h-px w-full origin-left bg-white/40"
        />

        {includes.map((text) => (
          <motion.p
            key={text}
            variants={fadeUp}
            className="font-poppins text-sm uppercase tracking-[0.2em] text-white/70"
          >
            {text}
          </motion.p>
        ))}
      </motion.div>
    </section>
  );
}
