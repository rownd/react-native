# @supertokens/rownd-react-native

Rownd bindings for React Native

## Prerequisites

You must be using React Native v0.61 or higher.

## Installation

First, install the Rownd SDK for React Native.

```sh
npm install @supertokens/rownd-react-native
```

### Expo development

1. Add `@supertokens/rownd-react-native` as a plugin to your `app.json` file.

```json
{
  "expo": {
    "plugins": ["@supertokens/rownd-react-native"]
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
      "@supertokens/rownd-react-native",
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
    "ios": {
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

Magic-link sign-in uses the native deep-link mechanism on both platforms. The
scheme configured in `RowndProvider` must match the scheme registered by your
host app.

```tsx
<RowndProvider
  config={{
    appKey: '<your app key>',
    supertokens: {
      appInfo: {
        appName: 'My App',
        apiDomain: 'https://api.example.com',
        apiBasePath: '/auth',
      },
    },
    deepLinkScheme: 'rowndsupertokens',
  }}
>
  <App />
</RowndProvider>
```

#### iOS

Register the scheme in `ios/<AppName>/Info.plist`.

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>rowndsupertokens</string>
    </array>
  </dict>
</array>
```

Forward URL opens to React Native `Linking` from your app delegate. The Rownd
provider listens for those events and passes the link to the native SDK.

Objective-C:

```objc
#import <React/RCTLinkingManager.h>

- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}
```

Swift:

```swift
import React

override func application(
  _ app: UIApplication,
  open url: URL,
  options: [UIApplication.OpenURLOptionsKey: Any] = [:]
) -> Bool {
  return RCTLinkingManager.application(app, open: url, options: options)
}
```

#### Android

Register the scheme on the activity that hosts React Native. The activity should
use `singleTask` so links opened while the app is running are delivered to the
existing activity.

```xml
<activity
  android:name=".MainActivity"
  android:exported="true"
  android:launchMode="singleTask">
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="rowndsupertokens" />
  </intent-filter>
</activity>
```

#### Expo

For Expo apps, set the same scheme in app config and use a development build or
prebuild so native URL scheme configuration is generated.

```json
{
  "expo": {
    "scheme": "rowndsupertokens"
  }
}
```

If you customize native iOS or Android files after prebuild, keep the generated
scheme aligned with `config.deepLinkScheme`.

## Usage

The Rownd SDK includes a context provider that will enable any component of your app to access authentication state and user data.

Before you can use the SDK, you'll need to obtain an App Key from the [Rownd Dashboard](https://app.rownd.io).

```tsx
import { RowndProvider } from '@supertokens/rownd-react-native';

// ...

export default function Root() {
  return (
    <RowndProvider
      config={{
        appKey: '<your app key>',
        supertokens: {
          appInfo: {
            appName: 'My App',
            apiDomain: 'https://api.example.com',
            apiBasePath: '/auth',
          },
        },
        deepLinkScheme: 'rowndsupertokens',
      }}
    >
      <App />
    </RowndProvider>
  );
}
```

Later on within your app's components, you can use the Rownd hook to access the Rownd browser API:

```tsx
import { View, Text, Pressable } from 'react-native';
import { useRownd } from '@supertokens/rownd-react-native';

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
        config={{
          appKey: '######-####-####-####-#########',
          supertokens: {
            appInfo: {
              appName: 'My App',
              apiDomain: 'https://api.example.com',
              apiBasePath: '/auth',
            },
          },
          deepLinkScheme: 'rowndsupertokens',
        }}
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
