"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import {
  Truck,
  Phone,
  Sparkles,
} from "lucide-react";

interface Announcement {
  icon: React.ReactNode;

  text: string;
}

const announcements: Announcement[] = [
  {
    icon: <Truck className="h-4 w-4" />,
    text: "Free delivery across Rwanda on orders over RWF 100,000",
  },

  {
    icon: <Sparkles className="h-4 w-4" />,
    text: "Discover the latest Umwambaro Collections arrivals.",
  },

  {
    icon: <Phone className="h-4 w-4" />,
    text: "Customer Support: +250 788 000 000",
  },
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) =>
        current === announcements.length - 1
          ? 0
          : current + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black text-white">

      <div className="mx-auto flex h-11 max-w-7xl items-center justify-center overflow-hidden px-4">

        <AnimatePresence mode="wait">

          <motion.div
            key={index}
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -15,
            }}
            transition={{
              duration: 0.35,
            }}
            className="flex items-center gap-3 text-sm"
          >
            {announcements[index].icon}

            <span className="font-medium tracking-wide">
              {announcements[index].text}
            </span>

          </motion.div>

        </AnimatePresence>

      </div>\    
      </div>
  );
}