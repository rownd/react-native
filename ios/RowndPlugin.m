#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RowndPlugin, NSObject)

RCT_EXTERN_METHOD(multiply:(float)a withB:(float)b
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(configure:(NSString *)appKey
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(requestSignIn)
RCT_EXTERN_METHOD(signOut)
RCT_EXTERN_METHOD(hello)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
