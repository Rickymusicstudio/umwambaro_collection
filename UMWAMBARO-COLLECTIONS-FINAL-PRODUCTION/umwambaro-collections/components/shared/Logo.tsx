import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex flex-col leading-none">
      <span className="text-[42px] font-bold tracking-[0.22em] text-zinc-900">
        UMWAMBARO
      </span>

      <span className="mt-2 text-[12px] uppercase tracking-[0.6em] text-[#C9A14A]">
        COLLECTIONS
      </span>
    </Link>
  );
}