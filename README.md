# @rownd/react-native

Rownd bindings for React Native

## Prerequisites
You must be using React Native v0.64 or higher.

## Installation

First, install the Rownd SDK for React Native.

```sh
npm install @rownd/react-native
```

Due to some native peer-dependencies, you'll also need to run the following command to get modules with native code working properly.

```sh
npm install @gorhom/bottom-sheet react-native-device-info \ react-native-gesture-handler react-native-mmkv react-native-reanimated \ react-native-sha256 react-native-svg
```

Once those are installed, run this command to ensure the iOS build can find the native components.

```sh
npx pod-install
```

## Setup
Rownd's React Native library uses several Expo modules to improve the overall experience. Some of these modules
have native bindings, so you won't be able to use a fully-managed Expo-based app. If you're running a bare project
or have used `expo prebuild`, then you should be fine.

### Install Expo
Run `npx install-expo-modules@latest` to ensure that dependent Expo modules are configured correctly.

### Install Gesture Handler
If you don't already use it, run `npx expo install react-native-gesture-handler`.

Include it within your app's root, wrapping your component tree like this:

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// ...

export default function Root() {
  return (
    <GestureHandlerRootView>
      <App />
    </GestureHandlerRootView>
  );
}
```

## Usage
The Rownd SDK includes a context provider that will enable any component of your app to access authentication state and user data.

Before you can use the SDK, you'll need to obtain an App Key from the [Rownd Dashboard](https://app.rownd.io).

```tsx
import { RowndProvider } from "@rownd/react-native";

// ...

export default function Root() {
  return (
    <GestureHandlerRootView>
      <RowndProvider appKey="<your app key>">
        <App />
      </RowndProvider>
    </GestureHandlerRootView>
  );
}
```

Later on within your app's components, you can use the Rownd hook to access the Rownd browser API:

```tsx
import { View, Text } from 'react-native';
import { useRownd } from '@rownd/react';

export default function MyProtectedComponent(props) {
  const { is_authenticated, user, requestSignIn, getAccessToken } = useRownd();

  // You can also request a sign in without a user pressing a button
  // by calling requestSignIn() from a useEffect callback.
  // useEffect(() => {
  //   if (!is_authenticated) {
  //     requestSignIn();
  //   }
  // }, [is_authenticated]);

  return (
    <View>
      {is_authenticated ? (
        <>
          <h1>Welcome {user.data.first_name}</h1>
          <button onClick={() => getAccessToken()}>Get access token</button>
        </>
      ) : (
        <>
          <Text>Please sign in to continue</Text>
          <Pressable onPress={() => requestSignIn()}>
            <Text>Sign in</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
```

## API reference

Most API methods are made available via the Rownd Provider and its associated `useRownd` React hook. Unless otherwise noted, we're assuming that you're using hooks.

#### requestSignIn()

Trigger the Rownd sign in dialog

```javascript
const { requestSignIn } = useRownd();

requestSignIn({
    auto_sign_in: false,                           // optional
    identifier: 'me@company.com' || '+19105551212' // optional
});
```

* `auto_sign_in: boolean` - when `true`, automatically trigger a sign-in attempt _if_ `identifier` is included or an email address or phone number has already been set in the user data.
* `identifier: string` - an email address or phone number (in E164 format) to which a verification message may be sent. If the Rownd app is configured to allow unverified users, then sign-in will complete without verification if the user has not signed in previously.

#### signOut()

Sign out the user and clear their profile, returning them to a completely unauthenticated state.

```javascript
const { signOut } = useRownd();
signOut();
```

#### **getAccessToken()**

Retrieves the active, valid access token for the current user.&#x20;

```javascript
const { getAccessToken } = useRownd();

let accessToken = await getAccessToken({
    waitForToken: false
});
```

* `waitForToken: boolean` - when `true`, if no access token is present or if it's expired, the promise will not resolve until a valid token is available. While unlikely, this could result in waiting forever.

#### is\_authenticated

Indicates whether the current user is signed in or not.

```javascript
const { is_authenticated } = useRownd();

return (
  <>
    {is_authenticated && <ProtectedRoute />}
    {!is_authenticated && <PublicRoute />}
  </>
);
```

#### access\_token

Represents the current access token for the user.

```javascript
const { access_token } = useRownd();

useEffect(() => {
    axios({
        method: 'post',
        url: '/api/sessions'
        headers: {
            authorization: `Bearer ${access_token}`
        }
    }).then(console.log);
}, [access_token]);
```

#### user

Represents information about the current user, specifically their profile information. In the example below, we use the existing data to display the current value of `first_name` in a form field, update a local copy of that data as the user changes it, and then save the changes to Rownd once the user submits the form.

```javascript
const { user } = useRownd();

return (
    <form onSubmit={() => user.set(profile)}>
        <Text>First name</Text>
            <TextInput
                value={user?.data?.first_name}
                onChangeText={}
            />
        <Pressable onPress={}>Save</button>
    </form>
);
```

**Merge data into the user profile**

```javascript
const { user } = useRownd();
user.set({
    first_name: 'Alice',
    last_name: 'Ranier'
});
```

Set a specific field in the user profile

```javascript
const { user } = useRownd();
user.setValue('first_name', 'Alice');
```

## License

Apache 2.0
