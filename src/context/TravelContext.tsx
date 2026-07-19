import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { TravelPlan, TripHistoryItem, PackingItem } from "../types";

interface TravelContextType {
  savedTrips: TripHistoryItem[];
  currentTrip: TravelPlan | null;
  currentTripId: string | null;
  currentInputs: any | null;
  isGenerating: boolean;
  generationError: string | null;
  generateTrip: (inputs: any) => Promise<void>;
  modifyTrip: (tripId: string, instruction: string) => Promise<void>;
  setCurrentTrip: (plan: TravelPlan | null, id?: string | null) => void;
  deleteTrip: (id: string) => void;
  duplicateTrip: (id: string) => void;
  togglePackingItem: (tripId: string, itemId: string) => void;
  addPackingItem: (tripId: string, itemText: string, category: string) => void;
  deletePackingItem: (tripId: string, itemId: string) => void;
  resetError: () => void;
}

const TravelContext = createContext<TravelContextType | undefined>(undefined);

export function useTravel() {
  const context = useContext(TravelContext);
  if (!context) {
    throw new Error("useTravel must be used within a TravelProvider");
  }
  return context;
}

export function TravelProvider({ children }: { children: ReactNode }) {
  const [savedTrips, setSavedTrips] = useState<TripHistoryItem[]>([]);
  const [currentTrip, setCurrentTripState] = useState<TravelPlan | null>(null);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [currentInputs, setCurrentInputs] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Load trips from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ai_travel_trips");
      if (stored) {
        setSavedTrips(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved trips from localStorage:", e);
    }
  }, []);

  // Save trips to localStorage whenever they change
  const saveTripsToStorage = (trips: TripHistoryItem[]) => {
    setSavedTrips(trips);
    try {
      localStorage.setItem("ai_travel_trips", JSON.stringify(trips));
    } catch (e) {
      console.error("Failed to save trips to localStorage:", e);
    }
  };

  const generateTrip = async (inputs: any) => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to generate itinerary. Please verify your connection.");
      }

      // Successfully generated plan
      const newTripId = "trip_" + Date.now();
      const newTripItem: TripHistoryItem = {
        id: newTripId,
        createdAt: new Date().toISOString(),
        inputs: inputs,
        plan: data,
      };

      const updatedHistory = [newTripItem, ...savedTrips];
      saveTripsToStorage(updatedHistory);
      setCurrentTripState(data);
      setCurrentTripId(newTripId);
      setCurrentInputs(inputs);
    } catch (error: any) {
      console.error("Error generating trip:", error);
      setGenerationError(error.message || "An unexpected error occurred while generating your itinerary.");
    } finally {
      setIsGenerating(false);
    }
  };

  const setCurrentTrip = (plan: TravelPlan | null, id: string | null = null) => {
    setCurrentTripState(plan);
    setCurrentTripId(id);
    if (id) {
      const trip = savedTrips.find((t) => t.id === id);
      if (trip) {
        setCurrentInputs(trip.inputs);
      }
    } else {
      setCurrentInputs(null);
    }
  };

  const deleteTrip = (id: string) => {
    const updated = savedTrips.filter((t) => t.id !== id);
    saveTripsToStorage(updated);
    if (currentTripId === id) {
      setCurrentTripState(null);
      setCurrentTripId(null);
      setCurrentInputs(null);
    }
  };

  const duplicateTrip = (id: string) => {
    const tripToDup = savedTrips.find((t) => t.id === id);
    if (!tripToDup) return;

    const duplicatedItem: TripHistoryItem = {
      ...tripToDup,
      id: "trip_" + Date.now(),
      createdAt: new Date().toISOString(),
      plan: {
        ...tripToDup.plan,
        destination: `${tripToDup.plan.destination} (Copy)`,
      },
    };

    const updated = [duplicatedItem, ...savedTrips];
    saveTripsToStorage(updated);
  };

  // Toggle checklist item
  const togglePackingItem = (tripId: string, itemId: string) => {
    const updated = savedTrips.map((trip) => {
      if (trip.id === tripId) {
        const updatedPacking = trip.plan.packingList.map((item) => {
          if (item.id === itemId) {
            return { ...item, completed: !item.completed };
          }
          return item;
        });
        return {
          ...trip,
          plan: {
            ...trip.plan,
            packingList: updatedPacking,
          },
        };
      }
      return trip;
    });

    saveTripsToStorage(updated);

    // Sync active view
    if (currentTripId === tripId) {
      const activeTrip = updated.find((t) => t.id === tripId);
      if (activeTrip) {
        setCurrentTripState(activeTrip.plan);
      }
    }
  };

  // Add custom packing item
  const addPackingItem = (tripId: string, itemText: string, category: string) => {
    const newItem: PackingItem = {
      id: "pack_" + Date.now(),
      item: itemText,
      category: category,
      completed: false,
    };

    const updated = savedTrips.map((trip) => {
      if (trip.id === tripId) {
        return {
          ...trip,
          plan: {
            ...trip.plan,
            packingList: [...trip.plan.packingList, newItem],
          },
        };
      }
      return trip;
    });

    saveTripsToStorage(updated);

    // Sync active view
    if (currentTripId === tripId) {
      const activeTrip = updated.find((t) => t.id === tripId);
      if (activeTrip) {
        setCurrentTripState(activeTrip.plan);
      }
    }
  };

  // Delete packing item
  const deletePackingItem = (tripId: string, itemId: string) => {
    const updated = savedTrips.map((trip) => {
      if (trip.id === tripId) {
        return {
          ...trip,
          plan: {
            ...trip.plan,
            packingList: trip.plan.packingList.filter((item) => item.id !== itemId),
          },
        };
      }
      return trip;
    });

    saveTripsToStorage(updated);

    // Sync active view
    if (currentTripId === tripId) {
      const activeTrip = updated.find((t) => t.id === tripId);
      if (activeTrip) {
        setCurrentTripState(activeTrip.plan);
      }
    }
  };

  const modifyTrip = async (tripId: string, instruction: string) => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const trip = savedTrips.find((t) => t.id === tripId);
      if (!trip) throw new Error("Trip not found");

      const response = await fetch("/api/modify-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPlan: trip.plan,
          instruction: instruction,
          inputs: trip.inputs,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to modify itinerary.");
      }

      // Successfully updated plan
      const updatedHistory = savedTrips.map((item) => {
        if (item.id === tripId) {
          return {
            ...item,
            plan: data,
          };
        }
        return item;
      });

      saveTripsToStorage(updatedHistory);
      setCurrentTripState(data);
    } catch (error: any) {
      console.error("Error modifying trip:", error);
      setGenerationError(error.message || "An unexpected error occurred while modifying your itinerary.");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetError = () => {
    setGenerationError(null);
  };

  return (
    <TravelContext.Provider
      value={{
        savedTrips,
        currentTrip,
        currentTripId,
        currentInputs,
        isGenerating,
        generationError,
        generateTrip,
        modifyTrip,
        setCurrentTrip,
        deleteTrip,
        duplicateTrip,
        togglePackingItem,
        addPackingItem,
        deletePackingItem,
        resetError,
      }}
    >
      {children}
    </TravelContext.Provider>
  );
}
