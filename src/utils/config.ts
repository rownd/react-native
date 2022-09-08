export interface IConfig {
  appKey: string;
}

export type PostAuthApiSpec = {
  method: 'post' | 'put';
  url: string;
  extra_headers: { [key: string]: string };
};
