import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from 'leaflet';
import "leaflet/dist/leaflet.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


// --- UPDATED TYPES ---
type Location = {
  _id: string; 
  name: string;
  type: string;
  county: string;
  position: [number, number];
  address: string;
  offerings: string[];
  schedule: {
    days: number[];
    openHour: number;
    closeHour: number;
  };
};

// --- CONSTANTS & CONFIG ---
const COUNTIES = ["All", "San Francisco", "Alameda", "Contra Costa", "San Mateo", "Santa Clara", "Marin", "Solano"];
const ORG_TYPES = ["All", "Pantry", "Hot Meal", "Food bank", "College Pantry"];

const COUNTY_COLORS: Record<string, string> = {
  "San Francisco": "#ef4444", // Red
  "Alameda": "#3b82f6",       // Blue
  "Contra Costa": "#8b5cf6",  // Purple
  "San Mateo": "#f59e0b",     // Amber
  "Santa Clara": "#10b981",   // Emerald
  "Marin": "#ec4899",         // Pink
  "Solano": "#06b6d4",        // Cyan
  "Default": "#64748b"        // Slate
};

// --- HELPERS ---
const formatTime = (hour: number) => {
  const h = Math.floor(hour);
  const m = (hour % 1 === 0) ? "00" : "30";
  const suffix = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 || 12;
  return `${displayHour}:${m} ${suffix}`;
};

const getPlaceStatus = (location: Location) => {
  const now = new Date();
  const caTime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
  const caDate = new Date(caTime);
  
  const currentDay = caDate.getDay(); 
  const currentHour = caDate.getHours() + caDate.getMinutes() / 60;

  const { days, openHour, closeHour } = location.schedule;
  const isOpen = days.includes(currentDay) && currentHour >= openHour && currentHour < closeHour;

  return {
    isOpen,
    label: isOpen ? "Open" : "Closed",
    timeString: `${formatTime(openHour)} - ${formatTime(closeHour)}`
  };
};

const createCustomIcon = (county: string, isSelected: boolean) => {
  const color = COUNTY_COLORS[county] || COUNTY_COLORS["Default"];
  const scale = isSelected ? 'scale(1.3)' : 'scale(1)';
  
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        transform: ${scale};
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg) ${scale};
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      ">
        <div style="
          transform: rotate(45deg);
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

function MapController({ selectedLocation }: { selectedLocation: Location | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedLocation) {
      map.flyTo(selectedLocation.position, 15, { duration: 1.5 });
    }
  }, [selectedLocation, map]);
  return null;
}

export default function Home() {
  const [locationsData, setLocationsData] = useState<Location[]>([]);
  const [search, setSearch] = useState("");
  const [activeCounty, setActiveCounty] = useState("All");
  const [activeType, setActiveType] = useState("All");
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/locations`)
      .then((res) => res.json())
      .then((data) => setLocationsData(data))
      .catch((err) => console.log("Fetch error:", err));
  }, []);

  const handleTravelClick = (mode: 'bicycling' | 'transit' | 'driving') => {
    if (!selectedLocation) return alert("Please select a location on the list first!");
    const [lat, lng] = selectedLocation.position;
    // URL Fixed: Changed '0' to '?'
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${mode}`, '_blank');
  };

  const center: LatLngExpression = [37.7749, -122.4194];

  const filtered = locationsData.filter((loc) => {
    const statusInfo = getPlaceStatus(loc);
    const matchesSearch = loc.name.toLowerCase().includes(search.toLowerCase());
    const matchesCounty = activeCounty === "All" || loc.county === activeCounty;
    const matchesType = activeType === "All" || loc.type === activeType;
    const matchesOpenStatus = showOnlyOpen ? statusInfo.isOpen : true;
    return matchesSearch && matchesCounty && matchesType && matchesOpenStatus;
  });

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full p-4 md:p-6">
      
      {/* HERO SECTION */}
      <div className="relative rounded-[2rem] bg-slate-900 h-[180px] md:h-[240px] shadow-2xl overflow-hidden border-4 border-white">
        <img
          src="https://news.okstate.edu/articles/agriculture/images/student-farm-24-banner.jpg"
          alt="Garden"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-1">
              FOOD <span className="text-green-400">CONNECT</span>
            </h2>
            <p className="text-white/70 font-bold text-[10px] md:text-xs uppercase tracking-[0.3em]">
              By students, for students
            </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN: SIDEBAR */}
        <div className="w-full lg:w-[420px] flex flex-col gap-4 order-2 lg:order-1">
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-6 flex flex-col h-[700px]">
            
            <input
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 outline-none focus:border-green-500 transition-all mb-4"
              placeholder="Search locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="mb-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Region</label>
              <select 
                className="w-full bg-white border-2 border-slate-100 rounded-xl px-3 py-2 mt-1 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                value={activeCounty}
                onChange={(e) => setActiveCounty(e.target.value)}
              >
                {COUNTIES.map(c => <option key={c} value={c}>{c} County</option>)}
              </select>
            </div>

            <div className="flex items-center justify-between mb-4 bg-green-50/50 border border-green-100 rounded-2xl p-4">
              <div>
                <p className="text-xs font-black text-green-800 uppercase tracking-wider">Availability</p>
                <p className="text-[10px] text-green-600 font-bold">Show Open Now Only</p>
              </div>
              <button
                onClick={() => setShowOnlyOpen(!showOnlyOpen)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showOnlyOpen ? 'bg-green-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showOnlyOpen ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {ORG_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveType(t)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${
                    activeType === t ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {filtered.map((loc) => {
                const status = getPlaceStatus(loc);
                return (
                  <div
                    key={loc._id}
                    onClick={() => setSelectedLocation(loc)}
                    className={`p-4 border-2 rounded-2xl transition-all cursor-pointer group
                      ${selectedLocation?._id === loc._id ? 'bg-green-50 border-green-500 shadow-md' : 'bg-white border-slate-50 hover:border-slate-200'}
                    `}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-slate-800 text-sm group-hover:text-green-700">{loc.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        status.isOpen ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{loc.county} • {loc.type}</p>
                    <p className="text-[10px] text-slate-600 font-bold mb-2">Hours: {status.timeString}</p>
                    <div className="flex flex-wrap gap-1">
                      {loc.offerings.map((food, idx) => (
                        <span key={idx} className="text-[8px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-bold uppercase">
                          {food}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MAP */}
        <div className="flex-1 flex flex-col gap-4 order-1 lg:order-2">
          <div className="h-[400px] lg:h-full min-h-[500px] w-full rounded-[2rem] shadow-2xl border-4 border-white overflow-hidden relative">
            
            {/* COUNTY LEGEND */}
            <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 hidden sm:block">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">County Key</p>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(COUNTY_COLORS).filter(([k]) => k !== "Default").map(([county, color]) => (
                  <div key={county} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[10px] font-bold text-slate-600 uppercase">{county}</span>
                  </div>
                ))}
              </div>
            </div>

            <MapContainer center={center} zoom={11} style={{ height: "100%", width: "100%" }} zoomControl={false}>
              <MapController selectedLocation={selectedLocation} />
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              {filtered.map((loc) => (
                <Marker 
                  key={loc._id} 
                  position={loc.position}
                  icon={createCustomIcon(loc.county, selectedLocation?._id === loc._id)}
                  eventHandlers={{ click: () => setSelectedLocation(loc) }}
                >
                  <Popup>
                    <div className="p-1 text-center">
                      <p className="font-bold text-slate-800 text-xs uppercase">{loc.name}</p>
                      <p className="text-[10px] text-slate-500 mb-2">{loc.address}</p>
                      <button 
                        onClick={() => handleTravelClick('transit')}
                        className="bg-slate-900 text-white text-[9px] px-3 py-1 rounded-full font-black uppercase"
                      >
                        Get Directions
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button onClick={() => handleTravelClick('bicycling')} className="bg-white border-2 border-slate-100 rounded-2xl py-4 font-black text-[10px] text-slate-700 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm">🚲 BIKE</button>
            <button onClick={() => handleTravelClick('transit')} className="bg-white border-2 border-slate-100 rounded-2xl py-4 font-black text-[10px] text-slate-700 hover:bg-purple-50 hover:border-purple-200 transition-all shadow-sm">🚌 BUS</button>
            <button onClick={() => handleTravelClick('driving')} className="bg-white border-2 border-slate-100 rounded-2xl py-4 font-black text-[10px] text-slate-700 hover:bg-orange-50 hover:border-orange-200 transition-all shadow-sm">🚗 DRIVE</button>
            <button onClick={() => alert("Redirecting to Uber...")} className="bg-slate-900 border-2 border-slate-900 rounded-2xl py-4 font-black text-[10px] text-white hover:bg-slate-800 transition-all shadow-md">📱 UBER</button>
          </div>
        </div>
      </div>
    </div>
  );
}