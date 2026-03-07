export function RaceSessionToggleView({raceLabels, raceNames, excluded, setExcluded, toggle, onDetails}) {
    const allExcluded = excluded.size === raceLabels.length;
    const noneExcluded = excluded.size === 0;
    const selectAll = () => setExcluded(new Set());
    const deselectAll = () => setExcluded(new Set(raceLabels.map((_, i) => i)));
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Sessions / Rounds
                </span>
                <div className="flex gap-3">
                    {!noneExcluded && (
                        <button onClick={selectAll}
                                className="text-[11px] font-medium text-stone-400 hover:text-stone-600 bg-transparent border-none cursor-pointer transition-colors flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Show All
                        </button>
                    )}
                    {!allExcluded && (
                        <button onClick={deselectAll}
                                className="text-[11px] font-medium text-stone-400 hover:text-stone-600 bg-transparent border-none cursor-pointer transition-colors flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
                {raceLabels.map((r, i) => {
                    const off = excluded.has(i);
                    return (
                        <div key={i} 
                             className={`flex items-center rounded overflow-hidden transition-all duration-200 border
                                ${off ? "border-stone-200 bg-white opacity-60 shadow-sm" : "border-stone-800 bg-stone-800 shadow-md shadow-stone-200/50"}`}>
                            <button onClick={() => toggle(i)} title={raceNames[i]}
                                    className={`pl-2.5 pr-1.5 py-1 text-xs font-mono font-bold border-none cursor-pointer transition-all duration-150
                      ${off ? "bg-transparent text-stone-400 line-through" : "bg-stone-800 text-stone-50 hover:bg-stone-700"}`}
                            >{r}</button>
                            <button onClick={() => onDetails(i)} 
                                    className={`px-1.5 py-1 text-[10px] border-none cursor-pointer transition-colors border-l flex items-center
                                        ${off ? "bg-stone-50 text-stone-300 hover:text-stone-500 border-stone-200" : "bg-stone-700/50 text-stone-400 hover:text-stone-100 border-stone-700"}`}
                                    title="View Results"
                            >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
