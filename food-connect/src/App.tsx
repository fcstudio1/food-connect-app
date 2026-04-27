import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Forum from "./pages/Forum";
import logoUrl from "./assets/Lehigh_University.png";

// This small sub-component handles the "active" styling for the links
function NavLink({ to, children }: { to: string, children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 active:scale-95 ${
        isActive 
          ? "bg-[#41682c] text-white shadow-md" 
          : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
      }`}
    >
      {children}
    </Link>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
        
        {/* HEADER */}
        <header className="sticky top-0 z-[1000] bg-white/80 backdrop-blur-md flex flex-col md:flex-row items-center justify-between px-6 py-4 shadow-sm border-b border-slate-200 gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-white p-1 rounded-lg group-hover:rotate-3 transition-transform duration-300">
               <img src={logoUrl} alt="Logo" className="w-8 h-10 object-contain" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-[#2d4a1c] tracking-tighter">
              BAY AREA <span className="text-green-600">FOOD CONNECT</span>
            </h1>
          </Link>

          {/* NEW PILL NAVIGATION SECTION */}
          <nav className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-full border border-slate-200 shadow-inner">
            <NavLink to="/">Map</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/forum">Forum</NavLink>
          </nav>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-6 md:py-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/forum" element={<Forum />} />
          </Routes>
        </main>

        <footer className="py-8 text-center text-slate-400 text-xs border-t border-slate-100 bg-white">
          <p>© 2026 Bay Area Food Connect • Supporting Student Food Security</p>
        </footer>

      </div>
    </Router>
  );
}