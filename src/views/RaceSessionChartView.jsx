export function RaceSessionChartView({ activeIdx, hovered, setHovered, driverDash, raceLabels, xPos, y, grids, W, H, pL, pR, visible }) {
    return (
        <div className="bg-white rounded-md border border-stone-100 p-5 pb-3 mb-8 overflow-x-auto">
            {activeIdx.length === 0 ? (
                <p className="text-center text-stone-300 text-sm py-10">Keine Rennen ausgewählt</p>
            ) : (
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
                    {grids.map(v => (
                        <g key={v}>
                            <line x1={pL} x2={W - pR} y1={y(v)} y2={y(v)} stroke="#f5f5f0" strokeWidth={1} />
                            <text x={pL - 8} y={y(v) + 3.5} fill="#c8c8c0" fontSize={8.5}
                                  textAnchor="end" fontFamily="ui-monospace, monospace">{v}</text>
                        </g>
                    ))}
                    {activeIdx.map((ri, i) => (
                        <text key={ri} x={xPos[i]} y={H - 6} fill="#d4d4c8" fontSize={7.5}
                              textAnchor="middle" fontFamily="ui-monospace, monospace">{raceLabels[ri]}</text>
                    ))}
                    {[...visible].reverse().map(driver => {
                        const pts = activeIdx.map((ri, i) => `${xPos[i]},${y(driver.cumulative[ri] ?? 0)}`).join(" ");
                        const isH = hovered === driver.id;
                        const dim = hovered && !isH;
                        return (
                            <g key={driver.id}
                               onMouseEnter={() => setHovered(driver.id)}
                               onMouseLeave={() => setHovered(null)}
                               className="cursor-pointer"
                            >
                                <polyline points={pts} fill="none" stroke={driver.color}
                                          strokeWidth={isH ? 2.2 : 1.3}
                                          strokeDasharray={driverDash[driver.id] ? "4,3" : "none"}
                                          strokeLinejoin="round" strokeLinecap="round"
                                          opacity={dim ? 0.06 : isH ? 1 : 0.5}
                                          style={{ transition: "opacity 0.3s, stroke-width 0.2s" }}
                                />
                                {isH && activeIdx.map((ri, i) => (
                                    <circle key={i} cx={xPos[i]} cy={y(driver.cumulative[ri] ?? 0)}
                                            r={2.2} fill={driver.color} stroke="#fff" strokeWidth={1.5} />
                                ))}
                                <text
                                    x={xPos[xPos.length - 1] + 8}
                                    y={y(driver.cumulative[activeIdx[activeIdx.length - 1]] ?? 0) + 3.5}
                                    fill={dim ? "#e8e8e0" : driver.color}
                                    fontSize={9} fontWeight={isH ? 600 : 400}
                                    fontFamily="system-ui, sans-serif"
                                    opacity={dim ? 0.4 : 1}
                                    style={{ transition: "opacity 0.3s" }}
                                >{driver.name}</text>
                            </g>
                        );
                    })}
                </svg>
            )}
        </div>

    );

}
