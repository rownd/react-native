import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { RowndProvider, useRownd } from '@rownd/react-native';

const loadingAnimation = require('./assets/loading.json');

const SignIn = () => {
  const { requestSignIn } = useRownd();
  return <Button title="Sign in" onPress={() => requestSignIn()} />;
};

export default function App() {
  return (
    <RowndProvider
      config={{ appKey: 'YOUR_APP_KEY' }}
      customizations={{
        sheetBackgroundHexColor: '#ffedbd',
        sheetCornerBorderRadius: '20',
        loadingAnimation: JSON.stringify(loadingAnimation),
      }}
    >
      <View style={styles.container}>
        <Text>Open up App.tsx to start working on your app!</Text>
        <SignIn />
      </View>
    </RowndProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
