export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">

      <div className="text-center">

        <h1 className="text-3xl font-bold mb-4">
          Order Placed Successfully 🎉
        </h1>

        <p className="mb-6">
          Thank you for your purchase.
        </p>

        <a
          href="/products"
          className="bg-black text-white px-6 py-3 rounded"
        >
          Continue Shopping
        </a>

      </div>

    </div>
  )
}
