---
title: "Cryptographie à clé publique"
description: "Chiffrement symétrique/asymétrique, hachage, PKI et signatures numériques."
order: 21
---


---

## Communications sécurisées — Éléments fondamentaux

Les organisations doivent protéger les données au repos et en transit. Les quatre **éléments des communications sécurisées** correspondent directement à des mécanismes cryptographiques :

| Élément | Définition | Mécanisme |
|---------|-----------|-----------|
| **Intégrité des données** | Garantit que le message n’a pas été modifié pendant le transit | SHA-2, SHA-3 |
| **Authentification d’origine** | Garantit que le message provient bien de l’émetteur annoncé | HMAC |
| **Confidentialité des données** | Garantit que seules les parties autorisées peuvent lire le message | AES, RSA, DH |
| **Non-répudiation** | Garantit que l’émetteur ne peut pas nier avoir envoyé le message | DSA, RSA, ECDSA |

**Définitions clés :**

- **Texte en clair (Plaintext)** — Message original lisible avant chiffrement.
- **Texte chiffré (Ciphertext)** — Sortie brouillée, illisible sans la clé.
- **Chiffrement symétrique** — Une seule clé partagée pour chiffrer et déchiffrer (PSK, *Pre-Shared Key*).
- **Chiffrement asymétrique** — Paire de clés : clé publique pour chiffrer, clé privée pour déchiffrer.
- **VPN** — Automatise le chiffrement/déchiffrement du trafic entre des points de terminaison.

---

## Algorithmes cryptographiques — Tableau récapitulatif

| Algorithme | Type | Taille de clé / empreinte | Statut | Cas d’usage |
|-----------|------|:-------------------------:|:------:|-------------|
| **AES** | Chiffrement symétrique par blocs | 128 / 192 / 256 bits | ✅ Sûr | WPA2/WPA3, VPN, TLS, chiffrement disque |
| **3DES** | Chiffrement symétrique par blocs | 112 ou 168 bits | ⚠️ En dépréciation | Équipements VPN hérités |
| **DES** | Chiffrement symétrique par blocs | 56 bits | ❌ Cassé | Systèmes hérités uniquement |
| **SEAL** | Chiffrement symétrique par flot | 160 bits | ✅ De niche | Chiffrement logiciel optimisé |
| **ChaCha20** | Chiffrement symétrique par flot | 256 bits | ✅ Sûr | TLS 1.3, terminaux mobiles |
| **RSA** | Asymétrique | 2048+ bits | ✅ Sûr | Échange de clés, signatures numériques |
| **Diffie-Hellman (DH)** | Asymétrique (échange de clés) | Variable | ✅ Sûr | VPN IPsec, échange de clés SSH |
| **ECC / ECDSA** | Asymétrique | 256+ bits | ✅ Sûr | Signatures numériques, TLS |
| **DSA** | Asymétrique (signature uniquement) | 1024–3072 bits | ✅ Sûr | Standard DSS |
| **MD5** | Hachage | 128 bits | ❌ Cassé | Sommes de contrôle non critiques |
| **SHA-1** | Hachage | 160 bits | ❌ Obsolète | Systèmes hérités |
| **SHA-256** | Hachage | 256 bits | ✅ Recommandé | TLS, signature logicielle, intégrité fichier |
| **SHA-512** | Hachage | 512 bits | ✅ Recommandé | Exigences de haute sécurité |
| **SHA-3** | Hachage | Variable | ✅ Nouvelle génération | Remplacement futur de SHA-2 |
| **HMAC** | Hachage + clé secrète | Dépend de la fonction de hachage | ✅ Sûr | Intégrité + authentification (IPsec, TLS) |

---

## Hachage cryptographique et intégrité

Une **fonction de hachage** transforme une entrée de taille quelconque en une **empreinte de taille fixe**. Il s’agit d’une **opération à sens unique** : il est computationnellement irréaliste de retrouver l’entrée initiale à partir du condensat.

**Propriétés essentielles :**

- **Effet avalanche** — Une modification minime de l’entrée produit une empreinte totalement différente.
- **Résistance aux collisions** — Deux entrées distinctes ne doivent pas produire la même empreinte.
- **HMAC** — Ajoute une **clé secrète** au hachage, ce qui fournit à la fois **intégrité ET authentification**.

> **Distinction d’examen :** SHA-256 seul = **intégrité uniquement**. HMAC = **intégrité + authentification**. Aucun des deux ne fournit la confidentialité.

**Référence OpenSSL (lab) :**

```bash
openssl sha256 file.txt          # Hachage SHA-256
openssl sha512 file.txt          # Hachage SHA-512
sha256sum file.img               # Utilitaire Linux natif
```

---

## Chiffrement symétrique

Le chiffrement symétrique utilise une **clé partagée unique (PSK)** pour le chiffrement et le déchiffrement. Il est rapide et adapté au chiffrement de volumes importants de données.

**Distinction clé — Bloc vs flot :**

- **Chiffrement par blocs** — Chiffre des blocs de taille fixe (ex. AES : blocs de 128 bits).
- **Chiffrement par flot** — Chiffre bit par bit ou octet par octet (ex. SEAL, ChaCha20).

> **Piège d’examen :** SEAL est un **chiffrement par flot** avec une **clé de 160 bits**, et non un chiffrement par blocs.

> **Base64** n’est PAS un chiffrement. C’est un encodage binaire-vers-texte destiné au transport sûr sur des protocoles textuels (ex. e-mail). Il n’apporte **aucune confidentialité**.

**OpenSSL AES-256-CBC (référence lab) :**

```bash
# Chiffrer
openssl aes-256-cbc -a -in plaintext.txt -out message.enc

# Déchiffrer
openssl aes-256-cbc -a -d -in message.enc -out decrypted.txt
```

| Option | Fonction |
|------|----------|
| `aes-256-cbc` | AES-256 en mode CBC (*Cipher Block Chaining*) |
| `-a` | Applique un encodage Base64 (sortie ASCII) |
| `-d` | Mode déchiffrement |
| `-salt` | Ajoute un sel aléatoire (protège contre les rainbow tables) |

---

## Chiffrement asymétrique

Le chiffrement asymétrique repose sur une **paire de clés mathématiquement liées** : clé publique et clé privée.

```text
Confidentialité :   Clé publique (chiffrement)  → Clé privée (déchiffrement)
Authentification :  Clé privée (signature)      → Clé publique (vérification)
```

| Propriété | Symétrique | Asymétrique |
|----------|-----------|-----------|
| Clés | 1 clé partagée | 2 clés (publique + privée) |
| Vitesse | Rapide | Plus lent |
| Usage | Chiffrement des données | Échange de clés, signatures |
| Exemples | AES, 3DES, SEAL | RSA, DH, ECC, DSA |
| Protocoles | Tunnels VPN | IKE, négociation TLS, SSH, PGP |

**Diffie-Hellman (DH)** permet à deux parties de générer un **secret partagé sur un canal non sûr** sans jamais transmettre ce secret directement. C’est un mécanisme fondamental de **SSH** et des **VPN IPsec**.

---

## Sécurité des mots de passe et force brute

Le niveau réel de protection dépend aussi du mot de passe utilisé pour protéger les données chiffrées.

| Longueur du mot de passe | Jeu de caractères | Difficulté de récupération |
|:-:|---------|:-:|
| 1–4 caractères | Numérique | ⚡ Quasi instantanée |
| 5–6 caractères | Alphanumérique | ⏱ Minutes à heures |
| 8–10 caractères | Lettres + chiffres + symboles | 📅 Jours à semaines |
| 12+ caractères | Jeu complet complexe | 🔒 Années (pratiquement irréalisable) |

> **Recommandation industrielle :** minimum **12 à 16 caractères** pour les données sensibles.

---

## Analyse protocolaire — Telnet vs SSH

| Fonctionnalité | Telnet | SSH |
|---------|:------:|:---:|
| Port TCP | 23 | 22 |
| Confidentialité | ❌ En clair | ✅ Chiffrement complet |
| Intégrité | ❌ Aucune | ✅ HMAC |
| Authentification | Mot de passe en clair | Mot de passe, clé publique, MFA |
| Échange de clés | Aucun | Diffie-Hellman |
| Protection contre le rejeu | ❌ Non | ✅ Oui |
| Identifiants visibles dans Wireshark | ✅ Oui | ❌ Non |

> **Point d’examen :** SSH utilise **Diffie-Hellman** pour l’échange de clés et protège contre l’écoute, le rejeu et le vol d’identifiants.

---

## Infrastructure à clé publique (PKI)

La **PKI** est l’infrastructure qui gère les **certificats numériques**, le **chiffrement à clé publique** et les **relations de confiance**.

**Entités principales :**

- **CA (Certificate Authority)** — Tiers de confiance qui émet des certificats signés numériquement.
- **Root CA** — Autorité racine, auto-signée. Toute la chaîne en dessous hérite de sa confiance.
- **Intermediate CA** — Autorité intermédiaire signée par la Root CA ; émet les certificats finaux.
- **RA (Registration Authority)** — Vérifie les demandes de certificats et les transmet à la CA. **N’émet pas** de certificats.
- **CRL (Certificate Revocation List)** — Liste publiée des certificats révoqués.
- **OCSP** — Protocole en ligne permettant de vérifier en temps réel la validité d’un certificat.

**Hiérarchie de confiance PKI :**

```text
Root CA (auto-signée)
    ├── Intermediate CA 1
    │       ├── Certificat terminal (website.com)
    │       └── Certificat terminal (mail.org)
    └── Intermediate CA 2
            ├── Certificat terminal (bank.com)
            └── Certificat terminal (shop.net)
```

### Types de certificats

| Type | Niveau de validation | Niveau de confiance | Cas d’usage |
|------|----------------------|:-------------------:|-------------|
| **DV (Domain Validated)** | Vérification automatisée du domaine | Faible | Blogs, sites personnels |
| **OV (Organization Validated)** | Vérification légale manuelle | Moyen | Sites d’entreprise |
| **EV (Extended Validation)** | Vérification poussée | Élevé | Banques, institutions financières |
| **Self-Signed** | Aucun tiers de confiance | Interne / nul | Labos, tests internes |

> **Classes de certificats (0 à 5) :** plus la classe est élevée, plus la vérification d’identité est rigoureuse, donc plus le certificat est digne de confiance.

### Signatures numériques

Les signatures numériques fournissent simultanément :

- **Authenticité**
- **Intégrité**
- **Non-répudiation**

**Algorithmes DSS :** DSA, RSA, ECDSA.

> **Code signing** : permet de vérifier l’**intégrité** et l’**origine** d’un exécutable ou d’un code signé. Le but n’est pas de chiffrer le code, mais de prouver qu’il n’a pas été modifié.

### Empreinte de certificat et détection de MitM HTTPS

Une **empreinte de certificat (thumbprint / fingerprint)** est un hachage SHA-1 ou SHA-256 de l’intégralité du certificat. Sa comparaison permet de détecter une interception HTTPS par proxy.

```bash
# Récupérer le certificat puis extraire son empreinte SHA-1
echo -n | openssl s_client -connect cisco.com:443 \
  | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > ./cisco.pem

openssl x509 -noout -in cisco.pem -fingerprint -sha1
```

> Si l’empreinte récupérée **correspond** à une référence de confiance, il n’y a pas de proxy d’interception. Si elle **diffère**, un proxy HTTPS intercepte probablement la connexion.

---

## Révision rapide examen

| Question | Bonne réponse | Raisonnement |
|----------|---------------|--------------|
| Exemple d’algorithme symétrique ? | **AES** | Une seule clé partagée |
| Algorithme asymétrique d’échange de clés ? | **Diffie-Hellman** | Génère un secret partagé |
| Fonction de hachage la plus robuste ? | **SHA-3** | Construction la plus récente |
| Type de chiffrement de SEAL ? | **Chiffrement par flot** | Pas un chiffrement par blocs ; clé 160 bits |
| Particularité de HMAC ? | **Clé secrète + hachage** | Intégrité + authentification |
| Rôle de MD5/SHA ? | **Intégrité** | Détection de modification uniquement |
| Algorithme assurant la confidentialité ? | **AES** | Chiffrement symétrique |
| Impact de HTTPS sur la supervision ? | **Chiffrement de bout en bout** | Le contenu n’est plus visible facilement |
| Standard du format des certificats PKI ? | **X.509** | Ne pas confondre avec X.500 |
| Deux algorithmes symétriques ? | **AES et 3DES** | Utilisent une clé partagée |
| But du code signing ? | **Intégrité des exécutables source** | Authenticité + absence de modification |
| Classe la plus fiable : 4 ou 5 ? | **Classe 5** | Vérification plus rigoureuse |
| Rôle de la RA dans la PKI ? | **Validation des demandes uniquement** | N’émet pas de certificats |
| Technologie utilisée pour l’échange de clés IPsec ? | **IKE (avec DH)** | Négociation et échange de clés |
| Technologie qui vérifie l’identité d’un site web ? | **Signature numérique** | Authenticité + intégrité + non-répudiation |