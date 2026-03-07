export default function FooterView() {
    return (
        <footer className="mt-20 py-10 border-t border-stone-200 text-center">
            <p className="text-xs font-medium text-stone-400 tracking-widest uppercase mb-4">
                Formula 1 Racing Standings
            </p>
            <div className="flex flex-col gap-2 items-center">
                <p className="text-xs text-stone-300">
                    Built with React & Tailwind CSS
                </p>
                <p className="text-[10px] text-stone-200 leading-relaxed max-w-xs">
                    This project is for educational purposes only. Data is scraped from the official Formula 1 website and reflects session-by-session results.
                </p>
            </div>
            <div className="mt-6 flex justify-center gap-4">
                <a 
                    href="https://github.com/ReleaseException/Formular1Graph"
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-stone-400 hover:text-stone-800 transition-colors"
                >
                    Source Code
                </a>
                <span className="text-stone-200">·</span>
                <a 
                    href="https://www.formula1.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-stone-400 hover:text-stone-800 transition-colors"
                >
                    Official F1 Site
                </a>
            </div>
        </footer>
    );
}
