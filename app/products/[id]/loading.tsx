export default function ProductLoading() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 animate-pulse">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">

                    {/* Product Image Section Skeleton */}
                    <div className="relative bg-slate-200 p-8 flex items-center justify-center min-h-[350px]">
                        <div className="w-full h-[350px] bg-slate-300 rounded-2xl" />
                        <div className="absolute top-6 left-6 w-24 h-8 bg-slate-300 rounded-full" />
                    </div>

                    {/* Product Details Section Skeleton */}
                    <div className="p-8 sm:p-10 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-8 bg-slate-200 rounded-lg w-2/3" />
                                <div className="h-5 bg-slate-200 rounded-md w-16" />
                            </div>

                            <div className="h-8 bg-slate-200 rounded-lg w-1/3 mb-6" />

                            <div className="space-y-2 mb-6">
                                <div className="h-4 bg-slate-200 rounded-md w-full" />
                                <div className="h-4 bg-slate-200 rounded-md w-5/6" />
                                <div className="h-4 bg-slate-200 rounded-md w-4/6" />
                            </div>

                            <div className="border-t border-slate-100 pt-6 mb-8">
                                <div className="h-3 bg-slate-200 rounded w-1/4 mb-3" />

                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {[...Array(4)].map((_, index) => (
                                        <li
                                            key={index}
                                            className="h-9 bg-slate-100 rounded-lg border border-slate-200 flex items-center px-3"
                                        >
                                            <div className="w-2 h-2 bg-slate-300 rounded-full mr-2" />
                                            <div className="h-3 bg-slate-200 rounded w-3/4" />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Action Button Skeleton */}
                        <div className="h-12 bg-slate-200 rounded-xl w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
