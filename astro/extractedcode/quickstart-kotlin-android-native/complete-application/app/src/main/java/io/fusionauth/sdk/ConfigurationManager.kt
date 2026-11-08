package io.fusionauth.sdk

import io.fusionauth.mobilesdk.AuthorizationConfiguration

class ConfigurationManager {

    fun getPrimaryConfig(): AuthorizationConfiguration {
        return AppConfigurations.PRIMARY_CONFIG
    }

    fun getAlternativeConfig(): AuthorizationConfiguration {
        return AppConfigurations.ALTERNATIVE_CONFIG
    }

    fun isPrimaryConfig(config: AuthorizationConfiguration): Boolean {
        return config.clientId == AppConfigurations.PRIMARY_CONFIG.clientId
    }
}
