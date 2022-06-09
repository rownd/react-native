import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { RowndProvider } from '@rownd/react-native';

import MyView from './MyView';

export default function App() {
  return (
    <RowndProvider
      appKey="82f7fa9a-8110-416c-8cc8-e3c0506fbf93"
      apiUrl="https://api.us-east-2.dev.rownd.io"
    >
      <View style={styles.container}>
        <Text style={styles.box}>Welcome</Text>
        <MyView />
      </View>
    </RowndProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
