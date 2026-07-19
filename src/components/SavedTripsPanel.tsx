import { useState } from "react";
import { useTravel } from "../context/TravelContext";
import { Compass, Search, Calendar, Users, DollarSign, Trash2, Copy, Eye, ArrowLeft } from "lucide-react";

interface SavedTripsPanelProps {
  onBack: () => void;
}

export default function SavedTripsPanel({ onBack }: SavedTripsPanelProps) {
  const { savedTrips, setCurrentTrip, deleteTrip, duplicateTrip } = useTravel();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTrips = savedTrips.filter((trip) =>
    trip.plan.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReopen = (tripId: string) => {
    const trip = savedTrips.find((t) => t.id === tripId);
    if (trip) {
      setCurrentTrip(trip.plan, trip.id);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 font-sans">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-blue-600 transition flex items-center gap-1 mb-1.5 cursor-pointer"
          >
            &larr; Back to Home
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-7 h-7 text-blue-600" /> Saved Travel Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            You have {savedTrips.length} saved custom itineraries in your local browser history.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by destination..."
            className="w-full bg-slate-50 border border-slate-200/70 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Grid of trips */}
      {filteredTrips.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-spin-slow" />
          <h3 className="font-bold text-slate-700 text-sm">No itineraries found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
            {searchQuery
              ? "We couldn't find any saved plans matching your search query. Try another keyword!"
              : "You haven't generated any itineraries yet. Get started by defining a destination!"}
          </p>
          {!searchQuery && (
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              Start Planning Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between h-48"
            >
              <div>
                {/* Destination & created date */}
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-extrabold text-sm text-slate-900 tracking-tight truncate max-w-[70%]" title={trip.plan.destination}>
                    {trip.plan.destination}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {formatDate(trip.createdAt)}
                  </span>
                </div>

                {/* Duration / travelers details */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" /> {trip.plan.itinerary.length} Days
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-400" /> {trip.inputs.travelers}
                  </span>
                </div>

                {/* Budget level */}
                <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50/50 px-2.5 py-1 rounded-xl w-fit">
                  <DollarSign className="w-3.5 h-3.5" /> Allocated: ${trip.inputs.budget} USD
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
                <button
                  id={`saved-reopen-btn-${trip.id}`}
                  onClick={() => handleReopen(trip.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                >
                  <Eye className="w-3 h-3" /> Reopen Guide
                </button>

                <div className="flex items-center gap-1">
                  <button
                    id={`saved-duplicate-btn-${trip.id}`}
                    onClick={() => duplicateTrip(trip.id)}
                    className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-lg transition cursor-pointer"
                    title="Duplicate Itinerary"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id={`saved-delete-btn-${trip.id}`}
                    onClick={() => deleteTrip(trip.id)}
                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition cursor-pointer"
                    title="Delete Itinerary"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
