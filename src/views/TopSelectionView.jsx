export default function TopSelectionView({ driverStandings, topN, setTopN }) {
    return (
        <div className="flex mb-3.5 border-b border-stone-200">
            {[5, 10, 21].map(n => (
                <button key={n} onClick={() => setTopN(n)}
                        className={`px-3.5 py-1 text-xs bg-transparent border-none cursor-pointer transition-all duration-150 -mb-px
                ${topN === n
                            ? "font-semibold text-stone-800 border-b-2 border-stone-800"
                            : "font-normal text-stone-300 border-b-2 border-transparent hover:text-stone-500"}`}
                >
                    {n >= driverStandings.length ? "Alle" : `Top ${n}`}
                </button>
            ))}
        </div>
    );

}