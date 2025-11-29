import axios from 'axios';
import type { Sensor, SensorEntry } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL: API_URL,
});

export const getSensors = async (): Promise<Sensor[]> => {
    const response = await api.get('/sensor');
    return response.data;
};

export const getSensor = async (id: string): Promise<Sensor> => {
    const response = await api.get(`/sensor/${id}`);
    return response.data;
};

export const getSensorHistory = async (id: string): Promise<SensorEntry[]> => {
    const response = await api.get(`/sensor/${id}/history`);
    return response.data;
};

export default api;
