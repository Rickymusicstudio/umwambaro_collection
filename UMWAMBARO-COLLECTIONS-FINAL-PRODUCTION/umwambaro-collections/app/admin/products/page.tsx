import AdminHeader from "@/components/admin/AdminHeader";
import AdminProducts from "@/components/admin/AdminProducts";

export default function AdminProductsPage() {
  return (
    <>
      <AdminHeader
        title="Products"
        description="Manage your catalog directly in Supabase."
      />
      <AdminProducts />
    </>
  );
}
