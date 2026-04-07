---
title: "Opérations Ethernet Layer 2 et Analyse du Protocole de Résolution d'Adresses (ARP)"
description: "Référence technique complète couvrant l'encapsulation des trames Ethernet II, les rôles fonctionnels des adresses MAC et IP, la mécanique opérationnelle de l'ARP, l'analyse de trafic sous Wireshark et les considérations de sécurité — programme CyberOps Associate."
tags: [ARP, Ethernet, Layer 2, MAC, Wireshark, CyberOps, Sécurité Réseau]
---

## VUE D'ENSEMBLE DU MODULE

Dans les environnements de réseau local (LAN) modernes, la communication de données repose sur l'encapsulation des protocoles des couches supérieures dans des trames Layer 2. Ce processus est déterminé par le type d'accès au médium ; concrètement, lorsque les protocoles TCP (*Transmission Control Protocol*) et IP (*Internet Protocol*) s'exécutent sur Ethernet, le format d'encapsulation Layer 2 standard est la **trame Ethernet II**.

Une communication efficace requiert la coordination de deux schémas d'adressage distincts : l'**adressage physique** (MAC) et l'**adressage logique** (IP). Les adresses IP assurent l'acheminement des paquets de la source d'origine jusqu'à la destination finale en traversant les frontières réseau, tandis que les adresses MAC sont utilisées pour la livraison nœud-à-nœud au sein du même segment réseau local. L'**Address Resolution Protocol (ARP)** constitue le mécanisme central permettant d'associer ces adresses IPv4 logiques aux adresses MAC physiques correspondantes.

> **Périmètre du document :** Cette référence couvre la structure des trames Layer 2, le fonctionnement de l'ARP, l'analyse de trafic sous Wireshark (basée sur le TP Cisco Networking Academy *« Using Wireshark to Examine Ethernet Frames »*), une banque de questions/réponses d'examen, ainsi que les vulnérabilités de sécurité connues liées à l'ARP.

---

## CONCEPTS FONDAMENTAUX ET DÉFINITIONS

| Terme | Définition |
| :--- | :--- |
| **Adresse MAC** | Identifiant physique sur 48 bits (6 octets) exprimé sous forme de 12 chiffres hexadécimaux. Utilisée pour la communication NIC-à-NIC au sein du même segment réseau. Les 6 premiers chiffres hex = OUI (constructeur) ; les 6 derniers = numéro de série de la NIC. |
| **Adresse IP** | Adresse logique identifiant la source d'origine et la destination finale d'un paquet. Reste constante sur l'ensemble du chemin réseau ; la trame Layer 2, quant à elle, est désencapsulée puis réencapsulée à chaque saut routeur. |
| **ARP** | *Address Resolution Protocol* — résout une adresse IPv4 connue en une adresse MAC physique. Maintient un **cache ARP** (stocké en RAM). |
| **Cache ARP / Table ARP** | Table résidente en RAM stockant les associations IP-vers-MAC connues. Consultée avant toute génération d'une requête ARP. Les entrées expirent après un délai configurable (*timeout*). |
| **Passerelle par défaut** | Interface du routeur chargée de transmettre le trafic à destination des réseaux distants. Lorsque la destination se trouve sur un sous-réseau différent, l'hôte résout l'adresse MAC de la **passerelle**, et non celle de l'hôte distant. |
| **ICMPv6 Neighbor Discovery (ND)** | Équivalent fonctionnel IPv6 de l'ARP. Utilise les messages **Neighbor Solicitation (NS)** et **Neighbor Advertisement (NA)** en remplacement des broadcasts ARP. |
| **EtherType** | Champ de 2 octets dans l'en-tête Ethernet II identifiant le protocole de couche supérieure encapsulé (ex. : `0x0800` = IPv4, `0x0806` = ARP). |
| **FCS** | *Frame Check Sequence* — séquence de contrôle de trame sur 4 octets, basée sur un CRC (*Cyclic Redundancy Check*), utilisée pour la détection d'erreurs. Non affichée dans les captures Wireshark. |
| **OUI** | *Organizationally Unique Identifier* — les 3 premiers octets (6 chiffres hex) d'une adresse MAC, attribués au constructeur de la NIC par l'IEEE. |

---

## TAXONOMIE TECHNIQUE ET CLASSIFICATION

### Tableau 1 : Structure de la Trame Ethernet II

```
 +-----------+---------+---------+-------+------------------+-----+
 | Préambule |   Dst   |   Src   | Type  |      Données     | FCS |
 | (8 octets)| (6 o.)  | (6 o.)  | (2 o.)| (46 – 1500 o.)   | (4o)|
 +-----------+---------+---------+-------+------------------+-----+
```

| Champ | Taille | Description technique | Visible dans Wireshark |
| :--- | :---: | :--- | :---: |
| **Préambule** | 8 o. | Bits de synchronisation traités par le matériel de la NIC au niveau de la couche physique. | ❌ Non affiché |
| **Adresse de destination** | 6 o. | Adresse Layer 2 sur 48 bits. Peut être unicast, multicast ou broadcast (`FF:FF:FF:FF:FF:FF`). | ✅ |
| **Adresse source** | 6 o. | Adresse Layer 2 sur 48 bits de la NIC émettrice. **Toujours unicast.** | ✅ |
| **Type de trame (EtherType)** | 2 o. | Identifie le protocole de couche supérieure. `0x0800` = IPv4 · `0x0806` = ARP. | ✅ |
| **Données** | 46–1500 o. | PDU Layer 3 encapsulé (paquet IPv4, charge utile ARP, etc.). | ✅ |
| **FCS** | 4 o. | Contrôle de redondance cyclique (CRC) pour la détection d'erreurs. Calculé par l'émetteur, vérifié par le récepteur. | ❌ Non affiché |

> **Remarque :** Le Préambule et le FCS ne sont jamais affichés dans Wireshark. Le Préambule est intégralement consommé par le matériel pour la synchronisation d'horloge, avant que les données ne soient transmises au système d'exploitation.

---

### Tableau 2 : Valeurs EtherType Courantes

| Valeur EtherType | Protocole |
| :---: | :--- |
| `0x0800` | Internet Protocol version 4 (IPv4) |
| `0x0806` | Address Resolution Protocol (ARP) |
| `0x86DD` | Internet Protocol version 6 (IPv6) |
| `0x8100` | Marquage VLAN IEEE 802.1Q |

---

### Tableau 3 : Adresse MAC vs. Adresse IP — Comparaison des rôles

| Attribut | Adresse MAC (Layer 2) | Adresse IP (Layer 3) |
| :--- | :--- | :--- |
| **Rôle principal** | Livraison locale NIC-à-NIC au sein d'un domaine de broadcast | Identification de bout-en-bout des équipements à travers les réseaux |
| **Portée** | Limitée au segment réseau local (domaine de broadcast) | Routage global / inter-réseau |
| **Persistance** | **Change** à chaque saut Layer 3 (le routeur réencapsule la trame) | **Reste constante** de la source à la destination finale |
| **Longueur** | 48 bits (6 octets) | 32 bits (IPv4) / 128 bits (IPv6) |
| **Notation** | Hexadécimal (ex. : `f4:8c:50:62:62:6d`) | Notation décimale pointée (ex. : `10.0.0.13`) |
| **Attribution** | Gravée dans le matériel de la NIC (peut être usurpée par logiciel) | Attribuée par l'administrateur réseau ou via DHCP |
| **Examinée par** | Les commutateurs (équipements Layer 2) | Les routeurs (équipements Layer 3) |

---

## ANALYSE OPÉRATIONNELLE

### Processus de Résolution ARP

Lorsqu'un hôte prépare une PDU Layer 2 pour transmission, il suit la logique décisionnelle suivante :

```
L'hôte souhaite envoyer un paquet
        │
        ▼
La destination est-elle sur le réseau LOCAL ?
        │
   OUI  │                          NON
        ▼                          ▼
Recherche dans le           Utiliser l'IP de la passerelle
cache ARP de la             Rechercher dans le cache ARP
MAC de destination          l'adresse MAC de la passerelle
        │                          │
   Trouvée ? ── OUI ─────────────► Encapsuler la trame
        │                          et transmettre
        NON
        │
        ▼
Émettre une requête ARP (Broadcast : FF:FF:FF:FF:FF:FF)
"Who has [IP cible] ? Tell [IP source]"
        │
        ▼
L'équipement cible répond par une réponse ARP (Unicast)
"[IP cible] is at [MAC cible]"
        │
        ▼
Mise à jour du cache ARP (stocké en RAM)
        │
        ▼
Encapsuler la trame et transmettre
```

#### Détail étape par étape

1. **Consultation du cache ARP** — L'hôte vérifie d'abord sa **table ARP** (en RAM) pour trouver une association IP-vers-MAC existante.
2. **Émission d'une requête ARP** — En l'absence d'entrée, l'hôte émet une **requête ARP** en broadcast (`MAC destination : FF:FF:FF:FF:FF:FF`) vers tous les équipements du segment local.
3. **Réponse ARP** — Seul l'équipement possédant l'adresse IP demandée répond, via une **réponse ARP unicast** contenant son adresse MAC physique.
4. **Mise à jour du cache** — L'association est enregistrée dans la table ARP. L'hôte procède ensuite à l'encapsulation de la trame Ethernet et à la transmission.

> **Point clé :** Les requêtes ARP sont des **broadcasts** ; les réponses ARP sont des **unicasts**.

---

### Trafic Local vs. Trafic Distant — Comparaison Détaillée

Les scénarios suivants sont basés sur la topologie du TP Cisco (réseau local `10.0.0.0/24`, réseau distant `172.16.0.0/12` via le routeur R1) :

#### Scénario A — Trafic local (H3 → H1, même sous-réseau)

| Étape | Action | Détail Layer 2 |
| :---: | :--- | :--- |
| 1 | H3 (`10.0.0.13`) envoie un ping vers H1 (`10.0.0.11`) | Reconnaît le même sous-réseau |
| 2 | H3 consulte le cache ARP pour `10.0.0.11` | Le cache peut être vide après `arp -d` |
| 3 | H3 émet une requête ARP en broadcast | MAC dest. : `FF:FF:FF:FF:FF:FF` |
| 4 | H1 répond par une réponse ARP unicast | Adresse MAC de H1 retournée |
| 5 | H3 envoie la requête ICMP Echo directement à H1 | MAC dest. = MAC de H1 |

#### Scénario B — Trafic distant (H3 → H4, sous-réseau différent)

| Étape | Action | Détail Layer 2 |
| :---: | :--- | :--- |
| 1 | H3 (`10.0.0.13`) envoie un ping vers H4 (`172.16.0.40`) | Reconnaît un sous-réseau **différent** |
| 2 | H3 consulte le cache ARP pour la **passerelle par défaut** `10.0.0.1` | Pas l'IP de H4 — l'IP de la passerelle |
| 3 | H3 résout la **MAC de la passerelle** via ARP | MAC dest. dans la trame = MAC de R1 |
| 4 | H3 envoie la trame ICMP vers R1 | IP dest. dans le paquet = `172.16.0.40` ; MAC dest. dans la trame = MAC de R1 |
| 5 | R1 achemine le paquet vers H4 | R1 réencapsule avec une nouvelle trame Layer 2 |

> **Point critique :** L'**adresse IP de destination** diffère entre les scénarios A et B, mais l'**adresse MAC de destination** dans la trame pointe toujours vers le **prochain saut** (hôte directement connecté ou passerelle par défaut). L'adresse IP à l'intérieur du paquet reste la destination finale réelle tout au long du trajet.

---

### Analyse de Trafic avec Wireshark (PCAP)

Wireshark est l'outil de référence pour inspecter le comportement des trames ARP et ICMP. Voici ce qu'un analyste observe lors d'une session de capture ARP + ping typique.

#### Trame de requête ARP observée (EtherType `0x0806`)

| Champ | Valeur observée | Remarques |
| :--- | :--- | :--- |
| MAC destination | `ff:ff:ff:ff:ff:ff` | Broadcast — envoyé à tous les hôtes du segment |
| MAC source | `f4:8c:50:62:62:6d` (ex. : NIC IntelCor) | Adresse physique de l'hôte émetteur |
| EtherType | `0x0806` | Identifie la charge utile comme étant de l'ARP |
| Info (Wireshark) | `Who has 192.168.1.1? Tell 192.168.1.6` | Message de requête ARP |
| En-tête IPv4 | **Absent** | L'ARP est encapsulé directement dans la trame Ethernet — pas d'en-tête IP |
| Préambule | Non affiché | Consommé par le matériel |
| FCS | Non affiché | Calculé et vérifié par le matériel |

#### Trame de requête ICMP Echo observée (EtherType `0x0800`)

| Champ | Ping local (même sous-réseau) | Ping distant (sous-réseau différent) |
| :--- | :--- | :--- |
| MAC dest. | MAC de l'hôte cible | MAC de la passerelle par défaut (routeur) |
| MAC source | MAC de l'émetteur | MAC de l'émetteur |
| EtherType | `0x0800` (IPv4) | `0x0800` (IPv4) |
| IP source (dans les données) | IP de l'émetteur | IP de l'émetteur |
| IP destination (dans les données) | IP de la cible locale | IP de la cible distante |

#### Référence des filtres Wireshark

| Filtre | Utilisation |
| :--- | :--- |
| `arp` | Afficher uniquement les trames ARP |
| `icmp` | Afficher uniquement le trafic ICMP (ping) |
| `arp or icmp` | Afficher les deux — utile pour analyser une session ARP + ping complète |
| `eth.dst == ff:ff:ff:ff:ff:ff` | Isoler toutes les trames broadcast |

---

### Anatomie d'une Adresse MAC

```
  f4  :  8c  :  50  :  62  :  62  :  6d
 └────────────────┘   └────────────────┘
      OUI / Identifiant constructeur     Numéro de série NIC
         (Fabricant = Intel)
```

- **OUI (3 premiers octets / 6 chiffres hex) :** Attribué par l'IEEE au constructeur. Dans la capture du TP, `f4:8c:50` correspond à Intel Corporation.
- **Numéro de série (3 derniers octets / 6 chiffres hex) :** Identifie de manière unique la NIC au sein de la gamme produit du constructeur.

---

## VULNÉRABILITÉS DE SÉCURITÉ

### ARP Spoofing / ARP Poisoning

L'ARP ne dispose d'**aucun mécanisme d'authentification intégré**. N'importe quel équipement sur le réseau peut émettre une réponse ARP sans avoir reçu de requête ARP préalable. Cette faille de conception permet les attaques suivantes :

#### Mécanique de l'attaque

```
Flux légitime :
  Hôte A ──Requête ARP──► (broadcast) ──► Routeur (10.0.0.1)
  Hôte A ◄──Réponse ARP──────────────────── Routeur (MAC : aa:bb:cc:dd:ee:ff)

Attaque par empoisonnement ARP :
  Hôte A ──Requête ARP──► (broadcast)
  L'attaquant envoie une réponse ARP NON SOLLICITÉE :
  "10.0.0.1 is at [MAC Attaquant]"
  Hôte A ◄──Réponse ARP forgée─────────── Attaquant
  Hôte A achemine désormais tout le trafic vers l'Attaquant → Attaque Man-in-the-Middle (MitM)
```

#### ARP Spoofing vs. MAC Spoofing

| Attaque | Mécanisme | Objectif |
| :--- | :--- | :--- |
| **ARP Spoofing / Poisoning** | Émission de réponses ARP forgées pour associer la MAC de l'attaquant à une IP légitime (ex. : passerelle par défaut) | Intercepter / rediriger le trafic (MitM), écoute passive ou modification de données |
| **MAC Spoofing** | Modification de l'adresse MAC de la NIC de l'attaquant pour usurper l'identité d'un hôte légitime | Tromper le commutateur pour qu'il achemine les trames vers l'attaquant plutôt que vers l'hôte légitime ; contourner les filtres de sécurité basés sur les adresses MAC |

#### Impact

- **Man-in-the-Middle (MitM) :** L'attaquant intercepte, lit ou modifie le trafic entre deux hôtes.
- **Déni de Service (DoS) :** L'attaquant associe une MAC invalide à l'IP de la passerelle, provoquant la perte de tout le trafic sortant.
- **Détournement de session (Session Hijacking) :** Une fois le MitM établi, l'attaquant peut injecter des données malveillantes dans des sessions actives.

#### Contre-mesures

| Contre-mesure | Description |
| :--- | :--- |
| **Dynamic ARP Inspection (DAI)** | Fonctionnalité des commutateurs Cisco validant les paquets ARP par rapport à la table de liaison DHCP snooping de confiance |
| **Entrées ARP statiques** | Configurer manuellement les associations IP-vers-MAC critiques (non évolutif pour les grands réseaux) |
| **Authentification de port 802.1X** | Garantir que seuls les équipements authentifiés peuvent se connecter aux ports du commutateur |
| **Supervision réseau / IDS** | Détecter les patterns de trafic ARP anormaux (ex. : floods de requêtes ARP gratuites) |
| **VPN / Canaux chiffrés** | Même si le trafic est intercepté, le chiffrement le rend inexploitable |

---

## RÉFÉRENCE EXAMEN — BANQUE DE QUESTIONS/RÉPONSES

Les questions et réponses suivantes sont issues du programme CyberOps Associate et du TP Cisco correspondant.

---

**Q : Comment le processus ARP utilise-t-il une adresse IP ?**
> ✅ Pour déterminer l'**adresse MAC d'un équipement sur le même réseau**.
> L'ARP résout une adresse IP connue en une adresse MAC inconnue au sein du domaine de broadcast local.

---

**Q : Que fait en PREMIER un hôte lorsqu'il prépare une PDU Layer 2 à destination d'un hôte sur le même réseau Ethernet ?**
> ✅ Il **consulte la table ARP** pour trouver l'adresse MAC de l'hôte de destination.
> Ce n'est qu'en l'absence d'entrée correspondante qu'il initie une requête ARP.

---

**Q : Lorsqu'un paquet IP est envoyé vers un hôte sur un réseau DISTANT, quelle information l'ARP fournit-il ?**
> ✅ L'**adresse MAC de l'interface du routeur la plus proche de l'hôte émetteur** (c'est-à-dire la MAC de la passerelle par défaut).
> L'ARP ne résout jamais directement la MAC d'un hôte distant — il résout celle du prochain saut.

---

**Q : Un hôte doit joindre un autre hôte sur un réseau distant, mais le cache ARP ne contient aucune entrée. Vers quelle adresse de destination la requête ARP sera-t-elle émise ?**
> ✅ L'**adresse MAC broadcast** (`FF:FF:FF:FF:FF:FF`).
> Les requêtes ARP sont toujours des broadcasts sur le segment réseau local.

---

**Q : Quel est l'objectif d'une attaque ARP spoofing ?**
> ✅ **Associer des adresses IP à de mauvaises adresses MAC**.
> Cela permet à l'attaquant d'intercepter ou de rediriger le trafic (MitM).

---

**Q : Dans quel type de mémoire la table ARP est-elle stockée ?**
> ✅ En **RAM** (mémoire volatile).
> Le cache ARP est effacé au redémarrage et les entrées expirent après un délai configurable.

---

**Q : Quelle est une caractéristique des messages ARP ?**
> ✅ **Les réponses ARP sont des unicasts.**
> Les requêtes ARP sont des broadcasts (diffusées sur tous les ports par le commutateur). L'ARP n'est pas encapsulé dans un en-tête IPv4 — il est transporté directement dans la trame Ethernet.

---

**Q : Quelle affirmation décrit le mieux la fonction de l'ARP ?**
> ✅ L'ARP est utilisé pour découvrir l'**adresse MAC de n'importe quel hôte sur le réseau local**.
> L'ARP ne franchit pas les frontières routées — sa portée est limitée au domaine de broadcast local.

---

**Q : Pourquoi un attaquant voudrait-il usurper une adresse MAC ?**
> ✅ Pour qu'**un commutateur du LAN achemine les trames vers l'attaquant à la place de l'hôte légitime**.
> Le MAC spoofing peut également servir à contourner les filtres de sécurité de port ou à usurper l'identité d'équipements de confiance.

---

**Q : Quelle information de l'en-tête de trame Ethernet est examinée par un équipement Layer 2 (commutateur) pour acheminer les données ?**
> ✅ L'**adresse MAC de destination**.
> Les commutateurs construisent leur table d'adresses MAC en lisant les adresses MAC source, puis acheminent les trames en se basant sur la MAC de destination.

---

**Q : Que contient le champ Préambule, et pourquoi n'est-il pas affiché dans Wireshark ?**
> ✅ Le Préambule contient des **bits de synchronisation** utilisés par le matériel de la NIC pour établir la synchronisation d'horloge au niveau de la couche physique. Il est intégralement traité par le matériel avant que les données ne parviennent au système d'exploitation ou au logiciel de capture — Wireshark ne le voit donc jamais.

---

**Q : Pourquoi l'adresse IP de destination change-t-elle lors d'un ping vers un hôte distant, alors que l'adresse MAC de destination reste la même que celle de la passerelle par défaut ?**
> ✅ Parce que l'**adresse IP identifie la destination finale** (qui se trouve sur un réseau distant), tandis que l'**adresse MAC identifie uniquement le prochain saut** (la passerelle par défaut sur le segment local). La MAC de destination dans la trame désigne toujours le prochain équipement directement connecté, en l'occurrence le routeur.

---

## AIDE-MÉMOIRE

| Concept | Fait clé |
| :--- | :--- |
| Type de requête ARP | **Broadcast** (`FF:FF:FF:FF:FF:FF`) |
| Type de réponse ARP | **Unicast** |
| Stockage du cache ARP | **RAM** |
| EtherType ARP | `0x0806` |
| EtherType IPv4 | `0x0800` |
| MAC distante résolue par ARP | **MAC de la passerelle par défaut**, pas celle de l'hôte distant |
| Décision de transfert d'un équipement Layer 2 | Basée sur l'**adresse MAC de destination** |
| Préambule dans Wireshark | **Non visible** — traité par le matériel |
| FCS dans Wireshark | **Non visible** — vérifié et retiré par la NIC |
| Faiblesse de sécurité de l'ARP | **Aucune authentification** — vulnérable au spoofing/poisoning |
| Objectif de l'ARP spoofing | Associer la MAC de l'attaquant à une IP légitime → **MitM** |
| Objectif du MAC spoofing | Usurper l'identité d'un hôte → **le commutateur achemine les trames vers l'attaquant** |
| Équivalent IPv6 de l'ARP | **ICMPv6 Neighbor Discovery (NS/NA)** |

---
