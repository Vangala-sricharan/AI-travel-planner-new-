import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "../types";

interface TravelMapProps {
  pins: MapPin[];
  destination: string;
}

export default function TravelMap({ pins, destination }: TravelMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Custom SVGs for pins
  const getPinIcon = (type: string) => {
    let color = "#10B981"; // green for attraction
    if (type === "hotel") color = "#3B82F6"; // blue
    if (type === "restaurant") color = "#EF4444"; // red

    const svgHtml = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21C16.5 16.5 20 12.5 20 9C20 4.58172 16.4183 1 12 1C7.58172 1 4 4.58172 4 9C4 12.5 7.5 16.5 12 21Z" fill="${color}" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="12" cy="9" r="3" fill="#FFFFFF"/>
      </svg>
    `;

    return L.divIcon({
      html: svgHtml,
      className: "custom-leaflet-pin",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center coordinates: find the average latitude and longitude, or fallback
    let centerLat = 48.8566; // Paris fallback
    let centerLng = 2.3522;
    let zoom = 13;

    if (pins && pins.length > 0) {
      const validPins = pins.filter((p) => typeof p.lat === "number" && typeof p.lng === "number");
      if (validPins.length > 0) {
        const sumLat = validPins.reduce((acc, p) => acc + p.lat, 0);
        const sumLng = validPins.reduce((acc, p) => acc + p.lng, 0);
        centerLat = sumLat / validPins.length;
        centerLng = sumLng / validPins.length;
      }
    }

    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: zoom,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);
    } else {
      // If it exists, update view
      mapInstanceRef.current.setView([centerLat, centerLng], zoom);
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers
    const bounds: L.LatLngTuple[] = [];

    pins.forEach((pin) => {
      if (typeof pin.lat !== "number" || typeof pin.lng !== "number") return;

      const marker = L.marker([pin.lat, pin.lng], {
        icon: getPinIcon(pin.type),
      })
        .addTo(map)
        .bindPopup(`
          <div class="p-2 font-sans">
            <span class="inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full mb-1 ${
              pin.type === "hotel"
                ? "bg-blue-100 text-blue-800"
                : pin.type === "restaurant"
                ? "bg-red-100 text-red-800"
                : "bg-emerald-100 text-emerald-800"
            }">
              ${pin.type}
            </span>
            <h3 class="font-bold text-sm text-slate-900">${pin.name}</h3>
            <p class="text-xs text-slate-600 mt-1">${pin.description}</p>
          </div>
        `);

      markersRef.current.push(marker);
      bounds.push([pin.lat, pin.lng]);
    });

    // Fit bounds if there are markers
    if (bounds.length > 0 && map) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Trigger map resize to prevent rendering bugs in tabs
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [pins, destination]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-slate-200/60 shadow-md">
      <div id="travel-planner-map" ref={mapContainerRef} className="w-full h-full z-0" />
      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl text-[11px] font-medium border border-slate-200/60 flex gap-4 shadow-lg z-[1000]">
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Hotel
        </div>
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Food
        </div>
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Sights
        </div>
      </div>
    </div>
  );
}
