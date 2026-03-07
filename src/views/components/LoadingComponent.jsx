export default function LoadingComponent({ progress }) {
    const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center font-sans">
            <svg width="28" height="28" viewBox="0 0 32 32" className="mb-5">
                <circle cx="16" cy="16" r="12" fill="none" stroke="#e5e5e5" strokeWidth="2" />
                <path d="M16 4 A12 12 0 0 1 28 16" fill="none" stroke="#292524" strokeWidth="2" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="0.8s" repeatCount="indefinite" />
                </path>
            </svg>
            <p className="text-xs text-stone-400 mb-2">{progress.text}</p>
            {progress.total > 0 && (
                <div className="w-44 h-0.5 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-stone-800 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                </div>
            )}
        </div>
    );

}