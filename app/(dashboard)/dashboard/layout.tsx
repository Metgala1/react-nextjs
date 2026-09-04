import Link from "next/link";

export default function DashboardLayout({
  children,
  analytics,
  orders,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  orders: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-100/60">
      
      {/* Dashboard Top Navigation / Header Banner */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-xs">
              P
            </span>
            <span className="text-base font-bold text-slate-900 tracking-tight">
              Product Catalog Admin
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <Link href="/dashboard" className="text-indigo-600 font-semibold">Overview</Link>
            <Link href="/products" className="hover:text-indigo-600 transition-colors">Products</Link>
            <Link href="/dashboard/orders" className="hover:text-indigo-600 transition-colors">Orders</Link>
            <Link href="/dashboard/analytics" className="hover:text-indigo-600 transition-colors">Analytics</Link>
          </nav>

          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-slate-200 rounded-full border-2 border-white shadow-xs overflow-hidden flex items-center justify-center text-xs font-bold text-slate-600">
              AD
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area using Parallel Route Slots */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          
          {/* Main Slot Content */}
          {children}

          {/* Parallel Route Slots Grid / Stack */}
          <div className="grid grid-cols-1 gap-8">
            {analytics}
            {orders}
          </div>

        </div>
      </main>

    </div>
  )
}
