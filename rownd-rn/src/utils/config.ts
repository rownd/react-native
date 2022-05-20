import pickBy from 'lodash-es/pickBy';

export interface IConfig {
    baseUrl: string;
    apiUrl: string;
    pdcBaseUrl: string;
    appKey: string;
    postLoginUrl: null | string;
    postRegistrationUrl: null | string;
    locationHash: null | string;
    postAuthenticationApi: null | PostAuthApiSpec;
}

const config: IConfig = {
    baseUrl: 'https://hub.rownd.io',
    apiUrl: 'https://api.rownd.io',
    pdcBaseUrl: 'https://mydata.rownd.io',
    appKey: '',
    postLoginUrl: null,
    postRegistrationUrl: null,
    locationHash: null,
    postAuthenticationApi: null
}

export type PostAuthApiSpec = {
    method: 'post' | 'put';
    url: string;
    extra_headers: { [key: string]: string };
}

export function createConfig(opts: Partial<IConfig>): IConfig {
    return {
        ...config,
        ...pickBy(opts)
    }
}