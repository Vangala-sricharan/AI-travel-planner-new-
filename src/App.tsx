import { useState, useEffect } from "react";
import { TravelProvider, useTravel } from "./context/TravelContext";
import LandingPage from "./components/LandingPage";
import PlannerForm from "./components/PlannerForm";
import SavedTripsPanel from "./components/SavedTripsPanel";
import TripDetail from "./components/TripDetail";
import OfflineIndicator from "./components/OfflineIndicator";
import { Compass, Sparkles, AlertTriangle, RefreshCw, Info } from "lucide-react";
import { motion } from "motion/react";

function TravelPlannerApp() {
  const {
    savedTrips,
    currentTrip,
    currentTripId,
    currentInputs,
    isGenerating,
    generationError,
    generateTrip,
    setCurrentTrip,
    resetError,
  } = useTravel();

  type PageType = "landing" | "planner" | "saved" | "itinerary";
  const [currentPage, setCurrentPage] = useState<PageType>("landing");

  // Cyclical messages for the AI loading screen
  const loadingMessages = [
    "Analyzing target destination coordinates...",
    "Looking up realistic geolocations for hotels and sights...",
    "Structuring tailored morning, afternoon, and night itineraries...",
    "Calculating optimal cost distributions across travel classes...",
    "Synthesizing customized packing checklists based on destination climate...",
    "Securing local emergency hotlines and regional safety guides...",
    "Adding final glassmorphic coordinates and styling visual charts..."
  ];
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);

  // Cycle through loading messages while generating
  useEffect(() => {
    let timer: any;
    if (isGenerating) {
      timer = setInterval(() => {
        setLoadingMessageIdx((prev) => (prev + 1) % loadingMessages.length);
      }, 3500);
    } else {
      setLoadingMessageIdx(0);
    }
    return () => clearInterval(timer);
  }, [isGenerating]);

  // Navigate back to itinerary if we have one, otherwise landing
  useEffect(() => {
    if (currentTrip && currentTripId) {
      setCurrentPage("itinerary");
    }
  }, [currentTrip, currentTripId]);

  // Trigger Canvas Confetti celebration on successful plan generation
  useEffect(() => {
    if (!isGenerating && currentTrip && currentPage === "itinerary") {
      import("canvas-confetti").then((module) => {
        const confetti = module.default;
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }).catch(err => console.log("Failed to load confetti:", err));
    }
  }, [isGenerating, currentTrip, currentPage]);

  const handleStartPlanning = () => {
    setCurrentTrip(null, null); // clear active plan for a fresh one
    setCurrentPage("planner");
  };

  const handleFormSubmit = async (inputs: any) => {
    await generateTrip(inputs);
  };

  const handleRetryGeneration = () => {
    if (currentInputs) {
      resetError();
      generateTrip(currentInputs);
    } else {
      resetError();
      setCurrentPage("planner");
    }
  };

  // Render Loading / AI Thinking View
  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 text-center font-sans">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
          <Compass className="w-8 h-8 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
        </div>

        <motion.div
          key={loadingMessageIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="max-w-md space-y-2"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-full text-indigo-700 text-[10px] font-bold tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" /> AI Engine Active
          </span>
          <h2 className="text-sm font-extrabold text-gray-900 tracking-tight">
            Synthesizing Perfect Experience
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed min-h-[36px]">
            {loadingMessages[loadingMessageIdx]}
          </p>
        </motion.div>
      </div>
    );
  }

  // Render Error View
  if (generationError) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md bg-white border border-gray-100 p-8 rounded-3xl shadow-sm space-y-6">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
              Failed to Generate Trip
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              {generationError}
            </p>
          </div>

          {/* Quick instructions for the developer preview key setup */}
          <div className="bg-amber-50/60 p-4 rounded-xl text-left text-amber-900 border border-amber-100/40 text-[11px] leading-relaxed">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Missing Gemini Key?</span> If you haven't supplied your custom API key, configure it in the <span className="font-bold">Settings &gt; Secrets</span> panel as <span className="font-bold">GEMINI_API_KEY</span>. Alternatively, ensure your internet connection is active and retry.
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                resetError();
                setCurrentPage("planner");
              }}
              className="w-full sm:w-1/2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition"
            >
              Adjust Form
            </button>

            <button
              onClick={handleRetryGeneration}
              className="w-full sm:w-1/2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Sync
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State Routing Render Tree
  switch (currentPage) {
    case "landing":
      return (
        <LandingPage
          onStartPlanning={handleStartPlanning}
          onViewHistory={() => setCurrentPage("saved")}
          savedTripsCount={savedTrips.length}
        />
      );
    case "planner":
      return (
        <PlannerForm
          onSubmit={handleFormSubmit}
          isGenerating={isGenerating}
          onBack={() => setCurrentPage("landing")}
          initialInputs={currentInputs}
        />
      );
    case "saved":
      return (
        <SavedTripsPanel
          onBack={() => {
            setCurrentTrip(null, null);
            setCurrentPage("landing");
          }}
        />
      );
    case "itinerary":
      if (!currentTrip) {
        setCurrentPage("landing");
        return null;
      }
      return (
        <TripDetail
          plan={currentTrip}
          tripId={currentTripId || ""}
          onBack={() => {
            setCurrentTrip(null, null);
            setCurrentPage("saved");
          }}
        />
      );
    default:
      return null;
  }
}

export default function App() {
  return (
    <TravelProvider>
      <div className="relative min-h-screen bg-[#F8FAFC]">
        <OfflineIndicator />
        <TravelPlannerApp />
      </div>
    </TravelProvider>
  );
}
