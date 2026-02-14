export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-4">

        <h1 className="text-3xl font-bold mb-4">
          Order Placed Successfully 🎉
        </h1>

        <p className="mb-4">
          Thank you for your purchase.
        </p>

        <p className="mb-6 text-lg font-medium">
          Please call <span className="text-black font-bold">0785712246</span> to confirm your order.
        </p>

        <a
          href="tel:0785712246"
          className="block mb-4 text-blue-600 underline"
        >
          Call Now
        </a>

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
