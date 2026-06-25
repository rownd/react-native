export type SuperTokensConfig = {
  appInfo: {
    appName?: string;
    apiDomain: string;
    apiBasePath?: string;
  };
};

export type RowndProviderConfig = {
  appKey: string;
  supertokens: SuperTokensConfig;
  hubUrlOverride?: string;
  deepLinkScheme?: string;
};

export type RequestSignInMethods =
  | 'default'
  | 'email'
  | 'phone'
  | 'google'
  | 'apple'
  | 'anonymous'
  | 'guest';

export type RequestSignInIntent = 'sign_in' | 'sign_up';

export type RequestSignIn = {
  method?: RequestSignInMethods;
  postSignInRedirect?: string;
  intent?: RequestSignInIntent;
  prevent_closing?: boolean;
};
