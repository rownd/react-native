import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { RowndProvider } from '@supertokens/rownd-react-native';
import Main from './Main';

const loadingAnimation = require('../assets/loading.json');

export default function App() {
  return (
    <View style={styles.container}>
      <RowndProvider
        config={{
          appKey: 'key_znpwrk9mnvfd0m4suwkxi06h',
          supertokens: {
            appInfo: {
              appName: 'React Native Example',
              apiDomain: 'http://localhost:3001',
              apiBasePath: '/auth',
            },
          },
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
