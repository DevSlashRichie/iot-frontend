export interface Sensor {
    id: string; // UUID
    label: string;
    created_at: number; // i64 timestamp
}

export interface SensorEntry {
    id: string; // UUID
    sensor_id: string; // UUID
    value: number; // f64
    created_at: number; // i64 timestamp
}
