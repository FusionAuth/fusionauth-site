---
layout: blog-post
title: "All your passwords are belong to us"
description: One-way hashing for passwords is the standard mechanism used to protect your user's passwords. Let's take a look at how it works and some new ideas to improve it.
author: Brian Pontarelli
excerpt_separator: "<!--more-->"
categories: blog
tags:
- code
- nodejs
- programming
image: blogs/all-your-password-entropy.png
---

Here's the reality, billions of credentials have been leaked or stolen and are now easily downloaded online by anyone. Many of these databases of identities include passwords in plain-text, while others are one-way hashed. Clearly one-way hashing is better, but it is only as secure as is mathematically feasible.

<!--more-->

## Hashing

Let's take a look at one-way hashing algorithms and how computers handle them. MD5 is an algorithm that uses various bit-wise operations on any number of bytes to produce a 128-bit "hash". The algorithm was designed specifically so that going from a hash back to the original bytes is impossible. Developers use MD5 so a plain-text form of the password is never stored. Instead, only the hash is stored and when a user is authenticated, the plain-text password they type into the login form is hashed, and then compared to the hash in the database.

While one-way hashing means we aren't storing plain-text passwords, it can still be possible to determine the plain-text password by trying all combinations of bytes until you generate the same hash that is stored in the database.

## Cracking passwords

There are two methods of reversing a one-way hash to a password. The first is called a rainbow table or lookup table. This method builds a massive lookup table that maps hashes to plain-text passwords. The table is built by simply hashing every possible password combination and storing it in some type of database or data-structure that allows for quick lookups.

Here's an example of a lookup table for MD5 hashed passwords:

```yaml
60b725f10c9c85c70d97880dfe8191b3 => a
d404401c8c6495b206fc35c95e55a6d5 => aa
daa8075d6ac5ff8d0c6d4650adb4ef29 => ab
...
3b5d5c3712955042212316173ccf37be => b
```

Using the lookup table, all the attacker needs to know is the MD5 hash of the password and they can see if it exists in the table.

The best way to protect against this type of attack is to use what is called a **salt**. Salts are simply a bunch of random characters that you prepend to the password before it is hashed. Each password has a different salt, which means that a lookup table is unlikely to have an entry for the combination of the salt and the password. This makes salts an ideal defense against lookup tables.

Here's an example of a salt and the resulting combination of the password and the salt which is then hashed:

```kotlin
salt = ";L'-2!;+=#/5B)40/o-okOw8//3a"
password = "password"
toHash = ";L'-2!;+=#/5B)40/o-okOw8//3apassword"
```

The second method that attackers use to crack passwords is called "brute force" cracking. This means that the attacker writes a small computer program that generates all possible combinations of characters that can be used for a password and then computes the hash for each. This program can also take a salt if the password was hashed with a salt. The attacker then runs the program until it generates a hash that is the same as the hash from the database. Here's a simple Java program for cracking passwords. I left out some detail, such as all the possible password characters, to keep the code short, but you get the idea.

```java
import org.apache.commons.codec.digest.DigestUtils;

public class PasswordCrack {
  public static final char[] PASSWORD_CHARACTERS = new char[] {'a', 'b', 'c', 'd'};

  public static void main(String... args) {
    String salt = args[0];
    String hashFromDatabase = args[1].toUpperCase();

    for (int i = 6; i <= 8; i++) {
      char[] ca = new char[i];

      fillArrayHashAndCheck(ca, 0, salt, hashFromDatabase);
    }
  }

  private static void fillArrayHashAndCheck(char[] ca, int index, String salt, String hashFromDatabase) {
    for (int i = 0; i < PASSWORD_CHARACTERS.length; i++) {
      ca[index] = PASSWORD_CHARACTERS[i];

      if (index < ca.length - 1) {
        fillArrayHashAndCheck(ca, index + 1, salt, hashFromDatabase);
      } else {
        String password = salt + new String(ca);
        String md5Hex = DigestUtils.md5Hex(password).toUpperCase();
        if (md5Hex.equals(hashFromDatabase)) {
          System.out.println("Plain-text password is [" + password + "]");
          System.exit(0);
        }
      }
    }
  }
}
```

This program will generate all the possible passwords with lengths between 6 and 8 characters and then hash each one until it finds a match. This type of brute-force hacking takes some time though because it is trying a lot of combinations.

## Password complexity vs. computational power

This is where we can start doing some math to figure out how long this program will take to run. Let's assume that passwords can only contain ASCII characters (uppercase, lowercase, digits, punctuation). This set is roughly 100 characters (I rounded up to make the math easier to read). If we know that there are at least 6 characters and at most 8 characters in a password, then all the possible combinations can be represented by this expression:

```
totalPassword = 100^8 + 100^7 + 100^6
```

This is equal to `10,101,000,000,000,000`. This is quite a large number, but what does it actually mean when it comes to my program running? This depends on the speed of the computer I'm running on and how long it takes my computer to execute the MD5 algorithm. The MD5 algorithm is the key component here because the rest of the program is extremely fast at just creating the passwords.

Here's where things get dicey. If you run a quick Google search for "fastest bitcoin rig" you'll see that these machines are rated in terms of the number of hashes they can do per second. The bigger ones can be rated as high as `44 TH/s`. That means it can generate 44 tera-hashes per second, or `44,000,000,000,000` hashes per second.

Now, if we divide the total number of passwords by the number of hashes we can generate per second, we are left with the total time it takes a bitcoin rig to generate the hashes for all possible passwords. In our example above, this equates to:

```
numberOfSeconds = 1.101e16 / 4.4e13 = 250
```   

This means that we can generate all the hashes for 6 to 8 character long passwords in basically 4 minutes.

Let's scale this out and see how long it takes to do 9 character long passwords:

```
bitcoinRig = 4.4e13
nineCharacterPasswords = 1e18
numberOfSeconds = 1e18 / 4.4e13 = 22,727
numberOfMinutes = 378
numberOfHours = 6.3
```

And let's make a big jump to 16 characters:

```
bitcoinRig = 4.4e13
nineCharacterPasswords = 1e32
numberOfSeconds = 1e32 / 4.4e13 = 2.27e18
numberOfMinutes = 3.78e16
numberOfHours = 630,000,000,000,000
numberOfDays = 26,250,000,000,000
numberOfYears = 71,917,808,219
```

If we take these expressions and rename them a little bit, we can build an equation that solves for any length password:

```
numberOfSeconds = 100^lengthOfPassword / computerSpeed
```

This equation shows that as the password length increases, the number of seconds to brute-force attack the password also increases since the computer power is a fixed divisor. The increase in password complexity (length and possible characters) is called **entropy**. As the entropy increases, the time required to brute-force attack a password also increases.

## What does all this math mean?

Great question. Here's the answer:

> If you let humans use short passwords that they can remember, you need to decrease `computerSpeed`.
>
> If you force humans to use password generators that create really long passwords, you don't need to change anything.

Let's assume we are going to let humans use short passwords. This means that we need to decrease the `computerSpeed` value. How do we accomplish that?

The way that the security industry has been solving this problem is by using more and more complex algorithms that cause the computer to spend more time generating one-way hashes. Examples of these algorithms include BCrypt, SCrypt, PBKDF2, and others. These algorithms are specifically designed to cause the CPU/GPU of the computer to take an exorbitant amount of time generating a single hash. If we can reduce the `computerSpeed` value from `4.4e13` all the way down to `1,000`, even our numbers for passwords between 6 and 8 characters long become much better:

```
computerPower = 1e3
sixToEightCharacterPasswords = 1.101e16
numberOfSeconds = 1.101e16 / 1e3 = 11,010,000,000,000
numberOfMinutes = 183,500,000,000
numberOfHours = 3,058,333,333
numberOfDays = 127,430,555
numberOfYears = 349,124
```

And here lies the debate that the security industry has been having for years:

Do we allow users to use short passwords and put the burden on the computer to generate hashes as slowly as reasonably still secure? Or do we force users to use long passwords and just use a fast hashing algorithm like MD5 or SHA512?

Some in the industry have argued that enough is enough with consuming massive amounts of CPU and GPU cycles simply computing hashes for passwords. By forcing users to use long passwords, we get back a ton of computing power and can reduce costs by shutting off the 42 servers we have to run to keep up with login volumes.

Others claim that this is a bad idea for a variety of reasons including:

* Humans don't like change
* The risk of simple algorithms like MD5 or SHA is still too high
* Simple algorithms might be currently vulnerable to attacks or new attacks might be discovered in the future

At the time of this writing, there are still numerous simple algorithms that have not been attacked, meaning that no one has figured out a way to reduce the need to compute every possible hash. Therefore, it is still a safe assertion that using a simple algorithm on a long password is secure. This leaves the only reason not to force users to use long passwords is for the first reason mentioned above, "humans don't like change". In reality, many users will change and some will already be using long passwords.

## Our new idea

As the provider of an identity management solution, we understand both sides of this debate, but we also have an idea for a solution. What if we dynamically changed the algorithm that FusionAuth used to hash passwords based on the length (and possibly complexity) of the password? Could this reduce the average CPU/GPU consumption by enough to make a difference?

Here's some example code for a simple algorithm that selects the hashing scheme based on password length:

```java
PasswordHasher hasher;
if (password.length() >= 14) {
  hasher = new SHA512PasswordHasher();
} else {
  hasher = new BCryptPasswordHasher();
}

String hashedPassword = hasher.hash(password);
```
**BG: You ask above "Could this reduce the average CPU/GPU consumption? - so should we spell out the outcome of this change? Summarize same math as above, and show the resulting consumption with similar security. If used BCrypt for all, it would be X, but by using SHA512 on longer passwords you save Y.**

We think this idea has merit. As more and more people start using password managers and password generators, FusionAuth could dynamically scale back its CPU/GPU utilization.

If you'd like to discuss on this feature, comment below or visit the FusionAuth GitHub issue for it and upvote or comment. **NEED TO MAKE GITHUB ISSUE to link to**
