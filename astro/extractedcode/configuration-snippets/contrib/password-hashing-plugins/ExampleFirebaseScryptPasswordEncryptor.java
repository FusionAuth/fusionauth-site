/*
 * Copyright (c) 2020, FusionAuth, All Rights Reserved
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

import io.fusionauth.plugin.spi.security.PasswordEncryptor;
import com.lambdaworks.crypto.SCrypt;
import org.apache.commons.codec.binary.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.Key;
import java.security.MessageDigest;

/**
 * This example code is a starting point to build your own hashing algorithm in order to import users into FusionAuth.
 */
public class ExampleFirebaseScryptPasswordEncryptor implements PasswordEncryptor {

  private static final Charset CHARSET = StandardCharsets.US_ASCII;
  private static final String CIPHER = "AES/CTR/NoPadding";

// :snippet-start: scryptParameters
  /* Firebase Scrypt Parameters. You can find the correct settings for your Firebase project 
    by opening the Firebase console, navigating to the Authentication panel, and clicking
    on the 3 dots near the the **Add User** button. Then select **Password hash parameters**.
    This will open a modal with the parameters needed below. Copy them here */
  private static final int memcost = 14;
  private static final int rounds = 8;
  private static final String saltSep = "Bw==";
  private static final String base64_signer_key = "GhlZmw+EylyJl3fhsIOa+bmAEP1sYSHfZargl1unu/5mCp7pi818imxZOdSjM1558T+XU3cBflyr5HDghZqv7Q==";
// :snippet-end:

  @Override
  public int defaultFactor() {
    return rounds;
  }

  @Override
  public String encrypt(String password, String salt, int factor) {
    try {
        int N = 1 << memcost;
        int p = 1;
        // concatenating decoded salt + separator
        byte[] decodedSaltBytes = Base64.decodeBase64(salt.getBytes(CHARSET));

        byte[] decodedSaltSepBytes = Base64.decodeBase64(saltSep.getBytes(CHARSET));

        byte[] saltConcat = new byte[decodedSaltBytes.length + decodedSaltSepBytes.length];
        System.arraycopy(decodedSaltBytes, 0, saltConcat, 0, decodedSaltBytes.length);
        System.arraycopy(decodedSaltSepBytes, 0, saltConcat, decodedSaltBytes.length, decodedSaltSepBytes.length);

        // hashing password
        byte[] hashedBytes =  SCrypt.scrypt(password.getBytes(CHARSET), saltConcat, N, factor, p, 64);

        // encrypting with aes
        byte[] signerBytes = Base64.decodeBase64(base64_signer_key.getBytes(CHARSET));
        byte[] cipherTextBytes = encrypt(signerBytes, hashedBytes);


        String hash = new String(Base64.encodeBase64(cipherTextBytes));
        return hash; 
    } catch (Exception e) {
        throw new RuntimeException(e);
    }
  }

  private static byte[] encrypt(byte[] signer, byte[] derivedKey) {
        try {
            Key key = generateKeyFromString(derivedKey);
            IvParameterSpec ivSpec = new IvParameterSpec(new byte[16]);
            Cipher c = Cipher.getInstance(CIPHER);
            c.init(Cipher.ENCRYPT_MODE, key, ivSpec);
            return c.doFinal(signer);
        } catch(Exception ex) {
            return null;
        }
  }

  private static Key generateKeyFromString(byte[] keyVal) {
    return new SecretKeySpec(keyVal, 0, 32, "AES");
  }

}
