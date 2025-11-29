import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getSensors } from '../../services/api'
import type { Sensor } from '../../types'
import { Activity, Thermometer } from 'lucide-react'

export const Route = createFileRoute('/sensor/')({
    component: SensorList,
})

function SensorList() {
    const [sensors, setSensors] = useState<Sensor[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        getSensors()
            .then(setSensors)
            .catch((err) => {
                console.error(err)
                setError('Failed to load sensors')
            })
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-900/50 border border-red-800 text-red-200 p-4 rounded-lg">
                {error}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-slate-100">Available Sensors</h2>
                <div className="text-sm text-slate-400">
                    Total: {sensors.length}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sensors.map((sensor) => (
                    <Link
                        key={sensor.id}
                        to="/sensor/$sensorId"
                        params={{ sensorId: sensor.id }}
                        className="block group"
                    >
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                    <Thermometer size={24} />
                                </div>
                                <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded">
                                    {sensor.id.slice(0, 8)}...
                                </span>
                            </div>

                            <h3 className="text-xl font-semibold text-slate-200 mb-1 group-hover:text-blue-400 transition-colors">
                                {sensor.label}
                            </h3>
                            <p className="text-slate-400 text-sm">
                                Created: {new Date(sensor.created_at * 1000).toLocaleDateString()}
                            </p>

                            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
                                <Activity size={16} />
                                <span>Active</span>
                            </div>
                        </div>
                    </Link>
                ))}

                {sensors.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                        No sensors found.
                    </div>
                )}
            </div>
        </div>
    )
}
