//
//  UserAuth.swift
//  ChangeBank
//

import Foundation
import SwiftUI
import AppAuth
import UIKit


class UserAuth: ObservableObject {
    
    @Published var isLoggedIn: Bool = false
    @Published var email: String = ""
    @Published var given_name: String = ""
    @Published var family_name: String = ""
    
    private let redirectUrl: String = "\(Bundle.main.bundleIdentifier ?? ""):/oauth2redirect/ios-provider";
    private var config : OIDServiceConfiguration?
    private var authState : OIDAuthState?
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    private let authStateKey : String = "authState"
    private let suiteName : String = "com.fusionauth.changebank"
    
    init() {
        loadState()
        discoverConfiguration()
    }
    
    
    // MARK: - Login and Logout
    
    func login() {
        
        let appSettings = AppSettingsReader().loadAppSettings()
        
        
        let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene
        let presentingView = windowScene?.windows.first?.rootViewController

        // Create redirectURI from redirectURL string
        guard let redirectURI = URL(string: redirectUrl) else {
            print("Error creating URL for : \(redirectUrl)")
            return
        }
        
        // Create login request
        let request = OIDAuthorizationRequest(configuration: config!, clientId: appSettings.authCredentials.clientId, clientSecret: nil, scopes: ["openid", "profile", "email", "offline_access"],
                                        redirectURL: redirectURI, responseType: OIDResponseTypeCode, additionalParameters: nil)
        // performs authentication request
        appDelegate.currentAuthorizationFlow = OIDAuthState.authState(byPresenting: request, presenting: presentingView!) { (authState, error) in
            if let authState = authState {
                self.setAuthState(state: authState)
                self.saveState()
                self.fetchUserInfo()
            } else {
                print("Authorization error: \(error?.localizedDescription ?? "DEFAULT_ERROR")")
            }
        }
    }
    
    func logout() {
        let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene
        let presentingView = windowScene?.windows.first?.rootViewController

        // Create redirectURI from redirectURL string
        guard let redirectURI = URL(string: redirectUrl) else {
            print("Error creating URL for : \(redirectUrl)")
            return
        }
        
        guard let idToken = authState?.lastTokenResponse?.idToken else { return }
        
        // Create logout request
        let request = OIDEndSessionRequest(configuration: config!, idTokenHint: idToken, postLogoutRedirectURL: redirectURI, additionalParameters: nil)

        guard let userAgent = OIDExternalUserAgentIOS(presenting: presentingView!) else { return }

        // performs logout request
        appDelegate.currentAuthorizationFlow = OIDAuthorizationService.present(request, externalUserAgent: userAgent, callback: { (_, error) in
            self.setAuthState(state: nil)
            self.saveState()
            self.email = "-"
            self.given_name = "-"
            self.family_name = "-"
        })
    }
    
    
    // MARK: - Loading & Saving State
    func loadState() {
        guard let data = UserDefaults(suiteName: suiteName)?.object(forKey: authStateKey) as? Data else {
            return
        }
        do {
            let authState = try NSKeyedUnarchiver.unarchivedObject(ofClasses: [OIDAuthState.self], from: data) as? OIDAuthState
            self.setAuthState(state: authState)
            // Fetch user info if user authenticated
            fetchUserInfo()
       } catch {
           self.setAuthState(state: nil)
           print(error)
       }
   }
    
    // Save user state to local
    func saveState() {
        guard let data = try? NSKeyedArchiver.archivedData(withRootObject: authState as Any, requiringSecureCoding: true) else {
            return
        }
        
        if let userDefaults = UserDefaults(suiteName: suiteName) {
            userDefaults.set(data, forKey: authStateKey)
            userDefaults.synchronize()
        }
    }
    
    // Set user auth state
    func setAuthState(state: OIDAuthState?) {
        if (authState == state) {
            return;
        }
        authState = state;
        isLoggedIn = state?.isAuthorized == true
    }
    
    
    // MARK: Get OIDC info
    
    func discoverConfiguration() {
        
        let appSettings = AppSettingsReader().loadAppSettings()
        guard let issuerUrl = URL(string: appSettings.authCredentials.issuer) else {
            print("Error creating URL for : \(appSettings.authCredentials.issuer)")
           return
        }
        // Get auth server endpoints
        OIDAuthorizationService.discoverConfiguration(forIssuer: issuerUrl) { configuration, error in
            if(error != nil) {
                print("Error: \(error?.localizedDescription ?? "DEFAULT_ERROR")")
            } else {
                self.config = configuration
            }
        }
    }
    
    func fetchUserInfo() {
        guard let userinfoEndpoint = authState?.lastAuthorizationResponse.request.configuration.discoveryDocument?.userinfoEndpoint else {
            print("Userinfo endpoint not declared in discovery document")
            return
        }

       print("Performing userinfo request")

        let currentAccessToken: String? = authState?.lastTokenResponse?.accessToken

        authState?.performAction() { (accessToken, idToken, error) in

            if error != nil  {
                print("Error fetching fresh tokens: \(error?.localizedDescription ?? "ERROR")")
                return
            }
            guard let accessToken = accessToken else {
                print("Error getting accessToken")
                return
            }
            if currentAccessToken != accessToken {
                print("Access token was refreshed automatically (\(currentAccessToken ?? "CURRENT_ACCESS_TOKEN") to \(accessToken))")
            } else {
                print("Access token was fresh and not updated \(accessToken)")
            }

            var urlRequest = URLRequest(url: userinfoEndpoint)
            urlRequest.allHTTPHeaderFields = ["Authorization":"Bearer \(accessToken)"]

            let task = URLSession.shared.dataTask(with: urlRequest) { data, response, error in

                DispatchQueue.main.async {
                    guard error == nil else {
                        print("HTTP request failed \(error?.localizedDescription ?? "ERROR")")
                        return
                    }
                    guard let response = response as? HTTPURLResponse else {
                        print("Non-HTTP response")
                        return
                    }
                    guard let data = data else {
                        print("HTTP response data is empty")
                        return
                    }

                    var json: [AnyHashable: Any]?

                    do {
                        json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any]
                    } catch {
                        print("JSON Serialization Error")
                    }

                    if response.statusCode != 200 {
                        let responseText: String? = String(data: data, encoding: String.Encoding.utf8)

                        if response.statusCode == 401 {
                            let oauthError = OIDErrorUtilities.resourceServerAuthorizationError(withCode: 0, errorResponse: json, underlyingError: error)
                            self.authState?.update(withAuthorizationError: oauthError)
                            print("Authorization Error (\(oauthError)). Response: \(responseText ?? "RESPONSE_TEXT")")
                        } else {
                            print("HTTP: \(response.statusCode), Response: \(responseText ?? "RESPONSE_TEXT")")
                        }
                        return
                    }
                    // Create profile info string
                    if let json = json {
                        self.email = json["email"] as! String
                        self.given_name = json["given_name"] as! String
                        self.family_name = json["family_name"] as! String
                    }
                }
            }
            task.resume()
        }
    }
}
