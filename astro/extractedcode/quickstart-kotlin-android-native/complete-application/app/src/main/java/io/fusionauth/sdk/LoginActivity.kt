/*
 * Copyright 2015 The AppAuth for Android Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.fusionauth.sdk

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.TextView
import androidx.annotation.MainThread
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.android.material.snackbar.Snackbar
import io.fusionauth.mobilesdk.AuthorizationConfiguration
import io.fusionauth.mobilesdk.AuthorizationManager
import io.fusionauth.mobilesdk.oauth.OAuthAuthorizeOptions
import io.fusionauth.mobilesdk.exceptions.AuthorizationException
import io.fusionauth.mobilesdk.exceptions.BrowserNotAvailableException
import io.fusionauth.mobilesdk.storage.DataStoreStorage
import kotlinx.coroutines.launch

/**
 * Demonstrates the usage of FusionAuth to authorize a user with an OAuth2 / OpenID Connect
 * provider. Based on the configuration provided in `res/raw/fusionauth_config.json`.
 */
class LoginActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (!AuthorizationManager.isInitialized()) {
            AuthorizationManager.initialize(
                AuthorizationConfiguration.fromResources(this, R.raw.fusionauth_config),
                DataStoreStorage(this)
            )
        }

        lifecycleScope.launch {
            if (AuthorizationManager.isAuthenticated()) {
                Log.i(TAG, "User is already authenticated, proceeding to token activity")
                startActivity(Intent(this@LoginActivity, TokenActivity::class.java))
                finish()
                return@launch
            }
        }

        setContentView(R.layout.activity_login)

        findViewById<View>(R.id.retry).setOnClickListener {
            startAuth()
        }
        findViewById<View>(R.id.start_auth).setOnClickListener {
            startAuth()
        }

        if (AuthorizationManager.oAuth(this@LoginActivity).isCancelled(intent)) {
            displayAuthCancelled()
        }

        if (AuthorizationManager.oAuth(this@LoginActivity).isLoggedOut(intent)) {
            displayLoggedOut()
        }

        displayAuthOptions()
    }

    override fun onDestroy() {
        super.onDestroy()

        AuthorizationManager.dispose()
    }

    @MainThread
    fun startAuth(prompt: String? = null) {
        displayLoading("Making authorization request")

        lifecycleScope.launch {
            try {
                displayLoading("Making authorization request")
                AuthorizationManager
                    .oAuth(this@LoginActivity)
                    .authorize(
                        Intent(this@LoginActivity, TokenActivity::class.java),
                        OAuthAuthorizeOptions(
                            cancelIntent = Intent(this@LoginActivity, LoginActivity::class.java)
                                .setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP),
                            state = "state-${System.currentTimeMillis()}",
                            prompt = prompt
                        )
                    )
            } catch (e: BrowserNotAvailableException) {
                Log.e(TAG, "No browser available to perform authorization", e)
                displayError(getString(R.string.no_browser_available), false)
            } catch (e: AuthorizationException) {
                Log.e(TAG, "Error while authorizing", e)
                displayError(e.message ?: "Error while authorizing", true)
            }
        }
    }

    @MainThread
    private fun displayLoading(loadingMessage: String) {
        findViewById<View>(R.id.loading_container).visibility = View.VISIBLE
        findViewById<View>(R.id.auth_container).visibility = View.GONE
        findViewById<View>(R.id.error_container).visibility = View.GONE

        (findViewById<View>(R.id.loading_description) as TextView).text = loadingMessage
    }

    @MainThread
    private fun displayError(error: String, recoverable: Boolean) {
        findViewById<View>(R.id.error_container).visibility = View.VISIBLE
        findViewById<View>(R.id.loading_container).visibility = View.GONE
        findViewById<View>(R.id.auth_container).visibility = View.GONE

        (findViewById<View>(R.id.error_description) as TextView).text = error
        findViewById<View>(R.id.retry).visibility = if (recoverable) View.VISIBLE else View.GONE
    }

    @MainThread
    private fun displayAuthOptions() {
        findViewById<View>(R.id.auth_container).visibility = View.VISIBLE
        findViewById<View>(R.id.loading_container).visibility = View.GONE
        findViewById<View>(R.id.error_container).visibility = View.GONE
    }

    private fun displayAuthCancelled() {
        Snackbar.make(
            findViewById(R.id.coordinator),
            "Authorization canceled",
            Snackbar.LENGTH_SHORT
        )
            .show()
    }

    private fun displayLoggedOut() {
        Snackbar.make(
            findViewById(R.id.coordinator),
            "Logged out",
            Snackbar.LENGTH_SHORT
        )
            .show()
    }

    companion object {
        private const val TAG = "LoginActivity"
    }
}
