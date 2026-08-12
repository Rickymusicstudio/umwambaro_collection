import AdminHeader from "@/components/admin/AdminHeader";
import AdminOrders from "@/components/admin/AdminOrders";

export default function AdminOrdersPage() {
  return (
    <>
      <AdminHeader title="Orders" description="Review customer orders and update their status." />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"><AdminOrders /></div>
    </>
  );
}
