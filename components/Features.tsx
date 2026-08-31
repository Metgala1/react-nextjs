// components/home/Features.tsx
export default function Features() {
    const items = [
        {
            title: "Lightning Fast Shipping",
            description: "Orders ship within 24 hours with reliable global tracking and priority delivery options.",
            icon: "⚡"
        },
        {
            title: "Verified Authenticity",
            description: "100% genuine electronics sourced directly from certified global manufacturers.",
            icon: "🛡️"
        },
        {
            title: "24/7 Expert Support",
            description: "Our technical team is always online to help you choose or troubleshoot your hardware.",
            icon: "💬"
        }
    ];

    return (
        <section className="py-20 bg-white border-t border-slate-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {items.map((item, idx) => (
                        <div key={idx} className="bg-slate-50 p-8 rounded-3xl border border-slate-200/60">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-xs flex items-center justify-center text-2xl mb-6 border border-slate-200/60">
                                {item.icon}
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
