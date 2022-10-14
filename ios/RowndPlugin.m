#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RowndPlugin, NSObject)


RCT_EXTERN_METHOD(setUserDataValue:(NSString *)key withValue:(id)value)
RCT_EXTERN_METHOD(setUserData:(NSDictionary<NSString *, id>)data)

RCT_EXTERN_METHOD(configure:(NSString *)appKey
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(requestSignIn)

RCT_EXTERN_METHOD(requestSignInApple)

RCT_EXTERN_METHOD(requestSignInGoogle)

RCT_EXTERN_METHOD(signOut)

RCT_EXTERN_METHOD(manageAccount)

RCT_EXTERN_METHOD(getAccessToken:
                  withResolver:(RCTPromiseResolveBlock)resolve)

RCT_EXTERN_METHOD(handleSignInLink:(NSString *)url)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
