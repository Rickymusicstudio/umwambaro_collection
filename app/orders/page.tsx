import { supabaseServer } from "@/lib/supabaseServer";
import Link from "next/link";

export default async function OrdersPage() {
  const supabase = supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p className="p-10">Please login.</p>;
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id,total_amount,status,payment_status,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="p-10">Failed to load orders.</p>;
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        My Orders
      </h1>

      {orders?.length === 0 && (
        <p>You have no orders yet.</p>
      )}

      <div className="space-y-4">

        {orders?.map((o) => (
          <div
            key={o.id}
            className="border p-4 rounded flex justify-between items-center"
          >
            <div>
              <p><b>Order:</b> {o.id}</p>
              <p><b>Total:</b> {o.total_amount} RWF</p>
              <p><b>Status:</b> {o.status}</p>
              <p><b>Payment:</b> {o.payment_status}</p>
              <p>
                <b>Date:</b>{" "}
                {new Date(o.created_at).toLocaleString()}
              </p>
            </div>

            <Link
              href={`/orders/${o.id}`}
              className="text-blue-600 underline"
            >
              View
            </Link>
          </div>
        ))}

      </div>

    </div>
  );
}
