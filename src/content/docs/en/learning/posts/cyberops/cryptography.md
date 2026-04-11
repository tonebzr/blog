---
title: "Public Key Cryptography"
description: "Symmetric/Asymmetric encryption, Hashing, PKI, and Digital Signatures."
order: 21
---


## Secure Communications — Core Elements

Organizations must protect data both at rest and in transit. The four **elements of secure communications** map directly to cryptographic mechanisms:

| Element | Definition | Mechanism |
|---------|-----------|-----------|
| **Data Integrity** | Message was not altered in transit | SHA-2, SHA-3 |
| **Origin Authentication** | Message comes from the stated sender | HMAC |
| **Data Confidentiality** | Only authorized parties can read the message | AES, RSA, DH |
| **Non-Repudiation** | Sender cannot deny having sent the message | DSA, RSA, ECDSA |

**Key definitions:**

- **Plaintext** — Original, readable message before encryption.
- **Ciphertext** — Scrambled output; unreadable without the key.
- **Symmetric Encryption** — One shared key for both encryption and decryption (Pre-Shared Key / PSK).
- **Asymmetric Encryption** — Key pair: public key encrypts, private key decrypts.
- **VPN** — Automates encryption/decryption of traffic between endpoints.

---

## Cryptographic Algorithms — Reference Table

| Algorithm | Type | Key / Digest Size | Status | Use Case |
|-----------|------|:-----------------:|:------:|----------|
| **AES** | Symmetric block cipher | 128 / 192 / 256 bits | ✅ Secure | WPA2/WPA3, VPN, TLS, disk encryption |
| **3DES** | Symmetric block cipher | 112 or 168 bits | ⚠️ Deprecating | Legacy VPN hardware |
| **DES** | Symmetric block cipher | 56 bits | ❌ Broken | Legacy systems only |
| **SEAL** | Symmetric stream cipher | 160 bits | ✅ Niche | Software-optimized high-speed encryption |
| **ChaCha20** | Symmetric stream cipher | 256 bits | ✅ Secure | TLS 1.3, mobile |
| **RSA** | Asymmetric | 2048+ bits | ✅ Secure | Key exchange, digital signatures |
| **Diffie-Hellman (DH)** | Asymmetric (key exchange) | Variable | ✅ Secure | IPsec VPNs, SSH key exchange |
| **ECC / ECDSA** | Asymmetric | 256+ bits | ✅ Secure | Digital signatures, TLS |
| **DSA** | Asymmetric (signature only) | 1024–3072 bits | ✅ Secure | Digital Signature Standard (DSS) |
| **MD5** | Hash | 128 bits | ❌ Broken | Non-critical checksums only |
| **SHA-1** | Hash | 160 bits | ❌ Deprecated | Legacy systems |
| **SHA-256** | Hash | 256 bits | ✅ Recommended | TLS, software signing, file integrity |
| **SHA-512** | Hash | 512 bits | ✅ Recommended | High-security requirements |
| **SHA-3** | Hash | Variable | ✅ Next-gen | Future replacement for SHA-2 |
| **HMAC** | Hash + Secret Key | Depends on underlying hash | ✅ Secure | Integrity + Authentication (IPsec, TLS) |

---

## Cryptographic Hashing & Integrity

A **hash function** maps any input to a **fixed-length digest**. It is a **one-way operation** — computationally infeasible to reverse.

**Key properties:**

- **Avalanche Effect** — A single-bit change in input produces a completely different hash.
- **Collision Resistance** — No two distinct inputs should produce the same hash.
- **HMAC** — Adds a **secret key** to the hash → provides both **integrity AND authentication**.

> **Exam distinction:** Plain SHA-256 = **Integrity only**. HMAC = **Integrity + Authentication**. Neither provides confidentiality.

**OpenSSL usage (lab reference):**

```bash
openssl sha256 file.txt          # SHA-256 hash
openssl sha512 file.txt          # SHA-512 hash
sha256sum file.img               # Native Linux utility
```

---

## Symmetric Encryption

Uses a **single shared key (PSK)** for both encryption and decryption. Fast — suited for bulk data.

**Key distinction — Block vs Stream:**

- **Block cipher** — Encrypts fixed-size blocks (e.g., AES: 128-bit blocks).
- **Stream cipher** — Encrypts one bit/byte at a time (e.g., SEAL, ChaCha20).

> **Exam trap:** SEAL is a **stream cipher** with a **160-bit** key — not a block cipher.

> **Base64** is NOT encryption. It is a binary-to-text encoding for safe transport over text-based protocols (e.g., email). It provides **zero confidentiality**.

**OpenSSL AES-256-CBC (lab reference):**

```bash
# Encrypt
openssl aes-256-cbc -a -in plaintext.txt -out message.enc

# Decrypt
openssl aes-256-cbc -a -d -in message.enc -out decrypted.txt
```

| Flag | Function |
|------|----------|
| `aes-256-cbc` | AES-256 in Cipher Block Chaining mode |
| `-a` | Apply Base64 encoding (ASCII-safe output) |
| `-d` | Decrypt mode |
| `-salt` | Add random salt (protects against rainbow tables) |

---

## Asymmetric Encryption

Uses a **mathematically linked key pair**: public key (encrypt) + private key (decrypt).

```
Confidentiality:   Public Key (Encrypt)  → Private Key (Decrypt)
Authentication:    Private Key (Encrypt) → Public Key (Decrypt)
```

| Property | Symmetric | Asymmetric |
|----------|-----------|-----------|
| Keys | 1 shared key | 2 keys (public + private) |
| Speed | Fast | Slow |
| Use case | Bulk data encryption | Key exchange, digital signatures |
| Examples | AES, 3DES, SEAL | RSA, DH, ECC, DSA |
| Protocols | VPN tunnels | IKE, TLS handshake, SSH, PGP |

**Diffie-Hellman (DH):** Allows two parties to generate a **shared secret over an insecure channel** without transmitting the secret itself. Foundational to **IPsec VPNs** and **SSH**.

---

## Password Security & Brute-Force

Encryption is only as strong as the password protecting it.

| Password Length | Character Set | Recovery Difficulty |
|:-:|---------|:-:|
| 1–4 chars | Numeric | ⚡ Near-instantaneous |
| 5–6 chars | Alphanumeric | ⏱ Minutes to hours |
| 8–10 chars | Alpha + digits + symbols | 📅 Days to weeks |
| 12+ chars | Full complex | 🔒 Years (infeasible) |

> **Industry recommendation:** Minimum **12–16 characters** for sensitive data.

---

## Protocol Analysis — Telnet vs. SSH

| Feature | Telnet | SSH |
|---------|:------:|:---:|
| TCP Port | 23 | 22 |
| Confidentiality | ❌ Plaintext | ✅ Fully encrypted |
| Integrity | ❌ None | ✅ HMAC |
| Authentication | Password (cleartext) | Password, Public Key, MFA |
| Key Exchange | None | Diffie-Hellman |
| Replay Attack Protection | ❌ None | ✅ Yes |
| Credentials visible in Wireshark | ✅ Yes | ❌ No |

> **Exam alert:** SSH uses **Diffie-Hellman** for key exchange and protects against eavesdropping, replay attacks, and credential theft.

---

## Public Key Infrastructure (PKI)

PKI is the framework managing **digital certificates**, **public-key encryption**, and **trust relationships**.

**Key entities:**

- **Certificate Authority (CA)** — Trusted third party that issues digitally signed certificates.
- **Root CA** — Top-level CA; self-signed. All certificates in its chain are trusted by browsers.
- **Intermediate CA** — Signed by Root CA; issues end-entity certificates on its behalf.
- **Registration Authority (RA)** — Validates certificate requests and forwards them to the CA. **Does NOT issue certificates.**
- **CRL (Certificate Revocation List)** — Published list of revoked certificates.
- **OCSP** — Real-time online protocol for checking certificate validity (more efficient than CRL).

**PKI Trust Hierarchy:**

```
Root CA (Self-signed)
    ├── Intermediate CA 1
    │       ├── End-Entity Cert (website.com)
    │       └── End-Entity Cert (mail.org)
    └── Intermediate CA 2
            ├── End-Entity Cert (bank.com)
            └── End-Entity Cert (shop.net)
```

### Certificate Types

| Type | Validation Level | Trust Level | Use Case |
|------|-----------------|:-----------:|----------|
| **Domain Validated (DV)** | Automated domain check | Low | Blogs, personal sites |
| **Organization Validated (OV)** | Manual legal verification | Medium | Corporate websites |
| **Extended Validation (EV)** | Rigorous background check | High | Banks, financial institutions |
| **Self-Signed** | No CA involved | None/Internal | Labs, internal testing |

> Certificate **class numbering (0–5):** Higher class = more rigorous identity verification = more trusted.

### Digital Signatures

Provide three services simultaneously: **Authenticity**, **Integrity**, **Non-repudiation**.

**DSS algorithms:** DSA, RSA, ECDSA.

> **Code signing** verifies the **integrity and authorship** of software — ensures code was not modified since it was signed by the publisher.

### Certificate Fingerprint & HTTPS MitM Detection

A **certificate fingerprint (thumbprint)** is a SHA-1 or SHA-256 **hash of the complete certificate**. Comparing fingerprints can detect HTTPS proxy interception.

```bash
# Fetch certificate and extract SHA-1 fingerprint
echo -n | openssl s_client -connect cisco.com:443 \
  | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > ./cisco.pem

openssl x509 -noout -in cisco.pem -fingerprint -sha1
```

> If the fetched fingerprint **matches** a trusted reference → no proxy. If it **differs** → an HTTPS proxy is intercepting.

---

## Exam Quick Reference

| Question | Correct Answer | Reasoning |
|----------|---------------|-----------|
| Symmetric encryption algorithm? | **AES** | One shared key |
| Asymmetric key exchange algorithm? | **Diffie-Hellman** | Shared secret over insecure channel |
| Most secure hash function? | **SHA-3** | Newest, strongest construction |
| SEAL cipher type? | **Stream cipher** | Not a block cipher; 160-bit key |
| HMAC feature? | **Secret key + hash** | Integrity + Authentication |
| MD5/SHA function? | **Integrity** | Detects modification only |
| Algorithm for confidentiality? | **AES** | Symmetric encryption |
| HTTPS impact on monitoring? | **Enables end-to-end encryption** | Hides payload from inspection |
| PKI certificate format standard? | **X.509** | Not X.500 (directory service) |
| Two symmetric algorithms? | **AES and 3DES** | Both use PSK |
| Purpose of code signing? | **Integrity of source .EXE files** | Authenticity + non-modification |
| More trusted class: 4 or 5? | **Class 5** | Higher class = more rigorous check |
| Role of RA in PKI? | **Subordinate — validates requests only** | Does not issue certificates |
| Technology for IPsec VPN key exchange? | **IKE (using DH)** | Asymmetric key exchange |
| Technology for website identity verification? | **Digital signature** | Authenticity + Integrity + Non-repudiation |
