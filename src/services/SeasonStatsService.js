import {API} from "../main.jsx";


async function fetchRetry(url, retries = 3, delay = 1000) {
    for (let i = 0; i <= retries; i++) {
        try {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 15000);
            const res = await fetch(url, { signal: ctrl.signal });
            clearTimeout(t);
            if (res.status === 429) {
                await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
                continue;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            if (i === retries) throw e;
            await new Promise(r => setTimeout(r, delay * (i + 1)));
        }
    }
}

async function fetchBatched(items, batchSize = 3, gapMs = 600) {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const settled = await Promise.allSettled(
            batch.map(({ url }) => fetchRetry(url))
        );
        settled.forEach((r, j) => {
            results.push({
                key: batch[j].key,
                data: r.status === "fulfilled" ? r.value : null,
            });
        });
        if (i + batchSize < items.length) {
            await new Promise(r => setTimeout(r, gapMs));
        }
    }
    return results;
}

function extractRaces(json) {
    return json?.MRData?.RaceTable?.Races ?? [];
}

function extractDriverStandings(json) {
    const lists = json?.MRData?.StandingsTable?.StandingsLists;
    if (!lists || !lists.length) return [];
    return lists[0].DriverStandings ?? [];
}

function extractResults(json) {
    const races = json?.MRData?.RaceTable?.Races;
    if (!races || !races.length) return [];
    return races[0].Results ?? [];
}

const teamColourMapping = {
    "mclaren": "FF8000",
    "red_bull": "3671C6",
    "ferrari": "E8002D",
    "mercedes": "27F4D2",
    "aston_martin": "229971",
    "alpine": "0093CC",
    "williams": "64C4FF",
    "rb": "6692FF",
    "haas": "B6BABD",
    "sauber": "52E252",
    "kick_sauber": "52E252",
    "racing_bulls": "6692FF",
    "alphatauri": "6692FF",
    "alfa": "C92D4B",
};

function teamColour(constructorId) {
    const id = (constructorId || "").toLowerCase();
    return teamColourMapping[id] || "888888";
}

export const SeasonStatsService = {
    async fetchSessions(year) {
        const json = await fetchRetry(`${API}/${year}.json?limit=100`);
        return extractRaces(json);
    },

    async fetchDriverStandings(year, round) {
        const json = await fetchRetry(
            `${API}/${year}/${round}/driverstandings.json`
        );
        const raw = extractDriverStandings(json);
        return raw.map(s => ({
            driver_number: parseInt(s.Driver?.permanentNumber, 10) || null,
            driverId: s.Driver?.driverId,
            code: s.Driver?.code,
            givenName: s.Driver?.givenName,
            familyName: s.Driver?.familyName,
            constructorId: s.Constructors?.[0]?.constructorId,
            constructorName: s.Constructors?.[0]?.name,
            team_colour: teamColour(s.Constructors?.[0]?.constructorId),
            position: parseInt(s.position, 10),
            points: parseFloat(s.points),
            wins: parseInt(s.wins, 10),
        }));
    },

    async fetchAllRoundStandings(year, totalRounds) {
        const items = [];
        for (let r = 1; r <= totalRounds; r++) {
            items.push({
                key: r,
                url: `${API}/${year}/${r}/driverstandings.json`,
            });
        }
        const raw = await fetchBatched(items, 3, 600);

        const failed = raw.filter(r => !r.data);
        if (failed.length > 0) {
            const retryItems = failed.map(f => ({
                key: f.key,
                url: `${API}/${year}/${f.key}/driverstandings.json`,
            }));
            const retried = await fetchBatched(retryItems, 2, 1000);
            retried.forEach(r => {
                if (r.data) {
                    const idx = raw.findIndex(x => x.key === r.key);
                    if (idx !== -1) raw[idx] = r;
                }
            });
        }

        const result = new Map();
        raw.forEach(r => {
            if (!r.data) return;
            const standings = extractDriverStandings(r.data);
            if (standings.length > 0) {
                result.set(r.key, standings.map(s => ({
                    driver_number: parseInt(s.Driver?.permanentNumber, 10) || null,
                    driverId: s.Driver?.driverId,
                    code: s.Driver?.code,
                    givenName: s.Driver?.givenName,
                    familyName: s.Driver?.familyName,
                    constructorId: s.Constructors?.[0]?.constructorId,
                    constructorName: s.Constructors?.[0]?.name,
                    team_colour: teamColour(s.Constructors?.[0]?.constructorId),
                    position: parseInt(s.position, 10),
                    points: parseFloat(s.points),
                    wins: parseInt(s.wins, 10),
                })));
            }
        });
        return result;
    },

    async fetchSessionResults(year, round) {
        const json = await fetchRetry(
            `${API}/${year}/${round}/results.json?limit=100`
        );
        const results = extractResults(json);
        return results.map(r => ({
            driver_number: parseInt(r.number, 10),
            driverId: r.Driver?.driverId,
            code: r.Driver?.code,
            givenName: r.Driver?.givenName,
            familyName: r.Driver?.familyName,
            fullName: `${r.Driver?.givenName} ${r.Driver?.familyName}`,
            constructorId: r.Constructor?.constructorId,
            team: r.Constructor?.name,
            team_colour: teamColour(r.Constructor?.constructorId),
            position: r.position ? parseInt(r.position, 10) : null,
            points: parseFloat(r.points) || 0,
            grid: parseInt(r.grid, 10),
            laps: parseInt(r.laps, 10),
            status: r.status,
            time: r.Time?.time || null,
            dnf: !["Finished", "+1 Lap", "+2 Laps", "+3 Laps", "+4 Laps", "+5 Laps", "+6 Laps"].includes(r.status),
            dns: r.status === "Did not start",
            dsq: r.status === "Disqualified" || r.positionText === "D",
        }));
    },
};