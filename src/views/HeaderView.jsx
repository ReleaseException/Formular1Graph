export default function HeaderView({ raceLabels, currentYear, setYear }) {
    const years = [2023, 2024, 2025, 2026];
    return (
        <div className="flex justify-between items-start mb-10">
            <div>
                <p className="text-xs font-medium text-stone-400 tracking-widest uppercase mb-2">
                    Formula 1 · Racing Standings
                </p>
                <h1 className="text-2xl font-light text-stone-800 tracking-tight mb-1">
                    Season {currentYear}
                </h1>
                <p className="text-xs text-stone-300">
                    {raceLabels.length} Races fetched via <a href={`https://www.formula1.com/en/results/${currentYear}/drivers`} target="_blank" rel="noopener noreferrer" className="hover:text-stone-400 underline underline-offset-2">Formula 1 official site</a>
                </p>
            </div>
            <div className="flex gap-2">
                {years.map(y => (
                    <button
                        key={y}
                        onClick={() => setYear(y)}
                        className={`px-3 py-1 text-xs font-medium rounded transition-all duration-150 border cursor-pointer
                        ${currentYear === y
                            ? "bg-stone-800 text-stone-100 border-stone-800"
                            : "bg-white text-stone-400 border-stone-200 hover:border-stone-400"}`}
                    >
                        {y}
                    </button>
                ))}
            </div>
        </div>
    )

}
