/*
 * Copyright (c) 2020-2022, FusionAuth, All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 */
package com.mycompany.fusionauth.plugins.guice;

import com.google.inject.AbstractModule;
import com.google.inject.multibindings.MapBinder;
import com.mycompany.fusionauth.plugins.ExamplePBDKF2HMACSHA1PasswordEncryptor;
import io.fusionauth.plugin.spi.PluginModule;
import io.fusionauth.plugin.spi.security.PasswordEncryptor;

/**
 * @author Daniel DeGroff
 */
@PluginModule
public class MyExampleFusionAuthPluginModule extends AbstractModule {
  @Override
  protected void configure() {
    MapBinder<String, PasswordEncryptor> passwordEncryptorMapBinder = MapBinder.newMapBinder(binder(), String.class, PasswordEncryptor.class);

    // TODO :
    //   1. Add one or more bindings here
    //   2. Name your binding. This will be the value you set in the 'encryptionScheme' on the user to utilize this encryptor.
    //   3. Delete any example code you don't use and do not want in your plugin. In addition to the bindings, you should delete any corresponding classes and tests you do not use in your plugin.

    // Example PBKDF2 with a SHA-1
    passwordEncryptorMapBinder.addBinding("example-salted-pbkdf2-hmac-sha1-10000").to(ExamplePBDKF2HMACSHA1PasswordEncryptor.class);
  }
}
