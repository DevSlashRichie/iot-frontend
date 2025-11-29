import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSensorHistory, getSensor } from "../../services/api";
import type { Sensor, SensorEntry } from "../../types";
import { ArrowLeft, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/sensor/$sensorId/history")({
  component: SensorHistory,
});

function SensorHistory() {
  const { sensorId } = Route.useParams();
  const [history, setHistory] = useState<SensorEntry[]>([]);
  const [sensor, setSensor] = useState<Sensor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getSensor(sensorId), getSensorHistory(sensorId)])
      .then(([sensorData, historyData]) => {
        setSensor(sensorData);
        // Sort history by date if needed, usually backend returns sorted but good to be safe
        setHistory(historyData.sort((a, b) => a.created_at - b.created_at));
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load history data");
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

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-800 text-red-200 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  // Format data for chart
  const chartData = history.map((entry) => ({
    ...entry,
    date: new Date(entry.created_at * 1000).toLocaleString(),
    timestamp: entry.created_at * 1000,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/sensor/$sensorId"
          params={{ sensorId }}
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={20} /> Back to Sensor
        </Link>
        <h2 className="text-3xl font-bold text-slate-100">
          History: {sensor?.label || sensorId}
        </h2>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <Calendar className="text-blue-400" /> Data Points: {history.length}
          </h3>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8" }}
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  borderColor: "#334155",
                  color: "#f1f5f9",
                }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
