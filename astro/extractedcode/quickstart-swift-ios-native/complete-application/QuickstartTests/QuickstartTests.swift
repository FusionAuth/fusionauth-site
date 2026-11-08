import XCTest

@MainActor
final class QuickstartTests: XCTestCase {
    private var primaryLogin = "richard@example.com"
    private var primaryWelcomeName = "Richard Hendricks"
    private var alternateLogin = "mike@example.com"
    private var alternateWelcomeName = "Mike Hendricks"

    private var app: XCUIApplication!

    override func setUp() async throws {
        continueAfterFailure = false
        await MainActor.run {
            app = XCUIApplication()
            app.launch()
        }
    }

    override func tearDown() async throws {
        await MainActor.run {
            let logoutButton = app.buttons["Log out"]
            if logoutButton.exists && logoutButton.isHittable {
                logoutButton.tap()
                confirmLoginAlert(app)
                let loginButton = app.buttons["Login"]
                XCTAssertTrue(loginButton.waitForExistence(timeout: 30), "Login button should appear after logging out")
            }
        }
    }

    private func confirmLoginAlert(_ app: XCUIApplication) {
        var alertPresent = false

        let predicate = NSPredicate { evaluatedObject, _ in
            let application = evaluatedObject as? XCUIApplication
            application?.tap()
            return alertPresent
        }

        let alertMonitor = addUIInterruptionMonitor(withDescription: "Login Alert") { alert -> Bool in
            alert.buttons["Continue"].tap()
            alertPresent = true
            return true
        }

        let expectation = XCTNSPredicateExpectation(predicate: predicate, object: app)
        wait(for: [expectation], timeout: 120)
        removeUIInterruptionMonitor(alertMonitor)
    }

    private func dismissPasswordSavePrompt(_ app: XCUIApplication) {
        var alertHandled = false

        let handledExpectation = expectation(description: "Password Save Prompt handled")
        let alertMonitor = addUIInterruptionMonitor(withDescription: "Password Save Prompt") { alert -> Bool in
            let buttons = alert.buttons
            if buttons["Don't Save"].exists {
                buttons["Don't Save"].tap()
            } else if buttons["Not Now"].exists {
                buttons["Not Now"].tap()
            } else if buttons["Never for This Website"].exists {
                buttons["Never for This Website"].tap()
            } else if buttons["Cancel"].exists {
                buttons["Cancel"].tap()
            } else {
                return false
            }
            if !alertHandled {
                alertHandled = true
                handledExpectation.fulfill()
            }
            return true
        }

        // ensure the alert monitor is cleaned up after handling the password prompt.
        defer { removeUIInterruptionMonitor(alertMonitor) }

        // Near-zero-cost path when no prompt: trigger once and wait briefly for the monitor to run.
        // app.tap()
        let safeCoord = app.coordinate(withNormalizedOffset: CGVector(dx: 0.05, dy: 0.1))
        safeCoord.tap()
        _ = XCTWaiter().wait(for: [handledExpectation], timeout: 0.5)
    }

    private func waitUntilHittable(_ element: XCUIElement, timeout: TimeInterval) -> Bool {
        let predicate = NSPredicate(format: "exists == true AND hittable == true")
        let exp = XCTNSPredicateExpectation(predicate: predicate, object: element)
        let result = XCTWaiter().wait(for: [exp], timeout: timeout)
        return result == .completed
    }

    private func focusTextField(_ field: XCUIElement, timeout: TimeInterval = 5) {
        let deadline = Date().addingTimeInterval(timeout)
        var lastError: String?

        while Date() < deadline {
            if field.exists && field.isHittable {
                field.tap()
                // Give the UI a moment to react after the tap.
                RunLoop.current.run(until: Date().addingTimeInterval(0.15))
                if field.hasFocus {
                    return
                }
                lastError = "Tapped but field did not gain focus."
            } else {
                lastError = "Field not hittable."
            }
            // Small backoff to let overlays/animations settle.
            RunLoop.current.run(until: Date().addingTimeInterval(0.2))
        }

        XCTFail("Failed to focus text field within \(timeout)s. Last state: \(lastError ?? "unknown")")
    }

    @MainActor
    func testExample() throws {
        // Login first
        try loginToApp(login: primaryLogin, welcomeName: primaryWelcomeName)

        // Check that Log out button is displayed
        let logoutButton = app.buttons["Log out"]
        XCTAssertTrue(logoutButton.exists)
        logoutButton.tap()

        confirmLoginAlert(app)

        let loginButton = app.buttons["Login"]
        XCTAssertTrue(loginButton.waitForExistence(timeout: 60))
    }

    @MainActor
    func testConfigurationResetButtonExists() throws {
        // Login first
        try loginToApp(login: primaryLogin, welcomeName: primaryWelcomeName)

        // Navigate to Home tab
        let homeTab = app.tabBars.buttons["Home"]
        XCTAssertTrue(homeTab.exists)
        homeTab.tap()

        // Check that Reset Configuration button exists
        let resetButton = app.buttons["Reset Configuration"]
        XCTAssertTrue(resetButton.exists, "Reset Configuration button should be visible after login")
    }

    @MainActor
    func testConfigurationResetAlertPresentation() throws {
        // Login first
        try loginToApp(login: primaryLogin, welcomeName: primaryWelcomeName)

        // Navigate to Home tab
        let homeTab = app.tabBars.buttons["Home"]
        homeTab.tap()

        // Tap Reset Configuration button
        let resetButton = app.buttons["Reset Configuration"]
        resetButton.tap()

        // Wait for alert and verify it has the expected options
        let alert = app.alerts.element
        XCTAssertTrue(alert.exists, "Configuration reset alert should appear")

        // Check for expected buttons in alert
        let switchAlternativeButton = alert.buttons["Switch to Alternative Tenant"]
        let switchPrimaryButton = alert.buttons["Switch to Primary Tenant"]
        let cancelButton = alert.buttons["Cancel"]

        XCTAssertTrue(switchAlternativeButton.exists, "Should have 'Switch to Alternative Tenant' button")
        XCTAssertTrue(switchPrimaryButton.exists, "Should have 'Switch to Primary Tenant' button")
        XCTAssertTrue(cancelButton.exists, "Should have 'Cancel' button")

        // Cancel the alert
        cancelButton.tap()

        // Verify alert is dismissed
        XCTAssertFalse(alert.exists, "Alert should be dismissed after canceling")
    }

    @MainActor
    func testConfigurationDisplayExists() throws {
        // Login first
        try loginToApp(login: primaryLogin, welcomeName: primaryWelcomeName)

        // Navigate to Home tab
        let homeTab = app.tabBars.buttons["Home"]
        homeTab.tap()

        // Check that configuration display text exists
        let configurationLabel = app.staticTexts.matching(NSPredicate(format: "label CONTAINS 'Active Configuration'")).firstMatch
        XCTAssertTrue(configurationLabel.exists, "Active Configuration label should be displayed")
    }

    @MainActor
    func testConfigurationIndicatorInHeader() throws {
        // Login first
        try loginToApp(login: primaryLogin, welcomeName: primaryWelcomeName)

        // Check that the configuration indicator exists in the header
        let configIndicator = app.staticTexts.matching(NSPredicate(format: "label CONTAINS 'Tenant:'")).firstMatch
        XCTAssertTrue(configIndicator.exists, "Configuration indicator should show tenant in header")
    }

    @MainActor
    func testAlertCancellationDoesNotChangeConfig() throws {
        // Login first
        try loginToApp(login: primaryLogin, welcomeName: primaryWelcomeName)

        // Navigate to Home tab
        let homeTab = app.tabBars.buttons["Home"]
        homeTab.tap()

        // Get the initial configuration text
        let configIndicators = app.staticTexts.matching(NSPredicate(format: "label CONTAINS 'Tenant:'"))
        XCTAssertTrue(configIndicators.count > 0, "Should have at least one configuration indicator")
        let initialConfigText = configIndicators.firstMatch.label

        // Tap Reset Configuration button
        let resetButton = app.buttons["Reset Configuration"]
        resetButton.tap()

        // Cancel the alert
        let alert = app.alerts.element
        let cancelButton = alert.buttons["Cancel"]
        cancelButton.tap()

        // Verify configuration hasn't changed
        let finalConfigIndicators = app.staticTexts.matching(NSPredicate(format: "label CONTAINS 'Tenant:'"))
        XCTAssertTrue(finalConfigIndicators.count > 0)
        let finalConfigText = finalConfigIndicators.firstMatch.label

        XCTAssertEqual(initialConfigText, finalConfigText, "Configuration should not change when alert is canceled")
    }

    // MARK: - New End to End Test

    @MainActor
    func testSwitchToAlternateConfigAndLogin() throws {
        // Login first
        try loginToApp(login: primaryLogin, welcomeName: primaryWelcomeName)

        // Navigate to Home tab
        let homeTab = app.tabBars.buttons["Home"]
        homeTab.tap()

        // Tap "Reset Configuration"
        let resetButton = app.buttons["Reset Configuration"]
        XCTAssertTrue(waitUntilHittable(resetButton, timeout: 15), "Reset Configuration button should be hittable")
        resetButton.tap()

        // Tap "Switch to Alternative Tenant" in alert
        let alert = app.alerts.element
        XCTAssertTrue(alert.waitForExistence(timeout: 10), "Configuration reset alert should appear")
        let switchAlternativeButton = alert.buttons["Switch to Alternative Tenant"]
        XCTAssertTrue(switchAlternativeButton.exists, "Should have 'Switch to Alternative Tenant' button")
        switchAlternativeButton.tap()

        var loginButton = app.buttons["Login"]
        XCTAssertTrue(loginButton.waitForExistence(timeout: 60))

        // Proceed to Login to the alternate tenant
        try loginToApp(login: alternateLogin, welcomeName: alternateWelcomeName)

        // Check that Log out button is displayed
        let logoutButton = app.buttons["Log out"]
        XCTAssertTrue(logoutButton.exists)
        logoutButton.tap()

        confirmLoginAlert(app)

        // Proceed to Login to the primary tenant
        loginButton = app.buttons["Login"]
        XCTAssertTrue(loginButton.waitForExistence(timeout: 60))
        loginButton.tap()

        confirmLoginAlert(app)
    }

    /// Tests that passing `prompt=login` to the OAuth authorize call forces the
    /// FusionAuth login page to be shown and that authentication still completes
    /// successfully.  The app is relaunched with the `--prompt-parameter login`
    /// launch argument so that `LoginView` picks it up and forwards it via
    /// `OAuthAuthorizeOptions(prompt:)`.
    @MainActor
    func testLoginWithPromptLogin() throws {
        // Relaunch the app with the prompt=login launch argument.
        app.terminate()
        app.launchArguments = ["--prompt-parameter", "login"]
        app.launch()

        // Verify that the login flow completes successfully even when prompt=login
        // is forwarded – FusionAuth should display the login form and accept credentials.
        try loginToApp(login: primaryLogin, welcomeName: primaryWelcomeName)

        // Confirm the authenticated state is reached.
        let logoutButton = app.buttons["Log out"]
        XCTAssertTrue(logoutButton.exists, "Log out button should appear after successful login with prompt=login")
        logoutButton.tap()

        confirmLoginAlert(app)

        let loginButton = app.buttons["Login"]
        XCTAssertTrue(loginButton.waitForExistence(timeout: 60), "Login button should reappear after logging out")
    }

    /// Tests that passing `prompt=none` to the OAuth authorize call fails when
    /// the user is not already authenticated.
    ///
    /// FusionAuth responds with the login screen when there is no active session.
    @MainActor
    func testLoginWithPromptNoneFailsWhenUnauthenticated() throws {
        // Relaunch the app fresh (no existing session) with prompt=none.
        app.terminate()
        app.launchArguments = ["--prompt-parameter", "none"]
        app.launch()

        // Confirm the Login button is present before attempting.
        let loginButton = app.buttons["Login"]
        XCTAssertTrue(loginButton.waitForExistence(timeout: 30), "Login button should be present before attempting login")
        loginButton.tap()

        // The system will present a SFSafariViewController/ASWebAuthenticationSession
        // confirmation sheet – dismiss it to let the authorization request proceed.
        confirmLoginAlert(app)

        // Verify the user is still on the Login screen.
        XCTAssertTrue(
            loginButton.waitForExistence(timeout: 10),
            "Login button should still be visible – user must not be authenticated after a prompt=none failure"
        )
    }

    // MARK: - Helper Methods

    private func loginToApp(login: String, welcomeName: String) throws {
        let loginButton = app.buttons["Login"]
        XCTAssertTrue(loginButton.exists)
        loginButton.tap()

        confirmLoginAlert(app)

        // Match Login field with any of these identifiers
        let loginField = app.textFields.matching(
            NSPredicate(format: "placeholderValue IN %@", ["Login", "Email"])
        ).firstMatch

        let passwordField = app.secureTextFields["Password"]
        let submitButton = app.buttons["Submit"]

        XCTAssertTrue(loginField.waitForExistence(timeout: 60))
        XCTAssertTrue(waitUntilHittable(loginField, timeout: 60))

        XCTAssertTrue(passwordField.waitForExistence(timeout: 60))
        XCTAssertTrue(waitUntilHittable(passwordField, timeout: 60))

        focusTextField(loginField)
        loginField.typeText(login)

        focusTextField(passwordField)
        passwordField.typeText("password\n")

        // dismiss the password prompt if it appears
        if app.alerts.element.exists {
            dismissPasswordSavePrompt(app)
        }

        // Primary path: rely on Return to submit. Give the UI a brief grace period to transition.
        let welcomeText = app.staticTexts["Welcome " + welcomeName]
        let graceDeadline = Date().addingTimeInterval(4.0)
        while Date() < graceDeadline {
            if welcomeText.exists { break }
            RunLoop.current.run(until: Date().addingTimeInterval(0.15))
        }

        // Fallback: if we're clearly still on the login screen, tap Submit once.
        if !welcomeText.exists {
            let stillOnLoginScreen = loginField.exists && passwordField.exists
            if stillOnLoginScreen {
                XCTAssertTrue(waitUntilHittable(submitButton, timeout: 5))
                submitButton.tap()
            }
        }

        // Finally, ensure we reach the post-login state.
        XCTAssertTrue(welcomeText.waitForExistence(timeout: 60))
    }
}
