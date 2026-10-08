import SwiftUI
import FusionAuth

struct HomeView: View {
    @EnvironmentObject private var authState: FusionAuthStateObject
    @State var userInfo: UserInfo?
    @State private var showingConfigurationAlert = false
    @State private var configurationError: String?

    var body: some View {
        if userInfo == nil {
            VStack {
                ProgressView()
                    .padding()
                Text("Retrieving user info")
            }
            .onAppear {
                getUserInfo()
            }
        } else {
            ZStack {
                VStack {
                    if userInfo?.given_name == nil || userInfo?.family_name == nil {
                        if userInfo?.email == nil {
                            Text("Welcome \(userInfo?.name ?? "") ").padding(.bottom, 20).font(.headline)
                        } else {
                            Text("Welcome \(userInfo?.email ?? "") ").padding(.bottom, 20).font(.headline)
                        }
                    } else {
                        Text("Welcome \(userInfo?.given_name ?? "") \(userInfo?.family_name ?? "")").padding(.bottom, 20).font(.headline)
                    }

                    Text("Your balance is:")
                    Text("$0.00").font(.largeTitle)

                    Divider()

                    // Action buttons
                    Button("Refresh token") {
                        Task {
                            do {
                                let accessToken = try await AuthorizationManager
                                    .oauth()
                                    .freshAccessToken()

                                guard let accessToken else {
                                    print("Access token is not returned")
                                    return
                                }

                                print("Refreshed access token: \(accessToken)")
                            } catch let error as NSError {
                                print(error)
                            }
                        }
                    }

                    Button("Reset Configuration") {
                        showingConfigurationAlert = true
                    }
                    .buttonStyle(SecondaryButtonStyle())

                    Button("Log out") {
                        Task {
                            do {
                                try await AuthorizationManager
                                    .oauth()
                                    .logout(options: OAuthLogoutOptions())

                                // on logout, switch to the primary configuration.
                                switchToPrimaryConfiguration()
                            } catch let error as NSError {
                                print(error)
                            }
                        }
                    }
                    .buttonStyle(SecondaryButtonStyle())
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .contentShape(Rectangle())
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color(.systemBackground)) // optional, for visibility
            .alert("Reset Configuration", isPresented: $showingConfigurationAlert) {
                Button("Switch to Alternative Tenant", action: switchToAlternativeConfiguration)
                Button("Switch to Primary Tenant", action: switchToPrimaryConfiguration)
                Button("Cancel", role: .cancel) {  /* no-op */ }
            } message: {
                Text("Choose a configuration to switch to. This will clear your current authentication state.")
            }
            .alert("Configuration Error", isPresented: Binding<Bool>(
                get: { configurationError != nil },
                set: { newValue in if !newValue { configurationError = nil } }
            )) {
                Button("OK") { configurationError = nil }
            } message: {
                Text(configurationError ?? "Unknown error")
            }
        }
    }

    func getUserInfo() {
        Task {
            do {
                self.userInfo = try await AuthorizationManager
                    .oauth()
                    .userInfo()
            } catch let error as NSError {
                print("JSON decode failed: \(error.localizedDescription)")

                // Attempt to log the user out
                do {
                    try await AuthorizationManager
                        .oauth()
                        .logout(options: OAuthLogoutOptions())
                } catch {
                    // If logout also fails, log it (and optionally show an alert)
                    print("Failed to log out after userInfo error: \(error.localizedDescription)")
                }
            }
        }
    }

    func switchToAlternativeConfiguration() {
        Task {
            do {
                try ConfigurationManager.switchToAlternativeConfiguration()
                authState.currentConfigurationName = "Alternative"
                // Reset user info to trigger refresh
                userInfo = nil
                getUserInfo()
            } catch let error as NSError {
                configurationError = "Failed to switch configuration: \(error.localizedDescription)"
            }
        }
    }

    func switchToPrimaryConfiguration() {
        Task {
            do {
                try ConfigurationManager.switchToPrimaryConfiguration()
                authState.currentConfigurationName = "Primary"
                // Reset user info to trigger refresh
                userInfo = nil
                getUserInfo()
            } catch let error as NSError {
                configurationError = "Failed to switch configuration: \(error.localizedDescription)"
            }
        }
    }
}
