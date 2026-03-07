import { createRoot } from 'react-dom/client'
import './index.css'
import SeasonStatsRoot from "./views/SeasonStatsRoot.jsx";

//api endpoint used by the official Formula 1 website https://www.formula1.com
export const API = "https://api.jolpi.ca/ergast/f1";

createRoot(document.getElementById('root')).render(
    <SeasonStatsRoot/>
)
