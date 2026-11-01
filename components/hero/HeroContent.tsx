"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import HeroButtons from "./HeroButtons";

export default function HeroContent() {
  return (
    <div className="relative z-10">

      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="
          inline-block
          rounded-full
          bg-[#c8a27a]/10
          px-5
          py-2
          text-sm
          font-semibold
          uppercase
          tracking-[0.3em]
          text-[#c8a27a]
        "
      >
        New Collection 2026
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.2,
          duration: 0.8,
        }}
        className="
          mt-8
          text-5xl
          font-bold
          leading-tight
          text-zinc-900
          md:text-6xl
          xl:text-7xl
        "
      >
        Modern
        <br />

        African
        <span className="text-[#c8a27a]">
          {" "}
          Luxury
        </span>

        <br />

        Fashion
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 0.5,
          duration: 0.8,
        }}
        className="
          mt-8
          max-w-xl
          text-lg
          leading-8
          text-neutral-600
        "
      >
        Discover handcrafted fashion inspired by
        African elegance, premium craftsmanship,
        and timeless contemporary design.
      </motion.p>

      <HeroButtons />
            <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 0.8,
          duration: 0.8,
        }}
        className="mt-12 flex flex-wrap items-center gap-8"
      >
        <div>
          <p className="text-3xl font-bold text-zinc-900">
            10K+
          </p>

          <span className="text-sm text-neutral-500">
            Happy Customers
          </span>
        </div>

        <div className="h-12 w-px bg-neutral-300" />

        <div>
          <p className="text-3xl font-bold text-zinc-900">
            100%
          </p>

          <span className="text-sm text-neutral-500">
            Premium Quality
          </span>
        </div>

        <div className="h-12 w-px bg-neutral-300" />

        <div>
          <p className="text-3xl font-bold text-zinc-900">
            Worldwide
          </p>

          <span className="text-sm text-neutral-500">
            Shipping
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 1,
          duration: 0.8,
        }}
        className="mt-12"
      >
        <Link
          href="/collections"
          className="
            inline-flex
            items-center
            text-sm
            font-semibold
            uppercase
            tracking-[0.25em]
            text-[#c8a27a]
            transition
            hover:text-black
          "
        >
          Explore the Full Collection →
        </Link>
      </motion.div>
    </div>
  );
}