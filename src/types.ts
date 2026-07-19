export interface EmergencyNumbers {
  police: string;
  medical: string;
  general: string;
}

export interface WeatherInfo {
  forecast: string;
  temperature: string;
  humidity: string;
  wind: string;
}

export interface BudgetBreakdown {
  accommodation: number;
  food: number;
  travel: number;
  activities: number;
  shopping: number;
  emergency: number;
  taxes: number;
  total: number;
}

export interface PackingItem {
  id: string;
  item: string;
  category: string;
  completed: boolean;
}

export interface MapPin {
  name: string;
  type: string; // 'hotel', 'restaurant', 'attraction'
  lat: number;
  lng: number;
  description: string;
}

export interface ItineraryActivity {
  time: string;
  description: string;
  location: string;
  travelTime: string;
  estimatedCost: number;
  period: "morning" | "afternoon" | "evening" | "night";
}

export interface DayItinerary {
  day: number;
  theme: string;
  activities: ItineraryActivity[];
}

export interface TravelPlan {
  destination: string;
  currency: string;
  language: string;
  emergencyNumbers: EmergencyNumbers;
  safetyAdvice: string;
  travelTips: string;
  weather: WeatherInfo;
  budgetBreakdown: BudgetBreakdown;
  packingList: PackingItem[];
  mapPins: MapPin[];
  itinerary: DayItinerary[];
}

export interface TripHistoryItem {
  id: string;
  createdAt: string;
  inputs: {
    destination: string;
    currentLocation: string;
    budget: number;
    travelers: string;
    days: number;
    travelStyle: string;
    transportation: string;
    accommodation: string;
    foodPreference: string;
    weatherPreference: string;
    interests: string[];
    accessibility: string;
    specialRequirements: string;
  };
  plan: TravelPlan;
}
