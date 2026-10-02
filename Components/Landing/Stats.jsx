import React from "react";
import { motion } from "framer-motion";
const stats = [
  { number: "780+", label: "Active Customer" },
  { number: "2+", label: "Years in business" },
  { number: "26+", label: "Workouts From One Bench" },
];
const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease } },
};

const line = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1.2, ease } },
};

const Stats = () => {
  return (
    <div className="relative grid grid-cols-3 pt-8">
      <motion.div
        variants={line}
        className="absolute left-0 top-0 h-px w-full origin-left bg-white/30"
      />

      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          variants={fadeUp}
          className={`flex flex-col gap-2 ${
            i > 0 ? "border-l border-white/20 pl-4 sm:pl-8" : "pr-4"
          }`}
        >
          <span className="text-[8.5vw] font-black leading-none sm:text-5xl lg:text-6xl">
            {s.number}
          </span>
          <span className="font-poppins text-[11px] font-light leading-snug text-white/60 sm:text-sm">
            {s.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export default Stats;
