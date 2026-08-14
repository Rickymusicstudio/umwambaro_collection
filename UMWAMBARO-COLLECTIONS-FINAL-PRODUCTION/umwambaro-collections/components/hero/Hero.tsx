"use client";

import { motion } from "framer-motion";

import Container from "@/components/layout/Container";

import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";
import HeroStats from "./HeroStats";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#faf8f4] to-[#f4efe4]">

      {/* Background Decoration */}

      <div className="absolute inset-0 overflow-hidden">

        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
          className="
            absolute
            -top-20
            -left-20
            h-72
            w-72
            rounded-full
            bg-[#C9A14A]/10
            blur-3xl
          "
        />

        <motion.div
          animate={{
            y: [0, 25, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
          }}
          className="
            absolute
            right-0
            top-1/4
            h-96
            w-96
            rounded-full
            bg-[#C9A14A]/10
            blur-3xl
          "
        />

      </div>

      <Container>

        <div
          className="
            relative
            grid
            min-h-[85vh]
            items-center
            gap-16
            py-16
            lg:grid-cols-2
          "
        >

          {/* Left */}

          <HeroContent />

          {/* Right */}

          <HeroImage />

        </div>

        <HeroStats />
              </Container>

      {/* Bottom Fade */}

      <div
        className="
          absolute
          bottom-0
          left-0
          h-24
          w-full
          bg-gradient-to-t
          from-white
          to-transparent
        "
      />

      {/* Scroll Indicator */}

      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
          y: [0, 8, 0],
        }}
        transition={{
          delay: 1.2,
          duration: 2,
          repeat: Infinity,
        }}
        className="
          absolute
          bottom-8
          left-1/2
          hidden
          -translate-x-1/2
          lg:block
        "
      >
        <div
          className="
            flex
            h-14
            w-8
            justify-center
            rounded-full
            border-2
            border-[#C9A14A]
          "
        >
          <motion.div
            animate={{
              y: [4, 20, 4],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
            }}
            className="
              mt-2
              h-3
              w-3
              rounded-full
              bg-[#C9A14A]
            "
          />
        </div>
      </motion.div>
    </section>
  );
}