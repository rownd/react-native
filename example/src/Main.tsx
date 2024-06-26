import { SignedIn, SignedOut, useRownd } from '@rownd/react-native';
import React from 'react';
import { View, Button, Text } from 'react-native';

export default function Main() {
  const {
    requestSignIn,
    signOut,
    user,
    manageAccount,
    access_token
  } = useRownd();

  return (
    <View>
      {user.data?.email && <Text>Email: {user.data?.email}</Text>}
      {access_token && <Text>Access Token: {access_token}</Text>}
      <SignedIn>
        <Button
          title="Sign Out"
          onPress={() => {
            signOut();
          }}
        />
        <Button title="Manage User" onPress={() => manageAccount()} />
        <Button
          title="Set First Name"
          onPress={() => user.setValue('first_name', 'Michael')}
        />
        <Button
          title="Set different First Name"
          onPress={() => user.setValue('first_name', 'Steve')}
        />
      </SignedIn>
      <SignedOut>
        <Button
          title="Sign In"
          onPress={() =>
            requestSignIn({
              postSignInRedirect: 'NATIVE_APP',
            })
          }
        />
        <Button
          title="Sign In (Apple)"
          onPress={() => requestSignIn({ method: 'apple' })}
        />
        <Button
          title="Sign In (Google)"
          onPress={() => requestSignIn({ method: 'google' })}
        />
        <Button
          title="Sign In (Guest)"
          onPress={() => requestSignIn({ method: 'guest' })}
        />
        <Button
          title="Sign In (Passkey)"
          onPress={() => requestSignIn({ method: 'passkey' })}
        />
      </SignedOut>
    </View>
  );
}
