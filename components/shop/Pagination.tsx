"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  );

  return (
    <div className="mt-16 flex flex-wrap items-center justify-center gap-2">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-300 bg-white transition hover:border-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={18} />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`h-11 w-11 rounded-xl border transition ${
            currentPage === page
              ? "border-black bg-black text-white"
              : "border-neutral-300 bg-white hover:border-black hover:bg-black hover:text-white"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-300 bg-white transition hover:border-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}