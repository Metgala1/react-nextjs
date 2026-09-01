

export default function notFound() {
    return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                        !
                    </div>
                    <h1 className="text-xl font-semibold text-slate-900 mb-2">Product Not Found</h1>
                    <p className="text-slate-600 text-sm mb-6">The product you are looking for might have been removed or does not exist.</p>
                    <a href="/" className="inline-block bg-slate-900 text-white font-medium text-sm px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
                        Back to Home
                    </a>
                </div>
            </div>
        );
}