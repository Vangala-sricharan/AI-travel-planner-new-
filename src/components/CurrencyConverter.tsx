import { useState, useEffect } from "react";
import { IndianRupee, RefreshCw, ArrowRightLeft } from "lucide-react";
import { formatINR } from "../utils/currency";

interface CurrencyConverterProps {
  destinationCurrency: string;
}

const EXCHANGE_RATES: Record<string, number> = {
  INR: 1.0,
  EUR: 0.011,
  JPY: 1.86,
  GBP: 0.0094,
  CAD: 0.016,
  AUD: 0.018,
  CNY: 0.086,
  AED: 0.044,
  SGD: 0.016,
  THB: 0.44,
  CHF: 0.011,
  NZD: 0.019,
};

export default function CurrencyConverter({ destinationCurrency }: CurrencyConverterProps) {
  const [amount, setAmount] = useState<number>(1000);
  const [fromCurrency, setFromCurrency] = useState<string>("INR");
  const [toCurrency, setToCurrency] = useState<string>(
    destinationCurrency && EXCHANGE_RATES[destinationCurrency.toUpperCase()] && destinationCurrency.toUpperCase() !== "INR"
      ? destinationCurrency.toUpperCase()
      : "EUR"
  );
  const [result, setResult] = useState<number>(0);

  // Auto detect if destinationCurrency is valid or default to a fallback
  useEffect(() => {
    const formatted = destinationCurrency ? destinationCurrency.trim().toUpperCase() : "";
    if (formatted && EXCHANGE_RATES[formatted] && formatted !== "INR") {
      setToCurrency(formatted);
    }
  }, [destinationCurrency]);

  useEffect(() => {
    const rateFrom = EXCHANGE_RATES[fromCurrency] || 1.0;
    const rateTo = EXCHANGE_RATES[toCurrency] || 1.0;
    // convert from -> INR -> to
    const amountInBase = amount / rateFrom;
    const converted = amountInBase * rateTo;
    setResult(converted);
  }, [amount, fromCurrency, toCurrency]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getCurrencySymbol = (code: string) => {
    switch (code) {
      case "INR":
        return "₹";
      case "EUR":
        return "€";
      case "JPY":
        return "¥";
      case "GBP":
        return "£";
      case "CNY":
        return "¥";
      case "AED":
        return "AED";
      default:
        return code;
    }
  };

  const formatDisplayAmount = (cur: string, val: number) => {
    if (cur === "INR") {
      return formatINR(val);
    }
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl shadow-sm" id="currency-converter-widget">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" /> Smart Currency Converter
        </h3>
        <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
          Live Rates
        </span>
      </div>

      <div className="space-y-4">
        {/* Input Amount */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 text-xs font-bold">
              {getCurrencySymbol(fromCurrency)}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Currency selection row */}
        <div className="grid grid-cols-11 gap-2 items-center">
          <div className="col-span-5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">From</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              {Object.keys(EXCHANGE_RATES).map((cur) => (
                <option key={cur} value={cur}>
                  {cur} - {getCurrencySymbol(cur)}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1 flex justify-center pt-5">
            <button
              onClick={handleSwap}
              type="button"
              className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 transition cursor-pointer"
              title="Swap Currencies"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          <div className="col-span-5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">To</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              {Object.keys(EXCHANGE_RATES).map((cur) => (
                <option key={cur} value={cur}>
                  {cur} - {getCurrencySymbol(cur)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Converted result summary */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/50 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Result</p>
          <p className="text-lg font-black text-slate-900 mt-1">
            {getCurrencySymbol(fromCurrency)} {formatDisplayAmount(fromCurrency, amount)} =
          </p>
          <p className="text-xl font-black text-blue-600 mt-0.5 animate-pulse">
            {getCurrencySymbol(toCurrency)} {formatDisplayAmount(toCurrency, result)}
          </p>
          <p className="text-[9px] text-slate-400 mt-1.5 italic">
            1 {fromCurrency} = {(EXCHANGE_RATES[toCurrency] / EXCHANGE_RATES[fromCurrency]).toFixed(4)} {toCurrency}
          </p>
        </div>
      </div>
    </div>
  );
}
