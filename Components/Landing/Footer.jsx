"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Noto_Sans_Ethiopic } from "next/font/google";

const ethiopic = Noto_Sans_Ethiopic({ subsets: ["ethiopic"] });

const brand = "ወንዳወንድ HOME GYM";
const lines = ["ወንዳወንድ", "HOME GYM"];

const ringWords = [
  "Build once",
  "Train for life",
  "Home gym gear",
  "Lifetime access",
];

const ringText = ringWords.map((t) => t.toUpperCase()).join(" ✦ ") + " ✦ ";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "Products", href: "/products" },
      { label: "Contact Us", href: "/contact_us" },
      { label: "Register", href: "/register" },
    ],
  },
  {
    title: "Follow",
    links: [
      { label: "Instagram", href: "https://instagram.com/wendawendhomegym" },
      { label: "TikTok", href: "https://tiktok.com/@wenda_wend" },
      { label: "Telegram", href: "https://t.me/Wendawendhomegymequipment" },
    ],
  },
];

const ease = [0.22, 1, 0.36, 1];

const isAmharic = (text) => /[\u1200-\u137F]/.test(text);

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

const line = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1.2, ease } },
};

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative flex flex-col overflow-hidden bg-[#0a0a0a] text-white lg:min-h-[92vh]">
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

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="relative z-10 flex flex-1 flex-col justify-between gap-16 px-6 pb-8 pt-16 md:px-17.5 md:pt-25 lg:pl-[calc(46vh+4rem)]"
      >
        <div>
        

          <motion.h2
            variants={headlineVariants}
            className="mb-8 text-[14vw] font-extrabold uppercase leading-[0.95] sm:text-[11vw] lg:text-[7vw]"
          >
            {lines.map((text) => (
              <span key={text} className="block">
                {text.split(" ").map((w, i) => (
                  <motion.span
                    key={i}
                    variants={word}
                    className={`mr-[0.25em] inline-block align-top ${
                      isAmharic(w)
                        ? `${ethiopic.className} font-black leading-[1.15]`
                        : ""
                    }`}
                  >
                    {w}
                  </motion.span>
                ))}
              </span>
            ))}
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="max-w-md font-poppins text-base leading-snug text-white/70 md:text-lg"
          >
            Train on your time train in your space
          </motion.p>
        </div>

        <div className="flex flex-col gap-10">
          <div className="relative grid grid-cols-2 gap-x-6 gap-y-10 pt-10 sm:grid-cols-4">
            <motion.div
              variants={line}
              className="absolute left-0 top-0 h-px w-full origin-left bg-white/30"
            />

            {columns.map((col, i) => (
              <motion.div key={col.title} variants={fadeUp}>
                <p className="mb-6 font-poppins text-xs uppercase tracking-[0.2em] text-white/50">
                  {col.title}
                </p>
                <ul className="flex flex-col gap-3">
                  {col.links.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="inline-block font-poppins text-base transition-all duration-300 hover:translate-x-1 hover:text-[#d4d4d4]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="relative flex flex-col items-start justify-between gap-4 pt-6 font-poppins text-xs uppercase tracking-[0.15em] text-white/60 sm:flex-row sm:items-center">
            <motion.div
              variants={line}
              className="absolute left-0 top-0 h-px w-full origin-left bg-white/30"
            />

            <motion.p variants={fadeUp}>
              © {new Date().getFullYear()} {brand}
            </motion.p>

            <motion.button
              variants={fadeUp}
              onClick={scrollToTop}
              className="group flex items-center gap-3 transition-colors duration-300 hover:text-[#d4d4d4]"
            >
              Back to top
              <span className="text-lg transition-transform duration-300 group-hover:-translate-y-1">
                ↑
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}