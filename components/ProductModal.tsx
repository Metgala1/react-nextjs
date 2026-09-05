import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"// or handle via client component if needed

export default async function ProductModal({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Fixed: Passed `id` directly as a string instead of Number(id)
  const product = await prisma.product.findUnique({
    where: {
      id: Number(id),
    },
  })

  if (!product) {
    notFound()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      
      {/* Backdrop Link to close the modal safely */}
      <Link 
        href="/products" 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        aria-label="Close modal" 
      />

      {/* Modal Container (Relative so it sits on top of the backdrop link) */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh] z-10">
        
        {/* Modal Header Bar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            {product.category}
          </span>

          <Link
            href="/products"
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors text-sm font-bold shadow-xs"
          >
            ✕
          </Link>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          
          {/* Product Image Preview */}
          <div className="relative bg-slate-100 aspect-video rounded-2xl overflow-hidden flex items-center justify-center border border-slate-100">
            <img 
              src={product.image} 
              alt={product.name} 
              className="object-cover w-full h-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-center text-amber-500 text-sm font-semibold mt-1">
                ★ <span className="ml-1 text-slate-700">{product.rating}</span>
                <span className="text-slate-400 font-normal ml-1">({product.reviewsCount} reviews)</span>
              </div>
            </div>

            <div className="text-3xl font-black text-slate-900 sm:text-right">
              ${product.price.toLocaleString()}
            </div>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed">
            {product.description}
          </p>

          {/* Specifications Grid */}
          {product.specs && product.specs.length > 0 && (
            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Key Specifications
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.specs.map((spec, index) => (
                  <li key={index} className="flex items-center text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2" />
                    {spec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-xs font-medium text-slate-500">
            Available Stock: <span className="text-slate-900 font-bold">{product.quantity} units</span>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3">
          <Link
            href="/products"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            Back to Catalog
          </Link>

          <button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 text-xs font-semibold shadow-sm transition-colors">
            Add to Cart
          </button>
        </div>

      </div>
    </div>
  )
}
