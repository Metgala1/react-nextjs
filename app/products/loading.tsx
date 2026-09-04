export default function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between animate-pulse">
            <div>
                {/* Image Section Skeleton */}
                <div className="relative bg-slate-100 aspect-square overflow-hidden flex items-center justify-center p-6">
                    <div className="w-full h-full bg-slate-200 rounded-2xl" />
                    <div className="absolute top-4 left-4 bg-slate-200 w-20 h-6 rounded-full" />
                </div>

                {/* Content Section Skeleton */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-5 bg-slate-200 rounded-md w-3/5" />
                        <div className="h-4 bg-slate-200 rounded-md w-10" />
                    </div>

                    <div className="space-y-2 mb-4">
                        <div className="h-3 bg-slate-200 rounded-md w-full" />
                        <div className="h-3 bg-slate-200 rounded-md w-4/5" />
                    </div>

                    <div className="h-3 bg-slate-200 rounded-md w-1/3" />
                </div>
            </div>

            {/* Footer Section Skeleton */}
            <div className="px-6 pb-6 pt-4 flex items-center justify-between border-t border-slate-100 mt-auto">
                <div className="h-5 bg-slate-200 rounded-md w-16" />
                <div className="h-3 bg-slate-200 rounded-md w-24" />
            </div>
        </div>
    );
}
