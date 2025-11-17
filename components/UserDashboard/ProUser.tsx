// "use client"

import React, { useEffect, useState } from "react";
import {
  Zap,
  Clock4,
  Bell,
  WifiOff,
  Globe,
  UserCheck,
  Gift,
  Wrench,
  Smartphone,
  Layers,
  CheckCircle,
  XCircle,
} from "lucide-react";

/**
 * ProDashboard.tsx
 * Fully responsive Pro User panel for Rainwater Harvesting App
 * - No external data calls; use local state / dummy data
 * - Tailwind CSS classes used for styling
 */

type RedistributionRule = {
  id: string;
  target: string;
  thresholdPercent: number; // start redistribution when tank >= threshold
  priority: number;
  enabled: boolean;
};

type ScheduleRule = {
  id: string;
  name: string;
  cronLike: string;
  enabled: boolean;
  time: string;
  action: string;
};

export default function ProDashboard() {
  // Dummy state
  const [redistributionRules, setRedistributionRules] = useState<
    RedistributionRule[]
  >([
    {
      id: "r1",
      target: "Garden",
      thresholdPercent: 80,
      priority: 1,
      enabled: true,
    },
    {
      id: "r2",
      target: "Toilet",
      thresholdPercent: 90,
      priority: 2,
      enabled: false,
    },
  ]);

  const [schedules, setSchedules] = useState<ScheduleRule[]>([
    { id: "s1", name: "Night Pump", cronLike: "0 2 * * *", enabled: true, time: "02:00", action: "Run pump 30 mins" },
    { id: "s2", name: "Morning Irrigation", cronLike: "0 6 * * *", enabled: false, time: "06:00", action: "Irrigation 20 mins" },
  ]);

  const [alertsEnabled, setAlertsEnabled] = useState({
    tankFull: true,
    tankEmpty: true,
    maintenance: true,
    rainAlert: true,
  });

  const [smartHomeConnected, setSmartHomeConnected] = useState({
    alexa: false,
    google: false,
  });

  const [sharingMode, setSharingMode] = useState({
    enabled: false,
    autoDonate: false,
    approvedNeighbors: ["Sita (House 12)"],
  });

  const [priorityUsage, setPriorityUsage] = useState({
    drinking: 50,
    cooking: 30,
    cleaning: 10,
    gardening: 10,
  });

  const [badges, setBadges] = useState<string[]>([
    "1000L Saver",
    "Community Donor",
    "Eco Champion",
  ]);

  const [maintenanceItems, setMaintenanceItems] = useState([
    { id: "m1", name: "Filter Cartridge", progressPercent: 60, dueDays: 20 },
    { id: "m2", name: "Pump Inspection", progressPercent: 85, dueDays: 60 },
  ]);

  const [offlineMode, setOfflineMode] = useState(false);
  const [supportRequests, setSupportRequests] = useState<
    { id: string; title: string; status: "open" | "resolved" }[]
  >([{ id: "su1", title: "Pump calibration help", status: "open" }]);

  // UI helpers
  const addRedistribution = () => {
    const id = `r${Date.now()}`;
    setRedistributionRules((prev) => [
      ...prev,
      { id, target: "New Target", thresholdPercent: 75, priority: prev.length + 1, enabled: true },
    ]);
  };

  const toggleRedistribution = (id: string) =>
    setRedistributionRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));

  const updateRedistribution = (id: string, patch: Partial<RedistributionRule>) =>
    setRedistributionRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const removeRedistribution = (id: string) =>
    setRedistributionRules((prev) => prev.filter((r) => r.id !== id));

  const addSchedule = () => {
    const id = `s${Date.now()}`;
    setSchedules((prev) => [...prev, { id, name: "New Schedule", cronLike: "", enabled: false, time: "00:00", action: "Custom action" }]);
  };

  const toggleSchedule = (id: string) =>
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));

  const bookService = (itemId: string) => {
    // dummy: mark maintenance item as scheduled (progress -> 0 or flag)
    setMaintenanceItems((prev) => prev.map((m) => (m.id === itemId ? { ...m, progressPercent: 0 } : m)));
    alert("Service booked — a technician will contact you (dummy)");
  };

  useEffect(() => {
    // simulate offline detection
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Layout
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-10 to-sky-900 text-white">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Top header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Pro Control Center</h1>
            <p className="text-sky-200/80 mt-1">Automation, sharing & premium controls for your rainwater system</p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-3 py-2 rounded-md ${offlineMode ? "bg-red-600/30" : "bg-emerald-600/20"} text-sm flex items-center gap-2`}>
              {offlineMode ? <WifiOff className="h-4 w-4 text-red-300" /> : <CheckCircle className="h-4 w-4 text-emerald-300" />}
              <span>{offlineMode ? "Offline Mode" : "Live Mode"}</span>
            </div>

            <button
              onClick={() => alert("Upgrade/downgrade flow")}
              className="bg-white/10 px-4 py-2 rounded-md hover:bg-white/20 text-sm"
            >
              Manage Plan
            </button>
          </div>
        </header>

        {/* Grid: left main + right sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — main controls (2 cols on large) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Redistribution rules */}
            <section className="bg-white/6 p-5 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Smart Water Redistribution</h2>
                <div className="flex items-center gap-2">
                  <button onClick={addRedistribution} className="bg-sky-500 px-3 py-1 rounded-md text-sm">+ Add Rule</button>
                </div>
              </div>

              <div className="space-y-3">
                {redistributionRules.map((r) => (
                  <div key={r.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/5 p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sky-700/30 flex items-center justify-center text-sky-200 font-semibold">{r.priority}</div>
                      <div>
                        <div className="font-semibold text-white/95">{r.target}</div>
                        <div className="text-sm text-white/60">Start when tank ≥ {r.thresholdPercent}%</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-sm text-white/70">Priority</label>
                      <input
                        type="number"
                        min={1}
                        value={r.priority}
                        onChange={(e) => updateRedistribution(r.id, { priority: Number(e.target.value) })}
                        className="w-20 rounded-md bg-white/10 px-2 py-1 text-white"
                      />

                      <label className="text-sm text-white/70">Threshold</label>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        value={r.thresholdPercent}
                        onChange={(e) => updateRedistribution(r.id, { thresholdPercent: Number(e.target.value) })}
                        className="w-40"
                      />
                      <span className="w-12 text-right text-sm">{r.thresholdPercent}%</span>

                      <button onClick={() => toggleRedistribution(r.id)} className={`px-3 py-1 rounded-md text-sm ${r.enabled ? "bg-emerald-500" : "bg-red-600/40"}`}>
                        {r.enabled ? "Enabled" : "Disabled"}
                      </button>

                      <button onClick={() => removeRedistribution(r.id)} className="px-2 py-1 rounded-md bg-white/5 text-sm">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Scheduling */}
            <section className="bg-white/6 p-5 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Usage Scheduling</h2>
                <div className="flex items-center gap-2">
                  <button onClick={addSchedule} className="bg-sky-500 px-3 py-1 rounded-md text-sm">+ New Schedule</button>
                </div>
              </div>

              <div className="space-y-3">
                {schedules.map((s) => (
                  <div key={s.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/5 p-3 rounded-xl">
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-sm text-white/60">{s.action} • at {s.time}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="time" value={s.time} onChange={(e) => setSchedules((prev) => prev.map((ps) => ps.id === s.id ? { ...ps, time: e.target.value } : ps))} className="bg-white/10 text-white rounded-md px-2 py-1"/>
                      <button onClick={() => toggleSchedule(s.id)} className={`px-3 py-1 rounded-md text-sm ${s.enabled ? "bg-emerald-500" : "bg-red-600/40"}`}>{s.enabled ? "On" : "Off"}</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Priority usage & sharing */}
            <section className="bg-white/6 p-5 rounded-2xl shadow-lg grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-3">Priority Water Usage</h3>
                <div className="space-y-3">
                  {Object.entries(priorityUsage).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-3">
                      <div className="w-28 capitalize text-sm text-white/80">{k}</div>
                      <input type="range" min={0} max={100} value={v} onChange={(e) => setPriorityUsage(prev => ({ ...prev, [k]: Number(e.target.value) }))} className="flex-1"/>
                      <div className="w-12 text-right">{v}%</div>
                    </div>
                  ))}
                  <div className="text-sm text-white/60 mt-2">Total allocation will be normalized when the system enforces priorities.</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Water Sharing Mode</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={sharingMode.enabled} onChange={(e) => setSharingMode(prev => ({ ...prev, enabled: e.target.checked }))} />
                      <span className="ml-1">Enable Sharing</span>
                    </label>
                    <label className="flex items-center gap-2 ml-4">
                      <input type="checkbox" checked={sharingMode.autoDonate} onChange={(e) => setSharingMode(prev => ({ ...prev, autoDonate: e.target.checked }))} />
                      <span className="ml-1">Auto-Donate</span>
                    </label>
                  </div>

                  <div>
                    <div className="text-sm text-white/70 mb-2">Approved Recipients</div>
                    <div className="flex flex-wrap gap-2">
                      {sharingMode.approvedNeighbors.map((n, i) => (
                        <div key={i} className="bg-white/5 px-3 py-1 rounded-lg text-sm">{n}</div>
                      ))}
                      <button onClick={() => setSharingMode(prev => ({ ...prev, approvedNeighbors: [...prev.approvedNeighbors, `Neighbor ${prev.approvedNeighbors.length + 1}`] }))} className="bg-sky-500 px-2 py-1 rounded text-sm">+ Add</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Gamification */}
            <section className="bg-white/6 p-5 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Gamification & Rewards</h2>
                  <p className="text-sm text-white/60">Milestones & community badges to encourage water saving</p>
                </div>
                <div>
                  <button onClick={() => alert("Open Rewards Center (dummy)")} className="bg-sky-500 px-3 py-1 rounded-md">Open Rewards</button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                {badges.map((b, i) => (
                  <div key={i} className="bg-white/5 px-4 py-2 rounded-full flex items-center gap-2">
                    <Gift className="h-4 w-4 text-yellow-300" />
                    <span className="text-sm">{b}</span>
                  </div>
                ))}
                <div className="bg-white/5 px-4 py-2 rounded-full cursor-pointer text-sm" onClick={() => setBadges(prev => [...prev, `Badge ${prev.length + 1}`])}>+ Earn badge</div>
              </div>
            </section>
          </div>

          {/* Right sidebar - smaller cards */}
          <aside className="space-y-6">
            {/* Alerts & Notifications */}
            <div className="bg-white/6 p-4 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Alerts & Notifications</h4>
                <Bell className="h-5 w-5 text-sky-300" />
              </div>
              <div className="space-y-2 text-sm">
                <label className="flex items-center justify-between">
                  <span>Tank Full Alerts</span>
                  <input type="checkbox" checked={alertsEnabled.tankFull} onChange={(e) => setAlertsEnabled(prev => ({ ...prev, tankFull: e.target.checked }))} />
                </label>
                <label className="flex items-center justify-between">
                  <span>Tank Empty Alerts</span>
                  <input type="checkbox" checked={alertsEnabled.tankEmpty} onChange={(e) => setAlertsEnabled(prev => ({ ...prev, tankEmpty: e.target.checked }))} />
                </label>
                <label className="flex items-center justify-between">
                  <span>Maintenance Reminders</span>
                  <input type="checkbox" checked={alertsEnabled.maintenance} onChange={(e) => setAlertsEnabled(prev => ({ ...prev, maintenance: e.target.checked }))} />
                </label>
                <label className="flex items-center justify-between">
                  <span>Rain Alerts</span>
                  <input type="checkbox" checked={alertsEnabled.rainAlert} onChange={(e) => setAlertsEnabled(prev => ({ ...prev, rainAlert: e.target.checked }))} />
                </label>
              </div>
            </div>

            {/* Smart Home Integration */}
            <div className="bg-white/6 p-4 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Smart Home</h4>
                <Smartphone className="h-5 w-5 text-sky-300" />
              </div>
              <p className="text-sm text-white/60 mt-2">Connect voice assistants or control remotely</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setSmartHomeConnected(prev => ({ ...prev, alexa: !prev.alexa }))} className={`flex-1 py-2 rounded-md ${smartHomeConnected.alexa ? "bg-emerald-500" : "bg-white/5"}`}>Alexa {smartHomeConnected.alexa ? "Connected" : "Connect"}</button>
                <button onClick={() => setSmartHomeConnected(prev => ({ ...prev, google: !prev.google }))} className={`flex-1 py-2 rounded-md ${smartHomeConnected.google ? "bg-emerald-500" : "bg-white/5"}`}>Google Home {smartHomeConnected.google ? "Connected" : "Connect"}</button>
              </div>
            </div>

            {/* Maintenance Hub */}
            <div className="bg-white/6 p-4 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Maintenance Hub</h4>
                <Wrench className="h-5 w-5 text-sky-300" />
              </div>
              <div className="space-y-3">
                {maintenanceItems.map((m) => (
                  <div key={m.id} className="bg-white/5 p-2 rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{m.name}</div>
                        <div className="text-xs text-white/60">Due in {m.dueDays} days</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{m.progressPercent}%</div>
                        <div className="w-24 h-2 bg-white/10 rounded overflow-hidden mt-2">
                          <div style={{ width: `${m.progressPercent}%` }} className="h-2 bg-emerald-400"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => bookService(m.id)} className="text-sm px-3 py-1 rounded bg-sky-500">Book Service</button>
                      <button onClick={() => alert("View maintenance history (dummy)")} className="text-sm px-3 py-1 rounded bg-white/5">History</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Support */}
            <div className="bg-white/6 p-4 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Premium Support</h4>
                <UserCheck className="h-5 w-5 text-sky-300" />
              </div>
              <p className="text-sm text-white/60">Priority helpdesk + expert chat</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => alert("Open chat (dummy)")} className="flex-1 py-2 rounded-md bg-sky-500">Chat Now</button>
                <button onClick={() => { setSupportRequests(prev => [...prev, { id: `su${Date.now()}`, title: 'Manual assistance requested', status: 'open' }]); alert('Request submitted (dummy)'); }} className="py-2 px-3 rounded-md bg-white/5">Create Ticket</button>
              </div>

              <div className="mt-3 text-sm">
                <div className="font-semibold">Recent Requests</div>
                <ul className="mt-2 space-y-2">
                  {supportRequests.map(s => (
                    <li key={s.id} className="flex items-center justify-between bg-white/5 p-2 rounded">
                      <span>{s.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${s.status === 'open' ? 'bg-yellow-500/30' : 'bg-emerald-500/30'}`}>{s.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/6 p-3 rounded-2xl shadow-lg flex flex-col gap-2">
              <button onClick={() => alert("Trigger immediate redistribution (dummy)")} className="py-2 rounded-md bg-sky-500">Run Redistribution Now</button>
              <button onClick={() => alert("Run diagnostics (dummy)")} className="py-2 rounded-md bg-white/5">Run Diagnostics</button>
              <button onClick={() => alert("Export config (dummy)")} className="py-2 rounded-md bg-white/5">Export Config</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
