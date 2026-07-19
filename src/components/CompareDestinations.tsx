import { useState } from "react";
import { ArrowRightLeft, DollarSign, CloudSun, Compass, Globe, Info } from "lucide-react";

interface CompareItem {
  name: string;
  budget: string;
  currency: string;
  language: string;
  weather: string;
  temp: string;
  bestTime: string;
  vibe: string;
  attractions: string[];
}

const PRESET_PLACES: Record<string, CompareItem> = {
  tokyo: {
    name: "Tokyo, Japan",
    budget: "Medium-High ($180 - $250/day)",
    currency: "JPY (¥)",
    language: "Japanese",
    weather: "Temperate, four distinct seasons",
    temp: "15°C (59°F)",
    bestTime: "March to May (Cherry Blossoms)",
    vibe: "Ultra-modern meets ancient tradition",
    attractions: ["Shibuya Crossing", "Sensō-ji Temple", "Meiji Jingu Shrine"],
  },
  paris: {
    name: "Paris, France",
    budget: "High ($200 - $300/day)",
    currency: "EUR (€)",
    language: "French",
    weather: "Mild winters, warm summers",
    temp: "12°C (54°F)",
    bestTime: "April to June or Sept to Oct",
    vibe: "Romantic, artistic, culinary hub",
    attractions: ["Eiffel Tower", "Louvre Museum", "Notre-Dame Cathedral"],
  },
  bali: {
    name: "Bali, Indonesia",
    budget: "Budget-Friendly ($40 - $80/day)",
    currency: "IDR (Rp)",
    language: "Indonesian / Balinese",
    weather: "Tropical, warm year-round",
    temp: "27°C (81°F)",
    bestTime: "April to October (Dry season)",
    vibe: "Tropical beaches, spiritual, laidback",
    attractions: ["Ubud Sacred Monkey Forest", "Uluwatu Temple", "Nusa Penida"],
  },
  london: {
    name: "London, UK",
    budget: "High ($220 - $320/day)",
    currency: "GBP (£)",
    language: "English",
    weather: "Mild, frequent light showers",
    temp: "11°C (52°F)",
    bestTime: "June to August",
    vibe: "Cosmopolitan, royal heritage, theatrical",
    attractions: ["Big Ben", "British Museum", "London Eye"],
  },
  nyc: {
    name: "New York, USA",
    budget: "Very High ($250 - $400/day)",
    currency: "USD ($)",
    language: "English",
    weather: "Hot summers, freezing winters",
    temp: "13°C (55°F)",
    bestTime: "September to November",
    vibe: "Fast-paced, high energy, Broadway lights",
    attractions: ["Times Square", "Central Park", "Statue of Liberty"],
  },
  rome: {
    name: "Rome, Italy",
    budget: "Medium ($120 - $200/day)",
    currency: "EUR (€)",
    language: "Italian",
    weather: "Mediterranean, warm summers",
    temp: "16°C (61°F)",
    bestTime: "April to June or September to October",
    vibe: "Historic ruins, renaissance art, pasta heaven",
    attractions: ["Colosseum", "Vatican Museums", "Trevi Fountain"],
  },
};

export default function CompareDestinations() {
  const [leftKey, setLeftKey] = useState<string>("tokyo");
  const [rightKey, setRightKey] = useState<string>("paris");

  const left = PRESET_PLACES[leftKey];
  const right = PRESET_PLACES[rightKey];

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm" id="compare-destinations-module">
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-blue-600" /> Compare Destinations Side-by-Side
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Select target holiday destinations to compare cost breakdowns, general climate, local accents, and vibes before generating.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
            First Destination
          </label>
          <select
            value={leftKey}
            onChange={(e) => setLeftKey(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800"
          >
            {Object.entries(PRESET_PLACES).map(([key, item]) => (
              <option key={key} value={key}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
            Second Destination
          </label>
          <select
            value={rightKey}
            onChange={(e) => setRightKey(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800"
          >
            {Object.entries(PRESET_PLACES).map(([key, item]) => (
              <option key={key} value={key}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <table className="w-full text-xs text-left divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider w-1/4">Metric</th>
              <th className="px-4 py-3 font-extrabold text-slate-900 w-3/8">{left?.name}</th>
              <th className="px-4 py-3 font-extrabold text-slate-900 w-3/8">{right?.name}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="px-4 py-3 font-bold text-slate-500 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Daily Cost Allocation
              </td>
              <td className="px-4 py-3 font-semibold text-slate-800">{left?.budget}</td>
              <td className="px-4 py-3 font-semibold text-slate-800">{right?.budget}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-bold text-slate-500 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-500" /> Language & Exchange
              </td>
              <td className="px-4 py-3 text-slate-600">
                <p><span className="font-semibold text-slate-700">Language:</span> {left?.language}</p>
                <p className="mt-0.5"><span className="font-semibold text-slate-700">Currency:</span> {left?.currency}</p>
              </td>
              <td className="px-4 py-3 text-slate-600">
                <p><span className="font-semibold text-slate-700">Language:</span> {right?.language}</p>
                <p className="mt-0.5"><span className="font-semibold text-slate-700">Currency:</span> {right?.currency}</p>
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-bold text-slate-500 flex items-center gap-1.5">
                <CloudSun className="w-3.5 h-3.5 text-amber-500" /> Climate & Ideal Season
              </td>
              <td className="px-4 py-3 text-slate-600">
                <p className="font-semibold text-slate-800">{left?.temp} (Average)</p>
                <p className="text-[11px] text-slate-400 italic mt-0.5">{left?.bestTime}</p>
              </td>
              <td className="px-4 py-3 text-slate-600">
                <p className="font-semibold text-slate-800">{right?.temp} (Average)</p>
                <p className="text-[11px] text-slate-400 italic mt-0.5">{right?.bestTime}</p>
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-bold text-slate-500 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-500" /> Vibe & Key Attractions
              </td>
              <td className="px-4 py-3 text-slate-600">
                <p className="font-bold text-slate-800 mb-1">{left?.vibe}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {left?.attractions.map((attr, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {attr}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">
                <p className="font-bold text-slate-800 mb-1">{right?.vibe}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {right?.attractions.map((attr, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {attr}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-800 flex gap-2">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Pro Travel Tip:</span> Bali is exceptional for long-stay remote working or cost-efficient luxury, while Tokyo offers hyper-efficient urban exploring. Select the best match for your style!
        </div>
      </div>
    </div>
  );
}
