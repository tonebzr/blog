---
title: "Protection des Terminaux et Opérations de Sécurité"
description: "Examen technique des architectures de sécurité des terminaux, des mécanismes de protection au niveau de l'hôte, et des méthodologies de mitigation des menaces malveillantes avancées au sein des réseaux d'entreprise."
order: 22
---

## PRÉSENTATION DU MODULE

La protection des terminaux englobe les technologies et méthodologies utilisées pour sécuriser tout équipement communicant au sein d'un réseau. Un **terminal** (endpoint) est techniquement défini comme un hôte sur le réseau pouvant accéder à d'autres hôtes ou être accédé par eux, incluant les postes de travail, serveurs, imprimantes et appareils mobiles.

> ✅ **Vrai ou Faux ?** *Les terminaux sont des hôtes sur le réseau pouvant accéder à d'autres hôtes ou être accédés par eux.*
> **Réponse : VRAI** — Tout équipement capable de communication réseau (poste de travail, imprimante, téléphone IP, serveur) est considéré comme un terminal.

Le périmètre réseau des entreprises modernes s'élargit en raison de l'intégration des équipements **Internet des Objets (IoT)** — tels que les caméras en réseau, automates et appareils connectés — et de l'utilisation des **Réseaux Privés Virtuels (VPN)** et des services cloud. Chaque terminal représente un point d'entrée potentiel pour des logiciels malveillants cherchant à infiltrer le LAN interne, pouvant ensuite servir de pivot pour atteindre les infrastructures critiques. Des opérations de sécurité efficaces nécessitent une stratégie de défense en profondeur combinant des éléments de sécurité à la fois au niveau de l'hôte et du réseau.

> **Objectif du module** : Expliquer comment un site web d'analyse de malwares génère un rapport d'analyse.

---

## CONCEPTS FONDAMENTAUX ET DÉFINITIONS

| Terme | Définition |
| :--- | :--- |
| **Terminal (Endpoint)** | Tout hôte sur le réseau pouvant accéder à d'autres hôtes ou être accédé par eux (postes de travail, serveurs, imprimantes, téléphones IP, équipements IoT). |
| **Surface d'attaque** | La somme totale des vulnérabilités d'un système donné accessibles à un attaquant — incluant les ports ouverts, les logiciels exposés sur Internet, les protocoles sans fil et le comportement humain. |
| **Suite de sécurité basée sur l'hôte** | Ensemble logiciel de défense en profondeur installé sur un terminal, comprenant antivirus, anti-hameçonnage, navigation sécurisée, HIPS et pare-feu. |
| **Sandboxing** | Exécution de fichiers suspects dans un environnement isolé et sécurisé afin d'observer et documenter le comportement des malwares (modifications du système de fichiers, activité réseau, modifications du registre). |
| **Télémétrie** | Journalisation robuste et collecte de données par les logiciels de sécurité basés sur l'hôte, essentielles aux opérations de cybersécurité et à l'analyse centralisée. |
| **Polymorphisme** | Caractéristique de certaines familles de malwares dont le code modifie ses caractéristiques ou sa signature en moins de 24 heures afin d'échapper à la détection. |
| **Modèle de référence (Baseline)** | Profil appris du comportement normal d'un hôte, utilisé par les systèmes de détection basés sur l'anomalie pour identifier les déviations pouvant indiquer une intrusion. |
| **Niveau de sécurité de référence (Security Baseline)** | Niveau de risque accepté par une organisation et composants environnementaux définissant quels logiciels sont autorisés à s'exécuter (utilisé pour l'autorisation explicite). |
| **Menace zero-day** | Vulnérabilité ou variant de malware inconnu jusqu'alors, pour lequel aucune signature n'existe, contournant entièrement la détection basée sur les signatures. |
| **Antivirus sans agent (Agentless)** | Analyses antivirus effectuées depuis un système centralisé (et non sur l'hôte lui-même) ; optimisé pour les environnements virtualisés. |
| **HIDS** | Système de Détection d'Intrusion basé sur l'Hôte — identifie les attaques potentielles et envoie des alertes sans bloquer le trafic. |
| **HIPS** | Système de Prévention d'Intrusion basé sur l'Hôte — bloque activement les menaces détectées en plus d'émettre des alertes. |
| **NAC** | Contrôle d'Admission au Réseau — n'autorise la connexion au réseau qu'aux équipements autorisés et conformes. |

---

## PAYSAGE DES MENACES

### Pourquoi les Terminaux Sont des Cibles de Haute Valeur

Les malwares demeurent un défi persistant pour plusieurs raisons :

- Les attaques par rançongiciel (ransomware) devaient toucher une nouvelle organisation toutes les **11 secondes** d'ici 2021, coûtant à l'économie mondiale **6 000 milliards de dollars par an**.
- En 2018, **8 millions** de tentatives de cryptojacking ciblant les ressources système ont été observées.
- Le volume mondial de spam a fortement augmenté entre 2016 et 2017 ; **8 à 10 %** de ce spam était classifié comme malveillant.
- D'ici 2020, les équipements macOS devaient faire face en moyenne à **14,2 cyberattaques**, contre 4,8 en 2018.
- Les familles de malwares polymorphes peuvent **modifier leurs signatures en moins de 24 heures**, mettant en échec les solutions classiques basées sur les signatures.

### Deux Éléments Internes du LAN à Sécuriser

1. **Les Terminaux** — Ordinateurs portables, postes de travail, imprimantes, serveurs et téléphones IP, vulnérables aux attaques par malwares.
2. **L'Infrastructure Réseau** — Commutateurs, équipements sans fil et équipements de téléphonie IP, vulnérables aux attaques de débordement de table MAC, usurpation d'identité, DHCP, manipulation STP, tempêtes LAN et attaques VLAN.

---

## TAXONOMIE TECHNIQUE ET CLASSIFICATION

### Méthodologies de Détection des Antimalwares

Les programmes antimalwares utilisent trois approches techniques principales pour identifier les logiciels malveillants.

> 🎯 **Ancrage QCM** : *« Quel type de logiciel antimalware reconnaît diverses caractéristiques de fichiers malveillants connus ? »* → **Basé sur les signatures**

| Méthodologie | Description Technique | Contrainte Opérationnelle |
| :--- | :--- | :--- |
| **Basé sur les signatures** | Reconnaît des **caractéristiques spécifiques ou des hachages de fichiers malveillants connus**. Approche classique — une base de données d'empreintes de malwares connus est comparée aux fichiers analysés. | Inefficace contre les menaces zero-day ou polymorphes. Nécessite des mises à jour constantes de la base de données. |
| **Basé sur l'heuristique** | Reconnaît des **caractéristiques générales et structures de code** communes à différents types de malwares, même si l'échantillon exact est inconnu. | Peut identifier des variantes de menaces connues mais risque de générer des faux positifs. |
| **Basé sur le comportement** | Emploie une **analyse en temps réel des actions suspectes** et des appels système lors de l'exécution. Surveille ce qu'un programme *fait*, et non ce à quoi il *ressemble*. | Nécessite une consommation de ressources système plus élevée pour une surveillance continue. |

> **Distinction clé** : Basé sur les signatures = *à quoi il ressemble* (caractéristiques du fichier). Basé sur l'heuristique = *patterns de code généraux*. Basé sur le comportement = *ce qu'il fait à l'exécution*.

---

## IMPLÉMENTATIONS DE PARE-FEU BASÉS SUR L'HÔTE

Les pare-feux au niveau de l'hôte restreignent les connexions entrantes et sortantes, généralement limitées aux connexions initiées par l'hôte lui-même.

> 🎯 **Ancrage QCM** : *« Quel type de protection des terminaux inclut iptables et TCP Wrapper ? »* → **Pare-feu basé sur l'hôte**

| Technologie | Plateforme | Caractéristiques Techniques |
| :--- | :--- | :--- |
| **Pare-feu Windows Defender** | Windows | **Approche par profils** (Public, Privé, Domaine) ; prend en charge la gestion centralisée via System Center / Stratégie de groupe. |
| **iptables** | Linux | Configure les règles d'accès réseau dans les modules du noyau Linux **Netfilter**. L'outil pare-feu Linux classique. |
| **nftables** | Linux | **Successeur moderne d'iptables** ; utilise une machine virtuelle dans le noyau pour exécuter les règles de décision sur les paquets. Permet aux administrateurs Linux de configurer des règles d'accès réseau faisant partie des modules Netfilter du noyau Linux. |
| **TCP Wrappers** | Linux | **Système de contrôle d'accès et de journalisation basé sur des règles** pour Linux ; contrôle les accès en fonction des adresses IP et des services réseau. |

### Pare-feu Windows Defender — Approche par Profils

> 🎯 **Ancrage QCM** : *« Lequel des éléments suivants utilise une approche par profils pour configurer les fonctionnalités du pare-feu ? »* → **Pare-feu Windows Defender**

| Profil | Condition d'Application | Niveau de Restriction |
| :--- | :--- | :--- |
| **Domaine** | Lorsque l'hôte est connecté à un **réseau d'entreprise de confiance** disposant d'une infrastructure de sécurité adéquate (ex. réseau interne avec contrôleur de domaine) | Le plus permissif |
| **Privé** | Lorsque l'hôte est connecté à un **réseau domestique ou de confiance isolé d'Internet** par un autre équipement de sécurité (ex. routeur/NAT) | Modéré |
| **Public** | Lorsque l'hôte **accède directement à Internet** ou se connecte à un réseau public non fiable (ex. Wi-Fi d'aéroport) | Le plus restrictif |

> 🎯 **Ancrage QCM** : *« Dans le Pare-feu Windows, quand le profil Domaine est-il appliqué ? »*
> **Réponse** : Lorsque l'hôte est connecté à un réseau de confiance tel qu'un **réseau interne d'entreprise**.

### iptables vs. nftables — Distinctions Clés

> 🎯 **Ancrage QCM** : *« Qu'est-ce qui permet aux administrateurs système Linux de configurer des règles d'accès réseau faisant partie des modules Netfilter du noyau Linux ? »* → **nftables** *(aussi iptables — les deux interagissent avec Netfilter ; nftables est le successeur moderne)*

| Fonctionnalité | iptables | nftables |
| :--- | :--- | :--- |
| Interface noyau | Directement via les modules noyau Netfilter | Via une machine virtuelle dans le noyau (plus flexible) |
| Syntaxe | Tables séparées par protocole (ip, ip6, arp) | Syntaxe unifiée pour tous les protocoles |
| Statut | Héritage (legacy), largement déployé | Remplacement moderne (Linux 3.13+) |
| Performances | Bonnes | Meilleures (opérations par lots) |

### TCP Wrappers — Journalisation Basée sur des Règles

> 🎯 **Ancrage QCM** : *« Lequel des éléments suivants est un système de contrôle et de journalisation basé sur des règles pour Linux ? »* → **TCP Wrappers**

Les TCP Wrappers assurent un contrôle d'accès basé sur l'hôte en enveloppant les services réseau. Ils utilisent deux fichiers de configuration :
- `/etc/hosts.allow` — définit les connexions autorisées
- `/etc/hosts.deny` — définit les connexions bloquées

Toutes les tentatives d'accès sont **journalisées**, faisant des TCP Wrappers à la fois un outil de contrôle d'accès et d'audit.

---

## OUTILS DE MITIGATION AU NIVEAU RÉSEAU

Bien que la protection des hôtes soit essentielle, les équipements au niveau réseau fournissent des couches supplémentaires d'analyse et de filtrage.

| Équipement | Fonction | Pertinence QCM |
| :--- | :--- | :--- |
| **Web Security Appliance (WSA)** | **Filtre les sites web et applique des listes de blocage** pour empêcher les terminaux d'accéder à des pages web malveillantes. | *« Qu'est-ce qui assure le filtrage de sites web et la gestion de listes de blocage ? »* → **WSA** |
| **Email Security Appliance (ESA)** | Filtre le spam et les pièces jointes malveillantes avant qu'elles n'atteignent le terminal (ex. Cisco ESA). | Distinct du WSA — traite l'e-mail, non la navigation web. |
| **Contrôle d'Admission au Réseau (NAC)** | **N'autorise que les systèmes autorisés et conformes** (ex. terminaux entièrement patchés) à se connecter au réseau. | *« Lequel n'autorise que les équipements autorisés et conformes ? »* → **NAC** |
| **Protection Avancée contre les Malwares (AMP)** | Protection des terminaux contre les virus et malwares ; **suit la trajectoire des fichiers** à travers le réseau. | Cisco AMP s'intègre également avec le sandbox Threat Grid. |
| **Pare-feu de Nouvelle Génération (NGFW)** | Inspection approfondie des paquets (DPI), connaissance applicative et capacités IPS au périmètre réseau. | Niveau réseau, non basé sur l'hôte. |

> 🎯 **Ancrage QCM** : *« Qu'est-ce qui assure le filtrage des sites web et la gestion de listes de blocage pour empêcher les terminaux d'accéder à des pages malveillantes ? »*
> **Réponse : Web Security Appliance (WSA)**

> 🎯 **Ancrage QCM** : *« Quel type de protection des terminaux n'autorise que les équipements autorisés et conformes à se connecter au réseau ? »*
> **Réponse : Contrôle d'Admission au Réseau (NAC)**

---

## SYSTÈMES DE DÉTECTION D'INTRUSION BASÉS SUR L'HÔTE (HIDS)

### Qu'est-ce qu'un HIDS ?

> 🎯 **Ancrage QCM** : *« Qu'est-ce qu'un système de détection d'intrusion basé sur l'hôte (HIDS) ? »*
> **Réponse** : Un HIDS **identifie les attaques potentielles et envoie des alertes sans bloquer le trafic**. Il est uniquement dédié à la détection, non à la prévention.

Un **Système de Détection d'Intrusion Basé sur l'Hôte (HIDS)** est une application à base d'agent installée directement sur les terminaux qui :
- Surveille la configuration système et l'activité des applications
- Détecte les modifications non autorisées de fichiers (vérification d'intégrité)
- Journalise les événements et corrèle les alertes
- Envoie des notifications aux administrateurs de sécurité
- **Ne bloque PAS activement le trafic** (c'est le rôle du HIPS)

> ⚠️ **Distinction Critique** :
> - **HIDS** = Détecte et *alerte* → réponse passive
> - **HIPS** = Détecte et *prévient/bloque* → réponse active
> - **Le HIDS ne stoppe PAS les attaques directes potentielles** et **n'est PAS sans agent** (il requiert un agent sur l'hôte)

### Stratégies de Détection HIDS

| Stratégie | Mécanisme | Caractéristique Clé | Note QCM |
| :--- | :--- | :--- | :--- |
| **Basée sur l'anomalie** | Compare le comportement actuel avec un **modèle de référence** appris du comportement normal. | Les déviations par rapport à la référence déclenchent des alertes ; sujette aux faux positifs. | Utilise un *modèle de référence appris* |
| **Basée sur la politique** | Mesure le comportement du système par rapport à des **règles et profils prédéfinis**. | Les violations (ex. modifications non autorisées du registre) déclenchent des alertes ou la terminaison du processus. | *Approche par profils* — prédéfinie, non apprise |
| **Vérification d'intégrité** | Les outils surveillent les journaux et **sommes de contrôle (checksums)** des fichiers (ex. OSSEC, Tripwire). | Détecte les rootkits et modifications non autorisées des fichiers système. | |
| **Basée sur les signatures (Proactive)** | Confronte les patterns de malwares connus avant l'exécution. | Efficace uniquement contre les menaces déjà répertoriées. | |

> 🎯 **Ancrage QCM** : *« Lequel des éléments suivants utilise un modèle de référence appris ? »*
> **Réponse : Stratégie basée sur l'anomalie**

### Comparatif des Produits HIDS

> 🎯 **Ancrage QCM** : *« Quel HIDS est un produit basé sur l'open source ? »*
> **Réponse : AlienVault USM** *(basé sur le moteur open source OSSEC)* — cependant, **OSSEC** lui-même est le HIDS open source le plus reconnu.

| Produit | Type | Fonctionnalités Notables |
| :--- | :--- | :--- |
| **OSSEC** | **Open Source** | Gestionnaire central + agents pour Windows/Linux/macOS/Solaris ; surveille les journaux et l'intégrité des fichiers. |
| **AlienVault USM** | Commercial (basé open source) | SIEM + HIDS unifié ; construit sur le moteur OSSEC ; inclut le renseignement sur les menaces. |
| **Cisco AMP** | Commercial | Suit la trajectoire des fichiers à travers le réseau ; s'intègre avec le sandbox Threat Grid ; combine HIDS + HIPS. |
| **Tripwire** | Commercial/OSS | Surveillance spécialisée de l'intégrité des fichiers et application de la conformité. |

---

## PROTECTION ANTIVIRUS SANS AGENT

> 🎯 **Ancrage QCM** : *« Quelle affirmation décrit la protection antivirus sans agent ? »*
> **Réponse : Les analyses antivirus sont effectuées sur les hôtes depuis un système centralisé.**

| Mode | Description | Cas d'Usage Optimal |
| :--- | :--- | :--- |
| **Avec agent** | Le logiciel de sécurité s'exécute directement sur chaque machine protégée. Visibilité plus approfondie. | Terminaux physiques disposant de ressources dédiées. |
| **Sans agent (Agentless)** | **Analyses effectuées depuis un système centralisé** ou une appliance virtuelle de sécurité (ex. VMware vShield). Aucun logiciel installé sur l'hôte. | Environnements virtualisés pour éviter la surconsommation de ressources sur les hôtes VM. |
| **Pare-feu distribué** | Combine l'application au niveau de l'hôte avec la gestion centralisée des règles et l'agrégation des journaux. | Grands réseaux d'entreprise nécessitant une application cohérente des politiques. |

> ❌ **Idées reçues courantes** (réponses incorrectes au QCM) :
> - La protection sans agent **n'est PAS** fournie par le FAI.
> - La protection sans agent **n'est PAS** un antivirus basé sur l'hôte (c'est de l'antivirus avec agent).
> - La protection sans agent **n'est PAS** fournie par un routeur connecté à un service cloud.

---

## SÉCURITÉ DES APPLICATIONS

### Liste de Blocage vs. Liste d'Autorisation

> 🎯 **Ancrage QCM** : *« Quel paramètre de sécurité des terminaux permettrait de déterminer si un ordinateur a été configuré pour empêcher l'exécution d'une application particulière ? »*
> **Réponse : Liste de blocage (Block listing)** — la liste de blocage empêche explicitement l'exécution d'applications spécifiques.
> **L'établissement de référence (Baselining)** est utilisé pour déterminer l'état normal d'un système, non pour bloquer des applications spécifiques.

| Approche | Définition | Base d'Application |
| :--- | :--- | :--- |
| **Liste de blocage (Block Listing)** | **Interdit les applications ou sites web spécifiquement identifiés comme malveillants** de s'exécuter ou d'être accédés. Utilisée pour empêcher l'exécution d'une application particulière. | Mise à jour en continu par des services tels que Cisco Talos ou The Spamhaus Project. |
| **Liste d'autorisation (Allow Listing)** | **N'autorise l'exécution que des programmes répondant au niveau de sécurité de référence établi par l'organisation**. Tout ce qui n'est pas explicitement autorisé est refusé. | Plus restrictif ; défini selon le niveau d'acceptation du risque organisationnel. |
| **Établissement de référence (Baselining)** | Documente l'état normal et accepté de la configuration et des logiciels d'un système. Utilisé pour la comparaison et la conformité, non pour le blocage direct. | Utilisé pour détecter les écarts par rapport à la norme acceptée. |

> **La Liste d'autorisation** est l'approche la plus restrictive : refus par défaut — seules les applications explicitement approuvées peuvent s'exécuter, sur la base du **niveau de sécurité de référence**.
> **La Liste de blocage** est permissive par défaut — tout s'exécute sauf ce qui est explicitement refusé.

---

## COMPOSANTES DE LA SURFACE D'ATTAQUE (SANS INSTITUTE)

La surface d'attaque est catégorisée en trois domaines de vulnérabilité distincts.

> 🎯 **Ancrage QCM** : *« Quelle surface d'attaque inclut l'exploitation des vulnérabilités dans les protocoles filaires et sans fil utilisés par les équipements IoT ? »*
> **Réponse : Surface d'attaque réseau**

| Composante | Vecteurs Ciblés | Pertinence IoT |
| :--- | :--- | :--- |
| **Surface d'attaque réseau** | Exploite les vulnérabilités dans les **protocoles filaires/sans fil** et les couches Réseau/Transport (ex. ports, IPv4/IPv6, TCP/UDP, **protocoles sans fil IoT/BYOD**). | ✅ Les vulnérabilités des protocoles IoT relèvent de cette catégorie |
| **Surface d'attaque logicielle** | Cible les vulnérabilités dans les applications exposées sur le web, en cloud ou sur l'hôte. | Exploits au niveau applicatif, non protocolaire |
| **Surface d'attaque humaine** | Exploite le comportement des utilisateurs par ingénierie sociale, menaces internes ou erreurs opérationnelles. | Hameçonnage, menaces internes |

> ⚠️ Il n'existe **pas de catégorie « Surface d'attaque Internet »** dans le modèle SANS — les trois catégories sont Réseau, Logicielle et Humaine.

---

## TECHNIQUES DE DÉTECTION

### Règles, Signatures et IA Prédictive

La surveillance moderne de la sécurité des terminaux repose sur trois techniques complémentaires.

| Technique | Fonctionnement | Efficacité Contre | Limitation |
| :--- | :--- | :--- | :--- |
| **Basée sur des règles** | Des conditions explicites déclenchent des alertes (ex. échecs de connexion, exécutable non signé, processus inhabituel). | Patterns comportementaux connus et violations de seuil. | Ne peut pas détecter les menaces inédites hors des règles prédéfinies. |
| **Basée sur les signatures** | Confronte les hachages de fichiers ou patterns de code à une base de données de malwares connus. | Familles de malwares connus et répertoriés. | Inefficace contre les menaces zero-day et polymorphes. |
| **IA Prédictive / ML** | Utilise le machine learning sur des données historiques pour identifier les menaces inconnues par similarité comportementale. | Menaces zero-day, mouvements latéraux sophistiqués, patterns d'attaque inédits. | Nécessite de grands jeux de données ; risque de faux positifs lors de l'entraînement du modèle. |

### Combinaison des Techniques

La posture de sécurité la plus efficace superpose les trois méthodes :

```
+-------------------------------------------------------------+
|              PILE DE DETECTION EN PROFONDEUR                |
+---------------+---------------------------------------------+
|  FONDATION    |  Regles        ->  parametres et seuils     |
|  DETECTION    |  Signatures    ->  base de menaces connues  |
|  AVANCEE      |  IA Predictive ->  menaces inedites/zero-day|
+---------------+---------------------------------------------+
```

**Exemple de flux** : Une règle signale un fichier s'exécutant depuis un répertoire inhabituel → la vérification par signature ne trouve aucune correspondance → l'IA prédictive analyse le comportement et le bloque en raison de sa similarité avec des patterns de rançongiciels connus.

---

## SANDBOXING ET ANALYSE DE MALWARES

### Sandboxing Basé sur le Système

Les sandboxes exécutent les fichiers suspects dans un environnement isolé et documentent :
- Les modifications du système de fichiers et du registre
- L'activité réseau (requêtes DNS, requêtes HTTP, connexions IP)
- Les arbres d'exécution des processus et appels système
- Les Indicateurs de Compromission (IoC) : hachages de fichiers, adresses IP de C2

### Frameworks d'Analyse de Malwares

| Outil | Type | Capacités Clés |
| :--- | :--- | :--- |
| **ANY.RUN** | En ligne (Interactif) | Cartographie les tactiques sur la **Matrice MITRE ATT&CK** ; capture des captures d'écran, requêtes DNS, requêtes HTTP, hachages de fichiers, vues hex/ASCII. |
| **Cisco Threat Grid** | Commercial | S'intègre avec Cisco AMP ; exécute des fichiers, documente les activités, génère de nouvelles signatures. |
| **Cuckoo Sandbox** | Open Source (Local) | Sandbox local gratuit ; prend en charge les scripts d'analyse personnalisés. |
| **VirusTotal** | En ligne (Multi-AV) | Soumet les échantillons à 70+ moteurs AV ; recherche rapide d'IoC. |
| **Joe Sandbox** | En ligne/Sur site | Analyse comportementale approfondie avec support Windows/Linux/Android. |
| **CrowdStrike Falcon Sandbox** | Cloud Commercial | Intégration avancée du renseignement sur les menaces ; génération automatisée de rapports. |

---

## RÉFÉRENCE RAPIDE EXAMEN — TOUTES LES RÉPONSES QCM

Le tableau suivant fournit une réponse directe à chaque question de l'évaluation, avec le concept clé justifiant chaque réponse.

| # | Question | Réponse Correcte | Concept Clé |
| :--- | :--- | :--- | :--- |
| 1 | Les terminaux sont des hôtes pouvant accéder à d'autres hôtes ou être accédés par eux ? | **Vrai** | Définition du terminal |
| 2 | Quel type d'antimalware reconnaît les caractéristiques de fichiers malveillants connus ? | **Basé sur les signatures** | Signature = caractéristiques de fichiers connus |
| 3 | Quelle protection des terminaux inclut iptables et TCP Wrapper ? | **Pare-feu basé sur l'hôte** | Les deux sont des outils pare-feu Linux au niveau de l'hôte |
| 4 | Qu'est-ce qui filtre les sites web et applique des listes de blocage contre les pages malveillantes ? | **Web Security Appliance (WSA)** | WSA = filtrage web + listes de blocage d'URL |
| 5 | Lequel n'autorise que les équipements autorisés et conformes à se connecter ? | **Contrôle d'Admission au Réseau (NAC)** | NAC = contrôle de conformité à l'entrée du réseau |
| 6 | Qu'est-ce qui permet aux admins Linux de configurer les règles Netfilter du noyau ? | **nftables** *(aussi iptables)* | Les deux interagissent avec Netfilter ; nftables est l'outil moderne |
| 7 | Lequel utilise une approche par profils pour la configuration du pare-feu ? | **Pare-feu Windows Defender** | Profils Domaine / Privé / Public |
| 8 | Lequel est un système de contrôle d'accès et de journalisation basé sur des règles pour Linux ? | **TCP Wrappers** | hosts.allow / hosts.deny + journalisation |
| 9 | Lequel utilise un modèle de référence appris ? | **Stratégie basée sur l'anomalie** | Modèle de référence = détection d'anomalie |
| 10 | Quel HIDS est basé sur l'open source ? | **AlienVault USM** *(construit sur OSSEC)* | OSSEC est le moteur open source sous-jacent |
| 11 | Qu'est-ce qu'un HIDS ? | **Identifie les attaques potentielles et envoie des alertes sans bloquer le trafic** | HIDS = détection + alertes uniquement |
| 12 | Quel paramètre vérifie si une application est empêchée de s'exécuter ? | **Liste de blocage (Block listing)** | Liste de blocage = interdire des applications spécifiques |
| 13 | Quand le profil Domaine est-il appliqué dans le Pare-feu Windows ? | **Lorsque connecté à un réseau interne d'entreprise de confiance** | Domaine = réseau d'entreprise/de confiance |
| 14 | Quelle surface d'attaque SANS couvre les exploits de protocoles IoT filaires/sans fil ? | **Surface d'attaque réseau** | Protocoles IoT = surface d'attaque au niveau réseau |
| 15 | Quelle affirmation décrit la protection antivirus sans agent ? | **Les analyses antivirus sont effectuées sur les hôtes depuis un système centralisé** | Sans agent = analyse centralisée, pas d'agent local |

---

## DISTINCTIONS TECHNIQUES CRITIQUES

| Paire de Concepts | Distinction |
| :--- | :--- |
| **iptables vs. nftables** | Les deux interagissent avec Netfilter dans le noyau Linux. `iptables` utilise directement les modules noyau ; `nftables` utilise une machine virtuelle dans le noyau (plus flexible) et est le remplacement moderne. |
| **HIDS vs. HIPS** | Le HIDS **détecte et alerte** ; le HIPS **prévient activement**. De nombreux systèmes modernes (ex. Cisco AMP) combinent les deux. |
| **Avec agent vs. Sans agent** | Avec agent = logiciel sur chaque hôte (visibilité approfondie) ; Sans agent = analyse centralisée (optimisé pour les environnements virtuels). |
| **Basé sur l'anomalie vs. Basé sur la politique** | Basé sur l'anomalie = référence apprise (plus de faux positifs, dynamique) ; Basé sur la politique = règles prédéfinies (plus rapide, déterministe). |
| **Liste de blocage vs. Liste d'autorisation** | Liste de blocage = permissif par défaut, exceptions interdites ; Liste d'autorisation = refus par défaut, approche la plus restrictive. |
| **Basé sur les signatures vs. Basé sur le comportement** | Signature = confronte les patterns de fichiers connus ; Comportement = surveille les actions à l'exécution. |
| **WSA vs. ESA** | WSA = filtre les **pages web / URL** ; ESA = filtre les **e-mails / spam / pièces jointes**. |
| **HIDS vs. Antivirus** | Le HIDS surveille l'intégrité du système et détecte les intrusions ; l'antivirus analyse les fichiers malveillants. Complémentaires, non interchangeables. |
| **NAC vs. Pare-feu** | Le NAC contrôle *qui* peut rejoindre le réseau (conformité + identité) ; le pare-feu contrôle *quel trafic* peut transiter par le réseau. |

---

## RESSOURCES COMPLÉMENTAIRES

- **AV-TEST** — Laboratoire de test indépendant fournissant des évaluations des produits de sécurité basés sur l'hôte.
- **OSSEC** — HIDS open source : [https://www.ossec.net](https://www.ossec.net)
- **ANY.RUN** — Sandbox de malwares interactif : [https://any.run](https://any.run)
- **The Spamhaus Project** — Service de liste de blocage gratuit pour la sécurité e-mail et réseau.
- **Cisco Talos** — Renseignement sur les menaces alimentant les listes de blocage Cisco Firepower.
- **Matrice MITRE ATT&CK** — Framework de cartographie des tactiques et techniques adversariales : [https://attack.mitre.org](https://attack.mitre.org)
- **SANS Institute** — Taxonomie de la surface d'attaque et formation en cybersécurité : [https://www.sans.org](https://www.sans.org)
- **Cisco AMP for Endpoints** — [https://www.cisco.com/c/en/us/products/security/amp-for-endpoints](https://www.cisco.com/c/en/us/products/security/amp-for-endpoints)