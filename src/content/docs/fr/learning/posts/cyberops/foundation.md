---
title: "Vulnérabilités de la suite protocolaire TCP/IP et vecteurs d'attaque réseau"
description: "Une analyse technique approfondie des structures d'en-tête IPv4, IPv6, TCP et UDP, ainsi que des vulnérabilités protocolaires spécifiques exploitées par les acteurs malveillants pour mener des attaques de reconnaissance, d'usurpation d'identité et de déni de service."
order: 16
---

# Attaquer la fondation — Module 16

> **Objectif du module** : Expliquer comment les vulnérabilités TCP/IP permettent les attaques réseau.

---

## PRÉSENTATION DU MODULE

Ce module identifie les faiblesses de conception inhérentes à la **pile TCP/IP** qui facilitent les attaques réseau modernes. Conçus à l'origine pour la connectivité et l'efficacité, ces protocoles ne disposent d'aucun mécanisme d'authentification natif pour la validation de la source, ce qui permet aux acteurs malveillants de manipuler les champs d'en-tête à des fins malveillantes. L'objectif principal est d'expliquer comment la livraison sans connexion **IPv4/IPv6** et les opérations avec/sans état **TCP/UDP** sont exploitées pour compromettre l'intégrité et la disponibilité du réseau.

| Sujet | Objectif |
| :--- | :--- |
| Détails des PDU IP | Expliquer la structure d'en-tête IPv4 et IPv6 |
| Vulnérabilités IP | Expliquer comment les vulnérabilités IP permettent les attaques réseau |
| Vulnérabilités TCP et UDP | Expliquer comment les vulnérabilités TCP et UDP permettent les attaques réseau |

---

## CONCEPTS FONDAMENTAUX ET DÉFINITIONS

### Architecture du protocole IP

Le protocole Internet (IP) est le protocole **sans connexion de couche 3** responsable de l'acheminement des paquets entre les hôtes source et destination.

- **Validation de la source** : IP ne valide **pas** nativement l'adresse source contenue dans un paquet, permettant ainsi l'**usurpation d'adresse IP** par des acteurs malveillants.
- **Gestion des flux** : IP n'est pas conçu pour suivre le flux de paquets ; cette fonction est déléguée à **TCP** en couche 4.
- **Fragmentation** : Des champs tels que **Identification**, **Drapeaux (Flags)** et **Décalage de fragment (Fragment Offset)** permettent de diviser les paquets pour respecter les exigences de l'Unité de Transmission Maximale (MTU) et de les réassembler ultérieurement.

### Caractéristiques de la couche Transport

| Protocole | Type | Fiabilité | Cas d'usage |
| :--- | :--- | :--- | :--- |
| **TCP** | Orienté connexion (avec état) | Élevée — utilise les ACK, le contrôle de flux, la retransmission | HTTP, SSL/TLS, FTP, transferts de zone DNS |
| **UDP** | Sans connexion (sans état) | Faible — pas de retransmission ni de séquencement | Requêtes DNS, DHCP, TFTP, VoIP, streaming multimédia, SNMP |

---

## TAXONOMIE TECHNIQUE ET CLASSIFICATION

### En-tête de paquet IPv4

L'en-tête IPv4 fait **20 octets** minimum. Ses champs principaux sont :

| Champ | Taille | Description |
| :--- | :--- | :--- |
| **Version** | 4 bits | Binaire `0100` — identifie IPv4 |
| **Longueur d'en-tête Internet (IHL)** | 4 bits | Longueur de l'en-tête IP ; minimum 20 octets |
| **Services Différenciés (DS)** | 8 bits | QoS/priorité ; contient DSCP (6 bits) + ECN (2 bits) |
| **Longueur totale** | 16 bits | Taille totale du paquet IP (en-tête + données) ; max 65 535 octets |
| **Identification** | 16 bits | Identifiant unique de fragment |
| **Drapeaux (Flags)** | 3 bits | Contrôle la fragmentation (bits DF, MF) |
| **Décalage de fragment (Fragment Offset)** | 13 bits | Position du fragment dans le paquet d'origine |
| **Durée de vie (TTL)** | 8 bits | Décrémenté de 1 à chaque saut routeur ; paquet supprimé à 0 → envoi d'un message ICMP Time Exceeded |
| **Protocole** | 8 bits | Identifie le protocole de couche supérieure : ICMP=1, TCP=6, UDP=17 |
| **Somme de contrôle d'en-tête (Header Checksum)** | 16 bits | Détecte la corruption dans l'en-tête |
| **Adresse IPv4 source** | 32 bits | Toujours une adresse unicast |
| **Adresse IPv4 destination** | 32 bits | Adresse de l'hôte cible |
| **Options et bourrage (Padding)** | 0–32 bits | Optionnel ; aligné sur une frontière de 32 bits |

### En-tête de paquet IPv6

L'en-tête IPv6 a une taille **fixe de 40 octets**. Contrairement à IPv4, il ne possède pas de somme de contrôle et déplace les données optionnelles vers des **En-têtes d'extension**.

| Champ | Taille | Description |
| :--- | :--- | :--- |
| **Version** | 4 bits | Binaire `0110` — identifie IPv6 |
| **Classe de trafic (Traffic Class)** | 8 bits | Équivalent au champ DS d'IPv4 ; priorité QoS |
| **Étiquette de flux (Flow Label)** | 20 bits | Les paquets portant la même étiquette reçoivent le même traitement de routage |
| **Longueur de charge utile (Payload Length)** | 16 bits | Taille de la partie données (en-tête non inclus) |
| **En-tête suivant (Next Header)** | 8 bits | Équivalent au champ Protocole d'IPv4 ; identifie la charge utile de couche supérieure ou l'en-tête d'extension |
| **Limite de sauts (Hop Limit)** | 8 bits | Remplace le TTL ; décrémenté à chaque saut ; ICMPv6 Time Exceeded envoyé à 0 |
| **Adresse IPv6 source** | 128 bits | Adresse de l'hôte émetteur |
| **Adresse IPv6 destination** | 128 bits | Adresse de l'hôte récepteur |

> **Différence clé** : IPv6 transporte les informations optionnelles de couche réseau dans des **En-têtes d'extension** attachés à l'en-tête principal, et *non* dans un champ Options intégré comme en IPv4.

### Comparaison des en-têtes : IPv4 vs. IPv6

| Caractéristique | IPv4 | IPv6 |
| :--- | :--- | :--- |
| Taille de l'en-tête | 20 octets (variable) | 40 octets (fixe) |
| Adressage | 32 bits (4 octets) | 128 bits (16 octets) |
| TTL / Persistance | Durée de vie (TTL) | Limite de sauts (Hop Limit) |
| Identifiant de protocole | Champ Protocole | Champ En-tête suivant |
| Vérification d'intégrité d'en-tête | Header Checksum ✅ | Aucun (géré par L2/L4) |
| Données optionnelles | Champ Options (intégré) | En-têtes d'extension (chaînés) |
| Fragmentation | Champs dans l'en-tête | En-tête d'extension uniquement |

---

## ANALYSE APPROFONDIE DE TCP

### Champs de l'en-tête de segment TCP

Le segment TCP suit immédiatement l'en-tête IP. Champs principaux :

| Champ | Taille | Rôle |
| :--- | :--- | :--- |
| Port source | 16 bits | Port de l'application émettrice |
| Port destination | 16 bits | Port de l'application cible |
| Numéro de séquence | 32 bits | Suit l'ordre des octets du flux de données |
| Numéro d'acquittement | 32 bits | Prochain octet attendu de l'autre côté |
| Longueur d'en-tête | 4 bits | Taille de l'en-tête TCP |
| Bits de contrôle (Drapeaux) | 6 bits | Gestion de l'état de la connexion (voir ci-dessous) |
| Fenêtre (Window) | 16 bits | Contrôle de flux — taille du tampon annoncée |
| Somme de contrôle (Checksum) | 16 bits | Intégrité de l'en-tête + des données |
| Pointeur urgent (Urgent Pointer) | 16 bits | Pointe vers les données urgentes lorsque le drapeau URG est positionné |

### Bits de contrôle TCP (Drapeaux)

Le champ de contrôle sur 6 bits gère l'état d'une connexion TCP :

| Drapeau | Nom complet | Rôle |
| :--- | :--- | :--- |
| **SYN** | Synchronize | Initie la connexion ; synchronise les numéros de séquence |
| **ACK** | Acknowledgment | Acquitte les données reçues |
| **RST** | Reset | Fermeture **brutale** de la connexion ; utilisé dans les attaques TCP Reset |
| **FIN** | Finish | Terminaison **gracieuse** ; plus de données de la part de l'émetteur |
| **URG** | Urgent | Le champ Pointeur urgent est significatif |
| **PSH** | Push | Demande la livraison immédiate des données à la couche application |

### Établissement de connexion TCP en trois étapes (Three-Way Handshake)

Avant le transfert de données, TCP établit une connexion avec état :

```
Client Serveur
|--- SYN (SEQ=100) -------->| Étape 1 : Le client demande une session
|<-- SYN-ACK (SEQ=300, ----)| Étape 2 : Le serveur acquitte + demande la session inverse
| ACK=101) |
|--- ACK (SEQ=101, -------->| Étape 3 : Le client acquitte
| ACK=301) |
[Connexion établie]

```

### Terminaison TCP en quatre étapes (Four-Way Termination)

Une fermeture de session gracieuse utilise 4 étapes :

1. Le client envoie **FIN** (plus de données à envoyer)
2. Le serveur envoie **ACK** (acquitte le FIN)
3. Le serveur envoie **FIN** (la session serveur→client se termine)
4. Le client envoie **ACK** (acquitte le FIN du serveur)

---

## ANALYSE APPROFONDIE DE UDP

### Structure du segment UDP

UDP possède un en-tête minimal de 8 octets :

| Champ | Taille | Description |
| :--- | :--- | :--- |
| Port source | 16 bits | Port d'origine |
| Port destination | 16 bits | Port cible |
| Longueur | 16 bits | Longueur totale de l'en-tête UDP + données |
| Somme de contrôle (Checksum) | 16 bits | Vérification d'intégrité optionnelle |

UDP ne fournit **aucun** établissement de connexion, retransmission, séquencement ni contrôle de flux. Ce faible surcoût le rend idéal pour les applications sensibles au temps où la rapidité prime sur la livraison garantie.

---

## ANALYSE OPÉRATIONNELLE — MÉTHODOLOGIES D'ATTAQUE

### Attaques basées sur IP

| Type d'attaque | Mécanisme | Objectif |
| :--- | :--- | :--- |
| **Attaque ICMP** | Utilise des requêtes echo (pings) pour sonder le réseau | Reconnaissance, découverte d'hôtes, empreinte OS, inondations DoS, manipulation de table de routage |
| **DoS** | Épuise la bande passante ou les ressources d'une cible unique | Rendre les services indisponibles aux utilisateurs légitimes |
| **DDoS** | Attaque coordonnée simultanée depuis plusieurs machines sources | Identique au DoS mais à plus grande échelle, plus difficile à bloquer |
| **Amplification et réflexion** | Requêtes ICMP usurpées envoyées à de nombreux hôtes ; les réponses inondent la victime (Smurf) | Submerger la victime avec du trafic amplifié |
| **Usurpation d'adresse (Address Spoofing)** | IP source falsifiée pour masquer l'identité ou usurper un utilisateur | Contourner les ACL, configuration d'attaque aveugle/non-aveugle |
| **MiTM** | L'attaquant se positionne entre la source et la destination | Écoute, capture ou modification du trafic |
| **Détournement de session (Session Hijacking)** | Utilise le MiTM sur le réseau physique pour s'emparer d'une session authentifiée | Accès non autorisé aux sessions actives |

### Détails des attaques ICMP

ICMP a été conçu pour les messages de diagnostic et d'erreur. Les acteurs malveillants l'exploitent pour :

- **Reconnaissance** : Requêtes echo pour cartographier la topologie, découvrir les hôtes actifs et effectuer une empreinte des systèmes d'exploitation.
- **Inondations DoS** : Inondation ICMP (requêtes echo) pour épuiser la bande passante.
- **Attaque Smurf** (Amplification + Réflexion) : L'acteur malveillant envoie des requêtes echo ICMP à de nombreux hôtes avec **l'IP usurpée de la victime** comme source → tous les hôtes répondent à la victime, la submergeant.

> **Défense** : Appliquer un filtrage ACL ICMP strict en périphérie du réseau. Utiliser un IDS/pare-feu pour détecter les volumes ICMP anormaux.

### Usurpation d'adresse : aveugle vs. non-aveugle

| Type | Visibilité de l'attaquant | Usage typique |
| :--- | :--- | :--- |
| **Usurpation non-aveugle** | Peut voir le trafic entre l'hôte et la cible ; inspecte les réponses | Analyse d'état du pare-feu, prédiction des numéros de séquence, détournement de session |
| **Usurpation aveugle** | Ne peut pas voir le trafic retour | Attaques DoS |
| **Usurpation MAC** | Nécessite un accès au réseau interne ; modifie le MAC pour correspondre à une cible | Écrasement de la table CAM du commutateur, redirection des trames vers l'attaquant |

---

## EXPLOITATION DE LA COUCHE TRANSPORT

### Résumé des attaques TCP

| Attaque | Mécanisme exploité | Méthode | Effet |
| :--- | :--- | :--- | :--- |
| **TCP SYN Flood** | Three-way handshake | Envoi de nombreux paquets SYN avec des IP sources usurpées ; handshake jamais complété | File d'attente de connexions du serveur épuisée ; déni de service (DoS) |
| **Attaque TCP Reset** | Bit de contrôle RST | Envoi d'un paquet usurpé avec le bit RST positionné vers un ou les deux points d'extrémité | Fermeture brutale immédiate de la session TCP active |
| **Détournement de session TCP** | Numéros de séquence | Usurpation de l'IP d'un hôte authentifié ; prédiction du prochain numéro de séquence ; envoi d'un ACK à l'autre hôte | L'attaquant peut envoyer des données en se faisant passer pour l'hôte détourné |

### TCP SYN Flood — Étape par étape

1. L'acteur malveillant envoie **de multiples requêtes SYN** au serveur web en utilisant des **IP sources aléatoires usurpées**.
2. Le serveur répond par **SYN-ACK** à chaque adresse usurpée et attend l'ACK final.
3. Les ACK n'arrivent jamais — le serveur accumule des **connexions semi-ouvertes**.
4. La file d'attente de connexions du serveur est épuisée → **les utilisateurs légitimes se voient refuser le service**.

### Attaques UDP

| Attaque | Méthode | Effet |
| :--- | :--- | :--- |
| **UDP Flood** | Un outil (UDP Unicorn, LOIC) inonde les ports cibles de paquets UDP depuis un hôte usurpé | Le serveur envoie un message ICMP port inaccessible pour chaque port fermé → épuisement de la bande passante, similaire à un DoS |

> UDP n'est **pas chiffré par défaut**. Un acteur malveillant peut modifier la charge utile et recalculer la somme de contrôle sur 16 bits pour livrer des données falsifiées sans être détecté par la destination.

---

## ÉTUDES DE CAS ET POINTS CLÉS POUR L'EXAMEN

### Référence rapide d'identification des attaques

| Scénario | Nom de l'attaque |
| :--- | :--- |
| L'attaquant surveille/capture de manière transparente la communication entre la source et la destination | **Attaque MiTM** |
| L'attaquant obtient un accès physique au réseau et utilise le MiTM pour manipuler le trafic légitime | **Détournement de session (Session Hijacking)** |
| Attaque simultanée et coordonnée depuis plusieurs machines sources | **DDoS / Amplification et Réflexion** |
| Utilise des pings pour découvrir des sous-réseaux/hôtes, générer des inondations ou modifier les tables de routage | **Attaque ICMP** |
| Paquets avec une IP source falsifiée pour masquer l'identité ou usurper un utilisateur | **Usurpation d'adresse (Address Spoofing)** |
| Exploite le three-way handshake TCP avec des SYN usurpés | **TCP SYN Flood** |
| Bit RST usurpé envoyé aux deux points d'extrémité pour fermer une session | **Attaque TCP Reset** |
| Usurpation d'IP + prédiction du numéro de séquence pour prendre le contrôle d'une session authentifiée | **Détournement de session TCP** |
| Inondation de paquets UDP vers des ports fermés ; le serveur répond avec ICMP inaccessible | **Attaque UDP Flood** |

### Logique critique des en-têtes pour les analystes

- **TTL / Hop Limit = 0** : Le routeur supprime le paquet et envoie un message **ICMP Time Exceeded** à la source. Les analystes peuvent utiliser des valeurs TTL anormales pour détecter des scans traceroute ou des paquets forgés.
- **En-têtes d'extension IPv6** : Les informations optionnelles de couche réseau en IPv6 sont transportées via des **En-têtes d'extension chaînés à l'en-tête principal**, non incorporées dans celui-ci (contrairement aux Options IPv4).
- **Header Checksum (IPv4 uniquement)** : Utilisé pour détecter la corruption introduite lors de la transmission. IPv6 supprime ce champ, en s'appuyant sur la couche 2 (CRC Ethernet) et la couche 4 (somme de contrôle TCP/UDP).
- **Champ Protocole / En-tête suivant** : Identifie ce qui suit l'en-tête IP. Valeurs courantes : `1` = ICMP, `6` = TCP, `17` = UDP.
- **Numéros de séquence TCP** : Critiques pour la livraison fiable et le détournement de session. Un attaquant capable de prédire le prochain numéro de séquence peut injecter des paquets forgés dans une session active.

### Détournement de session vs. MiTM — Distinction clé

| | Détournement de session | MiTM |
| :--- | :--- | :--- |
| **Portée** | Prend le contrôle d'une session *déjà authentifiée* | Plus large — surveille ou contrôle la communication |
| **Prérequis** | Usurpation d'IP + prédiction du numéro de séquence | Positionnement physique/logique entre deux hôtes |
| **Peut recevoir des données ?** | Non (l'attaquant peut *envoyer* mais pas recevoir) | Oui |
| **Difficulté de détection** | Élevée | Élevée |

---

## CHECKLIST RÉCAPITULATIVE

- [ ] Comprendre tous les champs d'en-tête IPv4 et IPv6 ainsi que leurs tailles
- [ ] Connaître les 6 drapeaux TCP et leur rôle dans le cycle de vie des connexions et les attaques
- [ ] Décrire le three-way handshake TCP et la terminaison en quatre étapes
- [ ] Différencier DoS, DDoS et Amplification/Réflexion
- [ ] Identifier le type d'attaque à partir d'un scénario donné (compétence d'examen)
- [ ] Expliquer l'usurpation d'adresse IP aveugle vs. non-aveugle
- [ ] Connaître les outils utilisés dans les attaques UDP flood (UDP Unicorn, LOIC)
- [ ] Expliquer en quoi le détournement de session TCP diffère d'un MiTM classique