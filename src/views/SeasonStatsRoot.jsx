import { useState, useEffect, useMemo } from "react";
import LoadingComponent from "./components/LoadingComponent.jsx";
import ErrorComponent from "./components/ErrorComponent.jsx";
import HeaderView from "./HeaderView.jsx";
import {RaceSessionToggleView} from "./RaceSessionToggleView.jsx";
import TopSelectionView from "./TopSelectionView.jsx";
import {RaceSessionChartView} from "./RaceSessionChartView.jsx";
import {RacerTableView} from "./RacerTableView.jsx";
import {SessionDetailView} from "./SessionDetailView.jsx";
import { SeasonStatsPresenter } from "../presenters/SeasonStatsPresenter.js";
import FooterView from "./FooterView.jsx";

export default function SeasonStatsRoot() {
    const [year, setYear] = useState(2025);
    const [raceLabels, setRaceLabels] = useState([]);
    const [raceNames, setRaceNames] = useState([]);
    const [allDrivers, setAllDrivers] = useState([]);
    const [validRaces, setValidRaces] = useState([]);
    const [excluded, setExcluded] = useState(new Set());
    const [hovered, setHovered] = useState(null);
    const [topN, setTopN] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState({ text: "Verbinde…", done: 0, total: 0 });
    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionResults, setSessionResults] = useState(null);

    useEffect(() => { load(year); }, [year]);

    const load = async (y) => {
        setLoading(true);
        setError(null);
        setExcluded(new Set());
        setSelectedSession(null);
        try {
            const { raceLabels, raceNames, allDrivers, validRaces } = await SeasonStatsPresenter.loadSeasonData(y, setProgress);
            setRaceLabels(raceLabels);
            setRaceNames(raceNames);
            setAllDrivers(allDrivers);
            setValidRaces(validRaces);
            setLoading(false);
        } catch (e) {
            setError(e.message);
            setLoading(false);
        }
    };

    const handleShowDetails = async (idx) => {
        const session = validRaces[idx];
        setSelectedSession(session);
        setSessionResults(null);
        try {
            const res = await SeasonStatsPresenter.loadSessionResults(session.session_key);
            setSessionResults(res);
        } catch (e) {
            console.error(e);
        }
    };

    const toggle = i => setExcluded(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; });

    const driverStandings = useMemo(() => {
        return SeasonStatsPresenter.calculateDriverStandings(allDrivers, excluded);
    }, [allDrivers, excluded]);

    const visible = driverStandings.slice(0, topN);
    const maxPts = Math.max(...visible.map(d => d.total), 1);

    const teamCount = {};
    const driverDash = {};
    visible.forEach(d => {
        if (!teamCount[d.team]) teamCount[d.team] = 0;
        teamCount[d.team]++;
        driverDash[d.id] = teamCount[d.team] > 1;
    });

    const W = 880, H = 370, pL = 42, pR = 80, pT = 10, pB = 30;
    const iW = W - pL - pR, iH = H - pT - pB;
    const activeIdx = raceLabels.map((_, i) => i).filter(i => !excluded.has(i));
    const xPos = activeIdx.map((_, idx) => pL + (idx / Math.max(activeIdx.length - 1, 1)) * iW);
    const y = v => pT + iH - (v / maxPts) * iH;
    const grids = [];
    const step = maxPts <= 100 ? 25 : maxPts <= 250 ? 50 : 100;
    for (let v = 0; v <= maxPts * 1.05; v += step) grids.push(v);

    if (loading) {
        return (<LoadingComponent progress={progress}/>);
    }

    if (error) {
        return (<ErrorComponent error={error} load={load} />);
    }

    return (
        <div className="min-h-screen bg-stone-50 text-stone-900 font-sans px-6 py-12">
            <div className="max-w-4xl mx-auto">
                <HeaderView raceLabels={raceLabels} currentYear={year} setYear={setYear} />
                <RaceSessionToggleView raceNames={raceNames} raceLabels={raceLabels} excluded={excluded} toggle={toggle} setExcluded={setExcluded} onDetails={handleShowDetails} />
                <div className="h-8" />
                <TopSelectionView topN={topN} driverStandings={driverStandings} setTopN={setTopN}></TopSelectionView>
                <RaceSessionChartView driverStandings={driverStandings} activeIdx={activeIdx} hovered={hovered} setHovered={setHovered} driverDash={driverDash} raceLabels={raceLabels} xPos={xPos} y={y} grids={grids} W={W} H={H} pL={pL} pR={pR} visible={visible}/>
                <RacerTableView driverStandings={driverStandings} hovered={hovered} setHovered={setHovered}/>
                <p className="mt-6 text-xs text-stone-300 text-center tracking-wide">
                    {raceLabels.length - excluded.size} / {raceLabels.length} Race
                </p>
                {selectedSession && (
                    <SessionDetailView 
                        session={selectedSession} 
                        results={sessionResults} 
                        onClose={() => setSelectedSession(null)} 
                    />
                )}
                
                <FooterView/>
            </div>
        </div>
    );
}
