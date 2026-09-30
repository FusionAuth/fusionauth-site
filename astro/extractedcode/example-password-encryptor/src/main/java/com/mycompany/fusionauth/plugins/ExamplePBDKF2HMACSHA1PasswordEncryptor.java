/*
 * Copyright (c) 2019, FusionAuth, All Rights Reserved
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
package com.mycompany.fusionauth.plugins;

import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;

import com.mycompany.fusionauth.util.HexTools;
import io.fusionauth.plugin.spi.security.PasswordEncryptor;

/**
 *  This is an example of a PBKDF2 HMAC SHA1 Salted hashing algorithm.
 *
 * <p>
 * This code is provided to assist in your deployment and management of FusionAuth. Use of this
 * software is not covered under the FusionAuth license agreement and is provided "as is" without
 * warranty. https://fusionauth.io/license
 * </p>
 *
 * @author Daniel DeGroff
 */
public class ExamplePBDKF2HMACSHA1PasswordEncryptor implements PasswordEncryptor {
  private final int keyLength;

  public ExamplePBDKF2HMACSHA1PasswordEncryptor() {
    // Default key length is 512 bits
    this.keyLength = 64;
  }

  @Override
  public int defaultFactor() {
    return 10_000;
  }

  @Override
  public String encrypt(String password, String salt, int factor) {
    if (factor <= 0) {
      throw new IllegalArgumentException("Invalid factor value [" + factor + "]");
    }

    SecretKeyFactory keyFactory;
    try {
      keyFactory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException("No such algorithm [PBKDF2WithHmacSHA1]");
    }

    KeySpec keySpec = new PBEKeySpec(password.toCharArray(), salt.getBytes(), factor, keyLength * 8);
    SecretKey secret;
    try {
      secret = keyFactory.generateSecret(keySpec);
    } catch (InvalidKeySpecException e) {
      throw new IllegalArgumentException("Could not generate secret key for algorithm [PBKDF2WithHmacSHA1]");
    }

    SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getEncoded(), "HmacSHA1");
    Mac mac;
    try {
      mac = Mac.getInstance("HmacSHA1");
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException("No such algorithm [HmacSHA1]");
    }

    try {
      mac.init(secretKeySpec);
      byte[] hashedPassword = mac.doFinal(password.getBytes(StandardCharsets.UTF_8));
      return HexTools.encode(hashedPassword);
    } catch (InvalidKeyException e) {
      throw new IllegalArgumentException("Invalid key used to initialize HmacSHA1");
    }
  }
}
