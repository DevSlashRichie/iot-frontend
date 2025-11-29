import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSensor } from "../../services/api";
import type { Sensor } from "../../types";
import { useSensorSSE } from "../../hooks/useSensorSSE";
// import { useSensorWebSocket } from '../../hooks/useSensorWebSocket'
import { ArrowLeft, Gauge, History } from "lucide-react";

export const Route = createFileRoute("/sensor/$sensorId/")({
  component: SensorDetail,
});

function SensorDetail() {
  const { sensorId } = Route.useParams();
  const [sensor, setSensor] = useState<Sensor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Connect to WebSocket for this sensor
  // Connect to real-time data for this sensor
  // Use SSE by default for live updates
  const { lastEntry, isConnected } = useSensorSSE(sensorId);
  // const { lastEntry, isConnected } = useSensorWebSocket(sensorId)

  useEffect(() => {
    getSensor(sensorId)
      .then(setSensor)
      .catch((err) => {
        console.error(err);
        setError("Failed to load sensor details");
      })
      .finally(() => setLoading(false));
  }, [sensorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !sensor) {
    return (
      <div className="bg-red-900/50 border border-red-800 text-red-200 p-4 rounded-lg">
        {error || "Sensor not found"}
      </div>
    );
  }

  // Determine current value (WebSocket or fallback to 0/loading)
  const currentValue = lastEntry?.value ?? 0;
  // Simple logic to determine if "high" (example threshold)
  const isHigh = currentValue > 1000; // Example threshold

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/sensor"
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={20} /> Back
        </Link>
        <h2 className="text-3xl font-bold text-slate-100">{sensor.label}</h2>
        <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">
          {sensor.id}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Gauge */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
          <div
            className={`absolute top-0 right-0 p-4 ${isConnected ? "text-emerald-400" : "text-red-400"}`}
          >
            <div className="flex items-center gap-2 text-xs font-medium">
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`}
              ></div>
              {isConnected ? "LIVE" : "OFFLINE"}
            </div>
          </div>

          <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Gauge className="text-blue-400" /> Real-time Reading
          </h3>

          <div className="flex flex-col items-center justify-center h-64 bg-slate-950/50 rounded-lg border border-slate-800/50">
            <span
              className={`text-6xl font-mono font-bold ${isHigh ? "text-red-500 animate-pulse" : "text-emerald-400"}`}
            >
              {lastEntry ? lastEntry.value.toFixed(2) : "--"}
            </span>
            <span className="text-slate-500 mt-2">PPM</span>
            {isHigh && (
              <div className="mt-4 px-4 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-bold animate-bounce">
                WARNING: HIGH GAS LEVELS
              </div>
            )}
          </div>
        </div>

        {/* History Link / Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
              <History className="text-purple-400" /> History
            </h3>
            <Link
              to="/sensor/$sensorId/history"
              params={{ sensorId }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors"
            >
              View Full History
            </Link>
          </div>
          <div className="h-64 bg-slate-950/50 rounded-lg flex items-center justify-center text-slate-500 border border-slate-800/50">
            <p className="text-center">
              Click "View Full History" to see
              <br />
              detailed charts and data logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
