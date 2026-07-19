import React, { useState, useEffect } from "react";
import { DollarSign, Plus, Trash2, PieChart, TrendingUp, AlertCircle } from "lucide-react";
import { BudgetBreakdown } from "../types";

interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
}

interface ExpenseTrackerProps {
  tripId: string;
  budgetBreakdown: BudgetBreakdown;
}

export default function ExpenseTracker({ tripId, budgetBreakdown }: ExpenseTrackerProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState("food");

  // Load expenses per trip on mount and tripId change
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`ai_travel_expenses_${tripId}`);
      if (stored) {
        setExpenses(JSON.parse(stored));
      } else {
        // Seed with a couple of mock initial entries to represent active tracking
        const defaultExpenses: Expense[] = [
          {
            id: "exp_1",
            name: "Initial Hotel deposit",
            amount: Math.round(budgetBreakdown.accommodation * 0.4),
            category: "accommodation",
            date: new Date().toISOString().split("T")[0],
          },
          {
            id: "exp_2",
            name: "Traditional Diner Lunch",
            amount: 45,
            category: "food",
            date: new Date().toISOString().split("T")[0],
          }
        ];
        setExpenses(defaultExpenses);
        localStorage.setItem(`ai_travel_expenses_${tripId}`, JSON.stringify(defaultExpenses));
      }
    } catch (e) {
      console.error("Failed to load expenses:", e);
    }
  }, [tripId, budgetBreakdown]);

  const saveExpenses = (updated: Expense[]) => {
    setExpenses(updated);
    try {
      localStorage.setItem(`ai_travel_expenses_${tripId}`, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save expenses:", e);
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || amount <= 0) return;

    const newExpense: Expense = {
      id: "exp_" + Date.now(),
      name: name.trim(),
      amount: amount,
      category: category,
      date: new Date().toISOString().split("T")[0],
    };

    const updated = [newExpense, ...expenses];
    saveExpenses(updated);
    setName("");
    setAmount(0);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    saveExpenses(updated);
  };

  // Calculate actual spending per category
  const actualCategoryTotals = expenses.reduce((acc, exp) => {
    const cat = exp.category.toLowerCase();
    acc[cat] = (acc[cat] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalActual = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudget = budgetBreakdown.total;
  const isOverBudget = totalActual > totalBudget;

  const categories = [
    { key: "accommodation", label: "Accommodation", budget: budgetBreakdown.accommodation, color: "bg-blue-600" },
    { key: "food", label: "Culinary & Dining", budget: budgetBreakdown.food, color: "bg-red-500" },
    { key: "travel", label: "Transit & Travel", budget: budgetBreakdown.travel, color: "bg-amber-500" },
    { key: "activities", label: "Activities & sights", budget: budgetBreakdown.activities, color: "bg-emerald-500" },
    { key: "shopping", label: "Shopping / Souvenirs", budget: budgetBreakdown.shopping, color: "bg-indigo-500" },
  ];

  return (
    <div className="space-y-8" id="expense-tracker-module">
      {/* Upper Budget Gauge / Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-center">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            Total Budget Limit
          </span>
          <span className="text-xl font-bold text-slate-800">
            ${totalBudget.toLocaleString()}
          </span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-center">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            Logged Spending
          </span>
          <span className={`text-xl font-bold ${isOverBudget ? "text-red-600" : "text-blue-600"}`}>
            ${totalActual.toLocaleString()}
          </span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-center">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            Remaining Funds
          </span>
          <span className={`text-xl font-bold ${totalBudget - totalActual < 0 ? "text-red-500" : "text-emerald-600"}`}>
            ${(totalBudget - totalActual).toLocaleString()}
          </span>
        </div>
      </div>

      {isOverBudget && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-2 text-red-800 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
          <div>
            <span className="font-bold">Over Budget Alert!</span> You have exceeded your initial travel budget by <span className="font-bold">${(totalActual - totalBudget).toLocaleString()}</span>. Consider swapping out dynamic sights for free local experiences.
          </div>
        </div>
      )}

      {/* Main split-pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Progress Gauges - 7 cols */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" /> Spending Progress vs Budget Allocation
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Compare actual logged cash outflows against Gemini's initial suggestions.
            </p>
          </div>

          <div className="space-y-5">
            {categories.map((cat) => {
              const actual = actualCategoryTotals[cat.key] || 0;
              const percent = Math.min(Math.round((actual / cat.budget) * 100), 100);
              const rawPercent = ((actual / cat.budget) * 100).toFixed(1);
              return (
                <div key={cat.key} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{cat.label}</span>
                    <span className="text-slate-400">
                      ${actual.toLocaleString()} / ${cat.budget.toLocaleString()}{" "}
                      <span className={`font-bold ml-1 ${actual > cat.budget ? "text-red-600" : "text-slate-600"}`}>
                        ({rawPercent}%)
                      </span>
                    </span>
                  </div>
                  {/* Progress track */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cat.color} transition-all duration-300`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense Log Form & Table - 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Add Form */}
          <form onSubmit={handleAddExpense} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Log Daily Expense
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Item / Service Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Taxi fare, Souvenir shop, Gelato"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Cost (USD)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 20"
                    value={amount === 0 ? "" : amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs focus:outline-none"
                  >
                    <option value="accommodation">Accommodation</option>
                    <option value="food">Culinary & Dining</option>
                    <option value="travel">Transit & Travel</option>
                    <option value="activities">Activities & sights</option>
                    <option value="shopping">Shopping / Souvenirs</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-black text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Log Expense
            </button>
          </form>

          {/* Expense list ledger */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-4 space-y-3">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <PieChart className="w-3.5 h-3.5" /> Logged Expense Ledger ({expenses.length})
            </h4>

            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
              {expenses.length === 0 ? (
                <p className="text-center text-slate-400 py-6 text-xs italic">
                  No custom items logged. Start tracking to see progress!
                </p>
              ) : (
                expenses.map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between py-2 text-xs group">
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-slate-800 truncate" title={exp.name}>
                        {exp.name}
                      </p>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {exp.category} &bull; {exp.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">${exp.amount}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="text-slate-300 hover:text-red-500 p-1 rounded transition cursor-pointer md:opacity-0 md:group-hover:opacity-100"
                        title="Delete expense entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
