import Foundation
import FusionAuth

/// ConfigurationManager provides alternative configurations for testing tenant switching functionality.
/// This demonstrates how the SDK supports multiple FusionAuth instances and tenants at runtime.
@MainActor
class ConfigurationManager {
    /// The primary configuration loaded from FusionAuth.plist
    static let primaryConfiguration = AuthorizationConfiguration(
        clientId: "e9fdb985-9173-4e01-9d73-ac2d60d1dc8e",
        fusionAuthUrl: "http://localhost:9011",
        tenant: "d7d09513-a3f5-401c-9685-34ab6c552453",
        additionalScopes: ["profile", "email"]
    )

    /// An alternative configuration for demonstrating tenant switching.
    /// In a real app, this would represent a different tenant or FusionAuth instance.
    static let alternativeConfiguration = AuthorizationConfiguration(
        clientId: "2d491002-1b1b-4a59-be2a-1d570c834c7a",
        fusionAuthUrl: "http://localhost:9011",
        tenant: "a3138f90-16b5-444f-b5f6-0ca64bc30ca7", // Different tenant ID
        additionalScopes: ["profile", "email"]
    )

    /// Switches to the alternative configuration
    /// This demonstrates the updateConfiguration() functionality for tenant switching
    static func switchToAlternativeConfiguration() throws {
        try AuthorizationManager.instance.resetConfiguration(
            configuration: alternativeConfiguration,
            storage: KeyChainStorage()
        )
    }

    /// Switches back to the primary configuration
    static func switchToPrimaryConfiguration() throws {
        try AuthorizationManager.instance.resetConfiguration(
            configuration: primaryConfiguration,
            storage: KeyChainStorage()
        )
    }

    /// Gets a description of the current configuration
    static func getCurrentConfigurationDescription() -> String {
        if let currentConfig = AuthorizationManager.instance.getConfiguration() {
            if let tenant = currentConfig.tenant {
                return "Tenant: \(tenant)"
            }
            return "Primary Instance"
        }
        return "Not configured"
    }
}
