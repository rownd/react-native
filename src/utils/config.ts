export interface IConfig {
  appKey: string;
  sheetBackgroundHexColor?: string;
  sheetCornerBorderRadius?: number;
}

export type PostAuthApiSpec = {
  method: 'post' | 'put';
  url: string;
  extra_headers: { [key: string]: string };
};
