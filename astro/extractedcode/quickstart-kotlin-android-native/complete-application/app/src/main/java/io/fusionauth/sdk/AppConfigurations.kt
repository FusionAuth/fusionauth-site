package io.fusionauth.sdk

import io.fusionauth.mobilesdk.AuthorizationConfiguration

object AppConfigurations {
    val PRIMARY_CONFIG = AuthorizationConfiguration(
        fusionAuthUrl = "http://10.0.2.2:9011",
        tenant = "d7d09513-a3f5-401c-9685-34ab6c552453",
        clientId = "e9fdb985-9173-4e01-9d73-ac2d60d1dc8e",
        allowUnsecureConnection = true,
        additionalScopes = setOf("email", "profile")
    )

    val ALTERNATIVE_CONFIG = AuthorizationConfiguration(
        fusionAuthUrl = "http://10.0.2.2:9011",
        clientId = "2d491002-1b1b-4a59-be2a-1d570c834c7a",
        allowUnsecureConnection = true,
        additionalScopes = setOf("email", "profile"),
        tenant = "a3138f90-16b5-444f-b5f6-0ca64bc30ca7"
    )
}
