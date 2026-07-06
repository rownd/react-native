import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { RowndProvider } from '@supertokens/rownd-react-native';
import Main from './Main';

const loadingAnimation = require('../assets/loading.json');
const defaultApiDomain = 'https://trout-uncouple-geriatric.ngrok-free.dev';
const defaultHubUrl = 'https://rownd-hub.supertokens.com';

type AppProps = {
  appKey?: string;
  apiDomain?: string;
  apiBasePath?: string;
  hubUrlOverride?: string;
};

export default function App({
  appKey = 'test_app_key',
  apiDomain = defaultApiDomain,
  apiBasePath = '/auth',
  hubUrlOverride = defaultHubUrl,
}: AppProps) {
  return (
    <View style={styles.container}>
      <RowndProvider
        config={{
          appKey,
          supertokens: {
            appInfo: {
              appName: 'React Native Example',
              apiDomain,
              apiBasePath,
            },
          },
          hubUrlOverride,
          deepLinkScheme: 'rowndsupertokens',
        }}
        customizations={{
          sheetBackgroundHexColor: '#ffedbd',
          sheetCornerBorderRadius: '20',
          loadingAnimation: JSON.stringify(loadingAnimation),
        }}
      >
        <Main />
      </RowndProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
