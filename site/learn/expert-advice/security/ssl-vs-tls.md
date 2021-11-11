In this tiny byte, you’ll learn the difference between SSL and TLS, when they are used, and why you should use them.

*What are SSL and TLS?*

SSL (secure socket layer) and TLS (transport layer security) are a set of protocols that are used when a computer is communicating with an external server to get information.  The protocols ensure secure communication over the web by encrypting and securing any information sent over the world wide web.   

*So what’s the difference between the two?*

There isn’t a difference, actually.  TLS actually replaced SSL, but since SSL has been around for longer, people still refer to TLS as SSL. Confused yet?  Read on!

*When do you use SSL? I mean TLS, I mean..wait, what?*

You use TLS, formally known as SSL, mainly when you send data between a client and a server.

*Ok, I get it. TLS used to be SSL. But how does it work?*

SSL and TLS work by establishing a handshake protocol between a client and a server.  Once that handshake protocol is established, the client and server decide on a secret key that will be used to encrypt and decrypt all communications between them.

In this way, an eavesdropper cannot read or manipulate any of the data sent between the client and the server, they can only see the endpoints.

Now, the overall process of this handshake protocol looks like this:


1. The client sends a “clienthello” message to the server.  This message includes information like SSL/TLS version, and the cryptographic algorithm and data compression methods that the client can support.  
2. The server responds with a “serverhello” message. This message includes cryptographic algorithms that the server has chosen from the list provided by the client. In this way, an algorithm that both sides support is chosen. The server also sends a session Id, its digital certificate, and its public key.
3. The client contacts the server’s certificate authority to verify the validity of the server’s certificate. This confirms the authenticity of the web server.
4. A secret key is exchanged.  The client sends a shared secret key to be used between the client and the server.  The secret key is encrypted with the server’s public key.
5. The client sends a “finished” message to the server, which is encrypted with the secret key.  This confirms that the client section of the handshake protocol is completed.
6. The server responds with a “finished” message, encrypted with the secret key. This indicates the server part of the handshake protocol is finished.  
7. The client and server now exchange messages that are symmetrically encrypted with the shared secret key.  

Tl;dr, the entire purpose of the handshake is to verify the validity of the server, as well as securely exchange a shared secret key, which is used to encrypt and decrypt messages sent between the client and the server.

*Why should I care?*

Imagine you are sending a very important message to someone through the mail, that if it was intercepted and read along the way, would have disastrous consequences for your life.  You would need some way of coding the message so if someone finds it, they can’t understand it (encryption) and putting it in an envelope so that the message is secure (securing the communication).  In the same way, information sent over the internet is assumed to need encryption and security, because all kinds of data needs to be sent over the web: credit card numbers, secret love notes, health information, you name it. It all needs to be encrypted and secured, and the way that happens currently is with SSL/TLS.
