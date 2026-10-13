"use client";

import Image from "next/image";
import { motion } from "framer-motion";

// Put your 3 images in public/ and change these paths, labels and alt text
const IMAGES = [
  { src: "/gallery/one.jpg", alt: "Bench workout", label: "Pull" },
  { src: "/gallery/two.jpg", alt: "Pull-up workout", label: "Pull" },
  { src: "/gallery/three.jpg", alt: "Leg workout", label: "Legs" },
];

const ease = [0.22, 1, 0.36, 1];

const entry = (delay) => ({
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease, delay },
  },
});

function Tile({ image, index, delay, className }) {
  return (
    <motion.div
      variants={entry(delay)}
      initial="hidden"
      animate="visible"
      className={className}
    >
      <div className="relative h-full w-full overflow-hidden bg-[#141414]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="(min-width: 1024px) 25vw, 0px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <span className="font-poppins text-xs font-light text-white/60">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function UserDetailsGallery() {
  return (
    <aside
      aria-hidden="true"
      className="sticky top-0 hidden h-svh overflow-hidden border-l border-white/10 bg-[#050505] p-6 lg:block xl:p-10"
    >
      <div className="flex h-full gap-4">
        <Tile
          image={IMAGES[0]}
          index={0}
          delay={0.1}
          className="mt-12 h-[calc(100%-3rem)] flex-1"
        />

        <div className="flex flex-1 flex-col gap-4">
          <Tile
            image={IMAGES[1]}
            index={1}
            delay={0.25}
            className="flex-[1.15]"
          />
          <Tile
            image={IMAGES[2]}
            index={2}
            delay={0.4}
            className="mb-12 flex-[0.85]"
          />
        </div>
      </div>
    </aside>
  );
}
