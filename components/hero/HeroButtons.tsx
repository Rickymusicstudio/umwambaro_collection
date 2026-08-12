"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";

import Button from "@/components/ui/button";

export default function HeroButtons() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: 0.7,
        duration: 0.8,
      }}
      className="
        mt-10
        flex
        flex-col
        gap-4
        sm:flex-row
      "
    >
      <Link href="/shop">
        <Button
          size="lg"
          rightIcon={<ArrowRight size={20} />}
        >
          Shop Collection
        </Button>
      </Link>

      <Link href="/collections">
        <Button
          variant="outline"
          size="lg"
          leftIcon={<Play size={18} />}
        >
          Explore Lookbook
        </Button>
      </Link>
          </motion.div>
  );
}