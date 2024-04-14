export interface IServiceUrls {
  backendUrl: string;
}

export interface IEnvironment {
  production: boolean;
  serviceUrls: IServiceUrls;
}
