import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GlobalContextProvider } from './GlobalContext';
import { DefaultContext } from './DefaultContext';
import { createConfig } from '../utils/config';
import { RowndComponents } from './RowndComponents';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

// const RowndContext = createContext<TRowndContext | undefined>(undefined);

interface IRowndProviderProps {
  appKey: string;
  apiUrl?: string;
  children: React.ReactNode;
}

export function RowndProvider({
  appKey,
  apiUrl,
  children,
}: IRowndProviderProps) {
  // const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  // const requestSignIn = useRef(function () {
  //     setIsSigningIn(true);
  // });

  // const [rowndState, setRowndState] = useState<any>({
  //     requestSignIn: requestSignIn.current,
  // });

  const config = createConfig({
    appKey,
    apiUrl,
  });

  return (
    <GlobalContextProvider config={config}>
      <DefaultContext config={config} />
      <BottomSheetModalProvider>
        <View style={styles.container}>
          <>
            {children}
            <RowndComponents />
          </>
        </View>
      </BottomSheetModalProvider>
    </GlobalContextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
