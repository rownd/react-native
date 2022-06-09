import * as React from 'react';

import { Text } from 'react-native';
import { useRownd } from '@rownd/react-native';

export default function MyView() {
  const { is_authenticated, requestSignIn } = useRownd();

  React.useEffect(() => {
    if (!is_authenticated) {
      requestSignIn();
    }
  });

  return (
    <>
      <Text>Requesting sign-in</Text>
    </>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   box: {
//     width: 60,
//     height: 60,
//     marginVertical: 20,
//   },
// });
