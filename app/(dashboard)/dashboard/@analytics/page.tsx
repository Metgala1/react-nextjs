export default function AnalyticsPage() {
  const metrics = [
    {
      title: "Total Revenue",
      value: "$48,250.00",
      change: "+12.4%",
      isPositive: true,
      timeframe: "vs. last month",
      icon: "💰",
    },
    {
      title: "Total Orders",
      value: "1,429",
      change: "+8.1%",
      isPositive: true,
      timeframe: "vs. last month",
      icon: "📦",
    },
    {
      title: "Average Order Value",
      value: "$33.76",
      change: "-2.1%",
      isPositive: false,
      timeframe: "vs. last month",
      icon: "📊",
    },
    {
      title: "Active Customers",
      value: "412",
      change: "+15.3%",
      isPositive: true,
      timeframe: "vs. last month",
      icon: "👥",
    },
  ];

  const recentActivity = [
    { id: 1, customer: "Alex Morgan", item: "Wireless Noise-Canceling Headphones", amount: "$299.00", status: "Completed", time: "10 minutes ago" },
    { id: 2, customer: "Sarah Jenkins", item: "Ergonomic Mechanical Keyboard", amount: "$149.50", status: "Processing", time: "45 minutes ago" },
    { id: 3, customer: "David Chen", item: "Ultra-Wide 4K Monitor", amount: "$699.00", status: "Completed", time: "2 hours ago" },
    { id: 4, customer: "Elena Rostova", item: "USB-C Hub Multiport Adapter", amount: "$45.00", status: "Shipped", time: "3 hours ago" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-slate-200">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3 inline-block">
              Performance
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Store Analytics
            </h1>
            <p className="mt-2 text-slate-600 text-sm max-w-xl">
              Monitor key sales performance indicators, customer engagement metrics, and recent fulfillment activity in real-time.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-xs">
              Last 30 Days
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div 
              key={index} 
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-500">
                  {metric.title}
                </span>
                <span className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-lg border border-slate-100">
                  {metric.icon}
                </span>
              </div>

              <div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                  {metric.value}
                </div>
                
                <div className="flex items-center space-x-2 text-xs">
                  <span className={`font-semibold px-2 py-0.5 rounded-full ${
                    metric.isPositive 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                      : "bg-rose-50 text-rose-700 border border-rose-100"
                  }`}>
                    {metric.change}
                  </span>
                  <span className="text-slate-400">
                    {metric.timeframe}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section: Recent Activity & Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Recent Transactions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest customer checkouts and fulfillment status across the catalog.
              </p>
            </div>
            
            <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View All History &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-4">Customer</th>
                  <th className="pb-3 px-4">Product</th>
                  <th className="pb-3 px-4">Amount</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentActivity.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900">{row.customer}</td>
                    <td className="py-4 px-4 text-slate-600">{row.item}</td>
                    <td className="py-4 px-4 font-bold text-slate-900">{row.amount}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        row.status === "Completed" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          : row.status === "Processing"
                          ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-xs text-slate-400">{row.time}</td>
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
