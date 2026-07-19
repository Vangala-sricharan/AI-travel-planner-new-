import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { BudgetBreakdown } from "../types";

interface BudgetChartsProps {
  budget: BudgetBreakdown;
}

export default function BudgetCharts({ budget }: BudgetChartsProps) {
  // Map data to Recharts format, filter out zero values and totals
  const chartData = [
    { name: "Accommodation", value: budget.accommodation, color: "#3B82F6" }, // Blue
    { name: "Food", value: budget.food, color: "#F59E0B" }, // Orange
    { name: "Travel", value: budget.travel, color: "#10B981" }, // Emerald
    { name: "Activities", value: budget.activities, color: "#8B5CF6" }, // Purple
    { name: "Shopping", value: budget.shopping, color: "#EC4899" }, // Pink
    { name: "Emergency", value: budget.emergency, color: "#EF4444" }, // Red
    { name: "Taxes & Fees", value: budget.taxes, color: "#6B7280" }, // Gray
  ].filter((item) => item.value > 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / budget.total) * 100).toFixed(1);
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 border border-slate-200/60 rounded-xl shadow-xl font-sans text-xs">
          <p className="font-semibold text-slate-900 dark:text-slate-100">{data.name}</p>
          <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
            {formatCurrency(data.value)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center" id="budget-visualization-panel">
      {/* Pie Chart Representation */}
      <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-200/60">
        <h3 className="text-sm font-semibold text-slate-800 mb-4 text-center">
          Allocation Breakdown
        </h3>
        <div className="h-64 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Total Value Overlay in Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Total Budget
            </span>
            <span className="text-xl font-bold text-slate-900">
              {formatCurrency(budget.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Bar Chart and Cost List */}
      <div className="space-y-6">
        <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-200/60">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">
            Budget Distribution
          </h3>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#94A3B8", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `$${val}`}
                  tick={{ fill: "#94A3B8", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Legend and Table */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {chartData.map((item, idx) => {
            const pct = ((item.value / budget.total) * 100).toFixed(0);
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-slate-600 truncate">
                    {item.name}
                  </span>
                </div>
                <div className="text-right flex-shrink-0 pl-1">
                  <span className="font-bold text-slate-900">
                    {formatCurrency(item.value)}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
