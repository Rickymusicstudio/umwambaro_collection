import { supabaseServer } from "@/lib/supabaseServer";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string };
}) {
  const supabase = supabaseServer();

  let query = supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        id,
        price,
        quantity,
        products (
          name
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  /* ================= FILTER LOGIC ================= */

  if (searchParams?.search) {
    query = query.or(
      `id.ilike.%${searchParams.search}%,user_id.ilike.%${searchParams.search}%`
    );
  } else if (searchParams?.status) {
    query = query.eq("status", searchParams.status);
  }

  const { data: orders, error } = await query;

  if (error) {
    return <pre>{JSON.stringify(error, null, 2)}</pre>;
  }

  return (
    <div style={{ padding: 40 }}>

      <h1 style={{ fontSize: 26, fontWeight: "bold" }}>
        Orders
      </h1>

      {/* ================= SEARCH ================= */}

      <form method="get" style={{ margin: "15px 0" }}>
        <input
          type="text"
          name="search"
          placeholder="Search Order ID or User ID..."
          defaultValue={searchParams?.search || ""}
          style={input}
        />

        <button style={blackBtn}>Search</button>
      </form>

      {/* ================= FILTER BAR ================= */}

      <div style={{ display: "flex", gap: 10, margin: "15px 0" }}>
        <FilterButton label="All" href="/admin/orders" />
        <FilterButton label="Pending" href="/admin/orders?status=pending" />
        <FilterButton label="Awaiting Payment" href="/admin/orders?status=awaiting_payment" />
        <FilterButton label="Paid" href="/admin/orders?status=paid" />
        <FilterButton label="Delivered" href="/admin/orders?status=delivered" />
        <FilterButton label="Cancelled" href="/admin/orders?status=cancelled" />
      </div>

      {/* ================= TABLE ================= */}

      <div style={{ overflowX: "auto" }}>
        <table style={table}>

          <thead>
            <tr>
              <th style={th}>Order ID</th>
              <th style={th}>User</th>
              <th style={th}>Items</th>
              <th style={th}>Total</th>
              <th style={th}>Payment Method</th>
              <th style={th}>Payment Status</th>
              <th style={th}>Order Status</th>
              <th style={th}>Date</th>
              <th style={{ ...th, width: 260 }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {orders?.map((order: any) => (
              <tr key={order.id}>

                <td style={td}>{order.id}</td>
                <td style={td}>{order.user_id}</td>

                {/* ITEMS */}
                <td style={td}>
                  {order.order_items.map((i: any) => (
                    <div key={i.id}>{i.products?.name}</div>
                  ))}
                </td>

                <td style={td}>{order.total_amount} RWF</td>

                <td style={td}>{order.payment_method}</td>

                {/* PAYMENT STATUS UPDATE */}
                <td style={td}>
                  <form
                    action={`/admin/orders/payment/${order.id}`}
                    method="post"
                    style={{ display: "flex", gap: 6 }}
                  >
                    <select
                      name="payment_status"
                      defaultValue={order.payment_status}
                    >
                      <option value="unpaid">unpaid</option>
                      <option value="paid">paid</option>
                    </select>

                    <button style={updateBtn}>Save</button>
                  </form>
                </td>

                {/* ORDER STATUS */}
                <td style={td}>
                  <StatusBadge status={order.status} />
                </td>

                <td style={td}>
                  {new Date(order.created_at).toLocaleString()}
                </td>

                {/* ACTION */}
                <td style={td}>
                  <div style={{ display: "flex", gap: 6 }}>

                    <a
                      href={`/admin/orders/${order.id}`}
                      style={viewBtn}
                    >
                      View
                    </a>

                    <form
                      action={`/admin/orders/status/${order.id}`}
                      method="post"
                    >
                      <select name="status" defaultValue={order.status}>
                        <option value="pending">Pending</option>
                        <option value="awaiting_payment">Awaiting Payment</option>
                        <option value="paid">Paid</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      <button style={updateBtn}>Update</button>
                    </form>

                  </div>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}

/* ================= COMPONENTS ================= */

function FilterButton({ label, href }: any) {
  return (
    <a href={href} style={filterBtn}>
      {label}
    </a>
  );
}

function StatusBadge({ status }: { status: string }) {
  let color = "#aaa";

  if (status === "pending") color = "#f59e0b";
  if (status === "awaiting_payment") color = "#f97316";
  if (status === "paid") color = "#22c55e";
  if (status === "delivered") color = "#3b82f6";
  if (status === "cancelled") color = "#ef4444";

  return (
    <span style={{ ...badge, background: color }}>
      {status}
    </span>
  );
}

/* ================= STYLES ================= */

const input: React.CSSProperties = {
  padding: 8,
  width: 260,
  borderRadius: 6,
  border: "1px solid #ccc",
  marginRight: 8,
};

const blackBtn: React.CSSProperties = {
  padding: "8px 14px",
  background: "black",
  color: "white",
  border: "none",
  borderRadius: 6,
};

const filterBtn: React.CSSProperties = {
  padding: "6px 14px",
  background: "#eee",
  borderRadius: 6,
  textDecoration: "none",
  color: "black",
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  background: "white",
};

const th: React.CSSProperties = {
  padding: 12,
  border: "1px solid #ddd",
  background: "#f8f8f8",
};

const td: React.CSSProperties = {
  padding: 12,
  border: "1px solid #eee",
  verticalAlign: "top",
};

const updateBtn: React.CSSProperties = {
  padding: "6px 12px",
  background: "black",
  color: "white",
  border: "none",
  borderRadius: 4,
};

const viewBtn: React.CSSProperties = {
  padding: "6px 10px",
  background: "#f59e0b",
  color: "white",
  borderRadius: 4,
  textDecoration: "none",
};

const badge: React.CSSProperties = {
  color: "white",
  padding: "4px 10px",
  borderRadius: 12,
  fontSize: 13,
};
