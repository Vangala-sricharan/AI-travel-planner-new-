import { useState, FormEvent } from "react";
import {
  Compass,
  Calendar,
  DollarSign,
  Briefcase,
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  CloudSun,
  Trash2,
  Copy,
  Plus,
  CheckSquare,
  Square,
  ArrowLeft,
  Eye,
  Info,
  Thermometer,
  Wind,
  Droplets,
  Share2,
  Printer,
  Download,
  Volume2,
  Mic,
  Send,
  Sparkles,
  BookOpen,
  Bell,
  ChevronDown,
  VolumeX
} from "lucide-react";
import { TravelPlan } from "../types";
import TravelMap from "./TravelMap";
import BudgetCharts from "./BudgetCharts";
import { useTravel } from "../context/TravelContext";
import CurrencyConverter from "./CurrencyConverter";
import ExpenseTracker from "./ExpenseTracker";
import DestinationInsights from "./DestinationInsights";
import TravelReminders from "./TravelReminders";
import ShareModal from "./ShareModal";

interface TripDetailProps {
  plan: TravelPlan;
  tripId: string;
  onBack: () => void;
}

type TabType = "itinerary" | "budget" | "packing" | "safety" | "insights" | "reminders" | "chat";

export default function TripDetail({ plan, tripId, onBack }: TripDetailProps) {
  const { 
    togglePackingItem, 
    addPackingItem, 
    deletePackingItem, 
    duplicateTrip, 
    deleteTrip,
    modifyTrip
  } = useTravel();
  const [activeTab, setActiveTab] = useState<TabType>("itinerary");
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // Custom packing list inputs
  const [newItemText, setNewItemText] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Clothing");

  // AI Chat, Speech & Voice states
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: `Hi there! I am your companion AI Travel Assistant. If you'd like to modify or refine your itinerary, just type or speak a request (e.g. "make the second day more historical", "add a gourmet coffee stop", "reduce the food budget by 20%").` }
  ]);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false);

  // Read Aloud Speech Synthesis
  const handleSpeakItinerary = () => {
    if (!("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const dayPlan = plan.itinerary.find((d) => d.day === selectedDay);
    if (!dayPlan) return;

    const intro = `Day ${dayPlan.day} theme is: ${dayPlan.theme}. `;
    const activitiesText = dayPlan.activities
      .map((act) => `At ${act.time}, you will visit ${act.location}. ${act.description}`)
      .join(" ");
    const fullText = intro + activitiesText;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  // Voice Speech Recognition input
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => setIsListeningVoice(true);
    rec.onend = () => setIsListeningVoice(false);
    rec.onerror = () => {
      setIsListeningVoice(false);
      alert("Voice input failed or was canceled. Please check microphone permissions.");
    };
    rec.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setChatInput(text);
    };

    rec.start();
  };

  // Google Calendar Integration
  const handleExportGoogleCalendar = () => {
    const title = `Trip to ${plan.destination}`;
    const details = `Planned with AI Travel Planner. Theme: ${plan.itinerary[0]?.theme || ""}. Language: ${plan.language}`;
    const dateStart = new Date(Date.now() + 14 * 24 * 3600000).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const dateEnd = new Date(Date.now() + 15 * 24 * 3600000).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dateStart}/${dateEnd}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(plan.destination)}`;
    window.open(gcalUrl, "_blank");
    setShowCalendarDropdown(false);
  };

  // Download .ics Calendar File
  const handleDownloadICS = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AITravelPlanner//NONSGML v1.0//EN\n";
    
    plan.itinerary.forEach((dayPlan) => {
      dayPlan.activities.forEach((act) => {
        const dateStart = new Date(Date.now() + (14 + dayPlan.day) * 24 * 3600000);
        const formattedDate = dateStart.toISOString().split("T")[0].replace(/-/g, "");
        
        icsContent += "BEGIN:VEVENT\n";
        icsContent += `SUMMARY:Day ${dayPlan.day} - ${act.location}\n`;
        icsContent += `DESCRIPTION:${act.description}. Cost: ${act.estimatedCost} USD. Travel time: ${act.travelTime}\n`;
        icsContent += `LOCATION:${act.location}, ${plan.destination}\n`;
        icsContent += `DTSTART;VALUE=DATE:${formattedDate}\n`;
        icsContent += `DTEND;VALUE=DATE:${formattedDate}\n`;
        icsContent += "END:VEVENT\n";
      });
    });
    
    icsContent += "END:VCALENDAR";
    
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${plan.destination.replace(/[^a-zA-Z0-9]/g, "_")}_itinerary.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowCalendarDropdown(false);
  };

  const handleSendChat = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    setChatHistory((prev) => [...prev, { sender: "user", text }]);
    setChatInput("");

    try {
      await modifyTrip(tripId, text);
      setChatHistory((prev) => [
        ...prev,
        { sender: "ai", text: `I have successfully updated your itinerary according to: "${text}". The active map, budget breakdown, and packing list have been fully refreshed.` }
      ]);
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "ai", text: `Failed to update: ${err.message || "Please check your connectivity and API setup."}` }
      ]);
    }
  };

  const handleTogglePacking = (itemId: string) => {
    togglePackingItem(tripId, itemId);
  };

  const handleAddPacking = (e: FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    addPackingItem(tripId, newItemText.trim(), newItemCategory);
    setNewItemText("");
  };

  const handleDeletePacking = (itemId: string) => {
    deletePackingItem(tripId, itemId);
  };

  const handleDuplicate = () => {
    duplicateTrip(tripId);
    alert("Trip duplicated successfully!");
  };

  const handleDeleteTrip = () => {
    if (confirm("Are you sure you want to delete this trip itinerary permanently?")) {
      deleteTrip(tripId);
      onBack();
    }
  };

  // Group packing list items by category for clear UI rendering
  const groupedPackingList = plan.packingList.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof plan.packingList>);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 font-sans">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-blue-600 transition flex items-center gap-1.5 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Travel Hub
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {plan.destination}
          </h1>
          <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-500" /> {plan.itinerary.length} Days Itinerary
            </span>
            <span>&bull;</span>
            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">
              {plan.currency}
            </span>
            <span>&bull;</span>
            <span>Local Language: {plan.language}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" /> Share Itinerary
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Export PDF
          </button>

          {/* Calendar Dropdown Container */}
          <div className="relative">
            <button
              onClick={() => setShowCalendarDropdown(!showCalendarDropdown)}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Add to Calendar <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showCalendarDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-30 font-sans">
                <button
                  onClick={handleExportGoogleCalendar}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition font-medium flex items-center gap-2 cursor-pointer"
                >
                  Export Google Calendar
                </button>
                <button
                  onClick={handleDownloadICS}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition font-medium flex items-center gap-2 cursor-pointer"
                >
                  Download .ics Calendar File
                </button>
              </div>
            )}
          </div>

          <button
            id="trip-duplicate-btn"
            onClick={handleDuplicate}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" /> Duplicate
          </button>

          <button
            id="trip-delete-btn"
            onClick={handleDeleteTrip}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Itinerary
          </button>
        </div>
      </div>

      {/* Apple-style Segmented Workspace Tabs */}
      <div className="flex border-b border-slate-100 gap-2 mb-8 overflow-x-auto pb-1 select-none">
        {[
          { id: "itinerary", label: "Itinerary & Map", icon: <Compass className="w-4 h-4" /> },
          { id: "budget", label: "Budget & Expenses", icon: <DollarSign className="w-4 h-4" /> },
          { id: "packing", label: "Packing Checklist", icon: <Briefcase className="w-4 h-4" /> },
          { id: "safety", label: "Local Survival Guide", icon: <ShieldCheck className="w-4 h-4" /> },
          { id: "insights", label: "Local Insights", icon: <BookOpen className="w-4 h-4" /> },
          { id: "reminders", label: "Reminders & Alerts", icon: <Bell className="w-4 h-4" /> },
          { id: "chat", label: "AI Modification Chat", icon: <Sparkles className="w-4 h-4 text-blue-500 fill-blue-500/10" /> }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/15"
                  : "bg-slate-50/50 hover:bg-slate-100 text-slate-600"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {/* TAB 1: ITINERARY & MAP */}
        {activeTab === "itinerary" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Day Selector and Itinerary Cards (Left side, 7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Day horizontal selector and read aloud controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/50">
                <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 select-none">
                  {plan.itinerary.map((dayPlan) => {
                    const isDaySelected = selectedDay === dayPlan.day;
                    return (
                      <button
                        key={dayPlan.day}
                        onClick={() => setSelectedDay(dayPlan.day)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-150 min-w-[70px] text-center cursor-pointer ${
                          isDaySelected
                            ? "bg-slate-900 text-white shadow-sm"
                            : "bg-white border border-slate-200/60 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Day {dayPlan.day}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleSpeakItinerary}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    isPlayingAudio
                      ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                      : "bg-blue-50 hover:bg-blue-100 text-blue-700"
                  }`}
                  title="Read out loud this day's activities using smart speech synthesis"
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="w-4 h-4" /> Stop Audio
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" /> Listen to Day
                    </>
                  )}
                </button>
              </div>

              {/* Selected Day Theme */}
              {plan.itinerary
                .filter((d) => d.day === selectedDay)
                .map((dayPlan) => (
                  <div key={dayPlan.day} className="space-y-6">
                    <div className="bg-blue-50/40 p-4 rounded-2xl border border-blue-100/30">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-700">
                        Theme for Day {dayPlan.day}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-base md:text-lg mt-0.5">
                        {dayPlan.theme}
                      </h3>
                    </div>

                    {/* Timeline of activities */}
                    <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-8">
                      {dayPlan.activities.map((act, actIdx) => (
                        <div key={actIdx} className="relative group">
                          {/* Circle marker on timeline */}
                          <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm group-hover:scale-110 transition" />

                          {/* Activity Card */}
                          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                <Clock className="w-3.5 h-3.5 text-slate-400" /> {act.time}
                              </span>
                              <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full bg-slate-100 text-slate-600">
                                {act.period}
                              </span>
                            </div>

                            <h4 className="font-extrabold text-sm text-slate-900 mb-1.5 flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-blue-500" /> {act.location}
                            </h4>

                            <p className="text-xs text-slate-600 leading-relaxed mb-3">
                              {act.description}
                            </p>

                            <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
                              <span>
                                <span className="font-semibold text-slate-700">Travel duration:</span> {act.travelTime}
                              </span>
                              <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold">
                                Cost: {act.estimatedCost === 0 ? "Free" : `$${act.estimatedCost}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            {/* Interactive Map (Right side, 5 cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Trip Geography & Points of Interest
                </h3>
                <TravelMap pins={plan.mapPins} destination={plan.destination} />
                <p className="text-[10px] text-slate-400 mt-2 text-center italic">
                  Drag, zoom, and click pinned items on OpenStreetMap to inspect details.
                </p>
              </div>

              {/* Fast Facts / Tips Widget */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                <h3 className="font-bold text-xs uppercase tracking-widest text-blue-400 mb-2">
                  Genius Travel Tip
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {plan.travelTips}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BUDGET & EXPENSES */}
        {activeTab === "budget" && (
          <div className="space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm">
              <div className="max-w-2xl mb-6">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  AI Budget Allocation
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed allocation analysis optimized for your preferences. Re-budget easily based on real estimates.
                </p>
              </div>
              <BudgetCharts budget={plan.budgetBreakdown} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Currency Converter (4 cols) */}
              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight mb-2">
                  Exchange Rate Converter
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Convert amounts quickly from USD into local <span className="font-bold text-slate-800">{plan.currency}</span>.
                </p>
                <CurrencyConverter destinationCurrency={plan.currency} />
              </div>

              {/* Expense Tracker (8 cols) */}
              <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight mb-1">
                  Cash Ledger & Expense Tracker
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Log your daily actual purchases to see if you are staying within limits.
                </p>
                <ExpenseTracker tripId={tripId} budgetBreakdown={plan.budgetBreakdown} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PACKING CHECKLIST */}
        {activeTab === "packing" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Custom Item Form Panel (4 cols) */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4 lg:sticky lg:top-24">
              <h3 className="font-extrabold text-sm text-slate-900">Add Item</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add your own essential equipment, clothes, or documents directly to your persistent travel packing list.
              </p>

              <form onSubmit={handleAddPacking} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Item Description
                  </label>
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="e.g. Swimming Goggles, Passport"
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Clothing">Clothing</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Documents">Documents</option>
                    <option value="Toiletries">Toiletries</option>
                    <option value="Essentials">Essentials</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                <button
                  id="add-custom-packing-btn"
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-black text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add custom item
                </button>
              </form>
            </div>

            {/* Checklist items list (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              {Object.keys(groupedPackingList).length === 0 ? (
                <div className="text-center p-12 bg-slate-50 rounded-2xl">
                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">No items in packing checklist.</p>
                </div>
              ) : (
                Object.entries(groupedPackingList).map(([category, items]) => (
                  <div key={category} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
                      {category} ({items.length})
                    </h3>

                    <div className="divide-y divide-slate-100">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-2.5 group"
                        >
                          <button
                            id={`toggle-packing-item-${item.id}`}
                            onClick={() => handleTogglePacking(item.id)}
                            className="flex items-center gap-3 text-left focus:outline-none cursor-pointer"
                          >
                            {item.completed ? (
                              <CheckSquare className="w-4.5 h-4.5 text-blue-600" />
                            ) : (
                              <Square className="w-4.5 h-4.5 text-slate-300 group-hover:text-blue-400" />
                            )}
                            <span
                              className={`text-xs font-medium transition ${
                                item.completed ? "line-through text-slate-400" : "text-slate-700"
                              }`}
                            >
                              {item.item}
                            </span>
                          </button>

                          <button
                            id={`delete-packing-item-${item.id}`}
                            onClick={() => handleDeletePacking(item.id)}
                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition duration-150 p-1 rounded-md hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: LOCAL SURVIVAL GUIDE */}
        {activeTab === "safety" && (
          <div className="space-y-8">
            {/* Weather overview */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-800 border-b border-slate-100 pb-2 mb-6 flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-blue-600" /> Climate & Weather Forecast
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-50/60 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Thermometer className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Temperature</span>
                    <span className="text-xs font-bold text-slate-800">{plan.weather.temperature}</span>
                  </div>
                </div>

                <div className="bg-slate-50/60 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Humidity</span>
                    <span className="text-xs font-bold text-slate-800">{plan.weather.humidity}</span>
                  </div>
                </div>

                <div className="bg-slate-50/60 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Wind className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Wind Velocity</span>
                    <span className="text-xs font-bold text-slate-800">{plan.weather.wind}</span>
                  </div>
                </div>

                <div className="bg-slate-50/60 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <CloudSun className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">General Cast</span>
                    <span className="text-xs font-bold text-slate-800 truncate" title={plan.weather.forecast}>
                      {plan.weather.forecast}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency & Safety Advisors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Emergency Contacts */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-red-600 border-b border-red-50 pb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Emergency Telephone Numbers
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <a
                    href={`tel:${plan.emergencyNumbers.police}`}
                    className="bg-red-50/50 hover:bg-red-50 border border-red-100/50 p-4 rounded-xl text-center transition block group"
                  >
                    <span className="block text-[10px] font-bold text-red-500 uppercase tracking-wider">Police</span>
                    <span className="text-sm font-black text-red-700 mt-1 block group-hover:underline">
                      {plan.emergencyNumbers.police}
                    </span>
                  </a>

                  <a
                    href={`tel:${plan.emergencyNumbers.medical}`}
                    className="bg-red-50/50 hover:bg-red-50 border border-red-100/50 p-4 rounded-xl text-center transition block group"
                  >
                    <span className="block text-[10px] font-bold text-red-500 uppercase tracking-wider">Medical</span>
                    <span className="text-sm font-black text-red-700 mt-1 block group-hover:underline">
                      {plan.emergencyNumbers.medical}
                    </span>
                  </a>

                  <a
                    href={`tel:${plan.emergencyNumbers.general}`}
                    className="bg-red-50/50 hover:bg-red-50 border border-red-100/50 p-4 rounded-xl text-center transition block group"
                  >
                    <span className="block text-[10px] font-bold text-red-500 uppercase tracking-wider">General SOS</span>
                    <span className="text-sm font-black text-red-700 mt-1 block group-hover:underline">
                      {plan.emergencyNumbers.general}
                    </span>
                  </a>
                </div>
              </div>

              {/* Local safety tips card */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Local Safety Advisor
                </h3>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0 mt-0.5">
                    <Info className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 mb-1">Safety Warnings</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {plan.safetyAdvice}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: LOCAL INSIGHTS */}
        {activeTab === "insights" && (
          <DestinationInsights
            destination={plan.destination}
            language={plan.language}
            currency={plan.currency}
            safetyAdvice={plan.safetyAdvice}
          />
        )}

        {/* TAB 6: REMINDERS & ALERTS */}
        {activeTab === "reminders" && (
          <TravelReminders tripId={tripId} />
        )}

        {/* TAB 7: AI ASSISTANT CHAT */}
        {activeTab === "chat" && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm max-w-4xl mx-auto space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" /> AI Itinerary Refinement Assistant
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Request adjustments, alter days, or customize dining recommendations using Gemini. Type or trigger voice dictation.
              </p>
            </div>

            {/* Chat Ledger */}
            <div className="space-y-4 max-h-[360px] overflow-y-auto bg-slate-50 border border-slate-100 p-5 rounded-2xl divide-y divide-slate-100">
              {chatHistory.map((chat, idx) => (
                <div key={idx} className={`pt-3 first:pt-0 flex gap-3 text-xs ${chat.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 leading-relaxed font-semibold ${
                    chat.sender === "user"
                      ? "bg-slate-900 text-white rounded-tr-none"
                      : "bg-white border border-slate-200/60 text-slate-800 rounded-tl-none"
                  }`}>
                    {chat.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Micro Quick Prompts */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Suggested Actions</span>
              <div className="flex flex-wrap gap-2">
                {[
                  "Replace lunch with an authentic street-food crawl",
                  "Make the afternoon activities more budget-friendly",
                  "Add one extra morning coffee spot to Day 1",
                  "Suggest some family-friendly sights"
                ].map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setChatInput(sug);
                    }}
                    className="bg-slate-50 border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Message input */}
            <form onSubmit={handleSendChat} className="flex gap-2.5 items-center bg-slate-50 border border-slate-200 p-2 rounded-2xl">
              <input
                type="text"
                placeholder="Ask AI to modify your itinerary..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-grow bg-transparent border-none text-xs px-3 focus:outline-none focus:ring-0"
              />

              <button
                type="button"
                onClick={handleVoiceInput}
                className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
                  isListeningVoice
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-white hover:bg-slate-100 text-slate-500 border border-slate-200/50"
                }`}
                title="Dictate with voice input"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition cursor-pointer flex items-center justify-center shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Share Modal Dialog Overlay */}
      {showShareModal && (
        <ShareModal plan={plan} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}
