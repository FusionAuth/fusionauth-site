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

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Random;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import com.mycompany.fusionauth.util.Base64Tools;
import io.fusionauth.plugin.spi.security.PasswordEncryptor;
import com.github.wolf480pl.phpass.PHPass;
import com.github.wolf480pl.phpass.BCrypt;

public class ExampleWordPressPhpassPasswordEncryptor implements PasswordEncryptor {

  @Override
  public int defaultFactor() {
    return 8;
  }

  /**
   * @param password the plaintext password to encrypt, not in base64 as it comes from the user input
   * @param salt not the salt. rather give the full previous hashed password in its entirety
   *             encoded in base64. the salt is included in the hash. if this password has
   *             never been hashed before then leave salt as null.
   * @param factor used only when generating a new phpass hash; imported hashes contain their own cost
   * @return the encrypted password including the salt. salt does not need to be stored separately.
   */
  @Override
  public String encrypt(String password, String salt, int factor) {
    try {
        String previousHash = Base64Tools.decode64(salt);
        if (previousHash != null && previousHash.startsWith("$wp")) {
          if (checkWordPressBcrypt(password, previousHash))
            return Base64Tools.encode64(previousHash);
          return Base64Tools.encode64(getRandomPassword());
        }
        PHPass phpass = new PHPass(factor);
        if (previousHash == null)
          return Base64Tools.encode64(phpass.HashPassword(password));
        if (phpass.CheckPassword(password, previousHash))
          return Base64Tools.encode64(previousHash);
        return Base64Tools.encode64(getRandomPassword());
    }
    catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  private boolean checkWordPressBcrypt(String password, String hash) throws Exception {
    // WordPress 6.8+: https://developer.wordpress.org/reference/functions/wp_check_password/
    if (!hash.matches("\\$wp\\$2y\\$[0-9]{2}\\$[./A-Za-z0-9]{53}") ||
        password.getBytes(StandardCharsets.UTF_8).length > 4096)
      return false;
    int cost = Integer.parseInt(hash.substring(7, 9));
    if (cost < 4 || cost > 30)
      return false;
    Mac hmac = Mac.getInstance("HmacSHA384");
    hmac.init(new SecretKeySpec("wp-sha384".getBytes(StandardCharsets.UTF_8), "HmacSHA384"));
    String prehash = Base64.getEncoder().encodeToString(hmac.doFinal(password.getBytes(StandardCharsets.UTF_8)));
    // The bundled BCrypt accepts $2a$, not $2y$. The WordPress prehash is always
    // 64 ASCII characters, so the revisions' high-bit handling cannot differ.
    return BCrypt.checkpw(prehash, "$2a$" + hash.substring(7));
  }

  String getRandomPassword() {
    return String.valueOf(new Random().nextInt(90000000) + 10000000);
  }

}
