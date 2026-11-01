"use client";

import { motion } from "framer-motion";

const stats = [
  {
    label: "Collections",
    value: "120+",
  },
  {
    label: "Happy Clients",
    value: "5K+",
  },
  {
    label: "Years",
    value: "10+",
  },
];

export default function HeroStats() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="grid grid-cols-3 gap-8 border-t border-neutral-200 py-10"
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="text-center"
        >
          <h3 className="text-3xl font-bold text-[var(--um-accent)]">
            {stat.value}
          </h3>

          <p className="mt-2 text-sm uppercase tracking-widest text-neutral-500">
            {stat.label}
          </p>
        </div>
      ))}
    </motion.div>
  );
}