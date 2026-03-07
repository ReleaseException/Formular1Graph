export default function ErrorComponent({load, error}) {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center font-sans">
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <button onClick={load} className="px-5 py-2 bg-stone-800 text-white text-xs rounded hover:bg-stone-700 transition-colors">
                Retry
            </button>
        </div>
    );

}