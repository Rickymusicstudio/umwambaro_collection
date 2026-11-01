import Link from "next/link";
import { PackageSearch } from "lucide-react";

// Customer accounts (login with phone, order history, wishlist) come in the next step.
export default function AccountPage() {
  return (
    <div className="mx-auto max-w-xl px-2 py-6 sm:px-4">
      <div className="rounded-lg bg-white p-6 text-center sm:p-8">
        <h1 className="text-xl font-bold">Your account</h1>
        <p className="mt-2 text-neutral-600">Accounts are coming very soon. You can already order without an account and follow your order here:</p>
        <Link href="/track" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--um-cta)] text-[var(--um-cta-text)] px-6 py-3 font-bold">
          <PackageSearch size={18} /> Track my order
        </Link>
      </div>
    </div>
  );
}
