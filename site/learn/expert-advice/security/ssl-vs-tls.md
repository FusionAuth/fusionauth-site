---
layout: advice
title: SSL vs. TLS
description: In this article, you’ll learn the difference between SSL and TLS, how they are used, and why you should use them.
author: Akira Brand
image: advice/steps-secure-auth-system/expert-advice-ten-steps-to-secure-your-authentication-system-header-image.png
category: Security
date: 2021-11-12
dateModified: 2021-11-12
---

In this blog, you’ll learn the difference between SSL and TLS, when they are used, and why you should use them.

***Why should you care?***

Imagine you are sending a very important message to someone through the mail, that if it was intercepted and read along the way, would have disastrous consequences for your life.  You would need some way of coding the message so if someone finds it, they can’t understand it (encryption) and putting it in an envelope so that the message is secure (securing the communication).  In the same way, information sent over the internet is assumed to need encryption and security, because all kinds of data needs to be sent over the web: credit card numbers, secret love notes, health information, you name it. It all needs to be encrypted and secured, and the way that happens currently is with SSL/TLS.

***What are SSL and TLS?***

SSL (secure socket layer) and TLS (transport layer security) are a set of protocols that are used when a computer is communicating with an external server to get information. The protocols ensure secure communication over the web by encrypting and securing any information sent with the HTTP protocol.   

***So what’s the difference between the two?***

There isn’t a functional difference, actually. TLS replaced SSL in 1999, but since SSL has been around for longer, people still refer to TLS as SSL. Confused yet? Read on!

***When do you use SSL? I mean TLS, I mean..wait, what?***

You use TLS, formally known as SSL, mainly when you send data between a client and a server.

***Ok, I get it. TLS replaced SSL in the late 90s. But how does it work?***

SSL and TLS work by establishing a handshake protocol between a client and a server. Once that handshake protocol is established, the client and server decide on a secret key that will be used to encrypt and decrypt all communications between them.

In this way, an eavesdropper cannot read or manipulate any of the data sent between the client and the server, they can only see the endpoints.

Now, the overall process of this handshake protocol looks like this:


1. The client sends a “clienthello” message to the server. This message includes information like SSL/TLS version, and the cryptographic algorithm and data compression methods that the client can support.  
2. The server responds with a “serverhello” message. This message includes cryptographic algorithms that the server has chosen from the list provided by the client. In this way, an algorithm that both sides support is chosen. The server also sends a session Id, its digital certificate, and its public key.
3. The client verifies the validity of the server’s certificate with the entity that issued it. It does so by first checking to ensure that the server's certificate is not expired and the domain name or IP address on the certificate matches the server's information. Then, the client attempts to verify that the server's certificate has been signed by the certificate authority who authorized it. It does so by verifying that the signature on the certificate has been signed by the certificate authority's public key.
4. A secret key is exchanged. The client sends a shared secret key to be used between the client and the server. The secret key is encrypted with the server’s public key.
5. If required, the server verifies the client's certificate.
6. The client sends a “finished” message to the server, which is encrypted with the secret key. This confirms that the client section of the handshake protocol is completed.
7. The server responds with a “finished” message, encrypted with the secret key. This indicates the server part of the handshake protocol is finished.  
8. The client and server now exchange messages that are symmetrically encrypted with the shared secret key.

{% plantuml source: _diagrams/learn/expert-advice/ssl-vs-tls/ssl-handshake.plantuml, alt: "The SSL/TLS handshake protocol." %}


***What is a Certificate Authority?***

A certificate authority (CA) is a trusted organization that verifies websites. The reason for that is so that you can know that a website is actually the website it claims to be, instead of a imposter. A certificate authority acts almost like a passport office, for a small fee, a certificate authority will verify your website and issue a digital certificate, which tan then be examined by other entities to verify the validity of your site, such as in the handshake protocol.

***In summary...***

In a nutshell, SSL was replaced by TLS in the late 90's. The way SSL/TLS works is through a "handshake" protocol, and the entire purpose of the handshake is to encrypt and decrypt messages sent between the client and the server.
