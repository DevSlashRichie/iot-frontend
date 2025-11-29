import { useEffect, useState } from 'react';
import type { SensorEntry } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

export const useSensorSSE = (sensorId?: string) => {
    const [lastEntry, setLastEntry] = useState<SensorEntry | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!sensorId) return;

        const eventSource = new EventSource(`${API_URL}/sensor/${sensorId}/live`);

        eventSource.onopen = () => {
            setIsConnected(true);
            console.log('Connected to SSE');
        };

        eventSource.onmessage = (event) => {
            try {
                const data: SensorEntry = JSON.parse(event.data);
                setLastEntry(data);
            } catch (error) {
                console.error('Error parsing SSE message:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE error:', error);
            setIsConnected(false);
            eventSource.close();
        };

        return () => {
            eventSource.close();
            setIsConnected(false);
        };
    }, [sensorId]);

    return { lastEntry, isConnected };
};
