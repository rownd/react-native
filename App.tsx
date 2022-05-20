import 'expo-dev-client';
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Pressable } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RowndProvider, useRownd } from './rownd-rn/src';
import App from './components';

function Root(props: any) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RowndProvider appKey="82f7fa9a-8110-416c-8cc8-e3c0506fbf93" apiUrl="https://api.us-east-2.dev.rownd.io">
        <App />
      </RowndProvider>
    </GestureHandlerRootView>
  );
}

export default Root;
