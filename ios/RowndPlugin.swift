import AnyCodable
import Combine
import Lottie
import Rownd
import SwiftUI

@objc(RowndPlugin)
class RowndPlugin: NSObject {

    private var state: ObservableState<RowndState>? = nil

    private var stateCancellable: AnyCancellable?

    override init() {
        super.init()
    }

    deinit {
        // Cancel the state subscription to prevent memory leaks
        stateCancellable?.cancel()
    }

    @objc(configure:withResolver:withRejecter:)
    func configure(
        config: NSDictionary, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock
    ) {

        if let apiUrl = config.value(forKey: "apiUrl") as? String {
            Rownd.config.apiUrl = apiUrl
        }

        if let baseUrl = config.value(forKey: "baseUrl") as? String {
            Rownd.config.baseUrl = baseUrl
        }

        if let appKey = config.value(forKey: "appKey") as? String {
            Task {
                await Rownd.configure(launchOptions: nil, appKey: appKey)
            }
            resolve(appKey)
            
            // Initialize state and sink after Rownd is configured.
            // Note: Subsequent calls to configure() will not reinitialize the state subscription
            // if it has already been initialized. This is intentional to prevent duplicate subscriptions.
            if self.state == nil {
                let initializedState = Rownd.getInstance().state().subscribe { $0 }
                self.state = initializedState
                self.stateCancellable = initializedState.$current.sink { newState in
                    do {
                        RowndPluginEventEmitter.emitter.sendEvent(
                            withName: "update_state", body: try newState.toDictionary())
                    } catch {
                        print("Failed to encode Rownd state: \(String(describing: error))")
                    }
                }
            }
        }
    }

    @objc(customizations:)
    func customizations(customizations: NSDictionary) {
        let appCustomizations = AppCustomizations()

        if let sheetBackgroundColor = customizations.value(forKey: "sheetBackgroundHexColor")
            as? String
        {
            appCustomizations.reactNativeSheetBackgroundColor = colorWithHexString(
                hexString: sheetBackgroundColor)
        }

        if let sheetCornerBorderRadius = customizations.value(forKey: "sheetCornerBorderRadius")
            as? String
        {
            if let doubleValue = Double(sheetCornerBorderRadius) {
                appCustomizations.sheetCornerBorderRadius = CGFloat(doubleValue)
            }
        }

        if let loadingAnimation = customizations.value(forKey: "loadingAnimation") as? String {
            let json = loadingAnimation.data(using: .utf8)!
            do {
                let decoder = JSONDecoder()
                let animation = try decoder.decode(LottieAnimation.self, from: json)
                appCustomizations.loadingAnimation = animation
            } catch {
                print("Failed to encode Loading Animation: \(error)")
            }
        }

        Rownd.config.customizations = appCustomizations
    }

    @objc(requestSignIn:)
    func requestSignIn(signInConfig: NSDictionary) {

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

        func requestSignInHub() {
            DispatchQueue.main.async {
                Rownd.requestSignIn(rowndSignInOptions)
            }
        }
        if let method = signInConfig.value(forKey: "method") as? String {
            switch method {
            case "apple":
                DispatchQueue.main.async {
                    Rownd.requestSignIn(
                        with: RowndSignInHint.appleId, signInOptions: rowndSignInOptions)
                }
            case "google":
                DispatchQueue.main.async {
                    Rownd.requestSignIn(
                        with: RowndSignInHint.googleId, signInOptions: rowndSignInOptions)
                }
            case "guest":
                DispatchQueue.main.async {
                    Rownd.requestSignIn(
                        with: RowndSignInHint.guest, signInOptions: rowndSignInOptions)
                }
            case "passkey":
                DispatchQueue.main.async {
                    Rownd.requestSignIn(
                        with: RowndSignInHint.passkey, signInOptions: rowndSignInOptions)
                }
            default:
                requestSignInHub()
            }
        } else {
            requestSignInHub()
        }
    }

    @objc
    func signOut() {
        DispatchQueue.main.async {
            Rownd.signOut()
        }
    }

    @objc
    func manageAccount() {
        DispatchQueue.main.async {
            Rownd.manageAccount()
        }
    }

    @objc(getAccessToken:withResolver:withRejecter:)
    func getAccessToken(
        token: String?, resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
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
                reject("Error", "\(error)", error)
            }
        }
    }

    @objc(getFirebaseIdToken:withRejecter:)
    func getFirebaseIdToken(
        resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock
    ) {
        Task {
            do {
                let idToken = try await Rownd.firebase.getIdToken()
                resolve(idToken)
            } catch {
                reject("Error", "\(error)", error)
            }
        }
    }

    @objc(setUserData:)
    func setUserData(data: [String: Any]) {
        do {
            // Convert to JSON and back to get proper types
            let jsonData = try JSONSerialization.data(withJSONObject: data, options: [])
            let jsonObject = try JSONSerialization.jsonObject(with: jsonData, options: [])

            // Try to cast to the expected type
            if let dictionary = jsonObject as? [String: Any] {
                // Convert each value to AnyCodable and set individually
                for (key, value) in dictionary {
                    Rownd.user.set(field: key, value: AnyCodable(value))
                }
            }
        } catch {
            print("FAILED TO SET USER DATA: ", error)
        }
    }

    @objc(setUserDataValue:withValue:)
    func setUserDataValue(key: String, value: Any) {
        // Convert value to AnyCodable
        Rownd.user.set(field: key, value: AnyCodable(value))
    }

    @objc(handleSignInLink:)
    func handleSignInLink(url: String) {
        Rownd.handleSmartLink(url: URL(string: url))
    }
}
