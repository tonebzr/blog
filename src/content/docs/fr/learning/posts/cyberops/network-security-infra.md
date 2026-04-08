---
title: "Sécurité de l'Infrastructure Réseau et Mécanismes de Contrôle d'Accès"
description: "Analyse technique approfondie de la conception réseau hiérarchique, des architectures de pare-feu, des listes de contrôle d'accès et des protocoles de sécurité administrative pour les environnements CyberOps."
order: 12
---

## PRÉSENTATION DU MODULE

L'infrastructure de sécurité réseau définit l'interconnexion des équipements pour garantir des communications sécurisées de bout en bout. L'objectif principal est de protéger les ressources de données et d'assurer la disponibilité des services grâce à des architectures standardisées recommandées par l'industrie. Ce module examine le modèle de conception réseau à trois couches, les différentes architectures de pare-feu (dont les **pare-feu à politique par zone — ZPF**), ainsi que la mise en œuvre opérationnelle des **listes de contrôle d'accès (ACL)** et des protocoles d'administration tels que **SNMP**, **NetFlow** et **AAA**.

---

## CONCEPTS FONDAMENTAUX ET DÉFINITIONS

| Terme | Définition |
| :--- | :--- |
| **Liste de contrôle d'accès (ACL)** | Série séquentielle de commandes qui autorisent ou refusent des paquets en fonction des informations contenues dans l'en-tête (adresse source, destination, protocole, etc.). |
| **Pare-feu à politique par zone (ZPF)** | Modèle de sécurité dans lequel les interfaces sont assignées à des zones logiques, et les politiques de sécurité s'appliquent au trafic circulant entre ces zones. |
| **Protocole SNMP** | Protocole de couche application permettant aux administrateurs de surveiller et gérer les performances, résoudre les incidents et planifier la croissance du réseau. |
| **AAA (Authentification, Autorisation, Comptabilisation)** | Cadre de contrôle d'accès aux ressources réseau, d'application des politiques et d'audit des activités. |
| **Réseau privé virtuel (VPN)** | Environnement de communication privé et chiffré créé sur une infrastructure réseau publique pour assurer la confidentialité des données. |
| **NetFlow** | Protocole Cisco fournissant des statistiques détaillées sur les flux de paquets IP traversant un équipement réseau. |
| **Mise en miroir de port (Port Mirroring)** | Fonctionnalité de commutateur qui duplique le trafic d'un port et le redirige vers un autre port où est connecté un analyseur réseau. |
| **Syslog** | Protocole standard pour transmettre les messages de journalisation des équipements réseau vers un serveur centralisé. |
| **NTP (Network Time Protocol)** | Synchronise les horloges des équipements réseau pour garantir des horodatages cohérents et précis sur toute l'infrastructure. |

---

## TAXONOMIE ET CLASSIFICATION TECHNIQUE

### Couches du modèle de conception réseau hiérarchique

Le réseau LAN câblé en entreprise utilise un modèle hiérarchique pour séparer la topologie en groupes modulaires. Cette séparation permet à chaque couche d'implémenter des fonctions spécifiques, ce qui simplifie la conception, le déploiement et la gestion du réseau.

| Couche | Fonction principale | Caractéristiques clés |
| :--- | :--- | :--- |
| **Couche d'accès** | Fournit aux terminaux et aux utilisateurs une connexion initiale au réseau | Commutateurs, points d'accès Wi-Fi ; premier point d'entrée des équipements |
| **Couche de distribution** | Agrège le trafic de la couche d'accès et fournit la connectivité aux services | Routage, filtrage, politiques QoS, délimitation des VLAN |
| **Couche cœur (Core)** | Assure la connectivité à haute vitesse entre les couches de distribution dans les grands environnements LAN | Fabric de commutation haute performance ; traitement minimal, débit maximal |

![hierarchical design model](../../../../../../assets/images/site/learning/cyops/learning-cyops12-hierarchichal-design-model.webp)

> **Principe de conception :** Chaque couche a un rôle distinct. Appliquer des fonctions lourdes au mauvais niveau (ex. : filtrage ACL intensif au Core) nuit aux performances et à la gestion.

---

### Classification des technologies de pare-feu

Les pare-feu sont les seuls points de transit entre les réseaux internes (de confiance) et les réseaux externes (non fiables), appliquant les politiques de contrôle d'accès entre ces zones.

#### Avantages et limites des pare-feu

| Avantages | Limites |
| :--- | :--- |
| Protègent les hôtes sensibles contre les utilisateurs non fiables | Une mauvaise configuration peut créer un point de défaillance unique |
| Assainissent les flux de protocoles, bloquant leur exploitation | Certaines données applicatives ne peuvent pas transiter de façon sécurisée |
| Bloquent les données malveillantes vers les serveurs et clients | Les utilisateurs peuvent tenter de contourner le pare-feu via des tunnels |
| Centralisent et simplifient la gestion de la sécurité | Peuvent réduire les performances réseau sous forte charge |
| Résistent aux attaques réseau | Ne protègent pas contre les menaces qui contournent le pare-feu |

#### Types de pare-feu — Tableau comparatif

| Type de pare-feu | Couche(s) OSI | Mécanisme principal | Cas d'usage typique |
| :--- | :--- | :--- | :--- |
| **Filtrage de paquets** | L3, L4 | Consultation stateless d'une table de règles basée sur IP et port | ACL de base sur routeur (ex. : bloquer le port 25) |
| **Pare-feu à état (Stateful)** | L3, L4, L5 | Suivi des connexions actives dans une table d'état ; type le plus répandu | Défense périmétrique en entreprise |
| **Passerelle applicative (Proxy)** | L3, L4, L5, L7 | Proxy des connexions ; le client n'atteint jamais directement le serveur | Inspection approfondie de HTTP, FTP, DNS |
| **Nouvelle génération (NGFW)** | L3 – L7 | Intègre IPS, contrôle applicatif, renseignement sur les menaces | Sécurité périmétrique moderne et cloud |
| **Transparent** | L2 | Filtre le trafic IP entre une paire d'interfaces en pont (bridge) | Inspection inline sans renumérotation IP |
| **Basé sur l'hôte** | Application | Logiciel pare-feu s'exécutant sur un PC ou serveur spécifique | Protection des terminaux et serveurs |
| **Hybride** | Multiple | Combinaison de plusieurs types de pare-feu (ex. : stateful + proxy) | Environnements complexes nécessitant une inspection multicouche |

---

## ANALYSE OPÉRATIONNELLE

### Architectures de conception de pare-feu

#### 1. Réseau privé / public (conception à deux interfaces)

La conception la plus simple utilise deux interfaces : une interne (de confiance) et une externe (non fiable).

- Le trafic **depuis le réseau privé** vers le réseau public est inspecté et autorisé.
- Le trafic de retour associé aux sessions initiées depuis l'intérieur est autorisé automatiquement.
- Le trafic **provenant du réseau public** vers le réseau privé est généralement bloqué.

#### 2. Zone démilitarisée (DMZ) — Conception à trois interfaces

La DMZ ajoute une troisième interface pour héberger les services publics (serveurs web, messagerie, DNS) tout en protégeant le réseau interne.

| Direction du trafic | Comportement |
| :--- | :--- |
| Interne → Externe / DMZ | ✅ Inspecté et autorisé avec peu de restrictions |
| Externe → DMZ | ⚠️ Sélectivement autorisé (HTTP, HTTPS, DNS, SMTP uniquement) |
| DMZ → Interne | ❌ Bloqué pour protéger le réseau privé |
| Externe → Interne | ❌ Strictement bloqué |
| DMZ → Externe | ⚠️ Sélectivement autorisé selon les besoins du service |

#### 3. Pare-feu à politique par zone (ZPF)

Le ZPF est l'évolution de l'inspection à état sur les routeurs Cisco IOS. Au lieu d'appliquer des politiques par interface, le ZPF regroupe les interfaces en **zones logiques** selon leur niveau de confiance ou leur fonction.

**Principes fondamentaux du ZPF :**

| Principe | Description |
| :--- | :--- |
| **Regroupement en zones** | Les interfaces aux fonctions similaires sont regroupées (ex. : INTERNE, EXTERNE, DMZ). Une interface ne peut appartenir qu'à une seule zone. |
| **Politique intra-zone par défaut** | Le trafic entre interfaces de la **même zone** circule librement, sans politique appliquée. |
| **Politique inter-zone par défaut** | Tout trafic entre **zones différentes** est bloqué par défaut. |
| **Zone-Pair** | Configuration unidirectionnelle (ex. : INTERNE → EXTERNE) requise pour autoriser le trafic entre zones. |
| **Self-Zone (zone routeur)** | Représente le routeur lui-même (toutes les IPs d'interface). Aucune politique n'est appliquée par défaut au trafic à destination ou en provenance du routeur. Concerne SSH, SNMP et les protocoles de routage. |

---

### Listes de contrôle d'accès (ACL) — Mise en œuvre et vérification

Les ACL améliorent les performances réseau en limitant le trafic inutile et fournissent un niveau de sécurité de base en filtrant les paquets au niveau du routeur.

#### Types d'ACL

| Type d'ACL | Critères de filtrage | Emplacement recommandé |
| :--- | :--- | :--- |
| **ACL standard** (1–99, 1300–1999) | Adresse IPv4 source uniquement | Le plus près possible de la **destination** |
| **ACL étendue** (100–199, 2000–2699) | Protocole, IP et port source/destination | Le plus près possible de la **source** |
| **ACL nommée** | Identique aux ACL standard/étendues, identifiée par un nom | Flexible ; remplace les ACL numérotées dans les configs modernes |

#### Rôles fonctionnels des ACL

- **Limitation du trafic :** Bloquer le trafic vidéo ou streaming pour réduire la consommation de bande passante.
- **Contrôle des flux :** Restreindre la livraison des mises à jour de routage aux sources connues uniquement.
- **Sécurité d'accès de base :** Autoriser ou refuser des hôtes spécifiques sur des segments réseau.
- **Filtrage par type de trafic :** Autoriser le courrier électronique tout en bloquant Telnet.

#### Référence TP — Démonstration ACL (Packet Tracer 12.3.4)

Ce TP illustre l'effet d'une ACL standard sur le trafic ICMP (ping) :

**Scénario :** L'ACL 11 est appliquée en **sortie (outbound)** sur l'interface `Serial0/0/0` du routeur R1.

```
R1# show access-lists
Standard IP access list 11
  10 deny   192.168.10.0 0.0.0.255
  20 permit any
```

| Instruction | Effet |
| :--- | :--- |
| `10 deny 192.168.10.0 0.0.0.255` | Bloque tout le trafic du sous-réseau 192.168.10.0/24 (y compris les pings ICMP) |
| `20 permit any` | Autorise tout autre trafic |

**Résultat :** PC1 (sur 192.168.10.0/24) peut pinguer les équipements locaux (PC2, PC3) mais **ne peut pas pinguer** les équipements distants (PC4, serveur DNS), car l'ACL bloque son trafic avant qu'il ne quitte `Se0/0/0`.

**Procédure de suppression de l'ACL :**

```bash
R1(config)# int se0/0/0
R1(config-if)# no ip access-group 11 out   ! Détacher l'ACL de l'interface
R1(config)# no access-list 11              ! Supprimer l'ACL de la config globale
```

#### Commandes de vérification essentielles

| Commande | Utilité |
| :--- | :--- |
| `show access-lists` | Affiche toutes les ACL configurées et leurs compteurs de correspondances |
| `show access-lists [numéro/nom]` | Affiche une ACL spécifique |
| `show ip interface [interface]` | Indique quelle ACL est appliquée et dans quelle direction |
| `show run` | Affiche la configuration complète en cours d'exécution |
| `no access-list [numéro]` | Supprime une ACL spécifique de la configuration globale |
| `no ip access-group [numéro] [in/out]` | Détache une ACL d'une interface |

> **Important :** Une ACL n'a **aucun effet** tant qu'elle n'est pas appliquée à une interface dans une direction précise (`in` ou `out`). Les ACL entrantes sont évaluées avant le routage ; les ACL sortantes sont évaluées après le routage.

---

### Protocoles de surveillance et de gestion réseau

| Protocole / Outil | Fonction | Détail clé |
| :--- | :--- | :--- |
| **SNMP** | Permet aux administrateurs de surveiller et gérer les équipements réseau | Collecte de données de performance ; envoi de traps en cas de dépassement de seuil |
| **NetFlow** | Fournit des statistiques sur les flux de paquets traversant un équipement | Identifie les flux par 7 champs : IP src/dst, port src/dst, protocole L3, ToS, interface d'entrée |
| **Port Mirroring (SPAN)** | Duplique le trafic d'un port de commutateur vers un autre pour analyse | Utilisé pour connecter des analyseurs de paquets ou des IDS/IPS sans perturber le trafic |
| **Syslog** | Transmet les messages système vers un serveur de journalisation centralisé | Niveaux de sévérité de 0 (Urgence) à 7 (Débogage) ; essentiel pour l'analyse forensique |
| **NTP** | Synchronise l'heure sur tous les équipements réseau | Indispensable pour la cohérence des journaux et l'analyse forensique |

---

## ÉTUDES DE CAS ET POINTS CLÉS D'EXAMEN

### Flux de trafic DMZ — Matrice de décision

```
[Internet / Externe]
         |
     [ Pare-feu ]
    /      |      \
Externe   DMZ   Interne
          |
  [Serveur Web / Mail / DNS]
```

| Zone source | Zone destination | Action par défaut |
| :--- | :--- | :--- |
| Interne | Externe | ✅ Autorisé et inspecté |
| Interne | DMZ | ✅ Autorisé et inspecté |
| Externe | DMZ | ⚠️ Sélectivement autorisé (HTTP, HTTPS, DNS, SMTP) |
| DMZ | Interne | ❌ Bloqué |
| Externe | Interne | ❌ Bloqué |
| DMZ | Externe | ⚠️ Sélectivement autorisé |

---

### ZPF — Résumé logique pour l'examen

| Scénario | Comportement du trafic |
| :--- | :--- |
| LAN1 (zone A) → LAN2 (zone A) | ✅ Circulation libre — même zone |
| LAN1 (zone A) → WAN (zone B) | ❌ Bloqué par défaut — nécessite une zone-pair + politique |
| SSH vers l'IP d'une interface du routeur | Utilise la **self-zone** ; non restreint par défaut |
| Deux interfaces sans zone assignée | Fonctionnent comme des interfaces IOS classiques (aucune règle ZPF) |

---

### Cadre de sécurité AAA

| Fonction AAA | Description | Exemple |
| :--- | :--- | :--- |
| **Authentification** | Vérifie l'identité via des identifiants, jetons ou challenge/réponse | Connexion avec nom d'utilisateur + mot de passe |
| **Autorisation** | Définit ce qu'un utilisateur authentifié est autorisé à faire | "L'utilisateur 'student' peut uniquement accéder à serverXYZ via SSH" |
| **Comptabilisation** | Enregistre les actions effectuées par les utilisateurs authentifiés | "L'utilisateur 'student' a accédé à serverXYZ via SSH pendant 15 minutes" |

#### TACACS+ vs RADIUS — Comparaison

| Caractéristique | TACACS+ | RADIUS |
| :--- | :--- | :--- |
| **Protocole de transport** | TCP | UDP |
| **Chiffrement** | Paquet entier chiffré | Mot de passe uniquement |
| **Séparation AAA** | Entièrement séparée (modulaire) | Authentification + Autorisation combinées |
| **Standard** | Principalement propriétaire Cisco | Ouvert / RFC standard |
| **Challenge d'authentification** | Bidirectionnel (basé sur CHAP) | Unidirectionnel |
| **Autorisation de commandes routeur** | Par utilisateur / par groupe | Non supportée |
| **Comptabilisation** | Limitée | Étendue |
| **Recommandé pour** | Administration des équipements réseau | Accès réseau des utilisateurs / VPN |

---

### Niveaux de strate NTP

```
Strate 0  — Horloges atomiques / GPS (référence matérielle)
    |
Strate 1  — Serveurs directement connectés à une source strate 0
    |
Strate 2  — Clients/serveurs NTP synchronisés sur la strate 1
    |
Strate 3+ — Équipements synchronisés sur la strate 2 (max 15 sauts)
    |
Strate 16 — Équipement non synchronisé
```

| Niveau de strate | Description |
| :--- | :--- |
| **0** | Équipements de référence haute précision (horloges atomiques, GPS) — non directement sur le réseau |
| **1** | Directement connectés à une source de strate 0 |
| **2** | Synchronisés via le réseau sur des serveurs de strate 1 ; peuvent aussi servir la strate 3 |
| **16** | Équipement non synchronisé — indique une défaillance NTP |

> **Remarque :** Plus le numéro de strate est faible, plus le serveur est proche de la source de temps de référence. Le nombre de sauts maximum est 15.

---

### VPN — Réseaux privés virtuels

Un VPN crée une connexion privée logique sur un réseau public, assurant la confidentialité grâce au chiffrement.

| Couche VPN | Protocoles / Technologies |
| :--- | :--- |
| **Couche 2** | L2TP, PPTP |
| **Couche 3** | GRE, IPsec, MPLS |

- **GRE (Generic Routing Encapsulation) :** Encapsule divers protocoles de couche 3 dans des tunnels IP. Ne fournit pas de chiffrement nativement.
- **IPsec :** Suite de protocoles IETF assurant authentification, intégrité et chiffrement du trafic IP. Solution VPN sécurisée la plus répandue.
- **MPLS :** Fournit une connectivité any-to-any entre sites via les réseaux des opérateurs.

---

## QUESTIONS DE RÉVISION — RÉFÉRENCE RAPIDE

| Question | Réponse |
| :--- | :--- |
| Quelle couche fournit la connectivité aux terminaux et utilisateurs ? | **Couche d'accès** |
| Quelle couche assure la connectivité inter-distribution dans les grands LAN ? | **Couche cœur (Core)** |
| Quelle couche agrège le trafic et connecte aux services ? | **Couche de distribution** |
| Quel design regroupe les interfaces aux fonctions similaires en zones ? | **ZPF (Pare-feu à politique par zone)** |
| Quel pare-feu filtre aux couches L3, L4, L5, L7 ? | **Passerelle applicative (Proxy)** |
| Quel pare-feu est une combinaison de plusieurs types ? | **Hybride** |
| Quel pare-feu fait partie d'un routeur et filtre sur L3/L4 ? | **Filtrage de paquets** |
| Quel pare-feu s'exécute comme logiciel sur un PC ou serveur ? | **Basé sur l'hôte (Host-based)** |
| Quel pare-feu filtre entre une paire d'interfaces en pont ? | **Transparent** |
| Qu'est-ce qui duplique le trafic d'un commutateur à des fins de surveillance ? | **Mise en miroir de port (Port Mirroring)** |
| Qu'est-ce qu'une série de commandes contrôlant le transfert ou le rejet de paquets ? | **ACL** |
| Qu'est-ce qui fournit des statistiques sur les flux de paquets traversant un équipement ? | **NetFlow** |
| Qu'est-ce qui crée un réseau privé sur un réseau public ? | **VPN** |
| Qu'est-ce qui synchronise la date et l'heure sur les équipements réseau ? | **NTP** |
| Qu'est-ce qui collecte les messages de statut des équipements vers un serveur ? | **Syslog** |
| Qu'est-ce qui permet aux administrateurs de surveiller et gérer les équipements réseau ? | **SNMP** |
| Qu'est-ce qui authentifie les utilisateurs, contrôle l'accès aux ressources et enregistre l'activité ? | **Serveur AAA** |

---

## RÉFLEXION CRITIQUE — QUESTION D'EXAMEN

> **En quoi la mise en œuvre d'un pare-feu à état diffère-t-elle opérationnellement d'un pare-feu à filtrage de paquets dans le traitement du trafic de retour provenant d'un réseau non fiable ?**

Un **pare-feu à filtrage de paquets** est sans état (*stateless*) : il évalue chaque paquet de façon indépendante par rapport à une table de règles statique basée sur les en-têtes L3/L4 (adresse IP, port, protocole). Il n'a aucune mémoire des paquets précédents. Pour autoriser le trafic de retour depuis un serveur externe, l'administrateur doit explicitement créer une règle autorisant le trafic entrant sur le port concerné — ce qui peut involontairement ouvrir le réseau à des connexions entrantes non sollicitées.

Un **pare-feu à état** (*stateful*) maintient une **table d'état des connexions**. Lorsqu'un hôte du réseau de confiance initie une connexion vers l'extérieur, le pare-feu enregistre cette session (IP source, IP destination, ports, numéros de séquence, état). Lorsque le trafic de retour arrive du réseau non fiable, le pare-feu consulte la table d'état, reconnaît ce trafic comme appartenant à une session légitime et établie, puis l'autorise automatiquement — sans nécessiter de règle entrante statique. Tout trafic ne correspondant à aucune entrée dans la table d'état est rejeté, ce qui rend les pare-feu à état nettement plus sécurisés pour gérer le trafic de retour asymétrique.