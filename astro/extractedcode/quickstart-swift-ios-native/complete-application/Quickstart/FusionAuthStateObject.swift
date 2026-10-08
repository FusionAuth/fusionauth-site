import Combine
import Foundation
import FusionAuth

/// FusionAuthStateObject is an observable object that manages the authorization state.
/// It listens for changes in the authorization state and updates its published property accordingly.
public class FusionAuthStateObject: ObservableObject {
    /// The current authorization state.
    @Published public var authState: FusionAuthState?

    /// The current active configuration name (for display purposes)
    @Published public var currentConfigurationName: String = "Primary"

    /// Initializes a new instance of FusionAuthStateObject.
    public init() {
        AuthorizationManager.instance.eventPublisher
            .sink { [weak self] authState in
                self?.authState = authState
            }
            .store(in: &cancellables)
    }

    /// Checks if the user is currently logged in.
    /// - Returns: A boolean value indicating whether the user is logged in.
    public func isLoggedIn() -> Bool {
        guard let authState = self.authState else {
            return false
        }
        return Date() < authState.accessTokenExpirationTime
    }

    /// Gets the description of the current configuration
    /// - Returns: A string describing the current configuration
    @MainActor public func getCurrentConfigurationDescription() -> String {
        return ConfigurationManager.getCurrentConfigurationDescription()
    }

    /// A set of AnyCancellable to store the Combine subscriptions.
    private var cancellables = Set<AnyCancellable>()
}
