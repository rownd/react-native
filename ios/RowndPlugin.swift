import Rownd
import SwiftUI
import Combine
import AnyCodable
import Lottie

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

    @objc(configure:withResolver:withRejecter:)
    func configure(config: NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        
        if let apiUrl = config.value(forKey: "apiUrl") as? String {
            Rownd.config.apiUrl = apiUrl
        }
        
        if let baseUrl = config.value(forKey: "baseUrl") as? String {
            Rownd.config.baseUrl = baseUrl
        }
        
        if let appKey = config.value(forKey: "appKey") as? String {
            Task {
                await Rownd.configure(launchOptions: nil, appKey: appKey);
            }
            resolve(appKey)
        }
    }

    @objc(customizations:)
    func customizations(customizations: NSDictionary) -> Void {
        let appCustomizations = AppCustomizations()

        if let sheetBackgroundColor = customizations.value(forKey: "sheetBackgroundHexColor") as? String {
            appCustomizations.reactNativeSheetBackgroundColor = colorWithHexString(hexString: sheetBackgroundColor)
        }

        if let sheetCornerBorderRadius = customizations.value(forKey: "sheetCornerBorderRadius") as? String {
            if let doubleValue = Double(sheetCornerBorderRadius) {
                appCustomizations.sheetCornerBorderRadius = CGFloat(doubleValue)
            }
        }

        if let loadingAnimation = customizations.value(forKey: "loadingAnimation") as? String {
            let json = loadingAnimation.data(using: .utf8)!
            do {
                let decoder = JSONDecoder()
                let animation = try decoder.decode(Lottie.Animation.self, from: json)
                appCustomizations.loadingAnimation = animation
            } catch {
                print("Failed to encode Loading Animation: \(error)")
            }
        }

        Rownd.config.customizations = appCustomizations
    }

    @objc(requestSignIn:)
    func requestSignIn(signInConfig: NSDictionary) -> Void {
        
        var rowndSignInOptions = RowndSignInOptions()
        
        if let postSignInRedirect = signInConfig.value(forKey: "postSignInRedirect") as? String {
            rowndSignInOptions.postSignInRedirect = postSignInRedirect
        }
        
        if let intentString = signInConfig.value(forKey: "intent") as? String {
            if let intent = RowndSignInIntent(rawValue: intentString) {
                rowndSignInOptions.intent = intent
            } else {
                print("Rownd plugin. An incorrect intent type was used: \(intentString)")
            }
        }
        

        func requestSignInHub() -> Void {
            DispatchQueue.main.async {
                Rownd.requestSignIn(rowndSignInOptions)
            }
        }
        if let method = signInConfig.value(forKey: "method") as? String {
            switch method {
            case "apple":
                DispatchQueue.main.async {
                    Rownd.requestSignIn(with: RowndSignInHint.appleId, signInOptions: rowndSignInOptions)
                }
            case "google":
                DispatchQueue.main.async {
                    Rownd.requestSignIn(with: RowndSignInHint.googleId, signInOptions: rowndSignInOptions)
                }
            case "guest":
                DispatchQueue.main.async {
                    Rownd.requestSignIn(with: RowndSignInHint.guest, signInOptions: rowndSignInOptions)
                }
            case "passkey":
                DispatchQueue.main.async {
                    Rownd.requestSignIn(with: RowndSignInHint.passkey, signInOptions: rowndSignInOptions)
                }
            default:
                requestSignInHub()
            }
        } else {
            requestSignInHub()
        }
    }

    @objc
    func signOut() -> Void {
        DispatchQueue.main.async {
            Rownd.signOut()
        }
    }

    @objc
    func manageAccount() -> Void {
        DispatchQueue.main.async {
            Rownd.manageAccount()
        }
    }

    @objc(getAccessToken:withResolver:withRejecter:)
    func getAccessToken(token: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        Task {
            do {
              var accessToken: String?
                if let token = token {
                    accessToken = try await Rownd.getAccessToken(token: token)
                } else {
                    accessToken = try await Rownd.getAccessToken()
                }
                resolve(accessToken ?? "")
            } catch {
                reject("Error","\(error)",error)
            }
        }
    }
    
    @objc(getFirebaseIdToken:withRejecter:)
    func getFirebaseIdToken(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        Task {
            do {
                let idToken = try await Rownd.firebase.getIdToken()
                resolve(idToken)
            } catch {
                reject("Error","\(error)",error)
            }
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

    @objc(handleSignInLink:)
    func handleSignInLink(url: String) -> Void {
        Rownd.handleSignInLink(url: URL(string: url))
    }
}
