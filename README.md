# @rownd/react-native

Rownd bindings for React Native

## Prerequisites

You must be using React Native v0.61 or higher.

## Installation

First, install the Rownd SDK for React Native.

```sh
npm install @rownd/react-native
```

### Expo development

1. Add `@rownd/react-native` as a plugin to your `app.json` file.

```json
{
  "expo": {
    "plugins": ["@rownd/react-native"]
  }
}
```

2. Install [Expo BuildProperties](https://docs.expo.dev/versions/latest/sdk/build-properties/) to set iOS/Android versions

```sh
npx expo install expo-build-properties
```

3. Add `expo-build-properties` as a plugin to your `app.json` file. Ensure the Sdk versions match or are above provided iOS/Android versions.

```json
{
  "expo": {
    "plugins": [
      "@rownd/react-native",
      [
        "expo-build-properties",
        {
          "android": {
            "minSdkVersion": 26
          },
          "ios": {
            "deploymentTarget": "14.0"
          }
        }
      ]
    ]
  }
}
```

4. (optional) Enable Apple sign-in for iOS in your `app.json` file.

```json
{
  "expo": {
    "ios": {
      "usesAppleSignIn": true
    }
  }
}
```

5. (optional) Enable Google sign-in for iOS. Add your Google IOS Client ID client as a URL Scheme in your `app.json` file.

```json
{
  "expo": {
    ios: {
      "infoPlist": {
        "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": [
              "com.googleusercontent.apps.xxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxx"
            ]
          }
        ]
      }
    }
  }
}
```

### Android

1. Ensure the Sdk versions match or are above provided versions. File: _android/build.gradle_

```
ext {
  ...
  minSdkVersion = 26
  compileSdkVersion = 33
  targetSdkVersion = 31
  ...
}
```

2. Install the Rownd library and dependencies.

```sh
cd android && ./gradlew build
```

3. Check and update your ProGuard config using [the rules from our Android SDK](https://github.com/rownd/android/blob/main/README.md#proguard-config).

4. Only required for Google Sign-in: Add a Rownd plugin initializer to your MainActivity file. File: \*android/app/src/main/java/.../MainActivity.java

```
import android.os.Bundle;
import com.reactnativerowndplugin.RowndPluginPackage;

public class MainActivity extends ReactActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    RowndPluginPackage.preInit(this);
  }
}
```

### iOS

1. Ensure iOS version is at least 14. File: _ios/Podfile_

```
platform :ios, '14.0'
```

2. Install the Rownd pod and it's dependencies

```sh
cd ios && pod install
```

## Setup

### Enable deep linking

Rownd supports automatically signing-in users when they initially install your
app or when they click a sign-in link when the app is already installed.

## Usage

The Rownd SDK includes a context provider that will enable any component of your app to access authentication state and user data.

Before you can use the SDK, you'll need to obtain an App Key from the [Rownd Dashboard](https://app.rownd.io).

```tsx
import { RowndProvider } from '@rownd/react-native';

// ...

export default function Root() {
  return (
    <RowndProvider config={{ appKey: '<your app key>' }}>
      <App />
    </RowndProvider>
  );
}
```

Later on within your app's components, you can use the Rownd hook to access the Rownd browser API:

```tsx
import { View, Text, Pressable } from 'react-native';
import { useRownd } from '@rownd/react-native';

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
          <Text>Welcome {user.data.first_name}</Text>
          <Pressable onClick={() => getAccessToken()}>
            <Text>Get access token</Text>
          </Pressable>
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

### Customizing the UI

Customizing the UI
While most customizations are handled via the [Rownd dashboard](https://app.rownd.io), there are a few things that have to be customized directly in the SDK.

The `customization` prop for `RowndProvider` allows specific customizations to be set:

- `sheetBackgroundHexColor: string` (Hex color) Allows changing the background color underlaying the bottom sheet that appears when signing in, managing the user account, transferring encryption keys, etc.
- `loadingAnimation: string` (JSON animation) Replace Rownd's use of the system default loading spinner with a custom animation. Any animation compatible with [Lottie](https://airbnb.design/lottie/) should work, but will be scaled to fit a 1:1 aspect ratio.
- `sheetCornerBorderRadius: string` (Number) Modifies the curvature radius of the bottom sheet corners.

```tsx
const loadingAnimation = require('../assets/loading.json');

export default function App() {
  return (
    <View style={styles.container}>
      <RowndProvider
        config={{ appKey: '######-####-####-####-#########' }}
        customizations={{
          sheetBackgroundHexColor: '#ffffff',
          sheetCornerBorderRadius: '20',
          loadingAnimation: JSON.stringify(loadingAnimation),
        }}
      >
        <Main />
      </RowndProvider>
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

requestSignIn();
```

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

let accessToken = await getAccessToken();
```

#### is_authenticated

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

#### access_token

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
  last_name: 'Ranier',
});
```

Set a specific field in the user profile

```javascript
const { user } = useRownd();
user.setValue('first_name', 'Alice');
```

## License

Apache 2.0
