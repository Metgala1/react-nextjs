import Link from "next/link";

export default function DashboardPage() {
  
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-black rounded-3xl p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-3 backdrop-blur-md">
            Admin Control Center
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, Admin
          </h1>
          <p className="mt-2 text-indigo-100 text-sm max-w-xl">
            Your Next.js product management system is running smoothly. Monitor your store inventory, check real-time orders, and analyze catalog traffic below.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/products/new"
            className="bg-white text-indigo-600 hover:bg-indigo-50 px-5 py-3 rounded-2xl text-xs font-bold shadow-sm transition-colors inline-flex items-center"
          >
            + Add New Product
          </Link>
        </div>
      </div>

      {/* Quick Access Navigation Grid */}
      
    </div>
  );
}
