export function RacerTableView({ driverStandings, hovered, setHovered}) {
    return (
        <div className="bg-white rounded-md border border-stone-100 overflow-hidden">
            {driverStandings.map((driver, i) => {
                const diff = i === 0 ? null : driver.total - driverStandings[0].total;
                const isH = hovered === driver.id;
                return (
                    <div key={driver.id}
                         onMouseEnter={() => setHovered(driver.id)}
                         onMouseLeave={() => setHovered(null)}
                         className={`flex items-center px-5 py-2.5 transition-colors duration-150 cursor-default
                  ${i < driverStandings.length - 1 ? "border-b border-stone-50" : ""}
                  ${isH ? "bg-stone-50" : ""}`}
                    >
                <span className={`w-6 text-xs font-mono font-medium ${i < 3 ? "text-stone-800" : "text-stone-300"}`}>
                  {i + 1}
                </span>
                        <span className="w-1.5 h-1.5 rounded-full mr-3.5 shrink-0 transition-opacity duration-150"
                              style={{ backgroundColor: driver.color, opacity: isH ? 1 : 0.5 }} />
                        <span className="flex-1 text-sm font-medium text-stone-800">
                  {driver.fullName}
                </span>
                        <span className="text-xs text-stone-400 w-28 text-right mr-5 hidden sm:block">
                  {driver.team}
                </span>
                        <span className="text-sm font-semibold text-stone-800 font-mono w-10 text-right">
                  {driver.total}
                </span>
                        <span className="text-xs text-stone-300 font-mono w-11 text-right ml-3">
                  {diff === null ? "" : diff}
                </span>
                    </div>
                );
            })}
        </div>

    );

}
