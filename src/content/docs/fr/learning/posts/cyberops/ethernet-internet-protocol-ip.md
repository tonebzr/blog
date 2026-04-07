---
title: "Opérations des protocoles Ethernet et IP"
description: "Couche 2 (Ethernet) et Couche 3 (IP), champs de trames, adressage, routage et opérations sur les hôtes."
order: 6
---

## PRÉSENTATION DU MODULE

Ce module propose un examen technique rigoureux des suites de protocoles **Ethernet** et **IP (Internet Protocol)**. Pour un analyste en cybersécurité, comprendre les fonctions précises au niveau des bits de ces protocoles est indispensable pour interpréter les captures de paquets (PCAP) et identifier les comportements réseau anormaux. L'accent est mis sur l'intégrité structurelle des trames et la logique qui gouverne le transit des paquets à travers des réseaux hétérogènes.

---

## CONCEPTS FONDAMENTAUX ET DÉFINITIONS

### Le protocole Ethernet (Couche 2)
Ethernet opère à la couche Liaison de données (OSI Couche 2) et à la couche Physique, en fournissant l'adressage physique nécessaire à la communication **de saut en saut (hop-to-hop)**. Il est défini par les normes **IEEE 802.2 et 802.3** et supporte des débits allant de **10 Mbps à 100 000 Mbps (100 Gbps)**. Il utilise la méthode de contrôle d'accès **CSMA/CD** (Carrier Sense Multiple Access with Collision Detection).

* **Adresse MAC** : Adresse physique de **48 bits** gravée dans la carte réseau (NIC) par le fabricant. Elle est globalement unique et s'exprime en **12 chiffres hexadécimaux** (4 bits par chiffre hex). Elle peut être représentée avec des tirets, des deux-points ou des points.
* **Unicast vs. Broadcast** : L'adresse MAC **source** doit toujours être une adresse **unicast** (identifiant une seule NIC). L'adresse de **destination** peut être unicast, multicast ou broadcast.
* **Sous-couche LLC (IEEE 802.2)** : La sous-couche de contrôle de liaison logique **communique avec les protocoles des couches supérieures**. Elle n'ajoute PAS l'en-tête/trailer (c'est le rôle de la sous-couche MAC) et n'est PAS responsable du contrôle d'accès au média.

### Le protocole Internet (Couche 3)
La couche Réseau assure des services de **livraison de bout en bout**. Elle encapsule le **segment de la couche Transport (Couche 4)** dans un paquet. Les protocoles principaux, **IPv4** et **IPv6**, partagent trois caractéristiques fondamentales :

* **Sans connexion (Connectionless)** : Aucun établissement de session n'a lieu à cette couche avant l'envoi des paquets.
* **Meilleur effort (Best Effort)** : La fiabilité n'est pas une fonction de la couche Réseau ; la livraison n'est **pas garantie**. Les paquets peuvent être perdus, corrompus ou arriver dans le désordre. IP ne retransmet pas les paquets.
* **Indépendant du média (Media Independent)** : Le protocole fonctionne de manière identique sur câble cuivre, fibre optique ou media sans fil. Cependant, la couche réseau est responsable de la **fragmentation** quand un paquet dépasse le MTU du média.

> **Astuce examen :** La couche Transport (Couche 4) envoie des **segments** qui sont encapsulés par la couche Réseau (Couche 3) dans des paquets IPv4 ou IPv6.

---

## TAXONOMIE TECHNIQUE ET CLASSIFICATION

### Analyse fonctionnelle des champs de la trame Ethernet
La taille minimale d'une trame Ethernet est de **64 octets** et la taille maximale est de **1518 octets** (de l'adresse MAC de destination jusqu'au FCS — le Préambule n'est **pas** compté dans la taille de la trame). Les trames inférieures au minimum sont appelées **"runt frames"** et sont éliminées.

| Champ | Taille | Rôle technique |
| :--- | :--- | :--- |
| **Préambule** | 7 octets | **Avertit les destinations de se préparer** (synchronisation) à recevoir une nouvelle trame. |
| **Délimiteur de début de trame (SFD)** | 1 octet | Signale que l'octet suivant est le début de l'adresse MAC de destination. |
| **Adresse de destination** | 6 octets | Champ clé utilisé par un hôte pour **déterminer si une trame lui est adressée**. Comparé à sa propre adresse MAC. Peut être unicast, multicast ou broadcast. |
| **Adresse source** | 6 octets | Identifie la NIC d'origine. L'adresse MAC source ne peut être **que unicast**. |
| **Type / Longueur (EtherType)** | 2 octets | **Identifie le protocole de couche supérieure encapsulé** (ex. : 0x0800 = IPv4, 0x86DD = IPv6, 0x0806 = ARP). |
| **Champ de données** | 46–1500 octets | Contient le PDU de Couche 3 (paquet). Si la charge utile est trop petite, des **bits de rembourrage (padding)** sont ajoutés pour atteindre le minimum de 64 octets. |
| **Séquence de contrôle de trame (FCS)** | 4 octets | Utilisé par la destination pour **détecter les erreurs de transmission** via un CRC (Contrôle de Redondance Cyclique). Si le CRC recalculé ne correspond pas, la trame est **éliminée**. |

> **Astuce examen — Préambule vs. FCS :**
> * **Préambule** → "se préparer à recevoir"
> * **FCS** → "vérifier les erreurs après réception"

### En-tête de paquet IPv4 — Champs clés

| Champ | Rôle technique |
| :--- | :--- |
| **Version** | Identifie la version IP (0100 = IPv4). |
| **Services différenciés (DS / DSCP)** | Utilisé pour déterminer la **priorité** de chaque paquet (QoS). |
| **Durée de vie (TTL)** | Décrémenté de 1 à chaque saut routeur. Quand il atteint 0, le paquet est **éliminé** et un message ICMP "Time Exceeded" est envoyé. Évite les boucles de routage infinies. |
| **Protocole** | Identifie le protocole de niveau supérieur (Couche 4) encapsulé. Valeurs courantes : **ICMP = 1, TCP = 6, UDP = 17**. |
| **Somme de contrôle de l'en-tête (Header Checksum)** | Utilisé pour **détecter la corruption dans l'en-tête IPv4** uniquement (pas la charge utile). |
| **Adresse IP source** | Adresse 32 bits de l'hôte émetteur. **Ne change pas** en transit (sauf avec NAT). |
| **Adresse IP de destination** | Adresse 32 bits de l'hôte destinataire. **Ne change pas** en transit (sauf avec NAT). |
| **Identification, Drapeaux, Décalage de fragment** | Utilisés pour **suivre et réassembler les paquets fragmentés**. |

> **Astuce examen — Header Checksum vs. FCS :**
> * **Header Checksum** → détecte la corruption dans **l'en-tête IPv4** (Couche 3)
> * **FCS** → détecte les erreurs dans **la trame Ethernet** (Couche 2)

> **Piège fréquent :** Les champs **Longueur totale** et **Header Checksum** servent à **identifier et valider** le paquet. Les champs utilisés pour **réordonner les paquets fragmentés** sont **Identification, Drapeaux et Décalage de fragment** — PAS Longueur totale ni Header Checksum.

### Comparaison des en-têtes IPv4 vs. IPv6

| Caractéristique | IPv4 | IPv6 |
| :--- | :--- | :--- |
| **Longueur de l'adresse** | 32 bits | 128 bits |
| **Représentation** | Décimal pointé | Hexadécimal (hextets) |
| **Gestion des erreurs** | Header Checksum présent | **Pas de Header Checksum** (géré en Couche 2/4) |
| **Configuration** | Statique ou DHCPv4 | SLAAC ou DHCPv6 |
| **Fragmentation** | Effectuée par les routeurs **ou** la source | Effectuée **uniquement par la source** |
| **Espace d'adressage** | ~4,3 milliards | ~340 undécillions |

![ipv4 frame field](../../../../../../assets/images/site/learning-cyops6-ehternet-frame-field.webp)

---

## ANALYSE OPÉRATIONNELLE

### Adressage IPv4 : Portion réseau vs. portion hôte
Une adresse IPv4 est une **adresse hiérarchique de 32 bits** qui contient :
* Une **portion réseau** (identifie le réseau)
* Une **portion hôte** (identifie l'hôte spécifique sur ce réseau)

Le **masque de sous-réseau** différencie les deux portions. Un masque de sous-réseau est une **séquence consécutive de bits à 1** (déterminant la portion réseau) suivie d'une **séquence consécutive de bits à 0** (déterminant la portion hôte). Ce n'est **PAS** une combinaison arbitraire de 0 et de 1. Sa longueur est de **32 bits** (comme une adresse IPv4), **pas** 24 bits.

> **Les bits à 1 du masque → portion réseau. Les bits à 0 → portion hôte.**

L'adresse IPv4 seule est **insuffisante** pour déterminer les portions réseau et hôte — le masque de sous-réseau est toujours nécessaire.

### L'opération AND (ET logique)
Pour déterminer la destination d'un paquet, un équipement de Couche 3 effectue une opération **ET bit à bit (ANDing)**.

**Table de vérité ET :**
* 1 ET 1 = **1**
* 1 ET 0 = **0**
* 0 ET 1 = **0**
* 0 ET 0 = **0**

> **Astuce examen — Règles AND :**
> * 1 ET 0 = **0** ✓
> * 1 ET 1 = **1** ✓ (PAS 0)
> * L'AND s'effectue entre une **adresse IPv4** et un **masque de sous-réseau** (PAS entre deux adresses IPv4).
> * **Objectif** : identifier l'**adresse réseau** de la destination (PAS l'adresse hôte, PAS l'adresse de broadcast).

**Exemple :** `10.128.17.4 ET 255.255.240.0`

```
10.128.17.4   = 00001010.10000000.00010001.00000100
255.255.240.0 = 11111111.11111111.11110000.00000000
                -----------------------------------------
Résultat      = 00001010.10000000.00010000.00000000
              = 10.128.16.0
```
**→ Adresse réseau : 10.128.16.0 / 255.255.240.0**

### Calcul de la capacité d'un sous-réseau
Pour l'examen CyberOps, des calculs précis du nombre d'hôtes sont requis.

**Formule :** Hôtes utilisables = $2^n - 2$ (on soustrait l'adresse réseau et l'adresse de broadcast), où *n* = nombre de **bits hôtes**.

**Exemple : 192.168.1.0/27**
* /27 → 27 bits pour le réseau, **5 bits pour les hôtes**
* $2^5 = 32$ adresses au total
* **30 adresses hôtes utilisables**

### Décisions de transfert des hôtes
Un hôte source détermine si une destination est **locale ou distante** en effectuant un AND entre son propre masque et ses deux adresses IP (la sienne et celle de destination), puis en comparant les résultats.

* **Destination locale** → l'hôte communique directement (pas de routeur nécessaire). Les hôtes locaux peuvent se joindre sans routeur.
* **Destination distante** → le paquet est envoyé à la **passerelle par défaut**.

**La passerelle par défaut :**
* Est l'adresse IP du **routeur** sur le **réseau local** (pas un switch, pas un équipement d'un réseau distant).
* Possède une adresse IP dans la **même plage** que les hôtes locaux.
* Est requise pour transmettre des paquets **en dehors** du réseau local. Sans passerelle par défaut, le trafic ne peut pas quitter le réseau local.
* N'est **pas** nécessaire pour la communication entre hôtes sur le **même** réseau local.

### Table de routage de l'hôte
Un hôte maintient sa propre **table de routage locale** contenant :
1. Une route vers l'**interface de bouclage (loopback)**
2. Une **route vers le réseau local**
3. Une **route par défaut distante** (via la passerelle par défaut)

**Commandes :**
* `netstat -r` ou `route print` → affiche la **table de routage de l'hôte**

### Opération AND — Objectif en Couche 3
Un équipement de Couche 3 effectue l'opération AND sur une **adresse IP de destination et un masque de sous-réseau** pour identifier l'**adresse réseau** du réseau de destination. Ceci permet de prendre des décisions de routage (local vs. distant, quelle route utiliser).

---

## ÉTUDES DE CAS ET POINTS CLÉS D'EXAMEN

### Fragmentation et MTU
Quand un routeur reçoit un paquet plus grand que le **MTU (Maximum Transmission Unit)** de l'interface de sortie, il doit effectuer une **Fragmentation**. Le routeur découpe le paquet en morceaux plus petits. L'hôte de destination réassemble les fragments grâce aux champs **Identification, Drapeaux et Décalage de fragment** dans l'en-tête IPv4.

> **Vocabulaire clé :**
> * **Segmentation** → Couche Transport (TCP découpe les données en segments)
> * **Fragmentation** → Couche Réseau (le routeur/la source divise les paquets pour un MTU plus petit)
> * **Encapsulation** → enveloppement des données avec des en-têtes de protocole
> * **Sérialisation** → conversion des données en flux de bits pour la transmission

### Vérification de la boucle locale (Loopback)
Pour vérifier que la pile TCP/IP interne fonctionne correctement **sans** envoyer de trafic sur le média physique :
* **Loopback IPv4** : `127.0.0.1`
* **Loopback IPv6** : `::1`
* **Commande** : `ping 127.0.0.1`
* **Teste** : la pile TCP/IP sur l'hôte local — **pas** la connectivité physique, **pas** la connectivité avec un autre équipement.

### Plages d'adresses IPv4 privées
Ces trois blocs d'adresses sont réservés à un usage privé et **ne sont pas routables** sur l'internet public :

| Plage | CIDR | Classe |
| :--- | :--- | :--- |
| **10.0.0.0 – 10.255.255.255** | 10.0.0.0/8 | Classe A |
| **172.16.0.0 – 172.31.255.255** | 172.16.0.0/12 | Classe B |
| **192.168.0.0 – 192.168.255.255** | 192.168.0.0/16 | Classe C |

> **Astuce examen :** `172.16.4.4` ✓ privée | `172.32.x.x` ✗ PAS privée | `192.167.x.x` ✗ PAS privée | `224.x.x.x` → multicast (PAS privée)

### Caractéristiques d'IP (Les deux clés à l'examen)
IP **fait** :
* Fonctionner **sans connexion dédiée de bout en bout** (sans connexion)
* Fonctionner **indépendamment du média réseau** (indépendant du média)

IP **ne fait PAS** :
* Garantir la livraison des paquets
* Réassembler les paquets hors-ordre *(c'est le rôle de TCP en Couche 4)*
* Retransmettre les paquets en cas d'erreur

### Compression et identification des adresses IPv6
IPv6 utilise un préfixe /64 pour la plupart des réseaux locaux, divisant l'adresse en deux parties :
1. **Préfixe (64 premiers bits)** : Identification du réseau.
2. **Identifiant d'interface (64 derniers bits)** : Identifiant de l'hôte.

**Deux règles de compression :**
1. **Omettre les zéros de tête** dans chaque hextet : `0db8` → `db8`, `0000` → `0`
2. **Double deux-points (::)** remplace une séquence contiguë de hextets à zéro. Ne peut être utilisé **qu'une seule fois** par adresse.

**Exemple :** `2001:0DB8:75a3:0214:0607:1234:aa10:ba01 /64`
* Préfixe réseau : `2001:0DB8:75a3:0214`
* Identifiant hôte : **`0607:1234:aa10:ba01`**

**Exemple de compression IPv6 :** `2001:0db8:eeff:000a:0000:0000:0000:0001`
* Suppression des zéros de tête : `2001:db8:eeff:a:0:0:0:1`
* Application du double deux-points : **`2001:db8:eeff:a::1`**

### Points clés sur l'adresse MAC
* C'est une **adresse physique** attribuée à une NIC Ethernet **par le fabricant**.
* Elle fait **48 bits** de long (exprimée en 12 chiffres hexadécimaux).
* Elle identifie la source et la destination **locales** (Couche 2) — PAS des adresses à l'échelle d'internet (c'est le rôle d'IPv4/IPv6).
* Elle ne contient **pas** de portion réseau / portion hôte (c'est un concept propre aux adresses IP).

### Caractéristiques de la technologie Ethernet (Choisir deux à l'examen)
* Définie par les normes **IEEE 802.3** ✓
* Utilise la méthode de contrôle d'accès **CSMA/CD** ✓
* Utilise une topologie **bus ou étoile** (PAS anneau — l'anneau, c'est Token Ring / IEEE 802.5)
* Supporte des débits de **10 Mbps à 100 Gbps** (PAS "une moyenne de 16 Mbps")

### Services de la couche Réseau OSI (Choisir deux à l'examen)
La couche Réseau (Couche 3) fournit :
* **Le routage** — sélection du meilleur chemin vers une destination
* **L'adressage logique** — adressage IP des équipements terminaux

La couche Réseau ne fournit **PAS** :
* La détection d'erreurs (→ FCS en Couche 2, ou TCP en Couche 4)
* Le placement des trames sur le média (→ Couche 2)
* La détection de collisions (→ CSMA/CD en Couche 1/2)
