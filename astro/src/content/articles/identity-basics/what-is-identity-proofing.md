---
title: What Is Identity Proofing? | Identity Verification Explained | FusionAuth
description: Learn and how identity proofing helps verify a user's identity during onboarding. Understand common methods and its role in secure authentication systems.
author: Deborah Ruck
icon: /img/icons/identity-proofing.svg
darkIcon: /img/icons/identity-proofing-dark.svg
section: Identity Basics
date: 2021-10-05
dateModified: 2021-10-05
---

Identity theft is on the rise. In 2020, the [reported cases of identity theft](https://www.ftc.gov/reports/consumer-sentinel-network-data-book-2020) rose to 1,387,615, more than double the 650,572 cases reported in 2019. The COVID-19 pandemic accelerated the use of online transactions as businesses leveraged digital technologies to take advantage of new business opportunities. This resulted in the increase of sensitive information stored in the cloud and an elevated risk of identity theft. 

An effective identity proofing solution is more critical to your business than ever before. As companies and users engage in more online transactions and digital services, businesses must take greater measures to confirm a person is who they say they are. Identity proofing verifies and authenticates the identity of legitimate customers to prevent fraudulent users from accessing your data. It is your first line of defense against data breaches and theft. 

![The identity proofing process.](/img/articles/identity-proofing-process.png)

In this article, we’ll explain why identity proofing is important and look at how it works. 

## The Importance of Identity Proofing 

Identity proofing is crucial for organizations that want to protect themselves and their users from security threats. According to [Javelin Strategy & Research’s 2020 Identity Fraud Study](https://www.javelinstrategy.com/coverage-area/2020-identity-fraud-study-genesis-identity-fraud-crisis), the total cost of identity fraud reached almost $17 billion (US)in 2019. This is the combined cost of compromised data, lost resources, and fines for privacy regulation breaches per the General Data Protection Regulation (GDPR) in the EU and the California Consumer Privacy Act (CCPA) in the US. 

Even large organizations like Facebook and Marriott aren’t immune. Both organizations suffered [recent data breaches](https://edition.cnn.com/2019/07/30/tech/biggest-hacks-in-history/index.html) that compromised hundreds of millions of accounts. 

The size of your business and the type of data you manage will factor into the type and levels of identity proofing you implement. The first step in deciding on an identity proofing solution is to understand your security risk posture.

### Understanding Your Risk Posture

Your security risk posture is the overall status of the security controls and mechanisms in place to protect your organization and its users from security breaches and data loss. This includes the strategies employed to protect software, hardware, networks, services, and information. 

Security posture is the measure of several factors including the controls and processes in place to prevent cyberattacks, the level of visibility over the organization’s assets and attack surface, the level of automation in the organization’s security program, and the organization’s ability to detect, contain, and remediate attacks and react and recover from security events.

The level of security you need will determine the identity proofing solution you implement. Organizations that don’t handle extremely sensitive data may simply need to confirm identity and ensure that it isn’t fraudulent, while banks and other financial institutions need greater assurance that only verified trusted users can access the organization’s applications and systems. Once you understand where your organization is most vulnerable, you can establish a plan to create a more secure environment.

### Identity Fraud and What It Costs

Identity fraud covers a wide range of criminal acts, including the attempt to gain access to the personally identifiable information (PII) of another person, such as their Social Security number, bank, or credit card information, then use their identity to commit fraud. 

Javelin’s [2021 Identity Fraud Study](https://www.javelinstrategy.com/press-release/total-identity-fraud-losses-soar-56-billion-2020) shows that identity fraud cost American consumers $56 billion in 2020. Forty million consumers fell victim to identity fraud, most of it from identity theft via phishing scams using email, voice calls, and text messages.

The most common form of fraud is for financial gain, where criminals make unauthorized transactions such as online purchases or credit card or loan applications, leaving a trail of damage to the victim’s credit reports, finances, and state of mind. Victims not only lose money directly from financial accounts but can be held liable for fraudulent charges and delinquent payments, resulting in indirect financial loss as well. Legal fees resulting from having to prove innocence in a fraudulent case or to regain identity can add to the financial burden.

### Improved Security and Benefits

It’s not a matter of if, but when a cybersecurity attack will occur. Identity proofing provides significant security benefits for your business and your customers: 

*Improved organizational efficiency*: Identity proofing reduces cyberattacks, allowing the organization to operate more efficiently. Instead of dealing with the aftereffects of a data breach, organizations can focus on revenue-generating activities. 

*Greater compliance*: Identity proofing allows you to reduce costs by using current and emerging technologies and industry best practices. These technologies make it easier to comply with regulations for GDPR, HIPAA, and payment card industry (PCI) standards, avoiding potential fines and penalties.  

*Increased customer confidence*: A company can lose business and customer confidence based on real or perceived security challenges.  With security measures like identity proofing in place, customers view the brand as trustworthy—one that cares about the security of their personal data. 

## How Identity Proofing Works

Identity proofing provides several ways to verify a user’s identity, such as physical documentation, credit history, and biometric information. Let’s see how some of these methods work.  

### Identity Document Verification

Identity document verification can be a physical process or done digitally. Physical identity proofing occurs when a customer performs a face-to-face transaction at a company location and presents identity documents such as an Id card, passport, or driver’s license. A company employee compares the photograph on the documents with the person standing in front of them and validates the information supplied against an authoritative source, such as government or credit records. Once identity is established, documents are copied and physically stored. 

Businesses needing to establish real-world identity with online users can verify documentation using a scan of a valid passport or Id along with other verifiable personal information, like an address or phone number. To ensure that scanned documents aren’t stolen, businesses sometimes ask users to submit a selfie of themselves holding the documents. 

### Knowledge-Based Authentication

Knowledge-based authentication (KBA) verifies identity by asking a person a set of security questions with answers only that person should know, e.g., “What is the middle name of your oldest sibling?” or “What is your father’s middle name?” Questions cannot be answered with a yes or no, and sometimes there is a time limit on answering the question.

There are two types of KBA: static and dynamic. Static KBA asks the user questions from a set repository of questions in a company’s database. Both questions and answers are stored in the database and presented to the user when identity needs to be confirmed, such as for a  password reset. Static KBA is part of [multi-factor authentication or MFA](https://searchsecurity.techtarget.com/definition/multifactor-authentication-MFA) and satisfies the “something you know” factor, but the answers to these questions can be easily discovered through social engineering. 

Dynamic KBA uses security questions automatically generated from a variety of different data sources, including the user’s credit history and public records. This is information only a legitimate user could give but is more difficult for a hacker to find out. 

### Out-of-Band Proofing

Out-of-band (OOB) authentication uses another channel besides an online process to authenticate an individual. OOB is commonly used for online banking to perform certain processes, such as logging in or changing the account to add a payee or change a password. When performing these types of actions, an authentication code is sent via SMS to the mobile device of the account holder.

OOB, also a form of MFA, increases security by requiring the person to have access to an external account or  another device in their possession. Using a separate channel makes it more difficult for an attacker to circumvent or intercept the proofing process  because the attacker would have to access and compromise two separate communication mechanisms.

### Biometric Verification and Passkeys

Biometric verification is used to identify individuals based on unique physical characteristics such as fingerprints, voiceprints, retina scans, signature comparisons, and DNA. Once only common in the most stringent security settings, these types of verification are becoming regular features in the latest smartphones and digital devices. As [passkeys](/tech-papers/why-passkeys-improve-user-security-how-to-implement-them) see wider adoption, the use of biometrics continues to rise as well. 

Biometrics give greater assurance that a person is who they say they are. The verification is used in several industries, including healthcare to identify patients, law enforcement to track people in the judicial system, and government entities for voter registration. 

Biometrics are considered more secure than other forms of identification because they are unique to the individual and harder to forge or steal. They’re highly convenient after initial setup, requiring no passwords and no questions to be answered. 

## Conclusion

With the rise in online fraud and identity theft, the security of your business is always under threat. Understanding your risk posture and implementing an effective identity proofing solution can improve your organization’s security to prevent fraudulent users from accessing your sensitive data and the costs associated with a data breach. 

Identity proofing can be implemented in several ways to help you authenticate users, including document scanning, knowledge-based authentication, out-of-band authentication, and biometrics. 

