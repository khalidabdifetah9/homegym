"use client";

import { motion } from "framer-motion";

const headline = "Got questions? We have answers";

const faqs = [
  {
    question: "How long does shipping take?",
    answer:
      "Most orders arrive within 3 to 7 business days, and you get a tracking link as soon as it ships.",
    position: "lg:left-[0%] lg:top-[2%]",
    tilt: "lg:-rotate-3",
  },
  {
    question: "Is assembly difficult?",
    answer:
      "Not at all. Every item comes with the tools and a simple step by step guide. Most take under 30 minutes.",
    position: "lg:left-[32%] lg:top-[0%]",
    tilt: "lg:rotate-2",
  },
  {
    question: "How much space do I need?",
    answer:
      "Most of our gear folds or stacks away, so a small corner of a room is enough to get started.",
    position: "lg:left-[62%] lg:top-[8%]",
    tilt: "lg:-rotate-2",
  },
  {
    question: "Is there a warranty?",
    answer:
      "Yes. All equipment is covered by a 2 year warranty against defects in materials and build.",
    position: "lg:left-[6%] lg:top-[42%]",
    tilt: "lg:rotate-3",
  },
  {
    question: "Can I return my order?",
    answer:
      "You can return any unused item within 30 days for a full refund. No questions asked.",
    position: "lg:left-[37%] lg:top-[38%]",
    tilt: "lg:-rotate-3",
  },
  {
    question: "Is it good for beginners?",
    answer:
      "Absolutely. The workout guide takes you from your first session to advanced training at your own pace.",
    position: "lg:left-[66%] lg:top-[48%]",
    tilt: "lg:rotate-2",
  },
];

const ease = [0.22, 1, 0.36, 1];

const container = {
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

export default function FAQ() {
  const words = headline.split(" ");

  return (
    <motion.section
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className="bg-black px-6 text-white md:max-h-[150vh] md:px-17.5 md:pt-25"
    >
      <motion.p
        variants={fadeUp}
        className="mb-10 flex items-center gap-3 text-xl"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
        </span>
        FAQ
      </motion.p>

      <motion.h2
        variants={headlineVariants}
        className="mb-6 max-w-4xl text-5xl font-semibold uppercase leading-none md:text-7xl"
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
        className="mb-16 font-poppins text-sm uppercase tracking-[0.2em] text-white/60"
      >
        Hover a card to see the answer
      </motion.p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:relative lg:block lg:h-[950px]">
        {faqs.map((item, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className={`group lg:absolute lg:w-[280px] lg:hover:z-20 ${item.position}`}
          >
            <div
              className={`relative h-56 border border-white/20 bg-[#111] transition-all duration-500 group-hover:border-[#d4d4d4] group-hover:bg-[#d4d4d4] lg:group-hover:rotate-0 lg:group-hover:scale-105 ${item.tilt}`}
            >
              <div className="absolute inset-0 flex flex-col justify-between p-6 transition-opacity duration-300 group-hover:opacity-0">
                <span className="font-poppins text-sm uppercase tracking-[0.2em] text-white/60">
                  0{i + 1}
                </span>
                <h3 className="text-2xl font-semibold uppercase leading-tight">
                  {item.question}
                </h3>
              </div>

              <div className="absolute inset-0 flex flex-col justify-between p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="font-poppins text-black text-sm uppercase tracking-[0.2em]">
                  Answer
                </span>
                <p className="font-poppins text-black text-base leading-snug">
                  {item.answer}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
