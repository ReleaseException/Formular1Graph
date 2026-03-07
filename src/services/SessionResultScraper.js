export const SessionResultScraper = {
    parseTimeGap(timeGap) {
        if (!timeGap) return null;
        timeGap = timeGap.trim();
        if (timeGap === "") return null;
        
        if (["DNS", "DNF", "DSQ"].includes(timeGap)) {
            return timeGap;
        }

        if (timeGap.startsWith("+")) {
            if (timeGap.toUpperCase().includes("LAP")) {
                return timeGap.toUpperCase();
            } else if (timeGap.endsWith("s")) {
                const val = parseFloat(timeGap.substring(1, timeGap.length - 1));
                return isNaN(val) ? timeGap : val;
            }
        }

        try {
            return this.toSeconds(timeGap);
        } catch (e) {
            console.error(`Unrecognized time gap format: ${timeGap}`, e);
            return timeGap;
        }
    },

    toSeconds(timeStr) {
        if (!timeStr) return 0;
        const parts = timeStr.split(":");
        if (parts.length === 2) {
            return parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
        } else if (parts.length === 3) {
            return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseFloat(parts[2]);
        }
        return parseFloat(timeStr);
    },

    parsePage(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const table = doc.querySelector("table.Table-module_table__cKsW2");
        if (!table) {
            throw new Error("No results table found");
        }

        const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.textContent.trim().toUpperCase());
        const headerMap = {
            "POS.": "position",
            "NO.": "driver_number",
            "LAPS": "number_of_laps",
            "TIME/RETIRED": "time_gap",
            "TIME / RETIRED": "time_gap",
            "TIME / GAP": "time_gap",
            "TIME": "time_gap",
            "PTS.": "points",
            "PTS": "points",
            "Q1": "Q1",
            "Q2": "Q2",
            "Q3": "Q3",
        };

        const rows = Array.from(table.querySelectorAll("tbody tr"));
        const rawResults = [];

        rows.forEach(row => {
            const cols = Array.from(row.querySelectorAll("td"));
            const driverData = {};
            headers.forEach((headerText, i) => {
                const outputKey = headerMap[headerText];
                if (!outputKey || i >= cols.length) return;

                const cellValue = cols[i].textContent.trim();
                if (!cellValue) {
                    driverData[outputKey] = null;
                    return;
                }

                try {
                    if (outputKey === "position") {
                        driverData[outputKey] = (["DQ", "NC"].includes(cellValue)) ? null : parseInt(cellValue, 10);
                    } else if (["driver_number", "number_of_laps"].includes(outputKey)) {
                        driverData[outputKey] = parseInt(cellValue, 10);
                    } else if (outputKey === "points") {
                        driverData[outputKey] = parseFloat(cellValue);
                    } else if (["time_gap", "Q1", "Q2", "Q3"].includes(outputKey)) {
                        driverData[outputKey] = this.parseTimeGap(cellValue);
                    } else {
                        driverData[outputKey] = cellValue;
                    }
                } catch (e) {
                    console.error(`Unhandled value format for output_key '${outputKey}': ${cellValue}`, e);
                    driverData[outputKey] = cellValue;
                }
            });
            if (Object.keys(driverData).length > 0) {
                rawResults.push(driverData);
            }
        });

        if (rawResults.length === 0) return [];

        const isQualifying = "Q1" in rawResults[0];
        if (isQualifying) {
            return this.processQualifyingResults(rawResults);
        } else {
            return this.processPracticeAndRaceResults(rawResults);
        }
    },

    processQualifyingResults(resultsData) {
        const bestTimes = {
            Q1: Math.min(...resultsData.map(d => typeof d.Q1 === 'number' ? d.Q1 : Infinity)),
            Q2: Math.min(...resultsData.map(d => typeof d.Q2 === 'number' ? d.Q2 : Infinity)),
            Q3: Math.min(...resultsData.map(d => typeof d.Q3 === 'number' ? d.Q3 : Infinity)),
        };

        ["Q1", "Q2", "Q3"].forEach(k => { if (bestTimes[k] === Infinity) bestTimes[k] = null; });

        return resultsData.map(doc => {
            const qTimes = { Q1: doc.Q1, Q2: doc.Q2, Q3: doc.Q3 };
            const statuses = new Set([doc.Q1, doc.Q2, doc.Q3].filter(q => typeof q === 'string'));
            
            const processed = {
                ...doc,
                dnf: statuses.has("DNF"),
                dns: statuses.has("DNS"),
                dsq: statuses.has("DSQ"),
                duration: [
                    typeof qTimes.Q1 === 'number' ? qTimes.Q1 : null,
                    typeof qTimes.Q2 === 'number' ? qTimes.Q2 : null,
                    typeof qTimes.Q3 === 'number' ? qTimes.Q3 : null,
                ],
                gap_to_leader: [
                    (typeof qTimes.Q1 === 'number' && bestTimes.Q1) ? Math.round((qTimes.Q1 - bestTimes.Q1) * 1000) / 1000 : null,
                    (typeof qTimes.Q2 === 'number' && bestTimes.Q2) ? Math.round((qTimes.Q2 - bestTimes.Q2) * 1000) / 1000 : null,
                    (typeof qTimes.Q3 === 'number' && bestTimes.Q3) ? Math.round((qTimes.Q3 - bestTimes.Q3) * 1000) / 1000 : null,
                ]
            };
            delete processed.Q1;
            delete processed.Q2;
            delete processed.Q3;
            return processed;
        });
    },

    processPracticeAndRaceResults(resultsData) {
        const leader = resultsData.find(d => d.position === 1);
        const leaderDuration = (leader && typeof leader.time_gap === 'number') ? leader.time_gap : null;

        return resultsData.map(doc => {
            const timeInfo = doc.time_gap;
            const processed = { ...doc };
            delete processed.time_gap;

            ["DNF", "DNS", "DSQ"].forEach(status => {
                processed[status.toLowerCase()] = timeInfo === status;
            });

            let currentTimeInfo = timeInfo;
            if (["DNF", "DNS", "DSQ"].includes(timeInfo)) {
                currentTimeInfo = null;
            }

            const isLeader = doc.position === 1;
            if (isLeader && leaderDuration !== null) {
                processed.duration = leaderDuration;
                processed.gap_to_leader = 0;
            } else if (typeof currentTimeInfo === 'number' && leaderDuration !== null) {
                processed.gap_to_leader = currentTimeInfo;
                processed.duration = Math.round((leaderDuration + currentTimeInfo) * 1000) / 1000;
            } else {
                processed.gap_to_leader = currentTimeInfo;
                processed.duration = null;
            }
            return processed;
        });
    }
};
