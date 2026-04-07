---
title: "Couche Transport — Opérations et Méthodologies de Reconnaissance Réseau"
description: "Analyse technique approfondie des protocoles de la couche 4 du modèle OSI, gestion des états de session via le three-way handshake TCP, classification des ports, et application de Nmap pour l'audit de sécurité et la découverte réseau."
order: 9
---

# Couche Transport — Opérations et Méthodologies de Reconnaissance Réseau

## PRÉSENTATION DU MODULE

La couche transport, ou **couche 4 du modèle OSI**, assure la communication logique entre les applications s'exécutant sur des hôtes distincts. Elle constitue l'interface principale entre la couche application et l'infrastructure réseau sous-jacente. Ses responsabilités fondamentales sont les suivantes :

- **Suivi** des conversations individuelles entre applications
- **Segmentation** des données applicatives en unités transportables
- **Réassemblage** des segments à destination dans le bon ordre
- **Multiplexage** de plusieurs flux applicatifs simultanément sur le même réseau

La communication est gérée par le **multiplexage de conversations**, qui permet à plusieurs applications d'utiliser le réseau simultanément par entrelacement de segments. Ce module détaille les distinctions opérationnelles entre le **Transmission Control Protocol (TCP)** et le **User Datagram Protocol (UDP)**, les mécanismes d'établissement de session, et la méthodologie d'audit de ces services via **Nmap**.

---

## CONCEPTS FONDAMENTAUX ET DÉFINITIONS

### Transmission Control Protocol (TCP)

TCP est un protocole **orienté connexion** et **à état (stateful)** conçu pour garantir la fiabilité des données et leur livraison ordonnée. Il maintient l'état d'une conversation en enregistrant quelles données ont été transmises et accusées de réception par le destinataire.

| Caractéristique TCP | Description |
| :--- | :--- |
| **Fiabilité** | Utilise des numéros de séquence et des accusés de réception (ACK) pour tracer chaque segment |
| **Contrôle de flux** | Mécanisme de **fenêtre glissante (sliding window)** pour réguler le débit en fonction de la capacité du buffer récepteur |
| **Segmentation** | Divise les données applicatives en **segments** conformément aux limitations MTU du réseau |
| **Livraison ordonnée** | Réassemble les segments dans le bon ordre à destination |
| **Établissement de session** | Requiert un **three-way handshake** avant tout transfert de données |
| **Terminaison de session** | Utilise les flags **FIN** et **ACK** pour clore proprement les connexions |

**Taille d'en-tête :** 20 octets minimum.

**Cas d'usage typiques :** FTP, HTTP, HTTPS, messagerie (SMTP, POP3, IMAP) — toute application où l'intégrité des données est primordiale.

---

### User Datagram Protocol (UDP)

UDP est un protocole **sans connexion (connectionless)** et **sans état (stateless)** qui assure une livraison au mieux (best-effort) avec un overhead minimal. Contrairement à TCP, il ne fournit ni contrôle de flux, ni récupération d'erreur, ni séquencement.

| Caractéristique UDP | Description |
| :--- | :--- |
| **Faible latence** | Aucun overhead lié à l'établissement de connexion ou aux accusés de réception |
| **Livraison best-effort** | Aucune garantie que les datagrammes arrivent ou arrivent dans l'ordre |
| **En-tête compact** | 8 octets — nettement plus petit que les 20 octets de TCP |
| **Sans état** | Pas de suivi de session ; chaque datagramme est indépendant |

**Cas d'usage typiques :** VoIP, DNS, DHCP, streaming vidéo — applications privilégiant la vitesse à la livraison garantie.

---

### Numéros de port

La couche transport identifie les applications spécifiques via des **numéros de port**, permettant à plusieurs services de fonctionner simultanément sur un même hôte.

| Catégorie de port | Plage | Rôle | Exemples |
| :--- | :--- | :--- | :--- |
| **Ports bien connus (Well-Known)** | 0 – 1023 | Assignés aux services communs standardisés | HTTP (80), SSH (22), FTP (21), DNS (53) |
| **Ports enregistrés (Registered)** | 1024 – 49151 | Assignés par l'IANA à des applications spécifiques | RDP (3389), MySQL (3306) |
| **Ports privés / dynamiques** | 49152 – 65535 | Ports éphémères assignés dynamiquement par l'OS aux applications clientes | Toute connexion sortante client |

> **Distinction clé :**
> - **Port de destination** → identifie le *service* sur l'hôte cible (ex. : port 80 pour HTTP).
> - **Port source** → assigné dynamiquement ; permet de router les données de retour vers l'application cliente correcte.

---

## TAXONOMIE TECHNIQUE ET CLASSIFICATION

### Analyse comparative des protocoles

| Caractéristique | TCP | UDP |
| :--- | :---: | :---: |
| **Type de connexion** | Orienté connexion | Sans connexion |
| **Gestion d'état** | Stateful | Stateless |
| **Fiabilité** | Livraison garantie | Livraison best-effort |
| **Séquencement** | Réassemblage ordonné | Pas de séquencement |
| **Contrôle de flux** | Fenêtre glissante | Non supporté |
| **Récupération d'erreur** | Retransmission des segments perdus | Aucune |
| **Overhead d'en-tête** | 20 octets | 8 octets |
| **Vitesse** | Plus lent (overhead élevé) | Plus rapide (overhead minimal) |
| **Applications typiques** | FTP, HTTP, Messagerie | VoIP, DNS, Streaming |

---

### Champs d'en-tête TCP absents de l'en-tête UDP

Les champs suivants sont présents dans l'**en-tête TCP** mais **absents de l'en-tête UDP** :

| Champ exclusif TCP | Rôle |
| :--- | :--- |
| **Numéro de séquence (Sequence Number)** | Identifie la position en octets de chaque segment pour le réassemblage ordonné |
| **Numéro d'acquittement (Acknowledgment Number)** | Indique le **prochain octet** attendu par le récepteur ; confirme la réception |
| **Taille de fenêtre (Window Size)** | Nombre d'octets que le récepteur peut accepter avant d'exiger un ACK (contrôle de flux) |
| **Flags de contrôle** | SYN, ACK, FIN, RST, PSH, URG — gèrent l'état de session |

> **Note d'examen :** Les en-têtes TCP et UDP contiennent tous deux les champs **Port source**, **Port destination**, **Longueur** et **Checksum**. Le numéro de séquence et la taille de fenêtre sont exclusifs à TCP.

---

## ANALYSE OPÉRATIONNELLE

### Méthodologie du Three-Way Handshake TCP

L'établissement d'une session TCP requiert un processus de signalisation en trois étapes pour synchroniser les numéros de séquence et établir les paramètres de connexion **avant** tout échange de données applicatives.

```
Client                          Serveur
  |                                |
  |──── SYN (Seq=0) ──────────────►|   Étape 1 : Le client initie
  |                                |
  |◄─── SYN-ACK (Seq=0, Ack=1) ───|   Étape 2 : Le serveur répond et synchronise
  |                                |
  |──── ACK (Seq=1, Ack=1) ───────►|   Étape 3 : Le client confirme — session ouverte
  |                                |
  |════ DÉBUT DE L'ÉCHANGE DE DONNÉES ══════|
```

| Étape | Flag(s) actif(s) | Émetteur | Rôle |
| :---: | :--- | :--- | :--- |
| **1** | `SYN` | Client → Serveur | Initie la connexion ; envoie le numéro de séquence initial (ISN) |
| **2** | `SYN, ACK` | Serveur → Client | Acquitte l'ISN du client ; envoie l'ISN du serveur |
| **3** | `ACK` | Client → Serveur | Confirme l'ISN du serveur ; session pleinement établie |

#### Observation en laboratoire Wireshark (capture de paquets)

Issu du lab Cisco CyberOps, une capture TCP filtrée du three-way handshake entre `10.0.0.11` et `172.16.0.40` produit :

| Trame | Source | Destination | Flags | Seq | Ack | Remarques |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | 10.0.0.11:58716 | 172.16.0.40:80 | `SYN` | 0 | — | Client initie ; port source dynamique (plage privée) |
| 2 | 172.16.0.40:80 | 10.0.0.11:58716 | `SYN, ACK` | 0 | 1 | Serveur répond ; ISN des deux côtés synchronisés |
| 3 | 10.0.0.11:58716 | 172.16.0.40:80 | `ACK` | 1 | 1 | Client confirme ; session TCP pleinement établie |

> **Classification des ports (Trame 1) :**
> - Port source `58716` → **Privé/Dynamique** (port éphémère client)
> - Port destination `80` → **Well-Known** (service HTTP)

#### Identification du handshake dans une liste de trames Wireshark

Dans une liste de trames capturées, le three-way handshake correspond toujours à la séquence :

```
[SYN]  →  [SYN, ACK]  →  [ACK]
```

Dans l'exercice d'examen (question 11), les **lignes 2, 3 et 4** représentent ce schéma :
- Ligne 2 : `53215 > http [SYN]`
- Ligne 3 : `http > 53215 [SYN, ACK]`
- Ligne 4 : `53215 > http [ACK]`

---

### Terminaison de session TCP

Les sessions sont fermées via un échange **FIN/ACK en quatre étapes** (parfois visible dans les captures sous la forme FIN, ACK → ACK → FIN, ACK → ACK). Le flag `FIN` signale la fin de la transmission de données depuis un côté.

```
Client                          Serveur
  |──── FIN, ACK ─────────────────►|
  |◄─── ACK ───────────────────────|
  |◄─── FIN, ACK ──────────────────|
  |──── ACK ───────────────────────►|
```

---

### Fenêtre glissante TCP et contrôle de flux

Le mécanisme de **fenêtre glissante (sliding window)** permet à TCP de transmettre plusieurs segments avant d'exiger un acquittement, dans la limite définie par le champ **Window Size** de l'en-tête.

- Si le buffer du récepteur se remplit, il réduit la taille de fenêtre pour ralentir l'émetteur.
- En cas de perte de segment, le récepteur signale à la source de **retransmettre à partir d'un point précis** (acquittement sélectif ou cumulatif).
- La fenêtre glissante ne signale **pas** la fin de la communication — c'est le rôle du flag `FIN`.

---

### Caractéristiques du processus serveur TCP

- Un serveur peut avoir **de nombreux ports ouverts simultanément**, un par application serveur active.
- Chaque application se voit attribuer un numéro de port unique bien connu ou enregistré.
- **Deux services distincts ne peuvent pas partager le même port** au sein du même protocole de transport sur un hôte donné.
- Un hôte client peut maintenir **plusieurs sessions TCP simultanées** avec le même serveur ou des serveurs différents (chacune identifiée par un port source unique).

---

### Comportement de fiabilité FTP

FTP utilisant TCP, si une partie d'un message n'est pas livrée à destination :

> **La partie perdue spécifique est retransmise** — ni l'intégralité du message, ni un abandon silencieux. Les numéros de séquence et acquittements TCP identifient précisément les octets à renvoyer.

---

## RECONNAISSANCE RÉSEAU AVEC NMAP

### Qu'est-ce que Nmap ?

**Nmap** (Network Mapper) est un outil open-source de découverte réseau et d'audit de sécurité. Il utilise des paquets IP bruts pour déterminer :

- Quels hôtes sont actifs sur le réseau
- Quels ports sont ouverts sur ces hôtes
- Quels services (et leurs versions) sont en cours d'exécution
- Quels systèmes d'exploitation (et leurs versions) sont utilisés
- Quels types de filtres de paquets ou pare-feux sont en place

Nmap est utilisé aussi bien par les **professionnels de la sécurité** pour les audits de routine et l'inventaire réseau, que potentiellement par des **acteurs malveillants** lors d'attaques de reconnaissance. Le scan de ports constitue généralement l'une des premières phases d'une attaque réseau.

---

### Taxonomie des états de ports Nmap

Nmap classe les ports scannés selon des états spécifiques en fonction de la réponse reçue de l'hôte cible.

| État du port | Description technique |
| :--- | :--- |
| **Open (ouvert)** | Une application accepte activement des connexions TCP ou des datagrammes UDP sur ce port |
| **Closed (fermé)** | Le port est accessible (l'hôte a répondu) mais aucune application n'écoute actuellement |
| **Filtered (filtré)** | Un pare-feu ou filtre de paquets empêche Nmap de déterminer l'état du port |
| **Open\|Filtered** | Nmap ne peut distinguer entre ouvert et filtré (fréquent en UDP) |

---

### Paramètres courants des commandes Nmap

```bash
# Scan agressif d'un hôte unique
nmap -A -T4 <cible>

# Scan d'un sous-réseau complet
nmap -A -T4 192.168.1.0/24

# Scan UDP
nmap -sU <cible>

# Scan furtif TCP SYN (half-open)
nmap -sS <cible>

# Scan du serveur de test distant
nmap -A -T4 scanme.nmap.org
```

| Option | Nom complet | Effet |
| :--- | :--- | :--- |
| `-A` | Mode agressif | Active la détection d'OS, la détection de version, le scan de scripts et le traceroute |
| `-T4` | Template de timing 4 | Timing « Agressif » — exécution accélérée, adapté aux réseaux fiables |
| `-sU` | Scan UDP | Identifie les services UDP ouverts |
| `-sS` | Scan SYN furtif | Scan TCP half-open ; moins susceptible d'être journalisé par la cible |

---

### Exemple de laboratoire : scan de scanme.nmap.org

Issu du lab Cisco CyberOps Nmap, un scan de `scanme.nmap.org` (`45.33.32.156`) produit les résultats suivants :

| Port | État | Service | Remarques |
| :--- | :--- | :--- | :--- |
| 22/tcp | Ouvert | SSH | OpenSSH 6.6.1p1 Ubuntu |
| 25/tcp | Filtré | SMTP | Bloqué par pare-feu |
| 80/tcp | Ouvert | HTTP | Apache httpd 2.4.7 (Ubuntu) |
| 135/tcp | Filtré | MSRPC | Bloqué par pare-feu |
| 139/tcp | Filtré | NetBIOS-SSN | Bloqué par pare-feu |
| 445/tcp | Filtré | Microsoft-DS | Bloqué par pare-feu |
| 9929/tcp | Ouvert | Nping-echo | Service de test Nmap |
| 31337/tcp | Ouvert | tcpwrapped | — |

> Le site `scanme.nmap.org` est intentionnellement mis à disposition par le projet Nmap comme cible légale et autorisée pour la pratique des scans.

---

### Nmap : considérations sur le double usage en sécurité

| Profil | Usage |
| :--- | :--- |
| **Administrateur réseau** | Inventaire des hôtes actifs, détection de périphériques non autorisés, vérification des règles de pare-feu, audit des ports ouverts |
| **Analyste en sécurité** | Identification des vulnérabilités avant les attaquants ; établissement d'une ligne de base de l'état normal du réseau |
| **Acteur malveillant** | Phase de reconnaissance d'une attaque — découverte des cibles, services ouverts et empreintes d'OS |

> ⚠️ **Obtenir toujours une autorisation écrite explicite** des propriétaires du réseau avant d'exécuter des scans Nmap. Un scan non autorisé peut être illégal.

---

## ÉTUDES DE CAS ET POINTS D'EXAMEN

### Critères de sélection du protocole

Dans les environnements CyberOps, l'identification du protocole de transport correct est essentielle pour l'analyse de trafic :

| Protocole | Choisir quand... | Applications types |
| :--- | :--- | :--- |
| **UDP** | La vitesse et le faible overhead priment sur la livraison garantie | VoIP, DNS, DHCP, streaming vidéo |
| **TCP** | L'intégrité des données et la livraison ordonnée sont impératives | FTP, HTTP, HTTPS, POP3, SMTP |

---

### Champs clés de l'en-tête TCP — Référence rapide

| Champ | Taille | Signification |
| :--- | :---: | :--- |
| **Port source** | 16 bits | Port client assigné dynamiquement (identifie l'application émettrice) |
| **Port destination** | 16 bits | Identifie le service cible sur le serveur |
| **Numéro de séquence** | 32 bits | Position en octets du premier octet de ce segment |
| **Numéro d'acquittement** | 32 bits | **Prochain octet** que le récepteur s'attend à recevoir |
| **Taille de fenêtre** | 16 bits | Nombre d'octets acceptables par le récepteur avant qu'un ACK soit requis |
| **Flags de contrôle** | 6 bits | SYN, ACK, FIN, RST, PSH, URG |
| **Checksum** | 16 bits | Champ de vérification d'erreur (présent dans TCP et UDP) |

---

### Référence des flags TCP

| Flag | Nom | Rôle |
| :---: | :--- | :--- |
| `SYN` | Synchronize | Initie une connexion ; utilisé aux étapes 1 et 2 du handshake |
| `ACK` | Acknowledge | Confirme la réception de données ; utilisé aux étapes 2 et 3 du handshake |
| `FIN` | Finish | Signal de fin propre d'une connexion |
| `RST` | Reset | Termine abruptement une connexion ou rejette une requête invalide |
| `PSH` | Push | Demande au récepteur de transmettre immédiatement les données à l'application |
| `URG` | Urgent | Indique des données urgentes devant être traitées en priorité |

> **Point d'examen :** Le three-way handshake TCP n'utilise que les flags **SYN** et **ACK**. Les deux flags servant à *établir* la connectivité sont **SYN** et **ACK**.

---

### Classification des ports — Référence rapide

| Plage | Catégorie | Exemples |
| :--- | :--- | :--- |
| 0 – 1023 | Ports well-known | HTTP (80), HTTPS (443), FTP (21), SSH (22), DNS (53), SMTP (25) |
| 1024 – 49151 | Ports enregistrés | RDP (3389), MySQL (3306) |
| 49152 – 65535 | Ports privés / dynamiques | Ports éphémères clients (ports source des connexions sortantes) |

---

### Filtres Wireshark utiles pour les administrateurs réseau

| Filtre | Utilité |
| :--- | :--- |
| `tcp` | Afficher uniquement le trafic TCP |
| `udp` | Afficher uniquement le trafic UDP |
| `http` | Afficher uniquement le trafic HTTP |
| `ip.addr == 192.168.1.1` | Afficher le trafic vers/depuis une adresse IP spécifique |
| `tcp.flags.syn == 1` | Isoler les paquets TCP SYN (initiations de connexion) |
| `tcp.flags.fin == 1` | Isoler les paquets TCP FIN (terminaisons de session) |
| `dns` | Afficher uniquement les requêtes et réponses DNS |

---

## RÉCAPITULATIF

```
┌──────────────────────────────────────────────────────┐
│         COUCHE TRANSPORT — VUE D'ENSEMBLE             │
├───────────────────────┬──────────────────────────────┤
│          TCP          │            UDP               │
├───────────────────────┼──────────────────────────────┤
│ Orienté connexion     │ Sans connexion               │
│ Three-way handshake   │ Pas de handshake             │
│ Fiable / Ordonné      │ Best-effort                  │
│ Fenêtre glissante     │ Pas de contrôle de flux      │
│ En-tête 20 octets     │ En-tête 8 octets             │
│ FTP, HTTP, Messagerie │ VoIP, DNS, Streaming         │
└───────────────────────┴──────────────────────────────┘

Fonctions clés de la couche transport :
  ✔ Identifier les applications via les numéros de port
  ✔ Suivre les sessions de communication individuelles
  ✔ Segmenter / réassembler les données
  ✔ Fournir l'interface entre applications et réseau (TCP/UDP)

États de ports Nmap :  Open | Closed | Filtered
Flags du handshake :   SYN → SYN-ACK → ACK
Flags de terminaison : FIN, ACK → ACK → FIN, ACK → ACK
```