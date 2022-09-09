#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RowndPlugin, NSObject)

RCT_EXTERN_METHOD(multiply:(float)a withB:(float)b
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setUserDataValue:(NSString *)key withValue:(id)value)
RCT_EXTERN_METHOD(setUserData:(NSDictionary<NSString *, id>)data)

RCT_EXTERN_METHOD(configure:(NSString *)appKey
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(requestSignIn)
RCT_EXTERN_METHOD(signOut)
RCT_EXTERN_METHOD(hello)

RCT_EXTERN_METHOD(manageUser)

RCT_EXTERN_METHOD(getAccessToken:
                  withResolver:(RCTPromiseResolveBlock)resolve)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
