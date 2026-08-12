"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import type { Product } from "@/types/product";

type Tab = "description" | "reviews" | "shipping" | "returns";

interface ProductTabsProps {
  product: Product;
}

const tabs: {
  id: Tab;
  label: string;
}[] = [
  {
    id: "description",
    label: "Description",
  },
  {
    id: "reviews",
    label: "Reviews",
  },
  {
    id: "shipping",
    label: "Shipping",
  },
  {
    id: "returns",
    label: "Returns",
  },
];

export default function ProductTabs({
  product,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] =
    useState<Tab>("description");

  return (
    <section className="py-20">

      {/* Tabs */}

      <div className="border-b border-neutral-200">

        <div className="flex flex-wrap gap-6">

          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="
                relative
                pb-5
                text-lg
                font-medium
                transition-colors
              "
            >
              <span
                className={
                  activeTab === tab.id
                    ? "text-black"
                    : "text-neutral-500 hover:text-black"
                }
              >
                {tab.label}
              </span>

              {activeTab === tab.id && (
                <motion.div
                  layoutId="product-tab"
                  className="
                    absolute
                    bottom-0
                    left-0
                    h-0.5
                    w-full
                    bg-amber-500
                  "
                />
              )}
            </button>
          ))}

        </div>

      </div>

      {/* Content */}

      <div className="pt-10">

        <AnimatePresence mode="wait">

          <motion.div
            key={activeTab}
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
            transition={{
              duration: 0.25,
            }}
            className="max-w-4xl"
          >            {activeTab === "description" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-neutral-900">
                  Product Description
                </h3>

                <p className="leading-8 text-neutral-600">
                  {product.description ??
                    "No description available for this product."}
                </p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-neutral-900">
                  Customer Reviews
                </h3>

                <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl font-bold text-neutral-900">
                      {product.rating?.toFixed(1) ?? "5.0"}
                    </div>

                    <div>
                      <p className="font-semibold text-neutral-900">
                        Based on {product.reviews ?? 0} reviews
                      </p>

                      <p className="mt-1 text-sm text-neutral-500">
                        Reviews from verified Umwambaro Collections customers.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 p-6 text-center">
                    <p className="text-neutral-500">
                      Individual customer reviews will appear here once the
                      review system is connected.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-neutral-900">
                  Shipping Information
                </h3>

                <div className="space-y-4 text-neutral-600">
                  <p>
                    • Delivery available throughout Rwanda.
                  </p>

                  <p>
                    • Orders are processed within 24 hours.
                  </p>

                  <p>
                    • Estimated delivery: <strong>1–3 business days.</strong>
                  </p>

                  <p>
                    • International shipping will be available in a future
                    release.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "returns" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-neutral-900">
                  Returns & Exchanges
                </h3>

                <div className="space-y-4 leading-8 text-neutral-600">
                  <p>
                    If your order arrives damaged or does not meet your
                    expectations, please contact our customer support team.
                  </p>

                  <p>
                    Eligible products may be returned or exchanged according to
                    the Umwambaro Collections return policy.
                  </p>

                  <p>
                    Returned items should be unused and in their original
                    packaging whenever possible.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}