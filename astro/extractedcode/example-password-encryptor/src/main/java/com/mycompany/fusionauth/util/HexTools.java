package com.mycompany.fusionauth.util;

/**
 * @author Daniel DeGroff
 */
public class HexTools {
  private final static char[] HEX = "0123456789ABCDEF".toCharArray();

  /**
   * @param bytes the bytes to Base16 encode
   * @return a hex encoded string
   */
  public static String encode(byte[] bytes) {
    char[] hexChars = new char[bytes.length * 2];
    for (int i = 0; i < bytes.length; i++) {
      int v = bytes[i] & 0xFF;
      hexChars[i * 2] = HEX[v >>> 4];
      hexChars[i * 2 + 1] = HEX[v & 0x0F];
    }
    return new String(hexChars);
  }
}
