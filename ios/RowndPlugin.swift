import Rownd
import SwiftUI
import Combine

@objc(RowndPlugin)
class RowndPlugin: NSObject {
    
    @ObservedObject private var state = Rownd.getInstance().state().subscribe { $0 }
    
    private var stateCancellable: AnyCancellable?
    
    override init() {
        super.init()
        
        state.$current.sink { newState in
            do {
                RowndPluginEventEmitter.emitter.sendEvent(withName: "update_state", body: try newState.toDictionary())
            } catch {
                print("Failed to encode Rownd state: \(String(describing: error))")
            }
        }
        
        stateCancellable = state.$current.sink { newState in
            do {
                RowndPluginEventEmitter.emitter.sendEvent(withName: "update_state", body: try newState.toDictionary())
            } catch {
                print("Failed to encode Rownd state: \(String(describing: error))")
            }
        }
    }

    @objc(multiply:withB:withResolver:withRejecter:)
        func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
            resolve(a*b)
    }
    
    @objc(configure:withResolver:withRejecter:)
    func configure(appKey: String, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        Task.init {
            let value = await Rownd.configure(launchOptions: nil, appKey: "b9cba8b0-4285-42fd-81ac-8afbe95cb8c5")
            print(value)
        }
        resolve(appKey)
    }
    
    @objc
    func requestSignIn() -> Void {
        DispatchQueue.main.async {
            Rownd.requestSignIn()
        }
    }
    
    @objc
    func signOut() -> Void {
        DispatchQueue.main.async {
            Rownd.signOut()
        }
    }
    
    @objc
    func hello() -> Void {
        do {
            RowndPluginEventEmitter.emitter.sendEvent(withName: "update_state", body: try state.current.toDictionary())
        } catch {
            print("Failed to encode Rownd state: \(String(describing: error))")
        }
    }
}
