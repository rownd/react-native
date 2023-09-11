#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RowndPlugin, NSObject)


RCT_EXTERN_METHOD(setUserDataValue:(NSString *)key withValue:(id)value)
RCT_EXTERN_METHOD(setUserData:(NSDictionary<NSString *, id>)data)

RCT_EXTERN_METHOD(configure:(NSDictionary *)config
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(requestSignIn:(NSDictionary *)signInConfig)

RCT_EXTERN_METHOD(customizations:(NSDictionary *)customizations)

RCT_EXTERN_METHOD(signOut)

RCT_EXTERN_METHOD(manageAccount)

RCT_EXTERN_METHOD(getAccessToken:(NSString *)token
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getFirebaseIdToken:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(handleSignInLink:(NSString *)url)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
