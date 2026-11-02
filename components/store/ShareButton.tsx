"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { siteConfig } from "@/constants/site";

// Phones get their own share sheet (WhatsApp, Instagram, SMS…); computers get a small menu.
export default function ShareButton({ path, title, text }: { path: string; title: string; text: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const url = `${typeof window !== "undefined" ? window.location.origin : siteConfig.url}${path}`;
  const message = `${text}\n${url}`;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  async function share() {
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try { await navigator.share({ title, text, url }); } catch { /* closed the share sheet */ }
      return;
    }
    setOpen((o) => !o);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link:", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div ref={box} className="relative inline-block">
      <button type="button" onClick={share} aria-haspopup="menu" aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--um-line)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--um-link)] hover:bg-[var(--um-soft)]">
        <Share2 size={16} /> Share
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-lg border border-[var(--um-line)] bg-white py-1 text-sm shadow-lg">
          <a role="menuitem" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--um-soft)]" onClick={() => setOpen(false)}>
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#25d366] text-[10px] font-bold text-white">W</span> WhatsApp
          </a>
          <a role="menuitem" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--um-soft)]" onClick={() => setOpen(false)}>
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#1877f2] text-[11px] font-bold text-white">f</span> Facebook
          </a>
          <a role="menuitem" href={`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--um-soft)]" onClick={() => setOpen(false)}>
            <span className="grid h-5 w-5 place-items-center rounded-full bg-black text-[11px] font-bold text-white">X</span> X (Twitter)
          </a>
          <button role="menuitem" type="button" onClick={copy} className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[var(--um-soft)]">
            {copied ? <Check size={18} className="text-emerald-700" /> : <Copy size={18} />} {copied ? "Link copied" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
