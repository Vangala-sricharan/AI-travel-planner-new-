import { useTravel } from "../context/TravelContext";
import { Sparkles, MapPin, Calendar, Compass, Star } from "lucide-react";
import { TravelPlan } from "../types";

// Paris Preloaded High-fidelity Plan
const PARIS_TEMPLATE: TravelPlan = {
  destination: "Paris, France",
  currency: "EUR (€)",
  language: "French",
  emergencyNumbers: {
    police: "17",
    medical: "15",
    general: "112"
  },
  safetyAdvice: "Keep valuables secure in crowded tourist spots like the Eiffel Tower and Metro lines due to pickpockets.",
  travelTips: "Buy a Navigo Easy card for the subway. Try dining off-street for lower prices and more authentic cafes.",
  weather: {
    forecast: "Sunny with light afternoon breeze",
    temperature: "22°C (71°F)",
    humidity: "60%",
    wind: "12 km/h"
  },
  budgetBreakdown: {
    accommodation: 600,
    food: 250,
    travel: 80,
    activities: 150,
    shopping: 120,
    emergency: 100,
    taxes: 50,
    total: 1350
  },
  packingList: [
    { id: "p1", item: "Universal Type C power plug adapter", category: "Electronics", completed: false },
    { id: "p2", item: "Valid Passport & Schengen Visa copies", category: "Documents", completed: false },
    { id: "p3", item: "Comfortable leather walking shoes", category: "Clothing", completed: false },
    { id: "p4", item: "Light travel umbrella", category: "Clothing", completed: false }
  ],
  mapPins: [
    { name: "Hôtel Regina Louvre", type: "hotel", lat: 48.8631, lng: 2.3323, description: "Luxury accommodation in the heart of Paris." },
    { name: "La Jacobine Bistro", type: "restaurant", lat: 48.8528, lng: 2.3401, description: "Excellent French culinary diner, known for coq au vin." },
    { name: "The Eiffel Tower", type: "attraction", lat: 48.8584, lng: 2.2945, description: "The iconic wrought-iron lattice tower on the Champ de Mars." },
    { name: "Louvre Museum", type: "attraction", lat: 48.8606, lng: 2.3376, description: "The world's largest art museum and historic monument." }
  ],
  itinerary: [
    {
      day: 1,
      theme: "Classic Monuments & Seine Cruise",
      activities: [
        { time: "09:00 AM", description: "Walk the historic gardens of Tuileries and marvel at Arc de Triomphe.", location: "Tuileries Gardens", travelTime: "15 mins walking", estimatedCost: 0, period: "morning" },
        { time: "01:30 PM", description: "Lunch at classic Parisian bistro near Saint-Germain.", location: "Le Comptoir du Relais", travelTime: "20 mins metro", estimatedCost: 35, period: "afternoon" },
        { time: "08:00 PM", description: "Enjoy a scenic sunset dinner cruise along the beautiful Seine River.", location: "Bateaux Parisiens", travelTime: "25 mins metro", estimatedCost: 85, period: "evening" }
      ]
    },
    {
      day: 2,
      theme: "Artistic Immersion in Montmartre",
      activities: [
        { time: "10:00 AM", description: "Explore the cobblestone alleys of Montmartre and visit Sacré-Cœur Basilica.", location: "Sacré-Cœur", travelTime: "30 mins metro", estimatedCost: 0, period: "morning" },
        { time: "03:00 PM", description: "Admire legendary impressionist masterpieces at the Musée d'Orsay.", location: "Musée d'Orsay", travelTime: "20 mins taxi", estimatedCost: 18, period: "afternoon" }
      ]
    }
  ]
};

// Tokyo Preloaded High-fidelity Plan
const TOKYO_TEMPLATE: TravelPlan = {
  destination: "Tokyo, Japan",
  currency: "JPY (¥)",
  language: "Japanese",
  emergencyNumbers: {
    police: "110",
    medical: "119",
    general: "119"
  },
  safetyAdvice: "Japan is extremely safe, but stay alert in major nightlife entertainment hubs like Kabukicho.",
  travelTips: "Cash is king in smaller shops, though Suica card handles subways and convenience stores flawlessly.",
  weather: {
    forecast: "Clear, brisk, and beautiful skies",
    temperature: "17°C (63°F)",
    humidity: "50%",
    wind: "8 km/h"
  },
  budgetBreakdown: {
    accommodation: 550,
    food: 320,
    travel: 90,
    activities: 130,
    shopping: 250,
    emergency: 150,
    taxes: 40,
    total: 1530
  },
  packingList: [
    { id: "t1", item: "Japanese yen physical banknotes", category: "Documents", completed: false },
    { id: "t2", item: "Handheld mobile pocket Wi-Fi router", category: "Electronics", completed: false },
    { id: "t3", item: "Slip-on walking shoes (easy to take off)", category: "Clothing", completed: false }
  ],
  mapPins: [
    { name: "Shibuya Stream Excel Hotel Tokyu", type: "hotel", lat: 35.6575, lng: 139.7028, description: "Sleek, modern design hotel over Shibuya stream." },
    { name: "Ichiran Ramen Shibuya", type: "restaurant", lat: 35.6625, lng: 139.7001, description: "Classic tonkotsu ramen served in private solo booths." },
    { name: "Senso-ji Buddhist Temple", type: "attraction", lat: 35.7148, lng: 139.7967, description: "Tokyo's oldest and most iconic ancient Buddhist temple in Asakusa." },
    { name: "Shibuya Crossing", type: "attraction", lat: 35.6595, lng: 139.7006, description: "The busiest pedestrian scramble crossing in the entire world." }
  ],
  itinerary: [
    {
      day: 1,
      theme: "Shibuya High-Tech Hub & Meiji Shrine",
      activities: [
        { time: "09:30 AM", description: "Walk the tranquil forested paths of Meiji Jingu Shrine inside Harajuku.", location: "Meiji Shrine", travelTime: "10 mins train", estimatedCost: 0, period: "morning" },
        { time: "02:00 PM", description: "Cross the legendary Shibuya Scramble and shop at Shibuya 109.", location: "Shibuya Pedestrian Crossing", travelTime: "15 mins walking", estimatedCost: 0, period: "afternoon" },
        { time: "07:30 PM", description: "Dine on authentic Yakitori skewers along Omoide Yokocho alleyway.", location: "Memory Lane Shinjuku", travelTime: "10 mins train", estimatedCost: 25, period: "evening" }
      ]
    }
  ]
};

export default function TripTemplates({ onSelectTemplate }: { onSelectTemplate?: () => void }) {
  const { setCurrentTrip, savedTrips } = useTravel();

  const handleLoadTemplate = (plan: TravelPlan) => {
    // Save to localStorage list as well so it registers in saved trips
    const newTripId = "trip_template_" + Date.now();
    const newTripItem = {
      id: newTripId,
      createdAt: new Date().toISOString(),
      inputs: {
        destination: plan.destination,
        currentLocation: "Local Origin",
        budget: plan.budgetBreakdown.total,
        travelers: "1 traveler",
        days: plan.itinerary.length,
        travelStyle: "Template Exploration",
        transportation: "Any",
        accommodation: "Template Style",
        foodPreference: "Local dishes",
        weatherPreference: "Fine weather",
        interests: ["Sightseeing", "Art"],
        accessibility: "None",
        specialRequirements: "None"
      },
      plan: plan
    };

    try {
      const stored = localStorage.getItem("ai_travel_trips");
      const currentHistory = stored ? JSON.parse(stored) : [];
      localStorage.setItem("ai_travel_trips", JSON.stringify([newTripItem, ...currentHistory]));
    } catch (e) {
      console.error(e);
    }

    // Set as active
    setCurrentTrip(plan, newTripId);
    if (onSelectTemplate) onSelectTemplate();
  };

  return (
    <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl" id="trip-templates-selector">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4.5 h-4.5 text-blue-600" />
        <h3 className="font-extrabold text-sm text-slate-800 tracking-tight">
          Instant Preset Itineraries
        </h3>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed mb-5">
        Skip the AI synthesis and load preloaded premium travel blueprints. Ideal for instantly previewing the travel map, expense logging, and checklist capabilities.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Paris Card */}
        <button
          onClick={() => handleLoadTemplate(PARIS_TEMPLATE)}
          className="flex items-start text-left gap-4 bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
            FR
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1">
              Parisian Escapade <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            </h4>
            <span className="text-[10px] text-slate-400 block font-medium mt-0.5">
              2 Days Itinerary &bull; Historic & Fine Dining
            </span>
            <span className="inline-block mt-2 text-[10px] bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 text-slate-500 font-bold">
              Load Blueprint
            </span>
          </div>
        </button>

        {/* Tokyo Card */}
        <button
          onClick={() => handleLoadTemplate(TOKYO_TEMPLATE)}
          className="flex items-start text-left gap-4 bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold flex-shrink-0 group-hover:bg-red-600 group-hover:text-white transition">
            JP
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1">
              Neon Tokyo Skyline <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            </h4>
            <span className="text-[10px] text-slate-400 block font-medium mt-0.5">
              1 Day Itinerary &bull; Modern Tech & Shrines
            </span>
            <span className="inline-block mt-2 text-[10px] bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 text-slate-500 font-bold">
              Load Blueprint
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
