import { supabaseServer } from "@/lib/supabaseServer";

export default async function InvoicePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = supabaseServer();

  const { data: order, error } = await supabase
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
    .eq("id", params.id)
    .single();

  if (error || !order) {
    return <p>Invoice not found</p>;
  }

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: "auto" }}>

      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <h1>UMWAMBARO</h1>
        <p>Fashion Store</p>
        <p>Phone: +250 xxx xxx xxx</p>
      </div>

      {/* ORDER INFO */}
      <div style={box}>
        <p><b>Invoice:</b> {order.id}</p>
        <p><b>Date:</b> {new Date(order.created_at).toLocaleString()}</p>
        <p><b>Customer:</b> {order.user_id}</p>
        <p><b>Phone:</b> {order.phone}</p>
        <p><b>Address:</b> {order.address}</p>
      </div>

      {/* ITEMS */}
      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Product</th>
            <th style={th}>Price</th>
            <th style={th}>Qty</th>
            <th style={th}>Subtotal</th>
          </tr>
        </thead>

        <tbody>
          {order.order_items.map((item: any) => (
            <tr key={item.id}>
              <td style={td}>{item.products?.name}</td>
              <td style={td}>{item.price} RWF</td>
              <td style={td}>{item.quantity}</td>
              <td style={td}>
                {item.price * item.quantity} RWF
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTAL */}
      <h2 style={{ textAlign: "right", marginTop: 20 }}>
        Total: {order.total_amount} RWF
      </h2>

      {/* PRINT */}
      <div style={{ textAlign: "center", marginTop: 30 }}>
        <button
          onClick={() => window.print()}
          style={printBtn}
        >
          Print Invoice
        </button>
      </div>

    </div>
  );
}

/* ================= STYLES ================= */

const box: React.CSSProperties = {
  background: "#f9f9f9",
  padding: 20,
  marginBottom: 20,
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const th: React.CSSProperties = {
  borderBottom: "2px solid black",
  padding: 10,
  textAlign: "left",
};

const td: React.CSSProperties = {
  padding: 10,
  borderBottom: "1px solid #ddd",
};

const printBtn: React.CSSProperties = {
  padding: "10px 20px",
  background: "black",
  color: "white",
  border: "none",
  cursor: "pointer",
};
