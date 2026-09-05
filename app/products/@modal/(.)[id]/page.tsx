import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ModalClose from "@/components/ModalClose";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductModal({ params }: Props) {
  const { id } = await params;
  const productId = Number(id)

  const product = await prisma.product.findUnique({
    where: {
      id: productId
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <ModalClose
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        aria-label="Close modal"
      >
        <span className="sr-only">Close modal</span>
      </ModalClose>

      {/* Modal */}
      <div className="relative z-10 flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600">
            {product.category}
          </span>

          <ModalClose
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-500 shadow-xs transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            ✕
          </ModalClose>
        </div>

        {/* Scrollable body */}
        <div className="space-y-6 overflow-y-auto p-6 sm:p-8">
          {/* Product image */}
          <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Product title + price */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                {product.name}
              </h1>

              <div className="mt-1 flex items-center text-sm font-semibold text-amber-500">
                ★

                <span className="ml-1 text-slate-700">
                  {product.rating}
                </span>

                <span className="ml-1 font-normal text-slate-400">
                  ({product.reviewsCount} reviews)
                </span>
              </div>
            </div>

            <div className="text-3xl font-black text-slate-900 sm:text-right">
              ${product.price.toLocaleString()}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed text-slate-600">
            {product.description}
          </p>

          {/* Specifications */}
          {product.specs && product.specs.length > 0 && (
            <div className="border-t border-slate-100 pt-6">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Key Specifications
              </h3>

              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {product.specs.map((spec, index) => (
                  <li
                    key={index}
                    className="flex items-center rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-700"
                  >
                    <span className="mr-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    {spec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stock */}
          <div className="text-xs font-medium text-slate-500">
            Available Stock:{" "}
            <span className="font-bold text-slate-900">
              {product.quantity} units
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <ModalClose className="rounded-xl px-5 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200/60">
            Back to Catalog
          </ModalClose>

          <button
            type="button"
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}