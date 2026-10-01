"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const headline = "Get in touch";

const socials = [
  { label: "Telegram", handle: "@Wendawendhomegymequipment", href: "https://t.me/Wendawendhomegymequipment" },
  {
    label: "Instagram",
    handle: "@wendawendhomegym",
    href: "https://instagram.com/wendawendhomegym",
  },
  {
    label: "TikTok",
    handle: "@wenda_wend",
    href: "https://tiktok.com/@wenda_wend",
  },
];

const phoneDisplay = "+251950315508";
const phoneLink = "tel:+251900000000";

const addressLines = [
  "Bethel",
  "Addis Ababa, Ethiopia",
];
const mapQuery = encodeURIComponent(addressLines.join(", "));
const mapEmbed = `https://maps.google.com/maps?q=${mapQuery}&output=embed`;
const mapLink = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

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

const line = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1.2, ease } },
};

const mapWipe = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 1.3, ease },
  },
};

export default function ContactPage() {
  const words = headline.split(" ");

  return (
    <motion.main
      variants={container}
      initial="hidden"
      animate="visible"
      className="flex min-h-svh flex-col bg-[#0a0a0a] px-6 pb-16 pt-28 text-white md:px-17.5 lg:h-svh lg:overflow-hidden lg:pb-8 lg:pt-24"
    >
      <motion.p
        variants={fadeUp}
        className="mb-6 flex items-center gap-3 text-xl lg:mb-4"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d4d4d4] opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d4d4d4]"></span>
        </span>
        Contact
      </motion.p>

      <motion.h1
        variants={headlineVariants}
        className="mb-10 text-5xl font-semibold uppercase leading-none md:text-7xl lg:mb-6 lg:text-[clamp(2.5rem,8vh,5rem)]"
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
      </motion.h1>

      <div className="grid grid-cols-1 gap-12 lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)] lg:gap-16">
        {/* Left: links and phone */}
        <div className="flex flex-col justify-between gap-8">
          <ul>
            {socials.map((item) => (
              <motion.li
                key={item.label}
                variants={fadeUp}
                className="relative"
              >
                <Link
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-6 py-5 lg:py-[1.8vh]"
                >
                  <span className="text-3xl font-semibold uppercase leading-none transition-all duration-300 group-hover:translate-x-3 group-hover:text-[#d4d4d4] md:text-5xl lg:text-[clamp(1.5rem,4.5vh,2.75rem)]">
                    {item.label}
                  </span>
                  <span className="flex items-center gap-4 font-poppins text-sm text-white/60">
                    <span className="hidden sm:block">{item.handle}</span>
                  </span>
                </Link>

                <motion.div
                  variants={line}
                  className="absolute bottom-0 left-0 h-px w-full origin-left bg-white/30"
                />
              </motion.li>
            ))}
          </ul>

          <motion.div variants={fadeUp}>
            <p className="mb-3 font-poppins text-xs uppercase tracking-[0.2em] text-white/50">
              Call us
            </p>
            <p className="mb-3 max-w-md font-poppins text-base leading-snug text-white/70 lg:text-[clamp(0.875rem,2vh,1.125rem)]">
              Questions about an order or our gear? Call us and we will help you
              choose the right setup for your space.
            </p>
            <a
              href={phoneLink}
              className="inline-block text-3xl font-semibold transition-colors duration-300 hover:text-[#d4d4d4] md:text-4xl"
            >
              {phoneDisplay}
            </a>
          </motion.div>
        </div>

        {/* Right: map and exact location */}
        <div className="flex flex-col gap-6 lg:min-h-0">
          {/* The map is only a picture. Clicking it opens Google Maps */}
          <motion.a
            variants={mapWipe}
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open our location in Google Maps"
            className="relative block h-[45vh] w-full cursor-pointer overflow-hidden border border-white/10 bg-[#1a1a1a] lg:h-auto lg:min-h-0 lg:flex-1"
          >
            <iframe
              src={mapEmbed}
              title="Our location on the map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              tabIndex={-1}
              className="pointer-events-none h-full w-full border-0 grayscale invert contrast-90"
            />
          </motion.a>

          <motion.div
            variants={fadeUp}
            className="flex shrink-0 flex-col justify-between gap-5 sm:flex-row sm:items-end"
          >
            <div>
              <p className="mb-3 font-poppins text-xs uppercase tracking-[0.2em] text-white/50">
                Visit us
              </p>
              {addressLines.map((text) => (
                <p
                  key={text}
                  className="font-poppins text-lg leading-snug lg:text-[clamp(0.9rem,2.2vh,1.25rem)]"
                >
                  {text}
                </p>
              ))}
            </div>

            <Link
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-6 border border-white/40 px-6 py-4 font-poppins text-xs uppercase tracking-[0.15em] transition-colors duration-300 hover:border-[#d4d4d4] hover:text-[#d4d4d4] sm:justify-start"
            >
              Open in Maps
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.main>
  );
}
