package com.mycompany.fusionauth.plugins;

import io.fusionauth.plugin.spi.security.PasswordEncryptor;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;

/**
 * @author Daniel DeGroff
 */
public class ExamplePBDKF2HMACSHA1PasswordEncryptorTest {
  @Test(dataProvider = "hashes")
  public void encrypt(String password, String salt, String hash) {
    PasswordEncryptor encryptor = new ExamplePBDKF2HMACSHA1PasswordEncryptor();
    assertEquals(encryptor.encrypt(password, salt, 10_000), hash);
  }

  @DataProvider(name = "hashes")
  public Object[][] hashes() {
    return new Object[][]{
        {"password123", "1484161696d0ca62390273b98846f49671cecd78", "4761D3392092F9CA6036B53DC92C6D7F3D597576"},
        {"password123", "ea95629c7954d73ea670f07a798e9fd4ab907593", "9480AD9A59CB5053B832BA5E731AFCD1F78068EC"},
    };
  }
}
