import { SeasonStatsService } from "../services/SeasonStatsService.js";

const countryCodes = {
    "Australia":"AUS",
    "China":"CHN",
    "Japan":"JPN",
    "Bahrain":"BHR",
    "Saudi Arabia":"SAU",
    "United States":"USA",
    "Italy":"ITA",
    "Monaco":"MON",
    "Spain":"ESP",
    "Canada":"CAN",
    "Austria":"AUT",
    "Great Britain":"GBR",
    "Belgium":"BEL",
    "Hungary":"HUN",
    "Netherlands":"NED",
    "Azerbaijan":"AZE",
    "Singapore":"SGP",
    "Mexico":"MEX",
    "Brazil":"BRA",
    "Qatar":"QAT",
    "United Arab Emirates":"ARE",
};

export function raceCode(s) {
    const country = s.Circuit?.Location?.country || "";
    const circuitName = (s.Circuit?.circuitName || "").toLowerCase();
    const base = countryCodes[country] || country.slice(0, 3).toUpperCase();
    if (base === "USA" || base === "UNI") {
        if (circuitName.includes("miami")) return "MIA";
        if (circuitName.includes("vegas")) return "LVG";
        return "USA";
    }
    if (base === "ITA" && (circuitName.includes("imola") || circuitName.includes("enzo"))) return "EMI";
    return base;
}

export const SeasonStatsPresenter = {
    loadSeasonData: async (year, setProgress) => {
        SeasonStatsPresenter._lastYear = year;
        setProgress({ text: `Loading sessions for ${year}...`, done: 0, total: 0 });
        const allSess = await SeasonStatsService.fetchSessions(year);
        
        const races = allSess.sort((a, b) => parseInt(a.round) - parseInt(b.round));
        if (!races.length) throw new Error(`No sessions for ${year} found`);

        setProgress({ text: "Loading sessions...", done: 0, total: races.length });

        const allStandings = await SeasonStatsService.fetchAllRoundStandings(year, races.length);
        
        const validRaces = races.filter(r => allStandings.has(parseInt(r.round)));
        if (!validRaces.length) throw new Error("No standings data loaded — API not reachable");

        const raceLabels = validRaces.map(raceCode);
        const raceNames = validRaces.map(s => s.Circuit?.Location?.country || s.raceName || "");

        const driverInfoMap = new Map();
        allStandings.forEach((standings) => {
            standings.forEach(s => {
                if (!driverInfoMap.has(s.driverId)) {
                    driverInfoMap.set(s.driverId, {
                        id: s.driverId,
                        number: s.driver_number,
                        code: s.code,
                        fullName: `${s.givenName} ${s.familyName}`,
                        team: s.constructorName,
                        color: `#${s.team_colour}`,
                    });
                } else {
                    const existing = driverInfoMap.get(s.driverId);
                    existing.team = s.constructorName;
                    existing.color = `#${s.team_colour}`;
                }
            });
        });

        const allDrivers = Array.from(driverInfoMap.values()).map(info => {
            const cum = [];
            validRaces.forEach((s, i) => {
                const round = parseInt(s.round);
                const roundStandings = allStandings.get(round);
                const entry = roundStandings?.find(d => d.driverId === info.id);
                
                if (entry) {
                    cum.push(entry.points);
                } else {
                    cum.push(i > 0 ? cum[i - 1] : 0);
                }
            });
            
            const deltas = cum.map((v, i) => (i === 0 ? v : v - cum[i - 1]));
            
            return {
                id: info.id,
                name: info.code || info.fullName,
                fullName: info.fullName,
                team: info.team,
                color: info.color,
                cumulative: cum,
                total: cum[cum.length - 1] || 0,
                deltas,
            };
        });

        const enrichedRaces = validRaces.map(r => ({
            ...r,
            session_key: r.round,
            country_name: r.Circuit?.Location?.country,
            session_name: "Race",
            circuit_short_name: r.Circuit?.circuitName,
            date_start: r.date
        }));

        return { 
            raceLabels, 
            raceNames, 
            allDrivers, 
            validRaces: enrichedRaces 
        };
    },

    loadSessionResults: async (round) => {
        return await SeasonStatsService.fetchSessionResults(SeasonStatsPresenter._lastYear || 2025, round);
    },

    calculateDriverStandings: (allDrivers, excluded) => {
        return allDrivers.map(d => {
            if (!excluded.size) return d;
            let r = 0;
            const c = d.deltas.map((delta, i) => { if (!excluded.has(i)) r += delta; return r; });
            return { ...d, cumulative: c, total: r };
        }).sort((a, b) => b.total - a.total);
    }
};
