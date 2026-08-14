"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroImage() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 60,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: 0.9,
        delay: 0.3,
      }}
      className="relative flex justify-center"
    >
      {/* Gold Background Glow */}

      <div
        className="
          absolute
          inset-0
          rounded-[3rem]
          bg-[#C9A14A]/10
          blur-3xl
        "
      />

      {/* Main Image Card */}

      <div
        className="
          relative
          overflow-hidden
          rounded-[2.5rem]
          shadow-2xl
        "
      >
        <Image
          src="/images/hero/hero.jpg"
          alt="Umwambaro Luxury Collection"
          width={650}
          height={850}
          priority
          className="
            h-auto
            w-full
            object-cover
            transition-transform
            duration-700
            hover:scale-105
          "
        />

        {/* New Collection Badge */}

        <motion.div
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 1,
          }}
          className="
            absolute
            left-6
            top-6
            rounded-full
            bg-white/90
            px-5
            py-2
            shadow-lg
            backdrop-blur
          "
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-[#C9A14A]">
            New Arrival
          </span>
        </motion.div>
                {/* Floating Statistics Card */}

        <motion.div
          initial={{
            opacity: 0,
            x: 30,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 1.2,
            duration: 0.7,
          }}
          className="
            absolute
            -right-8
            bottom-16
            hidden
            rounded-3xl
            bg-white
            p-6
            shadow-2xl
            lg:block
          "
        >
          <p className="text-4xl font-bold text-[#C9A14A]">
            5K+
          </p>

          <p className="mt-1 text-sm font-medium text-neutral-600">
            Happy Customers
          </p>

          <div className="mt-4 h-2 w-36 overflow-hidden rounded-full bg-neutral-200">
            <div className="h-full w-[95%] rounded-full bg-[#C9A14A]" />
          </div>

          <p className="mt-2 text-xs text-neutral-500">
            95% Customer Satisfaction
          </p>
        </motion.div>

        {/* Experience Badge */}

        <motion.div
          initial={{
            opacity: 0,
            x: -30,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 1.4,
            duration: 0.7,
          }}
          className="
            absolute
            -left-8
            bottom-40
            hidden
            rounded-2xl
            bg-black
            px-6
            py-4
            text-white
            shadow-xl
            lg:block
          "
        >
          <p className="text-2xl font-bold">
            10+
          </p>

          <p className="text-xs uppercase tracking-widest text-neutral-300">
            Years of Excellence
          </p>
        </motion.div>

      </div>

      {/* Decorative Gold Circle */}

      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
          absolute
          -right-10
          -top-10
          h-24
          w-24
          rounded-full
          border-2
          border-[#C9A14A]/30
        "
      />

      {/* Decorative Dot */}

      <div
        className="
          absolute
          bottom-10
          right-8
          h-5
          w-5
          rounded-full
          bg-[#C9A14A]
        "
      />
    </motion.div>
  );
}