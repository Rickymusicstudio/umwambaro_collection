"use client";

import { useState } from "react";
import Container from "@/components/layout/Container";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
  }

  return (
    <section className="bg-neutral-950 py-16 text-white sm:py-20">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C9A14A]">Stay in the loop</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">New styles, first look.</h2>
          <p className="mt-4 text-neutral-300">Join our list for new arrivals, special offers, and store updates.</p>
          <form onSubmit={submit} className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="h-13 flex-1 rounded-xl border border-white/15 bg-white px-4 text-neutral-900 outline-none focus:ring-2 focus:ring-[#C9A14A]"
            />
            <button type="submit" className="h-13 rounded-xl bg-[#C9A14A] px-7 font-semibold text-white transition hover:bg-[#b88f35]">Subscribe</button>
          </form>
          {submitted && <p className="mt-4 text-sm text-emerald-300">Thanks — you're on the list.</p>}
        </div>
      </Container>
    </section>
  );
}
