"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus, X } from "lucide-react";

const MAX_ZOOM = 4;
const TAP_ZOOM = 2.5;

// Product photos: hover to magnify (computer), tap/click to open full screen with
// pinch, double-tap, mouse-wheel and +/- zoom, drag to look around.
export default function ProductGallery({ images, name, badge }: { images: string[]; name: string; badge?: ReactNode }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);

  if (!images.length) return <div className="aspect-square rounded-lg bg-neutral-100" />;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setHover({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setHover(null)}
        aria-label="Open photo full screen"
        className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-lg bg-neutral-100"
      >
        <Image
          src={images[active]} alt={name} fill priority sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover transition-transform duration-150 ease-out"
          style={hover ? { transform: "scale(2.2)", transformOrigin: `${hover.x}% ${hover.y}%` } : undefined}
        />
        {badge}
        <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
          <Maximize2 size={13} /> Tap to zoom
        </span>
      </button>

      {images.length > 1 && (
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button key={src} onClick={() => setActive(i)} aria-label={`Photo ${i + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded border-2 ${i === active ? "border-[var(--um-accent)]" : "border-transparent"}`}>
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {open && <Lightbox images={images} name={name} index={active} onIndex={setActive} onClose={() => setOpen(false)} />}
    </div>
  );
}

function Lightbox({ images, name, index, onIndex, onClose }: {
  images: string[]; name: string; index: number; onIndex: (i: number) => void; onClose: () => void;
}) {
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ dist: number; scale: number; startX: number; startY: number; viewX: number; viewY: number; moved: boolean } | null>(null);
  const lastTap = useRef(0);
  const stage = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  // Keep the photo from being dragged completely off screen.
  const clamp = useCallback((v: { scale: number; x: number; y: number }) => {
    const scale = Math.min(MAX_ZOOM, Math.max(1, v.scale));
    if (scale === 1) return { scale, x: 0, y: 0 };
    const r = stage.current?.getBoundingClientRect();
    const maxX = r ? (r.width * (scale - 1)) / 2 : Infinity;
    const maxY = r ? (r.height * (scale - 1)) / 2 : Infinity;
    return { scale, x: Math.min(maxX, Math.max(-maxX, v.x)), y: Math.min(maxY, Math.max(-maxY, v.y)) };
  }, []);

  const go = useCallback((step: number) => {
    onIndex((index + step + images.length) % images.length);
    setView({ scale: 1, x: 0, y: 0 });
  }, [index, images.length, onIndex]);

  const zoomBy = useCallback(
    (factor: number) => setView((v) => clamp({ ...v, scale: v.scale * factor, x: v.x * factor, y: v.y * factor })),
    [clamp]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && images.length > 1) go(1);
      if (e.key === "ArrowLeft" && images.length > 1) go(-1);
      if (e.key === "+" || e.key === "=") zoomBy(1.5);
      if (e.key === "-") zoomBy(1 / 1.5);
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = overflow; window.removeEventListener("keydown", onKey); };
  }, [go, onClose, zoomBy, images.length]);

  // Zoom toward a point on screen (where the finger/mouse is).
  function zoomAt(clientX: number, clientY: number, nextScale: number) {
    const r = stage.current?.getBoundingClientRect();
    if (!r) return;
    const px = clientX - (r.left + r.width / 2);
    const py = clientY - (r.top + r.height / 2);
    setView((v) => {
      const s = Math.min(MAX_ZOOM, Math.max(1, nextScale));
      const k = s / v.scale;
      return clamp({ scale: s, x: px - (px - v.x) * k, y: py - (py - v.y) * k });
    });
  }

  function onPointerDown(e: ReactPointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    gesture.current = {
      dist: pts.length === 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0,
      scale: view.scale, startX: e.clientX, startY: e.clientY, viewX: view.x, viewY: view.y, moved: false,
    };
    setDragging(true);
  }

  function onPointerMove(e: ReactPointerEvent) {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const pts = [...pointers.current.values()];
    if (pts.length === 2 && g.dist) {
      // pinch
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      zoomAt((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2, g.scale * (dist / g.dist));
      g.moved = true;
      return;
    }
    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    if (Math.abs(dx) + Math.abs(dy) > 6) g.moved = true;
    if (view.scale > 1) setView((v) => clamp({ ...v, x: g.viewX + dx, y: g.viewY + dy }));
  }

  function onPointerUp(e: ReactPointerEvent) {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    if (!g || pointers.current.size > 0) return;
    setDragging(false);
    const dx = e.clientX - g.startX;
    // swipe to the next/previous photo when not zoomed in
    if (view.scale === 1 && g.moved && Math.abs(dx) > 60 && images.length > 1) { go(dx < 0 ? 1 : -1); return; }
    if (!g.moved) {
      // double tap / double click toggles zoom
      const now = Date.now();
      if (now - lastTap.current < 300) {
        if (view.scale > 1) setView({ scale: 1, x: 0, y: 0 });
        else zoomAt(e.clientX, e.clientY, TAP_ZOOM);
        lastTap.current = 0;
      } else lastTap.current = now;
    }
    gesture.current = null;
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={`${name} photos`} className="fixed inset-0 z-[200] flex flex-col bg-black text-white">
      <div className="flex items-center justify-between p-3">
        <span className="text-sm text-white/80">{images.length > 1 ? `${index + 1} / ${images.length}` : name}</span>
        <div className="flex items-center gap-1">
          <IconButton label="Zoom out" onClick={() => zoomBy(1 / 1.5)} disabled={view.scale <= 1}><Minus size={20} /></IconButton>
          <span className="w-12 text-center text-sm tabular-nums">{Math.round(view.scale * 100)}%</span>
          <IconButton label="Zoom in" onClick={() => zoomBy(1.5)} disabled={view.scale >= MAX_ZOOM}><Plus size={20} /></IconButton>
          <IconButton label="Close" onClick={onClose}><X size={22} /></IconButton>
        </div>
      </div>

      <div
        ref={stage}
        className={`relative flex-1 touch-none select-none overflow-hidden ${view.scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={(e) => zoomAt(e.clientX, e.clientY, view.scale * (e.deltaY < 0 ? 1.2 : 1 / 1.2))}
      >
        <div className="absolute inset-0" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`, transition: dragging ? "none" : "transform 120ms ease-out" }}>
          <Image src={images[index]} alt={name} fill unoptimized draggable={false} className="pointer-events-none object-contain" />
        </div>

        {images.length > 1 && view.scale === 1 && (
          <>
            <button onClick={() => go(-1)} onPointerDown={(e) => e.stopPropagation()} aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 hover:bg-white/25"><ChevronLeft size={26} /></button>
            <button onClick={() => go(1)} onPointerDown={(e) => e.stopPropagation()} aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 hover:bg-white/25"><ChevronRight size={26} /></button>
          </>
        )}
      </div>

      <p className="p-3 text-center text-xs text-white/60">Pinch or double-tap to zoom · drag to look around</p>
    </div>
  );
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} disabled={disabled}
      className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/15 disabled:opacity-40">
      {children}
    </button>
  );
}
