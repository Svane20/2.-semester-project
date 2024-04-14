export interface MQTTResponse {
  type: string;
  value: string;
}

export interface LockStatus extends MQTTResponse {}

export interface HealthStatus extends MQTTResponse {
  lastUpdate: Date;
}
