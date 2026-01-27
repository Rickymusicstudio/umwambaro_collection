import { supabaseServer } from "@/lib/supabaseServer";

export default async function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = supabaseServer();

  // ✅ Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p className="p-10">Please login.</p>;
  }

  // ✅ Fetch order + items + product info
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        status,
        payment_status,
        total_amount,
        phone,
        address,
        created_at,
        order_items (
          id,
          price,
          quantity,
          products (
            title,
            image_url
          )
        )
      `
    )
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    return <p className="p-10">Order not found.</p>;
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Order Details
      </h1>

      {/* ORDER META */}
      <div className="mb-6 space-y-2 border p-4 rounded">

        <p><b>Order ID:</b> {order.id}</p>

        <p>
          <b>Status:</b>{" "}
          <span
            className={`px-2 py-1 rounded text-white ${
              order.status === "Pending"
                ? "bg-yellow-500"
                : order.status === "Delivered"
                ? "bg-green-600"
                : order.status === "Cancelled"
                ? "bg-red-600"
                : "bg-gray-500"
            }`}
          >
            {order.status}
          </span>
        </p>

        <p><b>Payment:</b> {order.payment_status}</p>
        <p><b>Total:</b> {order.total_amount} RWF</p>
        <p><b>Phone:</b> {order.phone}</p>
        <p><b>Address:</b> {order.address}</p>

        <p>
          <b>Date:</b>{" "}
          {new Date(order.created_at).toLocaleString()}
        </p>

      </div>

      {/* ITEMS */}
      <h2 className="text-xl font-semibold mb-3">
        Items
      </h2>

      {order.order_items.length === 0 && (
        <p>No items found.</p>
      )}

      {order.order_items.length > 0 && (
        <table className="w-full border-collapse">

          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Product</th>
              <th className="text-center">Price</th>
              <th className="text-center">Qty</th>
              <th className="text-center">Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {order.order_items.map((item: any) => (
              <tr key={item.id} className="border-b">

                <td className="py-3 flex items-center gap-3">
                  <img
                    src={
                      item.products?.image_url ||
                      "/placeholder.png"
                    }
                    className="w-12 h-12 object-cover rounded"
                    alt=""
                  />
                  {item.products?.title}
                </td>

                <td className="text-center">
                  {item.price} RWF
                </td>

                <td className="text-center">
                  {item.quantity}
                </td>

                <td className="text-center">
                  {item.price * item.quantity} RWF
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      )}

    </div>
  );
}
