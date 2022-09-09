import Rownd
import SwiftUI
import Combine
import AnyCodable

@objc(RowndPlugin)
class RowndPlugin: NSObject {
    
    @ObservedObject private var state = Rownd.getInstance().state().subscribe { $0 }
    
    private var stateCancellable: AnyCancellable?
    
    override init() {
        super.init()
        
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
            await Rownd.configure(launchOptions: nil, appKey: appKey)
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
    func manageUser() -> Void {
        DispatchQueue.main.async {
            Rownd.manageUser()
        }
    }
    
    @objc(getAccessToken:withResolver:)
    func getAccessToken(resolve: @escaping RCTPromiseResolveBlock) async -> Void {
        let accessToken = await Rownd.getAccessToken()
        resolve(accessToken)
    }
    
    @objc
    func hello() -> Void {
        do {
            print(try state.current.toDictionary())
            RowndPluginEventEmitter.emitter.sendEvent(withName: "update_state", body: try state.current.toDictionary())
        } catch {
            print("Failed to encode Rownd state: \(String(describing: error))")
        }
    }
    
    @objc(setUserData:)
    func setUserData(data: Dictionary<String, Any>) -> Void {
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: data, options: .prettyPrinted)
            let decoder = JSONDecoder()
            let dictionary = try! decoder.decode([String: AnyCodable].self, from: jsonData)
            
            Rownd.user.set(data: dictionary)
        } catch {
            print("FAILED TO SET USER DATA: ",error)
        }
    }
    
    @objc(setUserDataValue:withValue:)
    func setUserDataValue(key: String, value: Any) -> Void {
        let json = """
        "\(value)"
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        let dictionary = try! decoder.decode(AnyCodable.self, from: json)
        Rownd.user.set(field: key, value: dictionary)
    }
}
