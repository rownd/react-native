export interface IConfig {
  baseUrl?: string;
  apiUrl?: string;
  pdcBaseUrl?: string;
  appKey?: string;
  postLoginUrl?: null | string;
  postRegistrationUrl?: null | string;
  locationHash?: null | string;
  postAuthenticationApi?: null | PostAuthApiSpec;
}

export type PostAuthApiSpec = {
  method: 'post' | 'put';
  url: string;
  extra_headers: { [key: string]: string };
};
