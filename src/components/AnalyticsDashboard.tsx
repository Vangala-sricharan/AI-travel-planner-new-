import { useTravel } from "../context/TravelContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { Compass, Calendar, DollarSign, BarChart3, TrendingUp, Award, Clock } from "lucide-react";

export default function AnalyticsDashboard() {
  const { savedTrips } = useTravel();

  // If there are no saved trips, provide a dummy set of metrics representing a typical travel history
  const hasTrips = savedTrips && savedTrips.length > 0;
  
  // Calculate real or simulated metrics
  const totalTripsCount = hasTrips ? savedTrips.length : 3;
  const avgDays = hasTrips
    ? Math.round(savedTrips.reduce((acc, t) => acc + t.plan.itinerary.length, 0) / savedTrips.length)
    : 4;
  const totalBudgetSpent = hasTrips
    ? savedTrips.reduce((acc, t) => acc + t.plan.budgetBreakdown.total, 0)
    : 3400;

  // Pie chart categories allocation
  const getPieData = () => {
    if (hasTrips) {
      const breakdown = savedTrips.reduce(
        (acc, t) => {
          const b = t.plan.budgetBreakdown;
          acc.accommodation += b.accommodation;
          acc.food += b.food;
          acc.travel += b.travel;
          acc.activities += b.activities;
          acc.shopping += b.shopping;
          return acc;
        },
        { accommodation: 0, food: 0, travel: 0, activities: 0, shopping: 0 }
      );
      return [
        { name: "Accommodation", value: breakdown.accommodation, color: "#3b82f6" },
        { name: "Dining & Food", value: breakdown.food, color: "#ef4444" },
        { name: "Transit", value: breakdown.travel, color: "#f59e0b" },
        { name: "Activities", value: breakdown.activities, color: "#10b981" },
        { name: "Shopping", value: breakdown.shopping, color: "#6366f1" },
      ];
    } else {
      return [
        { name: "Accommodation", value: 1600, color: "#3b82f6" },
        { name: "Dining & Food", value: 850, color: "#ef4444" },
        { name: "Transit", value: 450, color: "#f59e0b" },
        { name: "Activities", value: 300, color: "#10b981" },
        { name: "Shopping", value: 200, color: "#6366f1" },
      ];
    }
  };

  // Bar chart of travel duration
  const getBarData = () => {
    if (hasTrips) {
      return savedTrips.slice(0, 5).map((t) => ({
        name: t.plan.destination.split(",")[0],
        cost: t.plan.budgetBreakdown.total,
        days: t.plan.itinerary.length,
      }));
    } else {
      return [
        { name: "Paris", cost: 1350, days: 2 },
        { name: "Tokyo", cost: 1530, days: 3 },
        { name: "Bali", cost: 520, days: 5 },
      ];
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm space-y-8" id="analytics-dashboard-panel">
      <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" /> Travel Analytics & Statistics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of overall travel budgets, duration averages, and cost categories from your history.
          </p>
        </div>

        {!hasTrips && (
          <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-xl font-bold uppercase tracking-wide">
            Demo Data mode
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Total Planned Trips</span>
            <span className="text-base font-black text-slate-800">{totalTripsCount} Destinations</span>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Avg Stay Length</span>
            <span className="text-base font-black text-slate-800">{avgDays} Days per Trip</span>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Cumulative Budget</span>
            <span className="text-base font-black text-slate-800">${totalBudgetSpent.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Active Status</span>
            <span className="text-base font-black text-slate-800">Ready to Travel</span>
          </div>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col items-center">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest mb-4 text-center">
            Budget Allocation across all Categories
          </h3>
          <div className="w-full h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getPieData()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {getPieData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-[10px] font-semibold text-slate-500">
            {getPieData().map((entry, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </span>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest mb-4">
            Destination Cost Comparisons ($ USD)
          </h3>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getBarData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Bar dataKey="cost" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  {getBarData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#2563eb" : "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
