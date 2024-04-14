export interface Esp32Response {
  type: string;
  value: string;
}

export interface LockStatus extends Esp32Response {}

export interface HealthStatus extends Esp32Response {
  lastUpdate: Date;
}
