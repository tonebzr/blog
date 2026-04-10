---
title: "Module 21 — Public Key Cryptography"
description: "Comprehensive study guide covering symmetric/asymmetric encryption, cryptographic hashing, OpenSSL operations, password security, protocol analysis (Telnet vs SSH), and PKI/Certificate Authority systems."
order: 21
---


> **Module Objective:** Explain how the Public Key Infrastructure (PKI) supports network security.



## Securing Communications — The CIA Triad

### Module Overview

Organizations must secure data both at rest and in transit, including internal traffic, branch-site links, and partner connections. Cryptography provides the foundational mechanisms to achieve this. The four **elements of secure communications** are:

| Element | Definition | Cryptographic Mechanism |
|---------|-----------|------------------------|
| **Data Integrity** | Guarantees the message was not altered in transit | SHA-2, SHA-3 hash functions |
| **Origin Authentication** | Guarantees the message genuinely comes from the stated sender | HMAC (Hash-based Message Authentication Code) |
| **Data Confidentiality** | Guarantees only authorized parties can read the message | Symmetric (AES, 3DES) and Asymmetric (RSA, DH) algorithms |
| **Data Non-Repudiation** | Guarantees the sender cannot later deny having sent the message | Digital Signatures (DSA, RSA, ECDSA) |

> **Historical context:** Secret codes predate modern computing by millennia. Ancient Greeks used a *scytale*, Romans used the *Caesar cipher*, and the French employed the *Vigenère cipher*. Modern networks automate this through protocols like TLS and VPNs.

### Core Concepts & Definitions

- **Plaintext**: The original, human-readable message before encryption.
- **Ciphertext**: The scrambled output produced by an encryption algorithm; unreadable without the key.
- **Key**: A piece of data that controls the encryption/decryption process.
- **Symmetric Encryption**: One shared key is used for both encryption and decryption.
- **Asymmetric Encryption**: A mathematically linked key pair (public key encrypts, private key decrypts).
- **VPN (Virtual Private Network)**: Commonly used to automate the encryption and decryption of traffic between endpoints.

### Exam Quick Reference

| Question | Answer |
|----------|--------|
| Which pillar does MD5/SHA address? | **Integrity** |
| Which pillar does HMAC address? | **Integrity + Authentication** |
| Which pillar does AES address? | **Confidentiality** |
| Which pillar does a digital signature address? | **Non-repudiation** |

---

## Cryptographic Hashing & Data Integrity

### Module Overview

**Integrity** — one of the three pillars of the CIA triad — is enforced through **cryptographic hash functions**. A hash function maps an input of arbitrary length to a **fixed-length output** (the *digest* or *fingerprint*). Hashing is a **one-way operation**: given a hash value `h`, it is computationally infeasible to reconstruct the original input `x` such that `h = H(x)`.

> **Analogy:** Grinding coffee beans is an excellent analogy. It is trivial to grind beans into powder, but practically impossible to reassemble the original beans from the grounds.

### Core Concepts & Definitions

- **Hash Function `H(x)`**: A deterministic mathematical function producing a fixed-size digest from variable-length input.
- **Digest / Fingerprint**: The fixed-length output of a hash function; also called a *message digest* or *digital fingerprint*.
- **Avalanche Effect**: A single-bit change in the input causes an entirely different — and unpredictable — hash output.
- **Collision Resistance**: The guarantee that no two distinct inputs produce the same hash value.
- **MD5 (Message Digest 5)**: 128-bit hash; widely deployed but **cryptographically broken** due to collision vulnerabilities. Avoid in new designs.
- **SHA-1**: 160-bit hash; **deprecated** for digital signatures.
- **SHA-2 (SHA-256 / SHA-512)**: Current recommended standard for integrity verification and TLS.
- **SHA-3**: Newest standard; uses a fundamentally different internal construction (Sponge function). The recommended future replacement for SHA-2.
- **HMAC (Hash-based Message Authentication Code)**: Adds a **secret key** to the hash function, providing both **integrity** and **authentication** simultaneously.

### Properties of a Cryptographic Hash Function

| Property | Description |
|----------|-------------|
| Variable-length input | Any size of data can be hashed |
| Fixed-length output | The digest is always the same size regardless of input |
| Efficient computation | Easy to calculate `H(x)` for any `x` |
| One-way / Pre-image resistant | Computationally infeasible to reverse `H(x)` |
| Collision-free | Two different inputs will not produce the same hash |

### Technical Taxonomy — Hash Algorithm Comparison

| Algorithm | Digest Length | Collision Resistance | Status | Typical Use Case |
|-----------|:---:|:---:|--------|-----------------|
| **MD5** | 128 bits | ❌ Low | Broken | Non-critical checksums only |
| **SHA-1** | 160 bits | ❌ Low | Deprecated | Legacy systems |
| **SHA-256** | 256 bits | ✅ High | **Recommended** | Software signing, TLS, file integrity |
| **SHA-512** | 512 bits | ✅ Very High | **Recommended** | High-security requirements |
| **SHA-3** | Variable | ✅ Very High | Next-gen | Future replacement for SHA-2 |

### Operational Analysis — Hashing with OpenSSL

The **CyberOps Workstation VM** provides both OpenSSL and native Linux utilities for hashing.

```bash
# Generate a SHA-256 hash using OpenSSL
[analyst@secOps lab.support.files]$ openssl sha256 letter_to_grandma.txt
SHA256(letter_to_grandma.txt)= deff9c9bbece44866796ff6cf21f2612fbb77aa1b2515a900bafb29be118080b

# After changing a single character ('m' → 'p'), the hash changes entirely (Avalanche Effect)
[analyst@secOps lab.support.files]$ openssl sha256 letter_to_grandma.txt
SHA256(letter_to_grandma.txt)= 43302c4500b7c4b8e574ba27a59d83267812493c029fd054c9242f3ac73100bc

# Generate SHA-512 hash using OpenSSL
[analyst@secOps lab.support.files]$ openssl sha512 letter_to_grandma.txt
SHA512(letter_to_grandma.txt)= 7c35db79a06aa30ae0f6de33f2322fd419560ee9af9cedeb6e251f2f1c4e99e0...

# Native Linux utilities (sha256sum / sha512sum)
[analyst@secOps lab.support.files]$ sha256sum sample.img
c56c4724c26eb0157963c0d62b76422116be31804a39c82fd44ddf0ca5013e6a  sample.img
```

**File Integrity Verification Workflow:**

```
[Vendor publishes file]
        │
        ▼
Vendor also publishes the expected SHA-256 hash (e.g., in sample.img_SHA256.sig)
        │
        ▼
[Analyst downloads file + .sig file]
        │
        ▼
sha256sum sample.img  ──→  compare output with .sig
        │
   ┌────┴────┐
 Match    No Match
   │          │
  ✅ OK    ❌ File tampered or corrupted
```

### Case Studies & Exam Specifics

> **Exam Focus — Integrity vs. Authentication:**
> - Plain hashing (SHA-256) → **Integrity only** (detects changes, but NOT who made them)
> - HMAC → **Integrity + Authentication** (because it also uses a secret key known only to sender/receiver)

> **Operational Note — Digital Forensics:** Hashing is mandatory to maintain the **chain of custody**. A forensic disk image must be hashed immediately upon acquisition; any subsequent mismatch proves tampering.

> **Exam Trap:** HMAC uses a **secret key** — it does NOT use RSA, SSL, or TLS. It adds authentication to integrity but does **not** provide confidentiality.

---

## Data Confidentiality: Symmetric Encryption

### Module Overview

**Confidentiality** ensures that only authorized parties can read a message. It is achieved through **encryption algorithms**, which come in two families: **symmetric** (shared key) and **asymmetric** (public/private key pair). This section covers symmetric encryption, the dominant approach for bulk data confidentiality.

### Core Concepts & Definitions

- **Symmetric Encryption**: A single **Pre-Shared Key (PSK)** is used for both encryption and decryption. Both parties must securely exchange the key in advance.
- **AES (Advanced Encryption Standard)**: FIPS 197-compliant block cipher; supports 128, 192, and 256-bit keys. The current gold standard.
- **3DES (Triple DES)**: Applies DES three times; 112 or 168-bit effective key length. **Deprecated** in most modern applications.
- **DES (Data Encryption Standard)**: 56-bit key; **broken** — vulnerable to brute-force.
- **SEAL (Software-Optimized Encryption Algorithm)**: A **stream cipher** using a 160-bit key; lower CPU overhead than software AES in some contexts.
- **Block Cipher**: Encrypts data in fixed-size blocks (e.g., AES operates on 128-bit blocks).
- **Stream Cipher**: Encrypts data one bit or byte at a time (e.g., SEAL, ChaCha20).
- **Base64 Encoding**: A binary-to-text scheme that represents binary data as ASCII. It is **NOT encryption** — it provides zero confidentiality. It is used to safely transport binary ciphertext over text-based protocols (e.g., email/SMTP).

### Technical Taxonomy — Symmetric Algorithm Comparison

| Algorithm | Cipher Type | Key Size (Bits) | Security Status | Primary Use Case |
|-----------|:-----------:|:---------------:|:---------------:|-----------------|
| **AES** | Block | 128 / 192 / 256 | ✅ Secure | WPA2/WPA3, VPN, TLS, disk encryption |
| **3DES** | Block | 112 or 168 | ⚠️ Deprecating | Legacy VPN hardware |
| **DES** | Block | 56 | ❌ Broken | Legacy systems only |
| **SEAL** | Stream | 160 | ✅ Niche | Software-optimized high-speed encryption |
| **ChaCha20** | Stream | 256 | ✅ Secure | TLS 1.3, mobile efficiency |

> **Exam Distinction:** SEAL is a **stream cipher**, NOT a block cipher. It uses a **160-bit** key, NOT 112-bit. It requires **less CPU** than software AES in constrained environments.

### Asymmetric Encryption — Quick Overview

While symmetric encryption handles **bulk confidentiality**, asymmetric encryption solves the **key exchange problem** and enables **authentication**.

| Property | Symmetric | Asymmetric |
|----------|-----------|-----------|
| Keys | 1 shared key | 2 keys (public + private) |
| Speed | Fast | Slow |
| Use case | Bulk data encryption | Key exchange, digital signatures |
| Examples | AES, 3DES, DES, SEAL | RSA, DH, ECC, DSA |
| Typical protocols | VPN data tunnels | IKE, SSL/TLS handshake, SSH, PGP |

**Key formulas for asymmetric encryption:**

```
Confidentiality:   Public Key (Encrypt)  + Private Key (Decrypt)
Authentication:    Private Key (Encrypt) + Public Key (Decrypt)
```

**Diffie-Hellman (DH)** is a special asymmetric algorithm that allows two parties to generate an **identical shared secret** over an insecure channel — without ever transmitting the secret itself. It is foundational to **IPsec VPNs** and **SSH** key exchange.

---

## OpenSSL Encryption & Decryption

### Module Overview

**OpenSSL** is the de facto open-source toolkit for TLS, SSL, and general-purpose cryptography. This module covers CLI-based **AES-256-CBC** encryption and decryption, examining both the workflow and the security limitations of manual key derivation.

> **Security Warning:** The method described below uses a **weak Key Derivation Function (KDF)** tied directly to a password. Security depends entirely on password strength. Additionally, this approach provides **no authenticated encryption** — ciphertext can be tampered with without the receiver detecting it. **Do not use for truly sensitive data.**

### Core Concepts & Definitions

- **AES-256-CBC**: AES in Cipher Block Chaining mode with a 256-bit key. Each plaintext block is XOR'd with the previous ciphertext block before encryption, ensuring identical plaintext blocks produce different ciphertext blocks.
- **Initialization Vector (IV)**: A random value used to ensure that the same plaintext + same key always produces unique ciphertext.
- **Salt**: Random data prepended to the password before key derivation, defending against **Rainbow Table** attacks.
- **KDF (Key Derivation Function)**: A function that derives a cryptographic key from a password. OpenSSL's legacy KDF is weak; modern alternatives include **PBKDF2** and **Argon2**.

### OpenSSL AES Parameters

| Flag | Function |
|------|----------|
| `aes-256-cbc` | Select AES-256 in CBC mode |
| `-in <file>` | Input file (plaintext to encrypt, or ciphertext to decrypt) |
| `-out <file>` | Output file |
| `-a` | Apply Base64 encoding to output (makes it ASCII-safe) |
| `-d` | Decrypt mode |
| `-salt` | Add random salt (enabled by default in recent versions) |

### Operational Analysis — Encryption & Decryption Workflow

**Step 1 — Encrypt a file (binary output):**
```bash
[analyst@secOps lab.support.files]$ openssl aes-256-cbc -in letter_to_grandma.txt -out message.enc
enter aes-256-cbc encryption password: ****
Verifying - enter aes-256-cbc encryption password: ****
# Output: raw binary — not human-readable
```

**Step 2 — Encrypt with Base64 encoding (ASCII-safe output):**
```bash
[analyst@secOps lab.support.files]$ openssl aes-256-cbc -a -in letter_to_grandma.txt -out message.enc
enter aes-256-cbc encryption password: ****
# Output: human-readable Base64 text, safe for email transmission
```

**Example Base64-encoded ciphertext:**
```
U2FsdGVkX19ApWyrn8RD5zNp0RPCuMGZ98wDc26u/vmj1zyDXobGQhm/dDRZasG7
rfnth5Q8NHValEw8vipKGM66dNFyyr9/hJUzCoqhFpRHgNn+Xs5+TOtz/QCPN1bi
```

**Step 3 — Decrypt the file:**
```bash
[analyst@secOps lab.support.files]$ openssl aes-256-cbc -a -d -in message.enc -out decrypted_letter.txt
enter aes-256-cbc decryption password: ****
# -a: decode Base64 first, then decrypt
# -d: decrypt mode
```

**Full Workflow Diagram:**

```
Plaintext ──[AES-256-CBC encrypt + password]──▶ Binary Ciphertext
                                                        │
                                               [Base64 encode -a]
                                                        │
                                                        ▼
                                               ASCII Ciphertext (message.enc)
                                                        │
                                      ┌─────────────────┘
                               [email / HTTP]
                                      │
                                      ▼
                               ASCII Ciphertext
                                      │
                               [Base64 decode -a]
                                      │
                                      ▼
                         Binary Ciphertext ──[AES-256-CBC decrypt + same password]──▶ Plaintext
```

> **Why use `-a`?** Base64 encoding ensures the encrypted file can be safely transmitted via protocols that only support text (e.g., SMTP email). Without it, raw binary may get corrupted.

> **What happens with the wrong key?** The decryption will either fail with an error or produce garbled output — the original plaintext is **not** recovered.

### Case Studies & Exam Specifics

> **Critical Risk:** OpenSSL legacy encryption uses a weak KDF. Modern standards require **PBKDF2** or **Argon2** for proper key derivation from passwords.

> **Exam Trap:** AES is symmetric. Both parties **must share the same key in advance**. This is the classic limitation of symmetric encryption: secure key exchange.

---

## Vulnerability Assessment of Encrypted Archives

### Module Overview

Even when data is encrypted, weak passwords can render that protection meaningless. This module analyses **fcrackzip**, a Linux brute-force utility for recovering passwords from encrypted ZIP archives, demonstrating the direct relationship between **password length/complexity** and **security**.

> **Scenario:** A CFO locked an important document in an encrypted ZIP file, then forgot the password. The analyst must recover it using the tool `fcrackzip`.

> **Ethical Note:** The same tools used for legitimate recovery are used by attackers. This module is for instructional purposes only.

### Core Concepts & Definitions

- **Brute-Force Attack**: Systematically trying every possible password combination until the correct one is found.
- **Dictionary Attack**: Trying passwords from a pre-compiled list of common words and patterns.
- **Entropy**: A measure of the unpredictability/randomness of a password. Higher entropy = greater resistance to brute-force.
- **Password Complexity**: Defined by the character set used (lowercase, uppercase, digits, special characters).

### Password Entropy & Recovery Time

| Password Length | Character Set | Complexity | Recovery Difficulty |
|:-:|---------|:-:|-----------------|
| 1–4 chars | Numeric | Very Low | ⚡ Near-instantaneous |
| 5–6 chars | Alphanumeric | Low | ⏱ Minutes to Hours |
| 8–10 chars | Alpha + Digits + Symbols | Medium | 📅 Days to Weeks (standard hardware) |
| 12+ chars | Full complex | High | 🔒 Years (computationally infeasible) |

### Operational Analysis — fcrackzip

**Create encrypted ZIP files with varying password lengths:**
```bash
[analyst@secOps Zip-Files]$ zip -e file-1.zip sample*    # 1-char password: B
[analyst@secOps Zip-Files]$ zip -e file-2.zip sample*    # 2-char password: R2
[analyst@secOps Zip-Files]$ zip -e file-3.zip sample*    # 3-char password: 0B1
[analyst@secOps Zip-Files]$ zip -e file-4.zip sample*    # 4-char password: Y0Da
[analyst@secOps Zip-Files]$ zip -e file-5.zip sample*    # 5-char password: C-3P0
```

**Recover passwords with fcrackzip:**
```bash
# Flags:
#  -v : Verbose (show candidate passwords)
#  -u : Use unzip to verify candidate passwords
#  -l : Password length range

[analyst@secOps Zip-Files]$ fcrackzip -vul 1-4 file-1.zip
PASSWORD FOUND!!!!: pw == B        # Near-instantaneous

[analyst@secOps Zip-Files]$ fcrackzip -vul 1-4 file-4.zip
PASSWORD FOUND!!!!: pw == Y0Da     # Noticeably slower than 1-char

[analyst@secOps Zip-Files]$ fcrackzip -vul 1-5 file-5.zip
PASSWORD FOUND!!!!: pw == C-3P0   # Longer still

[analyst@secOps Zip-Files]$ fcrackzip -vul 1-6 file-6.zip
# A 6-character password may take hours — but is still NOT secure for production
```

> **Key takeaway:** Each additional character in the password exponentially increases the search space. A 6-character password is still recoverable within a reasonable timeframe by an attacker with modern hardware.

### Case Studies & Exam Specifics

> **Exam Focus:** What makes a password secure?
> 1. **Length** (primary factor)
> 2. **Character set complexity** (lowercase + uppercase + digits + symbols)
>
> Industry recommendation: **minimum 12–16 characters** for sensitive data.

> **Operational Recommendation:** For portable media (USB drives), organizations should enforce **AES-256 full-disk encryption** (e.g., BitLocker, VeraCrypt) rather than ZIP-level encryption, which relies on weaker legacy algorithms.

---

## Protocol Analysis — Telnet vs. SSH

### Module Overview

Remote management protocols are prime targets for **network sniffing** and **Man-in-the-Middle (MitM)** attacks. This module uses **Wireshark** to capture loopback traffic and compare **Telnet (TCP/23)** and **SSH (TCP/22)** — demonstrating why unencrypted protocols must never be used for remote administration.

### Core Concepts & Definitions

- **Telnet**: A legacy terminal emulation protocol. Transmits **all data — including credentials — in plaintext**. No encryption, no integrity, no authentication protection.
- **SSH (Secure Shell)**: A cryptographic network protocol providing **strong authentication**, **integrity (HMAC)**, and **full session encryption**. Uses Diffie-Hellman for key exchange.
- **Wireshark Follow TCP Stream**: A feature that reconstructs a complete TCP session and displays all exchanged data at the application layer.
- **Packet Sniffing**: Capturing and reading network packets as they traverse a network segment.

### Protocol Comparison

| Feature | Telnet | SSH |
|---------|:------:|:---:|
| **TCP Port** | 23 | 22 |
| **Confidentiality** | ❌ Plaintext | ✅ Fully encrypted |
| **Integrity** | ❌ None | ✅ HMAC |
| **Authentication mechanism** | Password (cleartext) | Password, Public Key, MFA |
| **Key Exchange** | None | Diffie-Hellman |
| **Replay Attack Protection** | ❌ None | ✅ Yes |
| **Wireshark-visible credentials** | ✅ Fully visible | ❌ Not readable |

### Operational Analysis — Wireshark Capture

**Telnet — Credential exposure:**
```bash
# Start Wireshark capture on loopback (lo), then:
[analyst@secOps ~]$ telnet localhost
secOps login: analyst
Password: cyberops   # ← VISIBLE IN PLAINTEXT in Wireshark TCP stream
```
> In Wireshark → Right-click → Follow > TCP Stream:
> The **entire session** (username, password, commands) is visible in plaintext.
> Note: Characters may appear doubled due to Telnet's echo setting.

**SSH — Encrypted traffic:**
```bash
[analyst@secOps ~]$ ssh localhost
analyst@localhost's password:   # ← NOT visible in Wireshark
```
> In Wireshark → Follow > TCP Stream:
> Only the **key exchange negotiation** is partially visible (cipher suite names).
> All payload data is labelled **"Encrypted Packet"** — unreadable to an eavesdropper.

**SSH Key Exchange (visible in Wireshark before encryption is established):**
```
SSH-2.0-OpenSSH_8.2
curve25519-sha256, diffie-hellman-group16-sha512 ...
aes128-ctr, aes256-ctr, aes256-gcm@openssh.com ...
hmac-sha2-256, hmac-sha2-512 ...
```

### Case Studies & Exam Specifics

> **Exam Alert:** Why is SSH preferred over Telnet?
> SSH protects against **eavesdropping**, **replay attacks**, and **credential theft** by encrypting the **entire session** from the moment the connection is established.

> **Technical Detail:** SSH uses **Diffie-Hellman** for key exchange, allowing both parties to derive a shared secret over an insecure channel **without transmitting the secret itself**. This is the same mechanism used in IPsec VPNs.

---

## 21.4 Public Key Infrastructure (PKI) & Certificate Authorities

### Module Overview

**Public Key Infrastructure (PKI)** is the comprehensive framework that manages digital certificates, public-key encryption, and the trust relationships between entities on the internet. This module analyses the role of **Certificate Authorities (CAs)**, the **X.509 certificate format**, how browsers use **trusted CA stores**, and how **hashes (fingerprints)** can be used to detect **HTTPS Man-in-the-Middle (MitM)** attacks.

### Core Concepts & Definitions

- **Certificate Authority (CA)**: A trusted third-party entity that verifies identity and issues digitally signed certificates.
- **Root CA**: The top-level CA in a trust hierarchy. All certificates it signs (and those signed by its subordinates) are trusted by browsers.
- **Subordinate / Intermediate CA**: A CA whose certificate is signed by a Root CA. It can issue end-entity certificates on behalf of the Root CA, improving scalability and security.
- **X.509**: The IETF standard (defined in RFC 5280) specifying the format of PKI digital certificates.
- **Digital Certificate**: A data file binding a public key to an identity (domain, person, organization). Contains the issuer's digital signature.
- **Certificate Fingerprint (Thumbprint)**: A **hash** (SHA-1 or SHA-256) of the complete certificate. Used to uniquely identify and verify a certificate's integrity. Even a one-character change in the certificate will produce a completely different fingerprint.
- **RA (Registration Authority)**: An entity that verifies certificate requests and forwards them to the CA. The RA does **not** issue certificates — the CA does.
- **CRL (Certificate Revocation List)**: A published list of certificates that have been revoked before their expiration date.
- **OCSP (Online Certificate Status Protocol)**: An online protocol for real-time certificate validity checking (more efficient than CRL).
- **Code Signing**: The use of a digital certificate to verify the **integrity and authorship** of software. Ensures the code has not been modified since it was signed by the publisher.

### PKI Trust Hierarchy

```
Root CA (Self-signed)
    │
    ├── Intermediate CA 1
    │       ├── End-Entity Cert (website.com)
    │       └── End-Entity Cert (mail.org)
    │
    └── Intermediate CA 2
            ├── End-Entity Cert (bank.com)
            └── End-Entity Cert (shop.net)
```

> If a browser trusts the Root CA, it **automatically trusts all certificates** signed by any CA in the chain beneath it.

### Certificate Classification by Validation Level

| Class / Type | Validation Level | Trust Level | Typical Use Case |
|---|---|:---:|---|
| **Domain Validated (DV)** | Automated domain ownership check | Low | Blogs, personal sites |
| **Organization Validated (OV)** | Manual verification of legal existence | Medium | Corporate websites |
| **Extended Validation (EV)** | Rigorous background check | High | Banks, financial institutions |
| **Self-Signed** | Signed by the entity itself (no CA) | None/Internal | Lab environments, internal testing |

> **Class numbering system (0–5):** The higher the class number, the more rigorously the holder's identity was verified at issuance. A **class 5 certificate is more trustworthy** than a class 4. The lower the class number, the **less** trusted.

### Digital Signatures

Digital signatures provide three core security services simultaneously:

| Service | Description |
|---------|-------------|
| **Authenticity** | Proves the message came from the claimed sender |
| **Integrity** | Proves the message was not altered after signing |
| **Non-repudiation** | The sender cannot deny having signed the message |

**DSS (Digital Signature Standard) Algorithms:**
- **DSA** — Digital Signature Algorithm
- **RSA** — Rivest-Shamir-Adleman Algorithm
- **ECDSA** — Elliptic Curve Digital Signature Algorithm

> **Code Signing:** When software is code-signed, the end user can verify that:
> 1. The code is authentic and genuinely from the publisher.
> 2. The code has not been modified since it was signed.
> 3. The publisher undeniably published that specific version.

### Operational Analysis — Browser CA Store & Fingerprint Verification

#### Part 1: Inspecting the Browser CA Store

**Chrome:**
Settings → Privacy and Security → More → Manage Certificates → **Trusted Root Certification Authorities** tab

**Firefox:**
Menu → Preferences → Privacy & Security → View Certificates → **Authorities** tab

Any certificate signed by an entity **not** in the browser's CA store will trigger a security warning.

#### Part 2: Detecting HTTPS MitM with Fingerprint Comparison

**How an HTTPS proxy intercepts traffic:**

```
User ──[HTTPS]──▶ HTTPS Proxy ──[HTTPS]──▶ Real Website (H)
         ↑                ↑
   Fake cert from    Real cert from H
   Proxy (signed     (seen only by Proxy)
   by added CA)
```

1. The company IT department adds a **custom CA** to the employee laptop's trusted CA store.
2. All user traffic is routed through the **HTTPS proxy**.
3. The proxy presents its own certificate (signed by the custom CA) — the browser trusts it.
4. The proxy decrypts, inspects, re-encrypts, and forwards traffic to the real site.
5. The user sees a "secure" connection (padlock) but the proxy reads everything.

**Detection method — Fingerprint comparison via OpenSSL:**

```bash
# Step 1: Fetch the certificate from the remote host and save it
[analyst@secOps ~]$ echo -n | openssl s_client -connect cisco.com:443 \
  | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > ./cisco.pem

# Step 2: Extract the SHA-1 fingerprint
[analyst@secOps ~]$ openssl x509 -noout -in cisco.pem -fingerprint -sha1
SHA1 Fingerprint=64:19:CA:40:E2:1B:3F:92:29:21:A9:CE:60:7D:C9:0C:39:B5:71:3E
```

**Reference fingerprints (as of May 2020 — certificates are regularly renewed):**

| Site | Domains Covered | SHA-1 Fingerprint |
|------|----------------|-------------------|
| www.cisco.com | www.cisco.com | `E2:BD:0B:58:C6:B4:FF:91:D6:23:AB:44:0D:8F:64:76:29:4E:30:0B` |
| www.facebook.com | *.facebook.com | `BB:E7:A0:97:C7:92:B2:2D:00:38:12:69:E4:64:E9:04:96:4B:C7:41` |
| www.wikipedia.org | *.wikipedia.org | `A8:F9:F7:79:BE:DB:3E:EB:59:F0:1D:A6:34:08:A1:64:5D:28:48:44` |
| twitter.com | twitter.com | `73:33:BB:96:1D:DB:9C:0C:4F:E5:1C:FF:68:26:CF:5E:3F:50:AB:96` |
| www.linkedin.com | www.linkedin.com | `04:BC:C5:09:DD:AE:99:40:7E:99:A5:65:32:68:EC:5D:2D:D7:5A:19` |

> **Interpretation:** If the fingerprint fetched from within your network **matches** the reference → no proxy. If it **differs** → an HTTPS proxy is intercepting the connection.

> **Limitation:** This method is not 100% foolproof. An attacker who controls the reference source could also spoof the comparison fingerprint.

### Applications & Impacts of Cryptography on Security Operations

| Challenge | Description |
|-----------|-------------|
| **SSL/TLS inspection difficulty** | Encrypted HTTPS traffic cannot be easily inspected for malware by firewalls |
| **C2 traffic concealment** | Attackers use TLS to hide Command & Control communications with infected hosts |
| **Data exfiltration via encryption** | Sensitive data can be encrypted and exfiltrated without triggering DLP alerts |
| **Certificate validity issues** | Expired, self-signed, or revoked certificates generate browser warnings that users may ignore |

**Security analyst mitigations:**
- Configure rules to distinguish SSL vs. non-SSL traffic and HTTPS vs. non-HTTPS SSL traffic.
- Enhance validation through **CRL** and **OCSP** checks.
- Implement antimalware + URL filtering for HTTPS content.
- Deploy **SSL inspection appliances** (e.g., Cisco SSL Appliance) to decrypt and re-inspect traffic before IPS analysis.

### Case Studies & Exam Specifics

> **Exam Focus:** The **X.509** standard defines the format for PKI digital certificates (IETF standard). **X.500** is the directory service standard — do not confuse them.

> **Exam Trap — RA vs CA:** A **Registration Authority (RA)** is NOT a backup CA, NOT a root CA, and NOT a super CA. It is a **subordinate entity** that validates requests before passing them to the CA for signing.

> **Exam Focus — Code Signing purpose:** Code signing ensures **integrity of source executable files** (`.EXE`, `.dll`, scripts). Its purpose is not encryption or identity secrecy.

> **Technical Logic:** The fingerprint/thumbprint is a **hash of the entire certificate** — a fast, unique identifier. Comparing fingerprints is far more efficient than comparing the full raw certificate file.

> **Risk:** If a **Root CA is compromised**, all certificates in its chain must be revoked and reissued. This is managed via a **CRL** or **OCSP** response.

---

Exam Question Review

| Question | Correct Answer | Key Reasoning |
|----------|---------------|---------------|
| Example of a symmetric encryption algorithm? | **AES** | AES uses one shared key for both encryption and decryption |
| Algorithm providing asymmetric encryption? | **Diffie-Hellman (DH)** | DH is an asymmetric algorithm used for key exchange |
| Most secure hash function listed? | **SHA-3** | SHA-3 has the newest, strongest construction |
| SEAL description? | **Stream cipher** | SEAL is a stream cipher; less CPU than software AES |
| Feature of HMAC? | **Uses secret key as input, adding authentication to integrity** | HMAC = hash + secret key |
| MD5/SHA hash requirement of secure comms? | **Integrity** | Hashing detects modification — not confidentiality |
| Algorithm ensuring data confidentiality? | **AES** | AES is a symmetric encryption algorithm |
| How HTTPS challenges enterprise monitoring? | **Enables end-to-end encryption** | HTTPS hides payload from inspection tools |
| IETF standard for PKI digital certificate format? | **X.509** | X.500 is directory services — don't confuse |
| Two symmetric encryption algorithms? | **AES and 3DES** | Both use pre-shared keys; SHA/MD5/HMAC are hash functions |
| Purpose of code signing? | **Integrity of source .EXE files** | Ensures authenticity and non-modification of software |
| More trustworthy certificate class: 4 or 5? | **Class 5** | Higher class = more rigorous identity verification |
| Role of an RA in PKI? | **Subordinate CA** | RA validates requests; does not issue certs independently |
| Technology for asymmetric key encryption in IPsec VPNs? | **IKE** | IKE uses DH for asymmetric key exchange in IPsec |
| Technology for verifying website identity and trusting downloaded code? | **Digital signature** | Digital signatures provide authenticity + integrity + non-repudiation |

---
