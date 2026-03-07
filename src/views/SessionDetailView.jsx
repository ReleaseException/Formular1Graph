export function SessionDetailView({ session, results, onClose }) {
    if (!session) return null;
    return (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-5 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                    <div>
                        <h2 className="text-xl font-light text-stone-800">
                            {session.country_name} · <span className="text-stone-400 font-mono text-base uppercase">{session.session_name}</span>
                        </h2>
                        <p className="text-xs text-stone-400 mt-1">
                            {session.circuit_short_name} · {new Date(session.date_start).toLocaleDateString()}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-stone-300 hover:text-stone-500 transition-colors cursor-pointer p-1">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {!results ? (
                        <div className="p-20 text-center text-stone-300 text-sm">Loading results...</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-widest text-stone-400 font-medium border-b border-stone-100">
                                    <th className="px-6 py-3 font-medium">Pos</th>
                                    <th className="px-6 py-3 font-medium">Driver</th>
                                    <th className="px-6 py-3 font-medium">Team</th>
                                    <th className="px-6 py-3 font-medium text-right">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((r, i) => (
                                    <tr key={r.driver_number} className="border-b border-stone-50 hover:bg-stone-50 transition-colors group">
                                        <td className="px-6 py-3.5 text-xs font-mono font-medium text-stone-400">
                                            {r.position || '-'}
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center">
                                                <div className="w-1 h-3.5 mr-3 rounded-full" style={{ backgroundColor: r.team_colour ? `#${r.team_colour}` : '#ccc' }} />
                                                <span className="text-sm font-medium text-stone-800">{r.fullName}</span>
                                                <span className="text-[10px] font-mono text-stone-300 ml-2">#{r.driver_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 text-xs text-stone-500 font-medium">
                                            {r.team}
                                        </td>
                                        <td className="px-6 py-3.5 text-xs font-mono text-stone-800 text-right font-semibold">
                                            {r.points}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                
                <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex justify-between items-center">
                   <p className="text-[10px] text-stone-300 uppercase tracking-tighter">
                       Powered by OpenF1 API & Scraping Logic
                   </p>
                </div>
            </div>
        </div>
    );
}
