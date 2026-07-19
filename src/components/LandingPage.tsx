import { motion } from "motion/react";
import { Sparkles, Map, Calendar, DollarSign, ShieldCheck, ArrowRight, Compass, HelpCircle, Star, ShieldAlert } from "lucide-react";
import TripTemplates from "./TripTemplates";
import AnalyticsDashboard from "./AnalyticsDashboard";

interface LandingPageProps {
  onStartPlanning: () => void;
  onViewHistory: () => void;
  savedTripsCount: number;
}

export default function LandingPage({ onStartPlanning, onViewHistory, savedTripsCount }: LandingPageProps) {
  const features = [
    {
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      title: "Generative AI Engine",
      desc: "Instant customized itineraries tailormade for your personal interests, food tastes, and accessibility requirements.",
    },
    {
      icon: <Map className="w-5 h-5 text-blue-500" />,
      title: "Interactive OpenStreetMaps",
      desc: "Visually pinned hotels, local restaurants, and primary tourist attractions integrated directly with custom-rendered cards.",
    },
    {
      icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
      title: "Smart Budget Allocation",
      desc: "Live distribution pie-charts tracking your expenses across accommodation, transport, shopping, and emergencies.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-rose-500" />,
      title: "Localized Travel Guard",
      desc: "Essential safety guidance, local emergency numbers, currency specs, and official languages generated per destination.",
    },
  ];

  const workflowSteps = [
    {
      num: "01",
      title: "Define Your Vision",
      desc: "Enter your dream destination, travel style, duration, and preferred transportation or accommodation.",
    },
    {
      num: "02",
      title: "Fine-tune Preferences",
      desc: "Select specific weather priorities, diet parameters, budget bounds, accessibility, and unique constraints.",
    },
    {
      num: "03",
      title: "Generate & Explore",
      desc: "Watch the AI synthesize custom daily guides, interactive map pins, custom packing checklists, and budgets.",
    },
  ];

  const testimonials = [
    {
      quote: "The day-by-day itineraries were extremely creative. Found incredible coffee spots in Tokyo I would've never discovered alone.",
      name: "Marcus V.",
      role: "Solo Backpacker",
      rating: 5,
    },
    {
      quote: "Managed to coordinate a 5-day group trip to Rome effortlessly. The budget charts kept our shopping and meals perfectly transparent.",
      name: "Elena S.",
      role: "Family Organizer",
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: "How accurate are the geographic coordinates on the map?",
      a: "The planner leverages Gemini 3.5's advanced geographic data to pin highly accurate coordinates for famous public spots, prominent hotels, and local food markers.",
    },
    {
      q: "Can I save, edit, and duplicate my itineraries?",
      a: "Yes! Every single generated trip is securely stored in your browser's local storage. You can search, delete, reopen, and duplicate trips with a single click.",
    },
    {
      q: "Can I customize the packing list?",
      a: "Absolutely! The AI generates a tailored packing list based on the destination's weather and your activities, but you can add your own custom items, delete default ones, and mark them completed.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col justify-between overflow-x-hidden">
      {/* Background Ambient Accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-slate-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Modern Top Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-600/10">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              AeroPlan<span className="text-blue-600 font-medium">.ai</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {savedTripsCount > 0 && (
              <button
                id="header-saved-trips-btn"
                onClick={onViewHistory}
                className="px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition"
              >
                Saved Trips ({savedTripsCount})
              </button>
            )}
            <button
              id="header-start-planning-btn"
              onClick={onStartPlanning}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/10 transition"
            >
              Start Planning
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Areas */}
      <main className="flex-grow">
        {/* Animated Hero Section */}
        <section className="max-w-4xl mx-auto text-center px-6 pt-20 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-blue-50 rounded-full text-blue-700 text-[11px] font-bold tracking-wider uppercase mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Advanced Travel Intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight mb-6"
          >
            Your next adventure,<br />
            <span className="text-blue-600">
              personalized by AI.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Generate tailor-made daily itineraries, accurate interactive map coordinates, interactive packing lists, 
            and complete cost dashboards in seconds. Crafted purely around your lifestyle, diet, and interests.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              id="hero-generate-itinerary-btn"
              onClick={onStartPlanning}
              className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl text-sm font-bold shadow-xl shadow-slate-200 transition duration-300 flex items-center justify-center gap-2"
            >
              Generate Free Itinerary <ArrowRight className="w-4 h-4" />
            </button>

            {savedTripsCount > 0 && (
              <button
                id="hero-view-saved-btn"
                onClick={onViewHistory}
                className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-2xl text-sm font-bold shadow-sm transition duration-300"
              >
                View Saved Trips ({savedTripsCount})
              </button>
            )}
          </motion.div>
        </section>

        {/* Instant Blueprint Presets & Live Statistics Row */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">
              <TripTemplates />
            </div>
            <div className="lg:col-span-7">
              <AnalyticsDashboard />
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section className="bg-white border-y border-slate-200 py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                Engineered for Perfect Journeys
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                We integrate multiple intelligence streams to coordinate complete guides that go far beyond standard search engines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -4 }}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
                    {feat.icon}
                  </div>
                  <h3 className="font-bold text-base text-slate-800 mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Visual Flow */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest font-bold text-blue-600">The Blueprint</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mt-2">
              How AI Travel Planning Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {workflowSteps.map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center">
                <span className="text-6xl font-black text-slate-200 dark:text-slate-100 select-none mb-4 block">
                  {step.num}
                </span>
                <h3 className="font-bold text-lg text-slate-800 mb-2">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-white border-t border-slate-200 py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-slate-900 mb-12">
              Loved by Global Explorers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((t, idx) => (
                <div key={idx} className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex gap-0.5 text-amber-500 mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 italic leading-relaxed mb-4">"{t.quote}"</p>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{t.name}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">{t.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-24 px-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-12 flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-blue-600" /> Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-2">{faq.q}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Beautiful Standard Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-white">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight text-white">
              AeroPlan<span className="text-blue-500 font-normal">.ai</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} AeroPlan.ai. All rights reserved. Powered by Advanced Intelligence.
          </p>
          <div className="flex gap-4 text-xs">
            <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
