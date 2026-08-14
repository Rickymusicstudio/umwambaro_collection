import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminSettingsPage() {
  return (
    <>
      <AdminHeader title="Settings" description="Core UMWAMBARO store configuration." />
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-[#ead9c0] bg-[#fffaf3] p-6 shadow-sm">
          <h2 className="font-semibold">Store</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Setting label="Store name" value="UMWAMBARO Collections" />
            <Setting label="Currency" value="RWF" />
            <Setting label="Payment" value="Cash on Delivery" />
            <Setting label="Delivery" value="Rwanda · 1–3 business days" />
          </div>
        </section>
        <section className="rounded-2xl border border-[#d7b46b] bg-[#fff8ed] p-6">
          <h2 className="font-semibold text-[#6d4c12]">Production checklist</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[#765b2a]">
            <li>• Supabase Auth protects the admin portal.</li>
            <li>• Supabase RLS protects product and order writes.</li>
            <li>• Checkout creates orders server-side and validates stock.</li>
            <li>• WhatsApp notifications are sent server-side using Meta Cloud API.</li>
          </ul>
        </section>
      </div>
    </>
  );
}

function Setting({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-[#f7efe4] p-4"><p className="text-xs font-semibold uppercase tracking-wider text-[#6f625d]">{label}</p><p className="mt-1 font-medium">{value}</p></div>;
}
