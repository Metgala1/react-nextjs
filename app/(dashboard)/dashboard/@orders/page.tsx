export default function OrdersPage() {
  const orderStats = [
    { title: "Total Orders", value: "1,429", subtitle: "+12% this month", icon: "📦" },
    { title: "Pending Fulfillment", value: "24", subtitle: "Requires immediate action", icon: "⏳" },
    { title: "Completed Orders", value: "1,385", subtitle: "Successfully delivered", icon: "✅" },
    { title: "Refunded / Cancelled", value: "20", subtitle: "1.4% return rate", icon: "🔄" },
  ];

  const orders = [
    {
      id: "ORD-1001",
      customer: "Alex Morgan",
      email: "alex.m@example.com",
      items: 2,
      amount: "$120.00",
      status: "Completed",
      date: "Sep 4, 2026",
    },
    {
      id: "ORD-1002",
      customer: "Sarah Jenkins",
      email: "s.jenkins@example.com",
      items: 1,
      amount: "$85.50",
      status: "Processing",
      date: "Sep 4, 2026",
    },
    {
      id: "ORD-1003",
      customer: "David Chen",
      email: "d.chen@example.com",
      items: 3,
      amount: "$240.00",
      status: "Completed",
      date: "Sep 3, 2026",
    },
    {
      id: "ORD-1004",
      customer: "Elena Rostova",
      email: "elena.r@example.com",
      items: 1,
      amount: "$45.00",
      status: "Shipped",
      date: "Sep 3, 2026",
    },
    {
      id: "ORD-1005",
      customer: "Marcus Vance",
      email: "m.vance@example.com",
      items: 4,
      amount: "$510.00",
      status: "Pending",
      date: "Sep 2, 2026",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-slate-200">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3 inline-block">
              Fulfillment
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Orders Management
            </h1>
            <p className="mt-2 text-slate-600 text-sm max-w-xl">
              Track customer purchases, manage fulfillment statuses, and review transactional histories across your catalog.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors">
              Export Orders CSV
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {orderStats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-500">
                  {stat.title}
                </span>
                <span className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-lg border border-slate-100">
                  {stat.icon}
                </span>
              </div>

              <div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  {stat.subtitle}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Orders Table Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-100 gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Recent Orders
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing all incoming transactions and current fulfillment states.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                placeholder="Search order ID or customer..." 
                className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-4">Order ID</th>
                  <th className="pb-3 px-4">Customer</th>
                  <th className="pb-3 px-4">Items</th>
                  <th className="pb-3 px-4">Total Amount</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-indigo-600">{order.id}</td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900">{order.customer}</div>
                      <div className="text-xs text-slate-400">{order.email}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{order.items} {order.items === 1 ? 'item' : 'items'}</td>
                    <td className="py-4 px-4 font-bold text-slate-900">{order.amount}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        order.status === "Completed" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          : order.status === "Processing"
                          ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                          : order.status === "Shipped"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-xs text-slate-500 font-medium">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
