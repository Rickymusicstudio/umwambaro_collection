import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex min-w-0 shrink flex-col leading-none"
      aria-label="UMWAMBARO Collections"
    >
      <span
        className="
          whitespace-nowrap
          text-[24px]
          font-bold
          tracking-[0.12em]
          text-zinc-900
          sm:text-[30px]
          sm:tracking-[0.16em]
          lg:text-[42px]
          lg:tracking-[0.22em]
        "
      >
        UMWAMBARO
      </span>

      <span
        className="
          mt-1
          whitespace-nowrap
          text-[8px]
          uppercase
          tracking-[0.35em]
          text-[var(--um-accent)]
          sm:mt-1.5
          sm:text-[10px]
          sm:tracking-[0.45em]
          lg:mt-2
          lg:text-[12px]
          lg:tracking-[0.6em]
        "
      >
        COLLECTIONS
      </span>
    </Link>
  );
}