import React from "react";
import { motion } from "framer-motion";

const ringWords = [
  "Build once",
  "Train for life",
  "Home gym gear",
  "Lifetime access",
];
const ringText = ringWords.map((t) => t.toUpperCase()).join(" ✦ ") + " ✦ ";

const ease = [0.22, 1, 0.36, 1];


export default function Motion_Circle() {
  return (
    <>
      <div className="pointer-events-none absolute left-0 top-0 z-0 h-[110vw] -translate-x-1/2 md:h-full">
        <motion.svg
          viewBox="0 0 400 400"
          className="h-full w-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          animate={{ rotate: 360 }}
          transition={{
            opacity: { duration: 1.5, ease },
            rotate: { duration: 50, ease: "linear", repeat: Infinity },
          }}
        >
          <defs>
            <path
              id="footer-ring"
              d="M 42,200 a 158,158 0 1,1 316,0 a 158,158 0 1,1 -316,0"
            />
          </defs>

          <circle
            cx="200"
            cy="200"
            r="196"
            fill="#d4d4d4"
            fillOpacity="0.08"
            stroke="#d4d4d4"
            strokeWidth="2"
          />
          <circle
            cx="200"
            cy="200"
            r="132"
            fill="none"
            stroke="#d4d4d4"
            strokeOpacity="0.4"
            strokeWidth="1"
          />

          <text
            fontSize="26"
            fontWeight="700"
            fill="#d4d4d4"
            className="font-sans"
          >
            <textPath
              href="#footer-ring"
              textLength="992"
              lengthAdjust="spacing"
            >
              {ringText}
            </textPath>
          </text>
        </motion.svg>
      </div>
    </>
  );
}
