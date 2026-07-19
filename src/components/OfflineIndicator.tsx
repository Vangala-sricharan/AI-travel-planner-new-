import { useState, useEffect } from "react";
import { WifiOff, AppWindow, Check, Info } from "lucide-react";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Capture standard PWA installation prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Check if running inside PWA standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <div id="offline-pwa-indicator-wrapper" className="font-sans">
      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="bg-red-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 animate-pulse">
          <WifiOff className="w-4 h-4" />
          <span>Offline Mode Active &bull; Viewing locally stored itineraries. AI modifications are paused until connection is restored.</span>
        </div>
      )}

      {/* PWA App Installation Floating Banner (shown if installation is possible) */}
      {deferredPrompt && !isInstalled && (
        <div className="bg-slate-900 text-white border-t border-slate-800 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AppWindow className="w-5 h-5 text-blue-400" />
            <div>
              <p className="font-bold">Install AI Travel Planner as a Native App</p>
              <p className="text-[10px] text-slate-400">Enjoy instant offline loading, standalone windows, and mobile launcher shortcuts.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeferredPrompt(null)}
              className="px-3 py-1.5 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              Ignore
            </button>
            <button
              onClick={handleInstallApp}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-sm cursor-pointer"
            >
              Install App
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
