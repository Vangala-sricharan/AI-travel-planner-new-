# AI Travel Planner 🌍✈️

An intelligent, high-fidelity full-stack AI-powered travel planner that generates customized day-by-day itineraries, interactive geographic map markers, complete cost allocation dashboards, dynamic packing lists, and local safety tips. Built with **React 19, Vite, Express, Tailwind CSS, Recharts, Leaflet, and the Google Gemini 3.5 AI Engine**.

---

## 🌟 Key Features

- **Generative AI Itineraries**: Harnesses Google Gemini 3.5 to synthesize structured, bespoke daily schedules categorized by Morning, Afternoon, Evening, and Night.
- **Interactive OpenStreetMap**: Color-coded map markers for Hotels, Restaurants, and tourist attractions dynamically bound with interactive popups.
- **Cost Allocation Hub**: Responsive Pie and Bar charts tracking expense estimates across accommodation, food, travel, activities, and emergency buffers.
- **Aesthetic Weather & Safety Guide**: Accurate localized climate details, currency designations, emergency hotlines, and security briefs per destination.
- **Smart Packing Checklist**: Categorized packing essentials based on destination climate, allowing users to check, add, and delete items.
- **Saved History Manager**: Search, delete, reopen, and duplicate previous itineraries stored persistently in `localStorage`.
- **Apple-Inspired Design**: Elegant Glassmorphism, smooth Framer Motion reveal effects, responsive grids, and high-contrast typography.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Framer Motion (`motion/react`), Tailwind CSS
- **Backend/API Proxy**: Node.js, Express (proxies Gemini API safely to hide keys)
- **Data Visualization**: Recharts
- **Mapping & Geodata**: Leaflet, OpenStreetMap
- **AI Engine**: Google Gemini API via the `@google/genai` TypeScript SDK
- **Compiler/Bundler**: Esbuild (bundles server CJS), Vite (bundles client static)

---

## 📁 Folder Structure

```text
├── server.ts               # Full-stack Express server (Vite middleware in dev, static assets in prod)
├── package.json            # Scripts & dependencies
├── metadata.json           # Applet configurations & requested permissions
├── .env.example            # Environment variables template
├── index.html              # HTML Entrypoint
├── src/
│   ├── main.tsx            # React Entrypoint
│   ├── App.tsx             # State-based routing, Loading screens, and error views
│   ├── index.css           # Global Tailwind CSS and Google Fonts (Inter / JetBrains Mono)
│   ├── types.ts            # Type-safe schemas (TravelPlan, Itinerary, PackingList)
│   ├── context/
│   │   └── TravelContext.tsx # Centralized React State Provider (localStorage syncing)
│   └── components/
│       ├── LandingPage.tsx   # Premium product homepage, FAQ, testimonials, and marketing
│       ├── PlannerForm.tsx   # Large preference collection form
│       ├── TripDetail.tsx    # Active trip dashboard (tabs for map, budget, checklist)
│       ├── SavedTripsPanel.tsx # Searchable list of saved trips
│       ├── TravelMap.tsx     # Leaflet map component with customized SVG markers
│       └── BudgetCharts.tsx  # Cost charts built on Recharts
```

---

## 🔑 Google AI Studio API Setup

1. Head to [Google AI Studio](https://aistudio.google.com/).
2. Create or select a project and click **Create API Key**.
3. Copy the generated key.
4. Set this key in your secrets or local environment as:
   ```env
   GEMINI_API_KEY="your_api_key_here"
   ```

---

## ⚙️ Running Locally

Follow these quick steps to get the app running on your machine:

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` into a new file named `.env` and fill in your Gemini API key:
```bash
cp .env.example .env
```

### 3. Start Development Server
This boots up the full-stack Express + Vite environment on `http://localhost:3000`:
```bash
npm run dev
```

### 4. Build for Production
This compiles the static assets into `dist/` and bundles `server.ts` into a self-contained `dist/server.cjs` file:
```bash
npm run build
```

### 5. Launch Production Server
```bash
npm run start
```

---

## 🚀 Deploying to Vercel

The AI Travel Planner is completely optimized for seamless Vercel deployment. Because Vercel supports standard serverless hosting or single-page static applications with environment fallbacks, you can choose to deploy the app with no backend configuration by taking advantage of client-side environments:

1. Connect your GitHub repository to **Vercel**.
2. Add your environment variable in Vercel's project dashboard:
   - Name: `VITE_GEMINI_API_KEY` (Fully mapped as fallback in our codebase)
   - Value: `YOUR_ACTUAL_GEMINI_API_KEY`
3. Hit **Deploy**! Vercel will automatically run the build and host your production-ready planner.

---

## 🔒 License

Distributed under the Apache 2.0 License. See `LICENSE` or file headers for details.
