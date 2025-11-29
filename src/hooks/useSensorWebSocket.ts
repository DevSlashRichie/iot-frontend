import { useEffect, useState } from 'react';
import type { SensorEntry } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.host}`;

export const useSensorWebSocket = (sensorId?: string) => {
    const [lastEntry, setLastEntry] = useState<SensorEntry | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!sensorId) return;

        const ws = new WebSocket(`${WS_URL}/sensor/${sensorId}/ws`);

        ws.onopen = () => {
            setIsConnected(true);
            console.log('Connected to WebSocket');
        };

        ws.onclose = () => {
            setIsConnected(false);
            console.log('Disconnected from WebSocket');
        };

        ws.onmessage = (event) => {
            try {
                const data: SensorEntry = JSON.parse(event.data);
                if (!sensorId || data.sensor_id === sensorId) {
                    setLastEntry(data);
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        return () => {
            ws.close();
        };
    }, [sensorId]);

    return { lastEntry, isConnected };
};
