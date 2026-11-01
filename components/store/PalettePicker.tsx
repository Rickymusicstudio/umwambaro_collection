"use client";

import { useEffect, useState } from "react";

// Temporary helper for choosing the store colors. Remove once a palette is picked.
const palettes = [
  { key: "chocolate", label: "Beige · chocolate · red", swatch: ["#2b1810", "#f3e9dc", "#b3261e"] },
  { key: "forest", label: "Forest · cream · gold", swatch: ["#13261c", "#f2efe6", "#c9a14a"] },
  { key: "navy", label: "Navy · coral", swatch: ["#14213d", "#f1f3f7", "#e85d4a"] },
  { key: "gold", label: "Black · gold", swatch: ["#111111", "#f5f2ec", "#b8893b"] },
  { key: "plum", label: "Plum · blush · pink", swatch: ["#3a1530", "#f6ecee", "#c2185b"] },
];

export default function PalettePicker() {
  const [active, setActive] = useState("chocolate");
  const [open, setOpen] = useState(true);

  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem("um-palette"); } catch {}
    if (saved) choose(saved);
  }, []);

  function choose(key: string) {
    document.documentElement.dataset.palette = key;
    setActive(key);
    try { localStorage.setItem("um-palette", key); } catch {}
  }

  return (
    <div className="fixed bottom-20 right-3 z-[100] w-60 rounded-xl border border-neutral-300 bg-white p-3 text-sm shadow-xl md:bottom-4">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between font-bold">
        Try colors <span>{open ? "–" : "+"}</span>
      </button>
      {open && (
        <ul className="mt-2 space-y-1">
          {palettes.map((p) => (
            <li key={p.key}>
              <button onClick={() => choose(p.key)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left ${active === p.key ? "bg-neutral-100 font-semibold" : "hover:bg-neutral-50"}`}>
                <span className="flex">{p.swatch.map((c) => <span key={c} className="h-4 w-4 rounded-full border border-white" style={{ background: c }} />)}</span>
                {p.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
