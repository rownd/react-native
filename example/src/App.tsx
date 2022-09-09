import * as React from 'react';

import { StyleSheet, View, Text, Button } from 'react-native';
import { multiply, RowndProvider, hello } from '@rownd/react-native';
import Main from './Main';

export default function App() {
  const [result, setResult] = React.useState<number | undefined>();

  React.useEffect(() => {
    multiply(3, 7).then(setResult);
  }, []);

  return (
    <View style={styles.container}>
      <RowndProvider config={{ appKey: 'b9cba8b0-4285-42fd-81ac-8afbe95cb8c5' }}>
        <Text>Result: {result}</Text>
        <Button onPress={()=> hello()} title="Hello"/>
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
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
