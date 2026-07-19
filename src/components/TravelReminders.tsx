import React, { useState, useEffect } from "react";
import { Bell, Calendar, Plus, Trash2, CheckCircle2, AlertTriangle, Check, Info } from "lucide-react";

interface Reminder {
  id: string;
  task: string;
  dueDate: string;
  completed: boolean;
  type: "document" | "packing" | "booking" | "other";
}

interface TravelRemindersProps {
  tripId: string;
}

export default function TravelReminders({ tripId }: TravelRemindersProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [taskText, setTaskText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [type, setType] = useState<"document" | "packing" | "booking" | "other">("packing");
  const [notifSupported, setNotifSupported] = useState(false);
  const [notifPermission, setNotifPermission] = useState("default");

  // Load reminders per trip
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`ai_travel_reminders_${tripId}`);
      if (stored) {
        setReminders(JSON.parse(stored));
      } else {
        // Preload default travel reminders
        const defaultReminders: Reminder[] = [
          { id: "rem_1", task: "Check passport expiration date (needs at least 6 months)", dueDate: new Date(Date.now() + 5 * 24 * 3600000).toISOString().split("T")[0], completed: false, type: "document" },
          { id: "rem_2", task: "Notify credit card company of international travel", dueDate: new Date(Date.now() + 7 * 24 * 3600000).toISOString().split("T")[0], completed: false, type: "other" },
          { id: "rem_3", task: "Pack multi-region universal power adapters", dueDate: new Date(Date.now() + 10 * 24 * 3600000).toISOString().split("T")[0], completed: false, type: "packing" },
          { id: "rem_4", task: "Download offline maps for the destination on mobile", dueDate: new Date(Date.now() + 11 * 24 * 3600000).toISOString().split("T")[0], completed: false, type: "booking" }
        ];
        setReminders(defaultReminders);
        localStorage.setItem(`ai_travel_reminders_${tripId}`, JSON.stringify(defaultReminders));
      }
    } catch (e) {
      console.error(e);
    }

    // Check notification support
    if ("Notification" in window) {
      setNotifSupported(true);
      setNotifPermission(Notification.permission);
    }
  }, [tripId]);

  const saveReminders = (updated: Reminder[]) => {
    setReminders(updated);
    try {
      localStorage.setItem(`ai_travel_reminders_${tripId}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const requestNotificationPermission = () => {
    if (!notifSupported) return;
    Notification.requestPermission().then((permission) => {
      setNotifPermission(permission);
    });
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim() || !dueDate) return;

    const newReminder: Reminder = {
      id: "rem_" + Date.now(),
      task: taskText.trim(),
      dueDate: dueDate,
      completed: false,
      type: type,
    };

    const updated = [...reminders, newReminder].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    saveReminders(updated);
    setTaskText("");
    setDueDate("");

    // Trigger local push notification if granted
    if (notifPermission === "granted") {
      new Notification("Travel Reminder Scheduled", {
        body: `"${newReminder.task}" scheduled successfully for ${newReminder.dueDate}!`,
        icon: "/icon-192.png",
      });
    }
  };

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map((rem) => {
      if (rem.id === id) {
        return { ...rem, completed: !rem.completed };
      }
      return rem;
    });
    saveReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter((rem) => rem.id !== id);
    saveReminders(updated);
  };

  const pendingReminders = reminders.filter((r) => !r.completed);

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm space-y-6" id="travel-reminders-panel">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600 animate-swing" /> Travel Reminders & Alarms
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep track of pre-travel preparations, documents, and packing checklist countdowns.
          </p>
        </div>

        {notifSupported && notifPermission !== "granted" && (
          <button
            onClick={requestNotificationPermission}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" /> Enable Push Alarms
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form - 4 cols */}
        <div className="lg:col-span-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1">
            <Plus className="w-4 h-4" /> Schedule Reminder
          </h3>

          <form onSubmit={handleAddReminder} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Reminder Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Purchase travel insurance"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Task Category
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs focus:outline-none"
                >
                  <option value="packing">Packing list</option>
                  <option value="document">Documents</option>
                  <option value="booking">Reservations</option>
                  <option value="other">General task</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-black text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" /> Set Reminder
            </button>
          </form>

          {notifPermission === "granted" ? (
            <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 justify-center bg-emerald-50 py-1.5 rounded-lg border border-emerald-100">
              <Check className="w-3.5 h-3.5" /> Browser push notifications are ACTIVE
            </p>
          ) : (
            <p className="text-[10px] text-slate-400 italic text-center">
              Reminders will be alerted in-app dynamically.
            </p>
          )}
        </div>

        {/* List - 8 cols */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pending Alerts ({pendingReminders.length})
            </h3>
            <span className="text-[10px] text-slate-400">
              Sorted by nearest deadline
            </span>
          </div>

          <div className="border border-slate-200/60 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {reminders.length === 0 ? (
              <p className="p-8 text-center text-slate-400 italic text-xs">
                No active reminders configured yet. Add one above!
              </p>
            ) : (
              reminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`flex items-center justify-between px-5 py-3 text-xs group transition ${
                    rem.completed ? "bg-slate-50/50" : "bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleReminder(rem.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer ${
                        rem.completed
                          ? "bg-blue-50 border-blue-200 text-blue-600"
                          : "border-slate-300 hover:border-blue-400 hover:bg-blue-50/30"
                      }`}
                    >
                      {rem.completed && <Check className="w-3.5 h-3.5 font-bold" />}
                    </button>

                    <div>
                      <p className={`font-semibold ${rem.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                        {rem.task}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-medium">
                        <span className="capitalize px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-bold">
                          {rem.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" /> Due: {rem.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteReminder(rem.id)}
                    className="text-slate-300 hover:text-red-500 p-1 rounded transition cursor-pointer md:opacity-0 md:group-hover:opacity-100"
                    title="Delete countdown alert"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
