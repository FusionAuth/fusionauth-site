package io.fusionauth.sdk

import android.accessibilityservice.AccessibilityServiceInfo
import android.view.accessibility.AccessibilityWindowInfo
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.intent.Intents
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.By
import androidx.test.uiautomator.UiDevice
import androidx.test.uiautomator.Until
import io.fusionauth.mobilesdk.AuthorizationManager
import kotlinx.coroutines.runBlocking
import org.hamcrest.Matchers.not
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import java.util.logging.Logger

/**
 * This class represents a full end-to-end test for the application.
 * It performs a series of UI actions and checks for certain conditions to verify the functionality of the application.
 *
 * @property loginActivityRule The rule used to launch the LoginActivity before each test.
 * @property repeatRule The rule used to repeat the test multiple times.
 */
@RunWith(AndroidJUnit4::class)
internal class FullEnd2EndTest {
    @get:Rule
    val loginActivityRule = ActivityScenarioRule(LoginActivity::class.java)

    @get:Rule
    val repeatRule = RepeatRule()

    private lateinit var device: UiDevice

    @Before
    fun setUp() {
        logger.info("Setting up test")
        Intents.init()
        device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())

        val automation = InstrumentationRegistry.getInstrumentation().uiAutomation
        val info = automation.serviceInfo
        info.flags = info.flags or AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS
        automation.serviceInfo = info
    }

    @Test
    @Repeat(2)
    fun e2eTest() {
        login(USERNAME, PASSWORD)
        performAndVerifyTokenRefresh()
        logout()
        login(USERNAME2, PASSWORD2)
        logout()
    }

    @Test
    fun e2eTestWithPromptLogin() {
        loginWithPrompt(USERNAME, PASSWORD, "login")
        logout()
    }

    @Test
    fun e2eTestWithPromptNone() {
        loginActivityRule.scenario.onActivity { activity ->
            activity.startAuth("none")
        }

        // Now assert error UI is present
        verifyAuthorizationError()
    }

    @Test
    fun e2eTestSwitchFromPrimaryToAlternative() {
        login(USERNAME, PASSWORD)
        switchToAlternative()
        login(USERNAME_RESET_CONFIGURATION, PASSWORD_RESET_CONFIGURATION)
        logout()
        loginSessionExists(USERNAME)
        logout()
    }

    @Test
    fun e2eTestSwitchFromAlternativeToPrimary() {
        login(USERNAME, PASSWORD)
        switchToAlternative()
        login(USERNAME_RESET_CONFIGURATION, PASSWORD_RESET_CONFIGURATION)
        switchToPrimary()
        loginSessionExists(USERNAME)
        switchToAlternative()
        loginSessionExists(USERNAME_RESET_CONFIGURATION)
        logout()
        loginSessionExists(USERNAME)
        logout()
    }

    @Test
    fun e2eTestCancelConfigurationSwitch() {
        login(USERNAME, PASSWORD)

        val expirationTimeBefore = runBlocking { AuthorizationManager.getAccessTokenExpirationTime()!! }

        logger.info("Click reset configuration")
        onView(withId(R.id.reset_configuration)).perform(click())
        logger.info("Click cancel button on dialog")
        onView(withId(R.id.cancel_button)).perform(click())

        verifyOnTokenActivity()

        logger.info("Click refresh token to confirm session is active")
        onView(withId(R.id.refresh_token)).perform(click())
        val expirationTimeAfter = runBlocking { AuthorizationManager.getAccessTokenExpirationTime()!! }
        check(expirationTimeAfter > expirationTimeBefore) { "Token was not refreshed after canceling config switch" }

        logout()
    }

    @Test
    fun e2eTestNoBrowserAvailable() {
        val disabled = disableAllBrowsers()
        try {
            // The test only makes sense if we actually removed every https handler.
            check(!hasHttpsHandler()) {
                "Could not disable all browsers on this device; cannot validate no-browser path"
            }

            // Trigger auth from the activity.
            onView(withId(R.id.start_auth)).perform(click())

            // Verify the friendly no-browser message is shown and Retry is hidden.
            val expected = InstrumentationRegistry.getInstrumentation()
                .targetContext
                .getString(R.string.no_browser_available)
            device.wait(Until.findObject(By.text(expected)), TIMEOUT_MILLIS)
            onView(withText(expected)).check(matches(isDisplayed()))
            onView(withId(R.id.retry)).check(matches(not(isDisplayed())))
        } finally {
            enablePackages(disabled)
        }
    }

    /**
     * Disables every package that currently handles `https` VIEW intents for user 0 and
     * returns the list so it can be re-enabled in teardown.
     */
    private fun disableAllBrowsers(): List<String> {
        val handlers = httpsHandlerPackages()
        logger.info("Disabling browser packages: $handlers")
        handlers.forEach { pkg ->
            device.executeShellCommand("pm disable-user --user 0 $pkg")
        }
        // Allow PackageManager state to settle.
        Thread.sleep(500)
        return handlers
    }

    private fun enablePackages(packages: List<String>) {
        packages.forEach { pkg ->
            logger.info("Re-enabling package: $pkg")
            device.executeShellCommand("pm enable $pkg")
        }
    }

    private fun httpsHandlerPackages(): List<String> {
        val pm = InstrumentationRegistry.getInstrumentation().targetContext.packageManager
        val intent = android.content.Intent(
            android.content.Intent.ACTION_VIEW,
            android.net.Uri.parse("https://example.com")
        )
        @Suppress("DEPRECATION")
        return pm.queryIntentActivities(intent, 0)
            .map { it.activityInfo.packageName }
            .distinct()
    }

    private fun hasHttpsHandler(): Boolean = httpsHandlerPackages().isNotEmpty()

    // Helper Functions

    private fun login(username: String, password: String) {
        logger.info("--> login(username: $username)")
        onView(withId(R.id.start_auth)).perform(click())
        handleFALoginForm(username, password)
        verifyOnTokenActivity()
        logger.info("<-- login")
    }

    private fun loginSessionExists(username: String) {
        logger.info("--> login(username: $username)")
        onView(withId(R.id.start_auth)).perform(click())
        verifyOnTokenActivity()
        logger.info("<-- login")
    }
    private fun logout() {
        logger.info("--> logout()")
        onView(withId(R.id.sign_out)).perform(click())
        verifyOnLoginActivity()
        logger.info("<-- logout()")
    }

    private fun performAndVerifyTokenRefresh() {
        logger.info("--> performAndVerifyTokenRefresh()")
        val expirationTime = runBlocking { AuthorizationManager.getAccessTokenExpirationTime()!! }
        onView(withId(R.id.refresh_token))
            .check(matches(isDisplayed()))
            .perform(click())
        val newExpirationTime = runBlocking { AuthorizationManager.getAccessTokenExpirationTime()!! }
        logger.info("Token was refreshed (${expirationTime} to ${newExpirationTime})")
        check(newExpirationTime > expirationTime) { "Token was not refreshed" }
        Thread.sleep(1000) // Wait a bit for UI to settle
        logger.info("<-- performAndVerifyTokenRefresh()")
    }

    private fun switchToAlternative() {
        logger.info("--> switchToAlternative()")
        onView(withId(R.id.reset_configuration)).perform(click())
        onView(withId(R.id.switch_to_alternative_button)).perform(click())
        verifyOnLoginActivity()
        logger.info("<-- switchToAlternative()")
    }

    private fun switchToPrimary() {
        logger.info("--> switchToPrimary()")
        onView(withId(R.id.reset_configuration)).perform(click())
        onView(withId(R.id.switch_to_primary_button)).perform(click())
        verifyOnLoginActivity()
        logger.info("<-- switchToPrimary()")
    }

    private fun verifyOnTokenActivity() {
        device.wait(Until.findObject(By.res("io.fusionauth.app:id/sign_out")), TIMEOUT_MILLIS)
        onView(withId(R.id.sign_out)).check(matches(isDisplayed()))
        logger.info("Verified on TokenActivity")
    }

    private fun verifyOnLoginActivity() {
        device.wait(Until.findObject(By.res("io.fusionauth.app:id/start_auth")), TIMEOUT_MILLIS)
        onView(withId(R.id.start_auth)).check(matches(isDisplayed()))
        logger.info("Verified on LoginActivity")
    }

    private fun handleFALoginForm(username: String, password: String) {
        device.wait(Until.findObject(By.clazz("android.webkit.WebView")),
            TIMEOUT_MILLIS)

        val textFields = device.findObjects(By.clazz("android.widget.EditText"))

        closeKeyboardIfOpen()
        logger.info("Set username")
        val userNameInputObject = textFields[0]
        userNameInputObject.setText(username)

        closeKeyboardIfOpen()
        logger.info("Set password")
        val passwordInputObject = textFields[1]
        passwordInputObject.setText(password)

        logger.info("Submit form by pressing enter key")
        passwordInputObject.click()
        device.pressEnter()
    }

    private fun closeKeyboardIfOpen() {
        val automation = InstrumentationRegistry.getInstrumentation().uiAutomation
        for (window in automation.windows) {
            if (window.type == AccessibilityWindowInfo.TYPE_INPUT_METHOD) {
                device.pressBack()
                return
            }
        }
    }

    /**
     * Starts auth with the given prompt. Handles login form and token activity only.
     * Does NOT check for error UI. Tests should check for error UI if expected.
     */
    private fun loginWithPrompt(username: String, password: String, prompt: String) {
        loginActivityRule.scenario.onActivity { activity ->
            activity.startAuth(prompt)
        }

        handleFALoginForm(username, password)
        verifyOnTokenActivity()
    }

    private fun verifyAuthorizationError() {
        onView(withText("Not authorized")).check(matches(isDisplayed()))
    }

    @After
    fun tearDown() {
        logger.info("Tearing down test")
        runBlocking { AuthorizationManager.clearState() }
        Intents.release()
    }

    companion object {
        private val logger = Logger.getLogger(FullEnd2EndTest::class.java.name)

        private const val USERNAME = "richard@example.com"
        private const val PASSWORD = "password"
        private const val USERNAME2 = "gilfoyle@example.com"
        private const val PASSWORD2 = "password"
        private const val USERNAME_RESET_CONFIGURATION = "mike@example.com"
        private const val PASSWORD_RESET_CONFIGURATION = "password"
        private const val TIMEOUT_MILLIS = 10_000L
    }
}
