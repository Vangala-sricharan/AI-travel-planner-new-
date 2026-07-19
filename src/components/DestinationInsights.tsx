import { useState } from "react";
import { Compass, Sparkles, BookOpen, MapPin, Smile, MessageSquare, AlertCircle, HelpCircle } from "lucide-react";

interface DestinationInsightsProps {
  destination: string;
  language: string;
  currency: string;
  safetyAdvice: string;
}

export default function DestinationInsights({ destination, language, currency, safetyAdvice }: DestinationInsightsProps) {
  const [activeSubTab, setActiveSubTab] = useState<"gems" | "phrases" | "culture" | "gallery">("gems");

  // Dynamic Content Generation based on Destination Name
  const cleanDest = destination.split(",")[0].trim();

  // Curator mock lists matching major destination types
  const getGems = () => {
    if (cleanDest.match(/paris|france/i)) {
      return [
        { name: "La Petite Ceinture", desc: "An abandoned circular railway line that once ringed Paris, now a wild green corridor with flower-filled tracks and street art." },
        { name: "Musée de la Chasse et de la Nature", desc: "An eccentric, fascinating private museum in the Marais showcasing taxidermy, art, and weapons in beautifully styled rooms." },
        { name: "Arènes de Lutèce", desc: "One of the city's most ancient Roman relics—an outdoor amphitheater tucked behind apartments in the Latin Quarter." }
      ];
    } else if (cleanDest.match(/tokyo|japan/i)) {
      return [
        { name: "Todoroki Valley", desc: "A lush, emerald forest ravine with a winding stream and small shrines, hidden right inside Tokyo's Setagaya ward." },
        { name: "Kagurazaka Alleyways", desc: "A charming historic neighborhood with cobblestone alleys, traditional geisha houses, and delicious upscale French-Japanese bistros." },
        { name: "Nezu Shrine", desc: "An ancient shrine boasting a mesmerizing path of red torii gates, lush azaleas, and quiet ponds, without the crowds of Senso-ji." }
      ];
    } else {
      return [
        { name: "The Old Quarter Backstreets", desc: "Get lost away from the main avenues where local artisans, neighborhood vegetable markets, and traditional architecture thrive." },
        { name: "The Botanical Glasshouse Sanctuary", desc: "A secret, quiet greenhouse featuring exotic flora and relaxing waterfall gardens ideal for escaping mid-afternoon crowds." },
        { name: "The Panoramic Sunset Ridge", desc: "An off-the-beaten-path viewpoint loved by locals. Bring some fresh local snacks and watch the lights flicker on across the city." }
      ];
    }
  };

  const getPhrases = () => {
    const lang = (language || "English").toLowerCase();
    if (lang.includes("french")) {
      return [
        { orig: "Bonjour", phonetic: "bohn-zhoor", meaning: "Hello / Good morning" },
        { orig: "S'il vous plaît", phonetic: "seel voo pleh", meaning: "Please" },
        { orig: "Merci beaucoup", phonetic: "mair-see boh-coo", meaning: "Thank you very much" },
        { orig: "Où se trouve...?", phonetic: "oo suh troov", meaning: "Where is...?" },
        { orig: "L'addition, s'il vous plaît", phonetic: "lah-dee-syohn seel voo pleh", meaning: "The bill, please" }
      ];
    } else if (lang.includes("japanese")) {
      return [
        { orig: "Konnichiwa", phonetic: "kon-nee-chee-wah", meaning: "Hello" },
        { orig: "Onegai shimasu", phonetic: "oh-neh-guy shee-mas", meaning: "Please" },
        { orig: "Arigatou gozaimasu", phonetic: "ah-ree-gah-toe go-zy-mas", meaning: "Thank you very much" },
        { orig: "Kore wa ikura desu ka?", phonetic: "ko-reh wah ee-coo-rah des kah", meaning: "How much is this?" },
        { orig: "Sumimasen", phonetic: "soo-mee-mah-sen", meaning: "Excuse me / Sorry" }
      ];
    } else if (lang.includes("spanish")) {
      return [
        { orig: "Hola", phonetic: "oh-lah", meaning: "Hello" },
        { orig: "Por favor", phonetic: "por fah-vor", meaning: "Please" },
        { orig: "Muchas gracias", phonetic: "moo-chas grah-syas", meaning: "Thank you very much" },
        { orig: "Dónde está...?", phonetic: "dohn-deh es-tah", meaning: "Where is...?" },
        { orig: "La cuenta, por favor", phonetic: "lah kwen-tah por fah-vor", meaning: "The check, please" }
      ];
    } else {
      return [
        { orig: "Hello", phonetic: "he-loh", meaning: "Universal greeting" },
        { orig: "Please", phonetic: "pleez", meaning: "Polite request" },
        { orig: "Thank you", phonetic: "thank yoo", meaning: "Expression of gratitude" },
        { orig: "How much?", phonetic: "how much", meaning: "Inquiring about cost" },
        { orig: "Excuse me", phonetic: "ex-kyooz mee", meaning: "Apologetic transition" }
      ];
    }
  };

  const getCulturalTips = () => {
    return [
      { title: "Tipping Etiquette", desc: `In many parts of the region, service charge is included or tipping is optional. Using local currency (${currency || "Cash"}) is always preferred.` },
      { title: "Dining Customs", desc: "Wait for the host to sit down or indicate where you should sit. Toasting with 'Cheers!' or the local equivalent is a warm custom to practice." },
      { title: "Social Norms", desc: "Keep voice levels moderate in public transport. Always greet shopkeepers upon entering as a sign of respect and goodwill." }
    ];
  };

  const getGallery = () => {
    return [
      { url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80", title: "Scenic Cityscape Skyline" },
      { url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=400&q=80", title: "Historical Local Architecture" },
      { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", title: "Authentic Culinary Cuisine" },
      { url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80", title: "Local Market & Traditions" }
    ];
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm" id="destination-insights-panel">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" /> Destination Insights: {cleanDest}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Phonetic phrasebooks, secret local spots, customs, and community tips.
          </p>
        </div>

        {/* Sub-tabs buttons */}
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1 self-start">
          {[
            { id: "gems", label: "Hidden Gems", icon: <Compass className="w-3.5 h-3.5" /> },
            { id: "phrases", label: "Phrasebook", icon: <MessageSquare className="w-3.5 h-3.5" /> },
            { id: "culture", label: "Culture & Tips", icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: "gallery", label: "Gallery", icon: <Smile className="w-3.5 h-3.5" /> }
          ].map((sub) => (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
                activeSubTab === sub.id
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {sub.icon} {sub.label}
            </button>
          ))}
        </div>
      </div>

      {/* RENDER ACTIVE INSIGHTS SUB-TAB */}
      {activeSubTab === "gems" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {getGems().map((gem, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 hover:shadow-md transition">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-bold uppercase mb-2">
                <MapPin className="w-2.5 h-2.5" /> Secret Spot
              </span>
              <h3 className="font-extrabold text-sm text-slate-800 mb-1.5">{gem.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{gem.desc}</p>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === "phrases" && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-blue-800 text-xs font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Primary language spoken here: <span className="font-bold text-blue-900 uppercase">{language || "Local Language"}</span>. Try these local phrases!
          </div>

          <div className="border border-slate-200/60 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
            <div className="grid grid-cols-12 gap-4 bg-slate-50 px-4 py-2.5 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
              <div className="col-span-4">English Meaning</div>
              <div className="col-span-4">Local Translation</div>
              <div className="col-span-4">Pronunciation / Phonetic</div>
            </div>
            {getPhrases().map((ph, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-4 px-4 py-3 text-xs items-center hover:bg-slate-50/50">
                <div className="col-span-4 font-bold text-slate-800">{ph.meaning}</div>
                <div className="col-span-4 text-blue-600 font-extrabold">{ph.orig}</div>
                <div className="col-span-4 italic text-slate-500 font-mono">[{ph.phonetic}]</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === "culture" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {getCulturalTips().map((tip, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 hover:shadow-md transition">
              <h3 className="font-extrabold text-sm text-slate-800 mb-2 border-b border-slate-200/60 pb-1.5 flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-emerald-500" /> {tip.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === "gallery" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          {getGallery().map((gal, idx) => (
            <div key={idx} className="relative group rounded-2xl overflow-hidden aspect-video border border-slate-200/50 shadow-sm">
              <img
                src={gal.url}
                alt={gal.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent p-3 flex flex-col justify-end">
                <span className="text-[10px] text-white/90 font-bold tracking-tight">{gal.title}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Safety Advisor Overlay */}
      {safetyAdvice && (
        <div className="mt-6 p-4 bg-amber-50/60 border border-amber-200 rounded-2xl text-xs text-amber-900 flex gap-2.5">
          <AlertCircle className="w-4.5 h-4.5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Regional Safety Advice:</span> {safetyAdvice}
          </div>
        </div>
      )}
    </div>
  );
}
