"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Noto_Sans_Ethiopic } from "next/font/google";

const ethiopic = Noto_Sans_Ethiopic({ subsets: ["ethiopic"] });

// Files in public/Landing_Img/
const MOBILE_IMAGE = "/Landing_Img/hero_formobile.png";
const DESKTOP_IMAGE = "/Landing_Img/hero_forpc.png";

const lines = ["ወንዳወንድ", "Home Gym"];

const info = [
  "26+ EXERCISES",
  "Fast delivery & set up",
  "Dedicated Training Guide",
];

const links = [
  { label: "Register", href: "/register", main: true },
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
  const mobileRef = useRef(null);
  const desktopRef = useRef(null);

  useEffect(() => {
    // Start if the visible image was already cached
    const visible =
      window.innerWidth >= 768 ? desktopRef.current : mobileRef.current;
    if (visible?.complete) setReady(true);

    const timer = setTimeout(() => setReady(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.section
      variants={section}
      initial="hidden"
      animate={ready ? "visible" : "hidden"}
      className="relative flex h-svh w-full flex-col overflow-hidden bg-[#0a0a0a] text-white md:block"
    >
      <div className="relative min-h-0 flex-1 overflow-hidden md:absolute md:inset-0 md:flex-none">
        {/* Mobile image */}
        <Image
          ref={mobileRef}
          src={MOBILE_IMAGE}
          alt="Home gym"
          fill
          priority
          sizes="100vw"
          onLoad={() => setReady(true)}
          onError={() => setReady(true)}
          className="object-cover object-center md:hidden"
        />

        {/* Desktop image */}
        <Image
          ref={desktopRef}
          src={DESKTOP_IMAGE}
          alt="Home gym"
          fill
          sizes="100vw"
          onLoad={() => setReady(true)}
          onError={() => setReady(true)}
          className="hidden object-cover object-center md:block"
        />

        <div className="absolute inset-0 hidden bg-gradient-to-t from-black/75 via-black/10 to-black/25 md:block" />
      </div>

      <motion.div
        variants={content}
        className="relative flex flex-col px-6 -mt-8 pb-5 pt-3 md:absolute md:inset-0 md:px-17.5 md:pb-12 md:pt-24 lg:pt-12"
      >
        <motion.h1
          variants={fadeUp}
          className="order-2 mb-6 flex items-baseline justify-center gap-[0.5em] whitespace-nowrap text-[6.2vw] font-black uppercase leading-none md:order-none md:hidden"
        >
          <span className={`${ethiopic.className} text-[1.15em] font-black`}>
            {lines[0]}
          </span>
          <span className="font-light text-white/40">|</span>
          <span>{lines[1]}</span>
        </motion.h1>

        <div className="hidden flex-1 items-start md:flex lg:items-center">
          <motion.h1
            variants={headlineVariants}
            className="text-[10vw] font-extrabold uppercase leading-[0.95] lg:text-[4.8vw]"
          >
            {lines.map((text) => (
              <span key={text} className="block">
                {text.split(" ").map((w, i) => (
                  <motion.span
                    key={i}
                    variants={word}
                    className={`mr-[0.25em] inline-block align-top text-[1.19em] lg:mr-0 lg:block ${
                      isAmharic(w)
                        ? `${ethiopic.className} font-black leading-[0.9]`
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
          className="order-1 mb-8 flex items-center justify-between gap-6 font-poppins text-[10px] font-light uppercase tracking-[0.15em] text-white/70 md:order-none md:mb-6 md:text-[11px]"
        >
          <span className="flex items-center gap-3">{info[0]}</span>
          <span>{info[1]}</span>
          <span className="hidden md:block">{info[2]}</span>
        </motion.div>

        <motion.div
          variants={line}
          className="mb-8 hidden h-px origin-left bg-[#d4d4d4]/60 md:block"
        />

        <div className="order-3 flex flex-col justify-between gap-6 md:order-none md:flex-row md:items-end">
          <motion.p
            variants={fadeUp}
            className="max-w-sm font-poppins text-sm leading-snug text-white/80 md:text-lg"
          >
            Build your gym once. Train for life. Everything you need for a
            complete home workout, in one place.
          </motion.p>

          <div className="flex flex-col gap-3 md:flex-row">
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