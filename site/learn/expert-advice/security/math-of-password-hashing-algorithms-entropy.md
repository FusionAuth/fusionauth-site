---
layout: advice
title: "The Math of Password Hashing Algorithms and Entropy"
description: "Long passwords and one-way password hashing are standard strategies used to increase security and protect your user's passwords. Let's take a look at how they work and some new ideas to improve it."
author: Brian Pontarelli
header_dark: true
image: advice/save-a-cpu-article.png
category: Security
related:
- title: Guide to User Data Security
  url: /learn/expert-advice/security/guide-to-user-data-security
- title: Password Compliance Checklist
  url: /learn/expert-advice/security/password-security-compliance-checklist
---

Here's the reality, billions of credentials have been leaked or stolen and are now easily downloaded online by anyone. Many of these databases of identities include passwords in plain text, while others are one-way hashed. One-way hashing is better (we'll get to why in a second), but it is only as secure as is mathematically feasible. Let's take a look at one-way hashing algorithms and how computers handle them.

## Hashing

A hash by definition is a function that can map data of an arbitrary size to data of a fixed size. SHA2 is a hashing algorithm that uses various bit-wise operations on any number of bytes to produce a fixed sized hash. For example, the SHA-256 algorithm produces a 256 bit result. The algorithm was designed specifically so that going from a hash back to the original bytes is infeasible. Developers use an SHA2 hash so that instead of storing a plain text password, they instead only store the hash. When a user is authenticated, the plain text password they type into the login form is hashed, and because the algorithm will always produce the same hash result given the same input, comparing this hash to the hash in the database tells us the password is correct.

## Cracking Passwords

While one-way hashing means we aren't storing plain text passwords, it is still possible to determine the original plain text password from a hash. Next, we'll outline the two most common approaches of reversing a hash.

### Lookup Tables

The first is called a lookup table, or sometimes referred to as a rainbow table. This method builds a massive lookup table that maps hashes to plain text passwords. The table is built by simply hashing every possible password combination and storing it in some type of database or data-structure that allows for quick lookups.

Here's an example of a lookup table for SHA2 hashed passwords:

```yaml
sha2_hash                                                          password
-----------------------------------------------------------------------------------------
e150a1ec81e8e93e1eae2c3a77e66ec6dbd6a3b460f89c1d08aecf422ee401a0   123456
e5d316bfd85b606e728017e9b6532e400f5f03e49a61bc9ef59ec2233e41015a   broncosfan123
561acac680e997e22634a224df2c0931cf80b9f7c60102a4e12e059f87558232   Letmein
bdc511ea9b88c90b75c3ebeeb990e4e7c813ee0d5716ab0431aa94e9d2b018d6   newenglandclamchowder
9515e65f46cb737cd8c191db2fd80bbd05686e5992b241e8ad7727510b7142e6   opensesame
6b3a55e0261b0304143f805a24924d0c1c44524821305f31d9277843b8a10f4e   password
c194ead20ad91d30c927a34e8c800cb9a13a7e445a3ffc77fed14176edc3c08f   xboxjunkie42
```

Using a lookup table, all the attacker needs to know is the SHA2 hash of the password and they can see if it exists in the table. For example, let's assume for a moment that Netflix stores your password using an SHA2 hash. If Netflix is breached, their user database is likely now available to anyone with a good internet connection and a torrent client. Even a mediocre hacker now only needs to lookup the SHA2 hash assoicated with your Netflix account to see if it exists in their lookup table. This will reveal nearly instantly what your plain text password is for Netflix. Now, this hacker can log in to your Netflix account and binge watch all four seasons of Fuller House ("how rude!"). And he can also try this password on Hulu and HBO Go to see if you used the same email address and password for those accounts as well.

{% include _image.html src="/assets/img/blogs/salt.png" alt="Salt" class="float-right ml-3" style="width: 250px;" figure=false %}

The best way to protect against this type of attack is to use what is called a **salt**. A salt is simply a bunch of random characters that you prepend to the password before it is hashed. Each password should have a different salt, which means that a lookup table is unlikely to have an entry for the combination of the salt and the password. This makes salts an ideal defense against lookup tables.

Here's an example of a salt and the resulting combination of the password and the salt which is then hashed:

```kotlin
// Bad, no salt. Very bland.
sha2("password") // 6b3a55e0261b0304143f805a24924d0c1c44524821305f31d9277843b8a10f4e

// Better, add a salt.
salt = ";L'-2!;+=#/5B)40/o-okOw8//3a"
toHash = ";L'-2!;+=#/5B)40/o-okOw8//3apassword"
sha2(toHash) // f534e6bf84a638112e07e69861927ab624c0217c0655e4d3be07659bcf6c1c07
```

Now that we have added the salt, the "password" that we actually generated the hash from was the String `;L'-2!;+=#/5B)40/o-okOw8//3apassword`. This String is long, complex and contains a lot of random characters. Therefore, it is nearly impossible that the hacker that created the lookup table would have generated the hash for the String `;L'-2!;+=#/5B)40/o-okOw8//3apassword`.

### Brute Force

{% include _image.html src="/assets/img/blogs/hulk.png" alt="Brute Force" class="float-left mb-3 mr-3" style="width: 150px;" figure=false %}

The second method that attackers use to crack passwords is called brute force cracking. This means that the attacker writes a computer program that can generate all possible combinations of characters that can be used for a password and then computes the hash for each combination. This program can also take a salt if the password was hashed with a salt. The attacker then runs the program until it generates a hash that is the same as the hash from the database. Here's a simple Java program for cracking passwords. I left out some detail to keep the code short (such as all the possible password characters), but you get the idea.

<br>
<br>

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
        String sha2Hex = DigestUtils.sha2Hex(password).toUpperCase();
        if (sha2Hex.equals(hashFromDatabase)) {
          System.out.println("plain text password is [" + password + "]");
          System.exit(0);
        }
      }
    }
  }
}
```

This program will generate all the possible passwords with lengths between 6 and 8 characters and then hash each one until it finds a match. This type of brute-force hacking takes time because of the number of possible combinations.

## Password complexity vs. computational power

Let's bust out our TI-85 calculators and see if we can figure out how long this program will take to run. For this example we will assume the passwords can only contain ASCII characters (uppercase, lowercase, digits, punctuation). This set is roughly 100 characters (I rounded up to make the math easier to read). If we know that there are at least 6 characters and at most 8 characters in a password, then all the possible combinations can be represented by this expression:

```
possiblePasswords = 100^8 + 100^7 + 100^6
```

The result of this expression is equal to `10,101,000,000,000,000`. This is quite a large number, north of 10 quadrillion to be a little more precise, but what does it actually mean when it comes to my program running? This depends on the speed of the computer I'm running on and how long it takes my computer to execute the SHA2 algorithm. The algorithm is the key component here because the rest of the program is extremely fast at just creating the passwords.

Here's where things get dicey. If you run a quick Google search for ["fastest bitcoin rig"](http://lmgtfy.com/?q=fastest+bitcoin+rig) you'll see that these machines are rated in terms of the number of hashes they can perform per second. The bigger ones can be rated as high as `44 TH/s`. That means it can generate 44 tera-hashes per second or `44,000,000,000,000`.

Now, if we divide the total number of passwords by the number of hashes we can generate per second, we are left with the total time it takes a Bitcoin rig to generate the hashes for all possible passwords. In our example above, this equates to:

```
bitcoinRig = 4.4e13
possiblePasswords = 100^8 + 100^7 + 100^6 = 1.0101e16

numberOfSeconds = possiblePasswords / bitcoinRig = ~230
numberOfMinutes = numberOfSeconds / 60 = ~4
```

This means that using this example Bitcoin rig, we could generate all the hashes for a password between 6 and 8 characters in length in roughly 4 minutes. Feeling nervous yet? Let's add one additional character and see long it takes to hash all possible passwords between 6 and 9 characters.

```
bitcoinRig = 4.4e13
possiblePasswords = 100^9 + 100^8 + 100^7 + 100^6 = 1.010101E18

numberOfSeconds = possiblePasswords / bitcoinRig = 22,956
numberOfMinutes = numberOfSeconds / 60 = ~383
numberOfHours = numberOfMinutes / 60 = ~6
```

By adding one additional character to the potential length of the password we increased the total compute time from 4 minutes to 6 hours. This is nearing a 100x increase in computational time to use the brute force strategy. You probably can see where this is going—to defeat the brute force strategy, you simply need to make it improbable to calculate all possible password combinations.


Let's get crazy and make a jump to 16 characters:

```
bitcoinRig = 4.4e13
possiblePasswords = 100^16 + 100^15 ... 100^7 + 100^6 = 1e32

numberOfSeconds = possiblePasswords / bitcoinRig = 2.27e18
numberOfMinutes = numberOfSeconds / 60 = 3.78e16
numberOfHours = numberOfMinutes / 60 = 630,000,000,000,000 or 630 trillion
numberOfDays = numberOfHours / 24 = 26,250,000,000,000 or 26.25 trillion days
numberOfYears = numberOfDays / 365 = 71,917,808,219 or 71.9 billion years
```

To boil down our results, if we take these expressions and simplify them, we can build an equation that solves for any length password.

```
numberOfSeconds = 100^lengthOfPassword / computeSpeed
```

This equation shows that as the password length increases, the number of seconds to brute-force attack the password also increases since the computer's speed to execute the hashing algorithm is a fixed divisor. The increase in password complexity (length and possible characters) is called **entropy**. As the entropy increases, the time required to brute-force attack a password also increases.

## What does all this math mean?

Great question. Here's the answer:

{:.tight}
> If you allow the use of short passwords, which makes them easy to remember, you need to decrease the value of `computeSpeed` in order to maintain a level of security.
>
> If you require longer randomized passwords, such as those created by a password generator, you don't need to change anything because the value of `computeSpeed` becomes much less relevant.

Let's assume we are going to allow users to select short passwords. This means that we need to decrease the `computeSpeed` value which means we need to slow down the computation of the hash. How do we accomplish that?

The way that the security industry has been solving this problem is by continuing to increase the algorithmic complexity, which in turn causes the computer to spend more time generating one-way hashes. Examples of these algorithms include BCrypt, SCrypt, PBKDF2, and others. These algorithms are specifically designed to cause the CPU/GPU of the computer to take an excessive amount of time generating a single hash.

If we can reduce the `computeSpeed` value from `4.4e13` to something much smaller such as `1,000`, our compute time for passwords between 6 and 8 characters long become much better. In other words, if we can slow down the computer so it takes longer for each hash it has to generate, we can increase the length of time it will take to calculate all of the possible passwords.

```
computeSpeed = 1e3
possiblePasswords = 100^8 + 100^7 + 100^6 = 1.0101e16

numberOfSeconds = possiblePasswords / computeSpeed = 10,101,000,000,000 or 10.1 trillion
numberOfMinutes = numberOfSeconds / 60 = 168,350,000,000 or 168.35 billion
numberOfHours = numberOfMinutes / 60 = 2,805,833,333 or 2.8 billion
numberOfDays = numberOfHours / 24 = 116,909,722 or 116.9 million
numberOfYears = numberOfDays / 365 = 320,300
```

Not bad. By slowing down the hash computation, we have increased the time from 4 minutes using our Bitcoin rig to 320,300 years. In this comparision you can see the practical difference between using SHA2 and BCrypt. BCrypt is purpose built to be extremely slow in comparison to SHA2 and other more traditional hashing algorithms.

And here lies the debate that the security industry has been having for years:

**Do we allow users to use short passwords and put the burden on the computer to generate hashes as slowly as reasonably still secure? Or do we force users to use long passwords and just use a fast hashing algorithm like SHA2 or SHA512?**

[Some in the industry have argued that enough is enough with consuming massive amounts of CPU and GPU cycles simply computing hashes for passwords](https://blog.benpri.me/blog/2019/01/13/why-you-shouldnt-be-using-bcrypt-and-scrypt/). By forcing users to use long passwords, we get back a ton of computing power and can reduce costs by shutting off the 42 servers we have to run to keep up with login volumes.

Others claim that this is a bad idea for a variety of reasons including:

* Humans don't like change
* The risk of simple algorithms like SHA2 is still too high
* Simple algorithms might be currently vulnerable to attacks or new attacks might be discovered in the future

At the time of this writing, there are still numerous simple algorithms that have not been attacked, meaning that no one has figured out a way to reduce the need to compute every possible hash. Therefore, it is still a safe assertion that using a simple algorithm on a long password is secure. This leaves the only reason not to force users to use long passwords is for the first reason mentioned above, "humans don't like change". In reality, many users will change and some will already be using long passwords.

## Our new idea: Let's split the difference

As the provider of an identity management solution, we understand both sides of this debate. We also have a strong desire to maintain security while reducing the cost to hash passwords at scale. Here is an idea we've been debating and hacking on at the office. What if we dynamically changed the algorithm that FusionAuth used to hash passwords based on the length (and possibly complexity) of the password? Could this reduce the average CPU/GPU consumption by enough to make a difference?

Here's some super simple example code for an algorithm that selects the hashing scheme based on password length alone:

```java
PasswordHasher hasher;
if (password.length() >= 14) {
  hasher = new SHA512PasswordHasher();
} else {
  hasher = new BCryptPasswordHasher();
}

String hashedPassword = hasher.hash(password);
```

Of course this is just the tip of the iceberg, we could perform a lot of analysis on a password and calculate the entropy based upon other factors. This would allow us to select a hash that maintains a high level of security while reducing the CPU cost as much as possible.

Let's just re-iterate our math from above one more time.

```text
// Passwords of length 16 using SHA2
totalYears to generate all passwords = 71,917,808,219 or 71.9 billion years

// Passwords of length 8 using BCrypt
totalYears to generate all passwords = 320,300 years
```

The interesting fact here is that the length of the password dictates the level of security more than the algorithm.

We think this idea has merit. As more people start using password managers with password generators, or letting the browser generate a unique password on your behalf, we could dynamically select a hash that could significantly reduce the CPU/GPU utilization.

Food for thought, we can hash approximately 20 passwords per second on a Amazon EC2 instance of type `t2.medium` using PBKDF2. If you're Pokémon Go trying to authenticate half of the known world so they can catch Charizard, how many EC2 instances do you think it would require to handle their load? There is a real business case for changing the way the industry thinks about secure password hashing.

Stayed tuned for an upcoming blog post where we walk through the real world performance numbers for 100 million users with passwords of varying length.

FusionAuth defaults to `PBKDF2` with `24,000` iterations as the default password hashing scheme. BCrypt and several other algorithms are supported to enable password migrations. We continue to research new techniques to reduce CPU overhead while maintaining the highest standards in secure password storage.

If you'd like to discuss on this feature, comment below or visit the FusionAuth GitHub issue for it and upvote or comment. [Feature: Entropy based password hashing](https://github.com/FusionAuth/fusionauth-issues/issues/85)

{% include _advice-get-started.html intro="If you are looking for a solution lets you manage and configure password hashing algorithms, FusionAuth has you covered." %}