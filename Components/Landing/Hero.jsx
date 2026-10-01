"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Noto_Sans_Ethiopic } from "next/font/google";

const ethiopic = Noto_Sans_Ethiopic({ subsets: ["ethiopic"] });

const lines = ["አንድ Bench", "ነፍ Workout"];

const info = ["26+ EXERCISES", "Fast delivery & set up", "Dedicated Training Guide"];

const links = [
  { label: "Contact Us", href: "/contact_us", main: true },
  { label: "Products", href: "/products", main: false },
];

const ease = [0.22, 1, 0.36, 1];

const isAmharic = (text) => /[\u1200-\u137F]/.test(text);

const section = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.35 } },
};

const content = {
  hidden: {},
  visible: { transition: { delayChildren: 0.3, staggerChildren: 0.15 } },
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
  visible: { scaleX: 1, transition: { duration: 1.4, ease } },
};

export default function Hero() {
  const [ready, setReady] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    if (imageRef.current?.complete) setReady(true);

    const timer = setTimeout(() => setReady(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.section
      variants={section}
      initial="hidden"
      animate={ready ? "visible" : "hidden"}
      className="relative h-svh w-full overflow-hidden bg-[#0a0a0a] text-white"
    >
      {/* Static Background Image Container */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          ref={imageRef}
          src="/Landing_Img/hh.png"
          alt="Home gym"
          fill
          priority
          sizes="100vw"
          onLoad={() => setReady(true)}
          onError={() => setReady(true)}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/25" />
      </div>

      <motion.div
        variants={content}
        className="absolute inset-0 flex flex-col px-6 pb-8 pt-24 md:px-17.5 md:pb-12 lg:pt-12"
      >
        <div className="flex flex-1 items-start lg:items-center">
          <motion.h1
            variants={headlineVariants}
            className="text-[11vw] font-extrabold uppercase leading-[0.95] sm:text-[10vw] lg:text-[4.8vw]"
          >
            {lines.map((text) => (
              <span key={text} className="block">
                {text.split(" ").map((w, i) => (
                  <motion.span
                    key={i}
                    variants={word}
                    className={`mr-[0.25em] inline-block align-top lg:mr-0 lg:block ${
                      isAmharic(w)
                        ? `${ethiopic.className} text-[1.15em] font-black leading-[0.9]`
                        : ""
                    }`}
                  >
                    {w}
                  </motion.span>
                ))}
              </span>
            ))}
          </motion.h1>
        </div>

        <motion.div
          variants={fadeUp}
          className="mb-4 flex items-center justify-between font-poppins text-[10px] font-light uppercase tracking-[0.15em] text-white/70 sm:text-[11px] md:mb-6"
        >
          <span className="flex items-center gap-3">{info[0]}</span>
          <span>{info[1]}</span>
          <span className="hidden sm:block">{info[2]}</span>
        </motion.div>

        <motion.div
          variants={line}
          className="mb-6 h-px origin-left bg-[#d4d4d4]/60 md:mb-8"
        />

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <motion.p
            variants={fadeUp}
            className="max-w-sm font-poppins text-sm leading-snug text-white/80 md:text-lg"
          >
            Build your gym once. Train for life. Everything you need for a
            complete home workout, in one place.
          </motion.p>

          <div className="flex flex-col gap-3 sm:flex-row">
            {links.map((item) => (
              <motion.div key={item.label} variants={fadeUp}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-center border px-8 py-3.5 font-poppins text-xs uppercase tracking-[0.15em] transition-colors duration-300 md:py-4 md:text-sm ${
                    item.main
                      ? "border-[#d4d4d4] bg-[#d4d4d4] text-black hover:bg-transparent hover:text-[#d4d4d4]"
                      : "border-white/40 hover:border-[#d4d4d4] hover:text-[#d4d4d4]"
                  }`}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}