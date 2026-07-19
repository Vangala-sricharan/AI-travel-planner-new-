import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Compass,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Info
} from "lucide-react";

interface PlannerFormProps {
  onSubmit: (inputs: any) => void;
  isGenerating: boolean;
  onBack: () => void;
  initialInputs?: any; // To allow pre-filling when duplicating or editing
}

export default function PlannerForm({ onSubmit, isGenerating, onBack, initialInputs }: PlannerFormProps) {
  const [destination, setDestination] = useState(initialInputs?.destination || "");
  const [currentLocation, setCurrentLocation] = useState(initialInputs?.currentLocation || "");
  const [budget, setBudget] = useState(initialInputs?.budget || 1000);
  const [travelers, setTravelers] = useState(initialInputs?.travelers || "1 Person");
  const [days, setDays] = useState(initialInputs?.days || 3);
  const [travelStyle, setTravelStyle] = useState(initialInputs?.travelStyle || "Balanced");
  const [transportation, setTransportation] = useState(initialInputs?.transportation || "Public Transit");
  const [accommodation, setAccommodation] = useState(initialInputs?.accommodation || "Standard Hotel");
  const [foodPreference, setFoodPreference] = useState(initialInputs?.foodPreference || "Local Cuisines");
  const [weatherPreference, setWeatherPreference] = useState(initialInputs?.weatherPreference || "Mild");
  const [accessibility, setAccessibility] = useState(initialInputs?.accessibility || "No special accessibility required");
  const [specialRequirements, setSpecialRequirements] = useState(initialInputs?.specialRequirements || "");

  // Multi-selectable interest tags
  const availableInterests = [
    "Sightseeing",
    "Historical Landmarks",
    "Nature & Parks",
    "Museums & Art",
    "Local Markets",
    "Nightlife",
    "Adventure Sports",
    "Spa & Relaxation",
    "Photography Hotspots",
    "Hidden Gems",
    "Wine & Coffee Tasting"
  ];
  const [interests, setInterests] = useState<string[]>(initialInputs?.interests || ["Sightseeing", "Historical Landmarks"]);

  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleInterest = (tag: string) => {
    if (interests.includes(tag)) {
      setInterests(interests.filter((i) => i !== tag));
    } else {
      setInterests([...interests, tag]);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      setValidationError("Destination is required to generate your customized plan.");
      return;
    }
    if (days < 1 || days > 14) {
      setValidationError("Please select a trip duration between 1 and 14 days.");
      return;
    }
    if (budget <= 0) {
      setValidationError("Please provide a valid budget above $0.");
      return;
    }

    setValidationError(null);
    onSubmit({
      destination,
      currentLocation,
      budget,
      travelers,
      days,
      travelStyle,
      transportation,
      accommodation,
      foodPreference,
      weatherPreference,
      interests,
      accessibility,
      specialRequirements
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 font-sans">
      {/* Title Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-blue-600 transition flex items-center gap-1 mb-2"
          >
            &larr; Back to Home
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-7 h-7 text-blue-600 animate-spin-slow" /> Create Your Itinerary
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fill in your ideal preferences and let Gemini create a custom travel experience.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 rounded-xl text-blue-700 text-xs font-bold shadow-sm">
          <Sparkles className="w-3.5 h-3.5" /> Powered by Gemini
        </div>
      </div>

      {/* Validation Banner */}
      {validationError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-xs flex items-start gap-2.5 animate-bounce">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Check Required Parameters:</span> {validationError}
          </div>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="space-y-8" id="travel-planner-form">
        {/* Step 1: Base Core Data */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
            Core Destination details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Destination Input */}
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> Destination *
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Paris, Tokyo, Maui Hawaii"
                className="w-full bg-slate-50 border border-slate-200/70 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                required
              />
            </div>

            {/* Current Starting Location */}
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Starting Point (Optional)
              </label>
              <input
                type="text"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                placeholder="e.g. Los Angeles, CA"
                className="w-full bg-slate-50 border border-slate-200/70 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Days duration */}
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Duration (Days) *
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 border border-slate-200/70 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-bold text-slate-800"
                required
              />
            </div>

            {/* Total Budget Allocation */}
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" /> Total Budget (USD) *
              </label>
              <input
                type="number"
                min="100"
                step="50"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value) || 100)}
                className="w-full bg-slate-50 border border-slate-200/70 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-bold text-slate-800"
                required
              />
            </div>

            {/* Travelers Count */}
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" /> Travelers *
              </label>
              <select
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/70 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium text-slate-800"
              >
                <option value="1 Person">1 Person (Solo)</option>
                <option value="2 People">2 People (Couple)</option>
                <option value="3-5 People">3-5 People (Family/Friends)</option>
                <option value="6+ People">6+ People (Large Group)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Personal Preferences & Style */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
            Style & Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Travel Style */}
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2">
                Travel Style
              </label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/70 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-800"
              >
                <option value="Balanced">Balanced Mix</option>
                <option value="Adventure">Adventure & Exploration</option>
                <option value="Relaxation">Relaxation & Spa</option>
                <option value="Luxury">Premium & Luxury</option>
                <option value="Budget-Friendly">Backpacker & Budget</option>
                <option value="Cultural & Historical">Historical & Culture</option>
                <option value="Foodie Trail">Food & Culinary Focused</option>
                <option value="Family-Centric">Family-Friendly</option>
              </select>
            </div>

            {/* Preferred Transit */}
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2">
                Preferred Transit
              </label>
              <select
                value={transportation}
                onChange={(e) => setTransportation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/70 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-800"
              >
                <option value="Public Transit">Public Transit (Metro, Bus)</option>
                <option value="Walking Only">Walking & Hiking</option>
                <option value="Car Rental">Car Rental</option>
                <option value="Ride Sharing">Ridesharing & Cabs</option>
                <option value="Bicycles">Bicycles / Scooters</option>
                <option value="Trains & Intercity">Intercity Trains</option>
              </select>
            </div>

            {/* Accommodation Type */}
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2">
                Accommodation style
              </label>
              <select
                value={accommodation}
                onChange={(e) => setAccommodation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/70 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-800"
              >
                <option value="Standard Hotel">Standard 3-4 Star Hotel</option>
                <option value="Boutique Inn">Boutique Inns</option>
                <option value="Luxury Resort">Luxury 5-Star Hotels/Resorts</option>
                <option value="Hostel & Shared">Hostels / Shared Rooms</option>
                <option value="Local AirBnB">Entire Apartment (Airbnb)</option>
              </select>
            </div>

            {/* Food Diet Preferences */}
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2">
                Diet / Culinary
              </label>
              <select
                value={foodPreference}
                onChange={(e) => setFoodPreference(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/70 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-800"
              >
                <option value="Local Cuisines">Anything (Local & Traditional)</option>
                <option value="Vegetarian">Strict Vegetarian</option>
                <option value="Vegan">Strict Vegan</option>
                <option value="Halal">Halal Dishes Only</option>
                <option value="Kosher">Kosher Dishes Only</option>
                <option value="Gluten-Free">Gluten-Free</option>
                <option value="Street Food Only">Local Street Food Lover</option>
                <option value="Fine Dining">High-End & Michelin Dining</option>
              </select>
            </div>

            {/* Weather preference */}
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2">
                Weather Preference
              </label>
              <select
                value={weatherPreference}
                onChange={(e) => setWeatherPreference(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/70 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-800"
              >
                <option value="Mild">Mild / Pleasant (15-22°C)</option>
                <option value="Sunny & Warm">Sunny & Warm (22°C+)</option>
                <option value="Cool/Snowy">Cool / Winter / Snowy</option>
                <option value="Any">No Preference</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 3: Selectable Interests Tags */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
            Select Core Interests
          </h2>
          <p className="text-xs text-slate-400">
            Choose as many activities and focus points as you wish. Your itinerary activities will adjust around these picks.
          </p>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {availableInterests.map((interest, idx) => {
              const isSelected = interests.includes(interest);
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/10"
                      : "bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {interest} {isSelected && "✓"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Special constraints */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
            Special Constraints
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {/* Accessibility needs */}
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2">
                Accessibility Requirements
              </label>
              <input
                type="text"
                value={accessibility}
                onChange={(e) => setAccessibility(e.target.value)}
                placeholder="e.g. Wheelchair access, minimal steep walking, stroller friendly"
                className="w-full bg-slate-50 border border-slate-200/70 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-800"
              />
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-2">
                Special Requests or Custom Focus
              </label>
              <textarea
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="e.g. Traveling with an infant, allergic to peanuts, prefer coffee crawls, plan 1 day for exploring nearby countryside..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200/70 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-3.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
          >
            Cancel
          </button>

          <button
            id="form-generate-btn"
            type="submit"
            disabled={isGenerating}
            className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-xl text-xs font-bold shadow-md shadow-slate-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? "Synthesizing Plan..." : "Generate AI Travel Plan"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
