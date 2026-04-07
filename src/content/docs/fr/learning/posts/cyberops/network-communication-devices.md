---
title: "Équipements de Communication Réseau et Opérations d'Infrastructure"
description: "Analyse technique approfondie des composants d'infrastructure Layer 2 et Layer 3, classification des protocoles de routage, méthodologies d'association sans fil et commutation multicouche dans le cadre CyberOps."
order: 11
---

## PRÉSENTATION DU MODULE

L'infrastructure réseau constitue l'architecture fondamentale permettant l'interconnexion des équipements et les communications de bout en bout. Le respect des conceptions standardisées par l'industrie est essentiel pour garantir la disponibilité et la sécurité du réseau. Ce module détaille le fonctionnement opérationnel des équipements de communication réseau, couvrant les infrastructures filaires et sans fil.

Pour l'analyste en cybersécurité, la maîtrise de ces mécanismes est critique pour interpréter les journaux d'événements, réaliser des captures de paquets (PCAP) et identifier des anomalies telles que l'empoisonnement de table de routage ou le détournement BGP (BGP hijacking).

## CONCEPTS FONDAMENTAUX & DÉFINITIONS

### Équipements Terminaux et Adressage

Les équipements terminaux (end devices) constituent la source ou la destination de tout message transmis sur le réseau. Pour permettre leur identification unique, chaque équipement terminal se voit attribuer une adresse spécifique. La communication est initiée lorsque l'équipement source spécifie l'adresse de l'équipement destination pour l'acheminement du message.

### Rôles des Équipements Intermédiaires

Les équipements intermédiaires constituent le tissu connectif de l'infrastructure, en déterminant les chemins de données et en dirigeant le trafic vers sa destination finale.

| Équipement | Couche OSI | Rôle Principal |
| :--- | :---: | :--- |
| **Routeur** | Couche 3 | Interconnecte des réseaux distants ; assure la détermination de chemin et le transfert de paquets entre réseaux IP distincts |
| **Commutateur LAN** | Couche 2 | Pont multiport connectant les équipements en topologie étoile ; segmente le LAN en domaines de collision distincts par port |
| **Commutateur Multicouche** | Couche 2 / 3 | Combine commutation et routage ; supporte les SVIs et les ports routés pour le routage inter-VLAN |
| **Point d'Accès Sans Fil (AP)** | Couche 1 / 2 | Connecte les équipements mobiles/sur batterie via des Radiofréquences (RF) au lieu de câblage physique |
| **Pont (Bridge)** | Couche 2 | Divise le réseau en domaines de collision multiples ; prend ses décisions de transfert sur la base des adresses MAC |
| **Concentrateur (Hub)** | Couche 1 | Répéteur multiport ; régénère le signal sur tous les ports sans intelligence ; équipement obsolète |
| **Contrôleur WLAN (WLC)** | Gestion | Gère et contrôle centralement un grand nombre de points d'accès en environnement d'entreprise |

> **Note pour les analystes CyberOps :** Les hubs et ponts sont des équipements obsolètes rarement présents dans les déploiements modernes. Leur présence peut indiquer un segment réseau vieillissant ou insuffisamment sécurisé.

## TAXONOMIE TECHNIQUE & CLASSIFICATION

### Classification des Protocoles de Routage

Les protocoles de routage dynamique sont catégorisés selon leurs algorithmes de détermination de chemin et leur portée opérationnelle.

| Catégorie | Exemples de Protocoles | Métrique / Algorithme Clé | Caractéristiques Opérationnelles |
| :--- | :--- | :--- | :--- |
| **Vecteur de Distance** | RIPv2, RIPng, EIGRP, EIGRP for IPv6 | Nombre de sauts (RIP) ; Composite (EIGRP : bande passante, délai, fiabilité, charge) | Détermine le chemin par distance et direction ; mises à jour par « bouche-à-oreille » ; EIGRP utilise l'algorithme DUAL pour une convergence rapide sans boucles |
| **État de Lien** | OSPFv2, OSPFv3, IS-IS, IS-IS for IPv6 | Coût ; algorithme de Dijkstra (SPF) | Chaque routeur construit une carte topologique complète (base de données d'état de lien) ; calcule l'arbre des plus courts chemins indépendamment ; convergence plus rapide que le vecteur de distance |
| **Vecteur de Chemin** | BGP-4, BGP-MP | Attributs AS_PATH | Utilisé entre Systèmes Autonomes (FAI) ; décisions basées sur les attributs de chemin plutôt que sur une simple distance ; critique à surveiller pour détecter un BGP hijacking |

> **Pertinence CyberOps :** Les routeurs échangent périodiquement des messages de routage visibles dans les captures de paquets. Des mises à jour de routage inattendues (broadcasts RIP, paquets Hello OSPF, messages BGP OPEN/UPDATE) peuvent signaler des mauvaises configurations ou des attaques d'injection de routes.

### Comparaison des Standards 802.3 (Filaire) et 802.11 (Sans Fil)

Les LANs filaires et sans fil partagent une origine commune IEEE 802, mais diffèrent significativement dans leurs implémentations aux couches physique et liaison de données.

| Caractéristique | LAN Sans Fil 802.11 | LAN Ethernet Filaire 802.3 |
| :--- | :--- | :--- |
| **Couche Physique** | Radiofréquence (RF) | Câblage physique |
| **Accès au Médium** | Évitement de collision (CSMA/CA) | Détection de collision (CSMA/CD) |
| **Duplex** | Semi-duplex (médium RF partagé) | Full-duplex possible |
| **Disponibilité** | Toute carte réseau à portée du signal | Connexion physique requise |
| **Intégrité du Signal** | Sujet aux interférences | Interférences minimales |
| **Réglementation** | Variable selon le pays/région | Standard IEEE 802.3 |
| **Confidentialité** | Le signal RF peut dépasser les limites du bâtiment | Contenu au médium physique |
| **Format de Trame** | Champs supplémentaires dans l'en-tête Layer 2 | Trame Ethernet standard |

## ANALYSE OPÉRATIONNELLE

### Processus de Transfert de Paquets — Couche 3

Les routeurs assurent deux fonctions primaires : la détermination de chemin et le transfert de paquets. La détermination de chemin implique la construction d'une table de routage — une base de données des réseaux connus — soit manuellement (routes statiques) soit via des protocoles dynamiques.

Lorsqu'un routeur reçoit un paquet, il exécute un processus en trois étapes :

1. **Désencapsulation** : L'en-tête et le trailer de trame Layer 2 sont retirés pour exposer le paquet Layer 3.
2. **Consultation de la Table** : Le routeur examine l'adresse IP destination du paquet et la compare à la table de routage pour trouver la meilleure correspondance.
3. **Ré-encapsulation** : Si un chemin existe, le paquet Layer 3 est encapsulé dans une nouvelle trame Layer 2 adaptée à l'interface de sortie.

Durant ce transit, les adresses IP Layer 3 restent constantes, mais les adresses de liaison de données Layer 2 sont réécrites à chaque saut.

#### Méthodes de Peuplement de la Table de Routage

| Méthode | Description |
| :--- | :--- |
| **Route Locale** | Ajoutée automatiquement lors de la configuration et activation d'une interface (IOS 15+ pour IPv4) |
| **Interface Directement Connectée** | Ajoutée lorsque l'interface est configurée et active |
| **Route Statique** | Configurée manuellement ; active lorsque l'interface de sortie est opérationnelle |
| **Protocole Dynamique** | Apprise via EIGRP, OSPF, RIP, BGP, etc. |

#### Résultats Possibles du Transfert de Paquets

| Scénario | Action du Routeur |
| :--- | :--- |
| Destination sur un réseau directement connecté | ARP (IPv4) ou NS ICMPv6 (IPv6) pour résoudre le MAC destination ; transfert direct |
| Destination sur un réseau distant | ARP/NS pour résoudre le MAC du **routeur du prochain saut** ; transfert vers le prochain saut |
| Aucune correspondance dans la table, pas de route par défaut | Paquet **abandonné** |

### CSMA/CA — Accès au Médium Sans Fil

Les WLANs fonctionnent en semi-duplex sur un médium partagé. Un client sans fil ne peut pas détecter les collisions pendant sa transmission ; 802.11 utilise donc le **CSMA/CA (Accès Multiple par Détection de Porteuse avec Évitement de Collision)** :

1. Le client écoute le canal pour vérifier qu'il est libre (pas d'autre trafic en cours).
2. Le client envoie un message **RTS (Ready To Send)** à l'AP pour demander un accès exclusif.
3. L'AP répond avec un message **CTS (Clear To Send)** accordant l'accès.
4. Si aucun CTS n'est reçu, le client attend un délai d'attente aléatoire (backoff) puis recommence.
5. Le client transmet les données.
6. Toutes les transmissions doivent être acquittées ; l'absence d'ACK déclenche une retransmission.

### Logique de Commutation — Couche 2

Les commutateurs maintiennent une table d'adresses MAC (ou table CAM — Content Addressable Memory) pour diriger les trames.

* **Apprentissage** : Le commutateur examine l'**adresse MAC source** de chaque trame entrante et l'enregistre avec le numéro de port d'entrée. Par défaut, les entrées sont conservées **5 minutes**.
* **Transfert** : Le commutateur examine l'**adresse MAC destination**. Si elle figure dans la table, la trame est envoyée sur le port correspondant. Si elle est inconnue (unicast inconnu ou broadcast), elle est **inondée** sur tous les ports sauf le port d'entrée.

> **Note sécurité :** Les attaques par débordement de table CAM (MAC flooding) exploitent ce comportement d'inondation en saturant la table avec de fausses adresses MAC, forçant le commutateur à se comporter comme un hub et permettant l'écoute passive de tout le trafic.

### VLAN et Routage Inter-VLAN

Les VLANs segmentent logiquement les domaines de broadcast indépendamment de l'emplacement physique des équipements. Cela améliore les performances et la sécurité en isolant le trafic. Chaque VLAN constitue un réseau logique distinct et doit posséder un numéro de réseau unique.

* **Routage Inter-VLAN** : Les paquets circulant entre VLANs doivent être routés. Deux méthodes courantes :

| Méthode | Description |
| :--- | :--- |
| **Router-on-a-Stick** | Une seule interface physique du routeur utilise des sous-interfaces (encapsulation 802.1Q) pour router entre les VLANs |
| **Interface Virtuelle de Commutateur (SVI)** | Interface Layer 3 virtuelle sur un commutateur multicouche, associée à un VLAN spécifique ; aucun port physique dédié requis ; configurable avec adresse IP et ACLs |

### Commutation Multicouche

Les commutateurs multicouches (commutateurs Layer 3) assurent à la fois la commutation Layer 2 et le routage Layer 3. Les commutateurs Cisco Catalyst multicouches supportent deux types d'interfaces Layer 3 :

* **Port Routé** : Port physique configuré comme interface Layer 3 pure (similaire à une interface de routeur). Non associé à un VLAN ; les protocoles Layer 2 comme STP ne fonctionnent pas sur ce type d'interface. Ne supporte **pas** les sous-interfaces (contrairement aux routeurs IOS).
* **Interface Virtuelle de Commutateur (SVI)** : Interface virtuelle créée pour tout VLAN existant sur le commutateur. Plusieurs SVIs peuvent coexister sur un même commutateur. Assure le traitement Layer 3 pour tous les ports du VLAN associé.

## ÉTUDES DE CAS & POINTS D'EXAMEN

### Processus d'Association Sans Fil

Le processus d'association 802.11 se déroule en trois étapes distinctes :

1. **Découverte** :
    * **Mode Passif** : Le client écoute les **trames Beacon** diffusées par l'AP contenant le SSID, les standards supportés et les paramètres de sécurité. Le mode passif génère le **moins** de trafic sur le WLAN.
    * **Mode Actif** : Le client diffuse des **trames Probe Request** (avec ou sans SSID connu) sur plusieurs canaux pour découvrir les WLANs disponibles. Le mode actif génère le **plus** de trafic. Requis si l'AP est configuré pour ne pas diffuser les trames Beacon.
2. **Authentification** :
    * Le client et l'AP s'accordent sur une **authentification ouverte (Open Authentication)**, OU
    * Initient un **processus d'authentification à clé partagée**.
    * Le client envoie son adresse MAC ; l'AP répond en conséquence.
3. **Association** :
    * Le client envoie son adresse MAC à l'AP.
    * Le client reçoit l'adresse MAC de l'AP (**BSSID**).
    * Le client reçoit l'**Identifiant d'Association (AID)** attribué par l'AP.

#### Paramètres de Configuration Sans Fil

| Paramètre | Description |
| :--- | :--- |
| **SSID** | Nom du réseau ; identifie le WLAN ; utilisé par les clients pour sélectionner un réseau |
| **Mot de passe** | Requis par le client pour s'authentifier auprès de l'AP |
| **Mode Réseau** | Variante du standard 802.11 (a/b/g/n/ac/ad) ; les APs peuvent fonctionner en **mode mixte** |
| **Mode de Sécurité** | WEP, WPA ou WPA2 ; toujours activer le niveau le plus élevé supporté |
| **Paramètres de Canal** | Bandes de fréquences utilisées pour la transmission ; réglage automatique ou manuel pour éviter les interférences |

#### Rôles du Routeur Sans Fil (Domicile / Petite Entreprise)

Un routeur sans fil assure généralement deux rôles simultanés :
* **Point d'Accès (AP)** — fournit la connectivité sans fil
* **Commutateur Ethernet** — fournit des ports LAN filaires pour les équipements locaux

### Prévention des Boucles via STP

Dans les topologies redondantes, le **Protocole Spanning Tree (STP)** est indispensable pour prévenir les boucles Layer 2. STP bloque intentionnellement les chemins redondants, garantissant l'existence d'un seul chemin logique entre deux destinations. En cas de défaillance d'un lien principal, STP recalcule les chemins et débloque les ports nécessaires pour maintenir la connectivité.

> **Distinction clé :** STP bloque les données utilisateur sur les ports redondants, mais les **trames BPDU (Bridge Protocol Data Unit)** continuent de circuler sur tous les ports pour permettre la détection de boucles et le recalcul de topologie.

### Distinctions Techniques Critiques

* **Paramètres de Canal** : Désigne les bandes de fréquences spécifiques utilisées pour la transmission sans fil — à ne pas confondre avec le SSID ou le mode de sécurité.
* **Résolution du Prochain Saut** : Si la destination est sur un réseau distant, le routeur résout l'adresse MAC du **routeur du prochain saut** (et non de la destination finale) via ARP ou NS ICMPv6.
* **Contrôleurs WLAN (WLC)** : Utilisés en environnement d'entreprise pour gérer et contrôler centralement un grand nombre de points d'accès ; à distinguer d'un simple WAP ou routeur.
* **Routage inter-VLAN via SVI** : Une SVI est nécessaire pour **chaque VLAN** ; aucune interface physique par VLAN n'est requise ; aucun type d'encapsulation ne doit être configuré sur la SVI elle-même.
* **Adressage IP des VLANs** : Chaque VLAN doit utiliser un **numéro de réseau différent** (sous-réseau) ; les VLANs supportent bien le VLSM et utilisent des adresses de broadcast au sein de leur sous-réseau.