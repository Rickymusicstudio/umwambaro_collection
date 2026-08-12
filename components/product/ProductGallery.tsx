"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Expand, ChevronLeft, ChevronRight } from "lucide-react";

import type { Product } from "@/types/product";

interface ProductGalleryProps {
  product: Product;
}

export default function ProductGallery({
  product,
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  const images =
    product.images.length > 0
      ? product.images
      : [
          product.image ??
            "/images/placeholder-product.jpg",
        ];

  const previousImage = () => {
    setSelectedImage((current) =>
      current === 0
        ? images.length - 1
        : current - 1
    );
  };

  const nextImage = () => {
    setSelectedImage((current) =>
      current === images.length - 1
        ? 0
        : current + 1
    );
  };

  return (
    <div className="flex flex-col gap-5 lg:flex-row">
      {/* Thumbnails */}

      <div className="order-2 flex gap-4 overflow-x-auto lg:order-1 lg:w-28 lg:flex-col">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() =>
              setSelectedImage(index)
            }
            className={`
              relative
              h-24
              w-24
              overflow-hidden
              rounded-2xl
              border-2
              transition-all
              duration-300

              ${
                selectedImage === index
                  ? "border-black shadow-lg"
                  : "border-neutral-200 hover:border-neutral-400"
              }
            `}
          >
            <Image
              src={image}
              alt={`${product.name} ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}

      <div className="relative order-1 flex-1 overflow-hidden rounded-3xl bg-neutral-100 lg:order-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage}
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 1.04,
            }}
            transition={{
              duration: 0.35,
            }}
            className="relative aspect-[4/5]"
          >
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              priority
              sizes="(max-width:768px) 100vw, 50vw"
              className="
                object-cover
                transition-transform
                duration-700
                hover:scale-110
              "
            />

            {/* Expand */}

            <button
              type="button"
              className="
                absolute
                right-5
                top-5
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-white/90
                shadow-xl
                backdrop-blur
                transition
                hover:bg-black
                hover:text-white
              "
            >
              <Expand size={20} />
            </button>

            {/* Previous */}

            {images.length > 1 && (
              <button
                type="button"
                onClick={previousImage}
                className="
                  absolute
                  left-5
                  top-1/2
                  flex
                  h-12
                  w-12
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  bg-white/90
                  shadow-xl
                  transition
                  hover:bg-black
                  hover:text-white
                "
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* Next */}

            {images.length > 1 && (
              <button
                type="button"
                onClick={nextImage}
                className="
                  absolute
                  right-5
                  top-1/2
                  flex
                  h-12
                  w-12
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  bg-white/90
                  shadow-xl
                  transition
                  hover:bg-black
                  hover:text-white
                "
              >
                <ChevronRight size={20} />
              </button>
            )}
            
          </motion.div>
        </AnimatePresence>

        {/* Image Counter */}

        {images.length > 1 && (
          <div
            className="
              absolute
              bottom-5
              left-1/2
              -translate-x-1/2
              rounded-full
              bg-black/70
              px-4
              py-2
              text-sm
              font-medium
              text-white
              backdrop-blur
            "
          >
            {selectedImage + 1} / {images.length}
          </div>
        )}

        {/* Mobile Dots */}

        {images.length > 1 && (
          <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-2 lg:hidden">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedImage(index)}
                className={`
                  h-2.5
                  w-2.5
                  rounded-full
                  transition-all
                  duration-300

                  ${
                    selectedImage === index
                      ? "w-8 bg-white"
                      : "bg-white/60"
                  }
                `}
              />
            ))}
          </div>
        )}

        {/* Desktop Thumbnail Hint */}

        {images.length > 1 && (
          <div className="absolute bottom-5 right-5 hidden rounded-full bg-white/90 px-4 py-2 text-sm font-medium shadow-lg backdrop-blur lg:block">
            {images.length} Images
          </div>
        )}
      </div>
    </div>
  );
}