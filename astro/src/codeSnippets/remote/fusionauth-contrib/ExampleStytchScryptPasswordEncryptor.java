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
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;

public class ExampleStytchScryptPasswordEncryptor implements PasswordEncryptor {

// tag::scryptParameters[]
  /* Scrypt Parameters. You can find the correct settings for your Stytch project
    in the email they sent you containing your hashes. Copy them here. */
  private static final int N_CpuCost = 1 << 15;
  private static final int R_MemoryCost_BlockSize = 8;
  private static final int P_Parallelization = 1;
  private static final int KeyLength = 32;
// end::scryptParameters[]

  @Override
  public int defaultFactor() {
    return 0;
  }

  @Override
  public String encrypt(String password, String salt, int factor) {
    try {
        Charset Charset = StandardCharsets.US_ASCII;
        String urlSafeSalt = salt.replace('+', '-').replace('/', '_'); // because Stytch exports the latter type of Base 64, and Java/FusionAuth require the former
        byte[] hashedBytes = SCrypt.scrypt(password.getBytes(Charset), urlSafeSalt.getBytes(Charset), N_CpuCost, R_MemoryCost_BlockSize, P_Parallelization, KeyLength);
        return new String(Base64.encodeBase64(hashedBytes)); // Return Base64 with + and / symbols, not - and _ symbols
    }
    catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

}