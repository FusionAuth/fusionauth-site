package com.mycompany.fusionauth.util;

import java.util.Arrays;
import java.util.Base64;

/**
 * @author Daniel DeGroff
 */
public class Base64Tools {
  private static final char[] BCRYPT_BASE_64_TABLE = {
      '.', '/', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
      'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
      'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
      'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
      'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5',
      '6', '7', '8', '9'
  };

  private static final char[] UNIX_BASE_64_TABLE = {
      '.', '/', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
      'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
      'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
      'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
      'w', 'x', 'y', 'z'
  };

  /**
   * Encode a byte array using bcrypt's slightly-modified base64 encoding scheme. Note that this is *not* compatible
   * with the standard MIME-base64 encoding.
   *
   * <p>
   * Uses: . / A-Z a-z 0-9
   * </p>
   *
   * @param bytes the byte array to encode
   * @param len   the number of bytes to encode
   * @return base64-encoded string
   * @throws IllegalArgumentException if the length is invalid
   */
  public static String bcryptEncodeBase64(byte[] bytes, int len) throws IllegalArgumentException {
    int index = 0;
    StringBuilder build = new StringBuilder();
    while (index < len) {
      int character1 = bytes[index++] & 0xff;
      build.append(BCRYPT_BASE_64_TABLE[(character1 >> 2) & 0x3f]);
      character1 = (character1 & 0x03) << 4;
      if (index >= len) {
        build.append(BCRYPT_BASE_64_TABLE[character1 & 0x3f]);
        break;
      }

      int character2 = bytes[index++] & 0xff;
      character1 |= (character2 >> 4) & 0x0f;
      build.append(BCRYPT_BASE_64_TABLE[character1 & 0x3f]);
      character1 = (character2 & 0x0f) << 2;
      if (index >= len) {
        build.append(BCRYPT_BASE_64_TABLE[character1 & 0x3f]);
        break;
      }

      character2 = bytes[index++] & 0xff;
      character1 |= (character2 >> 6) & 0x03;
      build.append(BCRYPT_BASE_64_TABLE[character1 & 0x3f]);
      build.append(BCRYPT_BASE_64_TABLE[character2 & 0x3f]);
    }

    return build.toString();
  }

  /**
   * Return a Base64 encoded string using the character set defined in RFC4648.
   * <p>
   * Uses: A-Z a-z 0-9 + /
   * </p>
   *
   * @param bytes bytes to encode
   * @return a base64 encoded string
   */
  public static String encodeToString(byte[] bytes) {
    return Base64.getEncoder().encodeToString(bytes);
  }

  /**
   * Return a Base64 encoded string using the character set used by Unix crypt.
   * <p>
   * Uses: . / 0-9 A-Z a-z
   * </p>
   *
   * @param bytes bytes to encode
   * @param len   the number of bytes to encode in the source array
   * @return a base64 encoded string
   */
  public static String unixCryptEncodeToString(byte[] bytes, int len) {
    return unixBase64Encode(bytes, len);
  }

  /**
   * Return a Base64 encoded string using the character set defined in RFC4648 as URL safe. This
   * encoding scheme replaces + and / for URL safe characters - and _ so the string is not required to be URL encoded.
   * <p>
   * Uses: A-Z a-z 0-9 - _
   * </p>
   *
   * @param bytes bytes to encode
   * @return a base64 encoded string
   */
  public static String urlEncodeToString(byte[] bytes) {
    return Base64.getUrlEncoder().encodeToString(bytes);
  }

  private static String unixBase64Encode(byte[] src, int len) {
    int i, value;
    StringBuilder sb = new StringBuilder();
    i = 0;

    if (src.length < len) {
      byte[] t = new byte[len];
      System.arraycopy(src, 0, t, 0, src.length);
      Arrays.fill(t, src.length, len - 1, (byte) 0);
      src = t;
    }

    do {
      value = src[i] + (src[i] < 0 ? 256 : 0);
      ++i;
      sb.append(UNIX_BASE_64_TABLE[value & 63]);
      if (i < len) {
        value |= (src[i] + (src[i] < 0 ? 256 : 0)) << 8;
      }
      sb.append(UNIX_BASE_64_TABLE[(value >> 6) & 63]);
      if (i++ >= len) {
        break;
      }
      if (i < len) {
        value |= (src[i] + (src[i] < 0 ? 256 : 0)) << 16;
      }
      sb.append(UNIX_BASE_64_TABLE[(value >> 12) & 63]);
      if (i++ >= len) {
        break;
      }
      sb.append(UNIX_BASE_64_TABLE[((value >> 18) & 63)]);
    } while (i < len);

    return sb.toString();
  }
}
