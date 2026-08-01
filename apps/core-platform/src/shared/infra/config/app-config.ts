export interface AppConfig {
  readonly host: string;
  readonly port: number;
}

export const APP_CONFIG = Symbol('APP_CONFIG');
