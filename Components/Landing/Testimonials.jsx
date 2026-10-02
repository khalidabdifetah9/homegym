"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const headline = "Lifter Feedback";

const testimonials = [
  {
    quote:
      "This is unbelievable. After setting up my home gym I have not missed a single workout in months.",
    name: "Natnael Tadesse",
    role: "Project Manager",
    image: "/Clients/client_one.avif",
  },
  {
    quote:
      "The quality is far better than I expected. Solid, sturdy and it looks great in my living room.",
    name: "Selamawit Hailu",
    role: "Personal Business Owner",
    image: "/Clients/client_two.avif",
  },
  {
    quote:
      "My school schedule is crazy, but this bench makes hitting my daily workouts super easy.",
    name: "Yada Zelalem",
    role: "Student",
    image: "/Clients/client_three.avif",
  },
];

const ease = [0.22, 1, 0.36, 1];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
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
const imageStates = {
  hidden: {
    clipPath: "inset(0 100% 0 0)",
    transition: { duration: 0 },
  },
  previous: {
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 0 },
  },
  active: {
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 0.8, ease },
  },
};

export default function Testimonial() {
  const [index, setIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(null);
  const words = headline.split(" ");
  const current = testimonials[index];

  const goTo = (newIndex) => {
    setPreviousIndex(index);
    setIndex(newIndex);
  };

  const next = () => goTo((index + 1) % testimonials.length);
  const prev = () =>
    goTo((index - 1 + testimonials.length) % testimonials.length);

  return (
    <motion.section
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="bg-[#0a0a0a] px-6 py-16 text-white md:px-17.5 md:py-25"
    >
      <motion.p
        variants={fadeUp}
        className="mb-10 flex items-center gap-3 text-xl"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
        </span>
        Testimonials
      </motion.p>

      <motion.h2
        variants={headlineVariants}
        className="mb-16 text-5xl font-semibold uppercase leading-none md:mb-20 md:text-7xl"
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

      <motion.div
        variants={fadeUp}
        className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1a1a1a]">
          {testimonials.map((item, i) => {
            const status =
              i === index
                ? "active"
                : i === previousIndex
                  ? "previous"
                  : "hidden";
            const layer =
              status === "active" ? 2 : status === "previous" ? 1 : 0;

            return (
              <motion.div
                key={item.name}
                variants={imageStates}
                initial={false}
                animate={status}
                style={{ zIndex: layer }}
                className="absolute inset-0"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </motion.div>
            );
          })}
        </div>

        <div className="flex flex-col justify-between gap-12 md:py-6">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease }}
            >
              <span className="mb-4 block h-16 text-8xl font-semibold leading-none text-[#de322d]">
                “
              </span>
              <p className="text-3xl font-semibold leading-tight md:text-4xl">
                {current.quote}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-end justify-between gap-6">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease }}
              >
                <p className="font-poppins text-lg font-semibold">
                  {current.name}
                </p>
                <p className="font-poppins text-base text-white/60">
                  {current.role}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col items-end gap-3">
              <span className="font-poppins text-sm tracking-[0.2em] text-white/60">
                0{index + 1} / 0{testimonials.length}
              </span>
              <div className="flex">
                <button
                  onClick={prev}
                  aria-label="Previous testimonial"
                  className="h-14 w-14 border border-white/30 text-2xl transition-colors duration-300 hover:border-[#de322d] hover:bg-[#de322d]"
                >
                  ‹
                </button>
                <button
                  onClick={next}
                  aria-label="Next testimonial"
                  className="h-14 w-14 border border-l-0 border-white/30 text-2xl transition-colors duration-300 hover:border-[#de322d] hover:bg-[#de322d]"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
