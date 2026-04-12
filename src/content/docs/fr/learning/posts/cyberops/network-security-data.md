---
title: "Types de données en supervision de sécurité réseau et analyse de télémétrie"
description: "Examen technique des catégories de données NSM (Network Security Monitoring), des structures de journaux et des plateformes de sécurité intégrées — programme CyberOps Associate."
order: 25
---

## VUE D'ENSEMBLE DU MODULE

La supervision de sécurité réseau (NSM — *Network Security Monitoring*) implique la collecte et l'analyse de données hétérogènes pour identifier, investiguer et mitiger les incidents de sécurité. Ce module définit la hiérarchie des données réseau — des résumés statistiques de haut niveau aux captures de paquets complètes — et examine les outils d'infrastructure nécessaires au traitement de cette télémétrie. Les opérations de cybersécurité efficaces requièrent une approche intégrée de la gestion des journaux, en s'appuyant sur des plateformes SIEM (*Security Information and Event Management*) et SOAR (*Security Orchestration, Automation, and Response*) pour unifier des sources de données disparates en une posture défensive cohérente.

---

## SECTION 1 — CATÉGORIES DE DONNÉES DE SUPERVISION RÉSEAU

Il existe six catégories principales de données de supervision réseau. Maîtriser les distinctions entre elles est essentiel pour réussir l'examen.

### 1.1 Données d'alerte

Les données d'alerte sont des messages générés par les **systèmes de prévention d'intrusion (IPS)** ou les **systèmes de détection d'intrusion (IDS)** en réponse à un trafic qui enfreint une règle ou correspond à la signature d'un exploit connu. Un IDS réseau (NIDS) tel que **Snort** est préconfiguré avec des règles pour les exploits connus.

**Conseil d'examen :** Les données d'alerte sont générées *par les équipements IDS/IPS*. Elles constituent la sortie d'une correspondance automatisée de règles ou de signatures — et non une capture brute.

**Validation du NIDS — Exemple Snort :**

Pour vérifier qu'un NIDS Snort est opérationnel, les analystes peuvent visiter `testmyids.com`. Ce site renvoie une page affichant `uid=0(root) gid=0(root) groups=0(root)`, ce qui correspond à une signature Snort et déclenche une alerte de test.

| Champ de règle Snort | Valeur |
| :--- | :--- |
| SID de règle | `2100498` |
| Motif de signature | `uid=0(root)` |
| Message d'alerte | `GPL ATTACK_RESPONSE id check returned root` |
| Déclencheur de détection | Toute IP recevant un contenu correspondant à `uid=0\|28\|root\|29\|` depuis une source externe |

Les alertes sont rendues lisibles et interrogeables par des outils tels que **Sguil** et **Squert**, tous deux intégrés à la suite NSM Security Onion.

---

### 1.2 Données de session

Les données de session constituent un **enregistrement d'une conversation entre deux équipements réseau** (généralement un client et un serveur). Elles contiennent des métadonnées *sur* la session, et non le contenu réel transmis.

Les données de session sont identifiées par le **5-uplet** (*5-tuple*) :

| Champ du 5-uplet | Description |
| :--- | :--- |
| Adresse IP source | IP de l'hôte initiateur |
| Adresse IP destination | IP de l'hôte répondant |
| Port source | Port protocolaire de l'hôte initiateur |
| Port destination | Port protocolaire de l'hôte répondant |
| Protocole | Type de protocole de couche 3 (ex. : TCP, UDP) |

Les métadonnées de session incluent également : l'identifiant de session, le volume de données échangé par chaque équipement, et la durée de la session.

**Conseil d'examen :** Les données de session décrivent *le flux*, pas le contenu. Elles répondent à la question : « qui a communiqué avec qui, pendant combien de temps, et pour quel volume de données ? »

**Zeek (anciennement Bro)** est un outil NSM de référence qui génère des journaux de session. Un enregistrement de journal de connexion Zeek contient les champs suivants :

| Champ | Signification |
| :--- | :--- |
| `ts` | Horodatage de début de session |
| `uid` | Identifiant unique de session |
| `id.orig_h` | Adresse IP source (hôte initiateur) |
| `id.orig_p` | Port source (hôte initiateur) |
| `id.resp_h` | Adresse IP destination (hôte répondant) |
| `id.resp_p` | Port destination (hôte répondant) |
| `proto` | Protocole de couche 4 |
| `duration` | Durée de la session |
| `orig_bytes` | Octets envoyés par l'hôte initiateur |
| `resp_bytes` | Octets envoyés par l'hôte répondant |
| `orig_pkts` | Paquets émis par l'hôte initiateur |
| `resp_pkts` | Paquets émis par l'hôte répondant |

---

### 1.3 Données de transaction

Les données de transaction correspondent aux **messages spécifiques échangés au cours d'une session réseau** — les requêtes et les réponses elles-mêmes. Là où une session représente l'ensemble de la conversation, une transaction est une paire requête/réponse unique au sein de cette conversation.

**Exemple :** Une session HTTP peut impliquer plusieurs transactions : une requête HTTP GET et la réponse HTTP du serveur. Ces éléments sont journalisés dans un journal d'accès de serveur web ou par un NIDS tel que Zeek.

**Distinction clé :**
- **Session** = l'ensemble du trafic impliqué dans la conversation globale
- **Transaction** = la requête ou la réponse spécifique au sein de cette conversation

Les données de transaction incluent les journaux de serveurs et d'hôtes spécifiques aux équipements (ex. : journaux d'accès Apache, journaux IIS, journaux de serveurs de messagerie).

---

### 1.4 Capture complète de paquets (FPC — *Full Packet Capture*)

La capture complète de paquets est le type de données NSM le **plus exhaustif et le plus coûteux en stockage**. Contrairement aux données de session, la FPC enregistre chaque bit de trafic, y compris le **contenu réel et la charge utile** (*payload*) des communications.

La FPC permet la reconstruction de conversations entières, notamment :
- Le texte des messages électroniques
- Le contenu HTML des pages web
- Les fichiers transférés sur le réseau (**contenu extrait**)
- L'analyse de la charge utile à des fins de détection de maliciels

**Outils principaux :** **Wireshark** (interface graphique) et **tcpdump** (ligne de commande) sont les outils de référence pour générer et visualiser des captures complètes de paquets.

**Conseil d'examen :** La FPC contient des informations détaillées sur les **protocoles et la charge utile** pour l'ensemble du trafic. C'est le seul type de données qui capture le contenu réel des fichiers transitant sur le réseau. Le contenu extrait (ex. : pièces jointes, fichiers téléchargés) est récupérable à partir des FPC.

---

### 1.5 Données statistiques

Les données statistiques sont **dérivées de l'analyse d'autres formes de données réseau**. Elles ne capturent pas le trafic brut, mais produisent des résumés, des références de comportement (*baselines*) et des indicateurs d'anomalie grâce à des analyses avancées.

Les données statistiques servent à :
- Établir des référentiels du comportement réseau normal (*baselines*)
- Détecter les anomalies en comparant le trafic courant aux référentiels
- **Décrire ou prédire le comportement réseau** via l'apprentissage automatique et l'analytique prédictive

Les techniques comprennent l'**analyse comportementale du réseau (NBA — *Network Behavior Analysis*)** et la **détection d'anomalies comportementales réseau (NBAD — *Network Behavior Anomaly Detection*)**, qui analysent les données de télémétrie NetFlow ou IPFIX.

**Exemple d'outil :** **Cisco Cognitive Threat Analytics (Cognitive Intelligence)** — produit cloud qui utilise l'apprentissage automatique et la modélisation statistique pour identifier les activités malveillantes ayant contourné les contrôles de sécurité ou pénétré par des canaux non supervisés, et opérant à l'intérieur d'un réseau d'entreprise.

**Conseil d'examen :** Les données statistiques *résument ou analysent* les données de flux/performance. Elles constituent la réponse attendue aux questions portant sur la description ou la prédiction du comportement réseau.

---

### 1.6 Contenu extrait

Le contenu extrait désigne les **fichiers et objets récupérés à partir de captures complètes de paquets** — par exemple, les fichiers joints à des e-mails ou les fichiers téléchargés depuis Internet. Le contenu extrait est analysé pour détecter des maliciels ou des violations de politique de sécurité.

---

### Tableau comparatif des types de données

| Type de données | Contenu | Cas d'usage principal | Coût de stockage |
| :--- | :--- | :--- | :--- |
| **Données d'alerte** | Notifications de correspondance de règles IDS/IPS | Notification immédiate de menace | Faible |
| **Données de session** | 5-uplet + métadonnées de flux | Comptabilité des flux, reconstruction de chronologie | Faible |
| **Données de transaction** | Messages requête/réponse, journaux serveur | Analyse couche applicative, DLP | Moyen |
| **Capture complète de paquets** | Charge utile complète + données protocolaires | Analyse forensique approfondie, extraction de contenu | Très élevé |
| **Données statistiques** | Analyses dérivées, référentiels, scores d'anomalie | Analyse comportementale, détection d'anomalies | Faible |
| **Contenu extrait** | Fichiers issus d'e-mails, téléchargements extraits de FPC | Analyse de maliciels, application des politiques | Moyen |

---

## SECTION 2 — ANALYSE DES JOURNAUX D'HÔTES ET DE SERVEURS

### 2.1 Classification des événements du journal Windows

Les systèmes Windows catégorisent les événements de sécurité et opérationnels en types spécifiques pour faciliter la résolution de problèmes et l'audit. Ces événements sont consignés dans l'**Observateur d'événements Windows**.

| Type d'événement | Description | Exemple opérationnel |
| :--- | :--- | :--- |
| **Erreur** | Problème significatif indiquant une perte de données ou une défaillance fonctionnelle | Échec du chargement d'un service au démarrage |
| **Avertissement** | Problème potentiel futur ; non critique, le système a récupéré | Notification d'espace disque insuffisant |
| **Information** | Décrit le **fonctionnement normal** d'une application, d'un pilote ou d'un service | Chargement réussi d'un pilote réseau |
| **Audit de succès** | Enregistre une tentative d'accès sécurisé **réussie** | Un utilisateur s'est connecté avec succès au système |
| **Audit d'échec** | Enregistre une tentative d'accès sécurisé **échouée** | Un utilisateur non autorisé échoue à se connecter à distance ; tentative d'accès non autorisé à un partage réseau |

**Conseil d'examen — Correspondance rapide :**
- Erreur disque lors d'une sauvegarde → **Erreur**
- Tentative de connexion distante échouée par un utilisateur non autorisé → **Audit d'échec**
- Espace disque faible → **Avertissement**
- Fonctionnement normal d'une application/d'un pilote/d'un service → **Information**

### 2.2 Types de journaux Windows

Windows maintient plusieurs journaux distincts. Pour l'examen, la distinction clé est la suivante :

| Type de journal | Contenu |
| :--- | :--- |
| **Journaux de sécurité** | Tentatives de connexion, audits d'accès aux fichiers/objets (événements Audit de succès et Audit d'échec) |
| **Journaux d'application** | Événements issus d'applications logicielles spécifiques |
| **Journaux système** | Événements issus des composants du système d'exploitation et des pilotes |
| **Journaux d'installation** | Événements liés à l'installation d'applications |

**Conseil d'examen :** Les journaux de sécurité enregistrent les **tentatives de connexion et les opérations liées à l'accès aux fichiers ou aux objets**.

---

### 2.3 Niveaux de sévérité Syslog

Le protocole Syslog standard classe les messages selon une échelle de sévérité de 0 (le plus critique) à 7 (le moins critique).

| Valeur | Sévérité | Signification technique |
| :--- | :--- | :--- |
| 0 | Urgence (*Emergency*) | Le système est inutilisable |
| 1 | Alerte (*Alert*) | Une action doit être prise immédiatement |
| 2 | Critique (*Critical*) | Conditions critiques ; défaillance système indiquée |
| 3 | Erreur (*Error*) | Défaillance non urgente ; à résoudre dans un délai défini |
| 4 | Avertissement (*Warning*) | L'erreur n'existe pas encore mais surviendra si la condition n'est pas traitée |
| 5 | Notice (*Notice*) | Événement inhabituel ; n'exige pas d'action immédiate |
| 6 | Informatif (*Informational*) | Messages relatifs aux opérations normales du système |
| 7 | Débogage (*Debug*) | Messages détaillés pour le développement et le dépannage |

**Formule de priorité Syslog (PRI) :**

$$\text{Priorité} = (\text{Facility} \times 8) + \text{Sévérité}$$

La valeur de priorité apparaît en tant que première valeur dans un paquet syslog, encadrée par des chevrons (ex. : `<34>`). Les codes Facility 15 à 23 (local0–local7) n'ont pas de mot-clé fixe et peuvent être assignés contextuellement.

---

### 2.4 Journaux serveur

Les serveurs d'applications réseau maintiennent des journaux d'accès et d'erreurs qui constituent des sources primaires de données NSM.

**Exemple de journal d'accès du serveur web Apache :**
```
203.0.113.127 - dsmith [10/Oct/2016:10:26:57 -0500] "GET /logo_sm.gif HTTP/1.0" 200 2254
```

**Exemple de journal d'accès Microsoft IIS :**
```
6/14/2016, 16:22:43, 203.0.113.24, -, W3SVC2, WEB3, 198.51.100.10, 80, GET, /home.htm, -, 200, 6, 15321
```

**Les journaux proxy DNS** sont particulièrement importants — ils documentent l'ensemble des requêtes et réponses DNS, et sont essentiels pour identifier les hôtes ayant visité des sites malveillants, les exfiltrations DNS, et les connexions vers des serveurs C2 (*command-and-control*).

---

## SECTION 3 — OUTILS ET PLATEFORMES DE TÉLÉMÉTRIE

### 3.1 tcpdump

**tcpdump** est un analyseur de paquets en ligne de commande capable d'afficher des captures de paquets en temps réel ou de les écrire dans un fichier. Il capture des données détaillées sur les protocoles et le contenu des paquets (Capture Complète de Paquets).

**Wireshark** est un analyseur de paquets à interface graphique construit sur les fonctionnalités de tcpdump.

**Conseil d'examen :** tcpdump = outil en ligne de commande pour la capture complète de paquets. Il N'est PAS utilisé pour analyser des données NetFlow ou des journaux statistiques.

---

### 3.2 NetFlow

**NetFlow** est un protocole développé par Cisco pour le dépannage réseau et la comptabilité basée sur les sessions. Il collecte des **métadonnées sur les flux de paquets**, et non le contenu réel des paquets.

NetFlow constitue la base du standard IETF **IPFIX** (*Internet Protocol Flow Information Export*). IPFIX est fondé sur Cisco NetFlow Version 9.

#### 5-uplet NetFlow (champs obligatoires dans tous les enregistrements de flux) :

| Champ | Description |
| :--- | :--- |
| Adresse IP source | IP de l'initiateur du trafic |
| Adresse IP destination | IP de la destination du trafic |
| Port source | Numéro de port source |
| Port destination | Numéro de port destination |
| Protocole | Type de protocole de couche 3 |

#### Champs supplémentaires présents dans tous les enregistrements de flux NetFlow :

| Champ | Description |
| :--- | :--- |
| **Horodatage de début** | Heure de début du flux |
| **Horodatage de fin** | Heure de fin du flux |
| Nombre total de paquets | Nombre de paquets du flux |
| Nombre total d'octets | Volume en octets du flux |

**Conseil d'examen — Points clés sur NetFlow :**
- NetFlow ne capture **PAS** le contenu réel (charge utile) des paquets
- Tous les enregistrements de flux contiennent le 5-uplet + **horodatage de début** + **horodatage de fin**
- Les données NetFlow sont visualisées avec des outils comme **nfdump** (ligne de commande) ou FlowViewer (interface graphique)
- NetFlow **ne peut pas** être visualisé avec tcpdump
- NetFlow fournit des métadonnées (enregistrements de flux), **pas** des captures complètes de paquets

#### Architecture de flux NetFlow :

```
Équipement réseau (Exportateur) → Collecteur NetFlow → nfdump / FlowViewer
```

---

### 3.3 Visibilité et contrôle applicatifs (AVC — *Application Visibility and Control*)

**Cisco AVC** combine plusieurs technologies pour reconnaître, analyser et contrôler plus de **1 000 applications**, incluant la VoIP, la vidéo, la messagerie, le partage de fichiers, les jeux, le P2P et les applications cloud.

#### Modules de l'architecture AVC :

| Module | Fonction |
| :--- | :--- |
| **Reconnaissance applicative** | Identifie les applications via **NBAR2** (données L3–L7) |
| **Collecte de métriques** | Collecte la bande passante, le temps de réponse, la latence, la perte de paquets, la gigue |
| **Gestion et reporting** | Exporte les données vers les outils de gestion ; génère des rapports |
| **Gestion et contrôle** | Configure le réseau ; applique les politiques applicatives et la QoS |

**NBAR2** (*Next-Generation Network-Based Application Recognition*) est le moteur Cisco déployé dans le module de **reconnaissance applicative** d'AVC. Il identifie les applications par leurs **signatures** (et non par numéros de port), permettant une visibilité granulaire sur le comportement des utilisateurs (ex. : téléconférence vs. partage de fichiers P2P).

**Conseil d'examen :** AVC utilise **NBAR2** pour découvrir et classifier les applications responsables du trafic réseau. NBAR2 est déployé dans le module de **Reconnaissance Applicative**.

---

### 3.4 Journaux de filtrage de contenu

Les équipements qui effectuent le filtrage de contenu génèrent des journaux précieux pour le NSM. Deux appliances Cisco clés :

| Équipement | Fonction principale | Types de journaux |
| :--- | :--- | :--- |
| **Cisco Email Security Appliance (ESA)** | Filtre et supervise le trafic e-mail | Plus de 30 journaux : antivirus, antispam, décisions liste blanche/noire, journaux de distribution |
| **Cisco Web Security Appliance (WSA)** | Agit comme proxy web ; filtre le trafic HTTP | Journaux de décisions ACL, journaux d'analyse de maliciels, journaux de filtrage de réputation web, journaux de transactions entrantes/sortantes |

**Conseil d'examen :** Le **Web Security Appliance (WSA)** et l'**Email Security Appliance (ESA)** génèrent tous deux des journaux des contenus suspects détectés dans le trafic applicatif.

---

### 3.5 Journaux proxy

**Les serveurs proxy** agissent comme intermédiaires pour les clients réseau. Ils journalisent toutes les requêtes et réponses, permettant la détection du trafic malveillant et la mise en œuvre de la **prévention des pertes de données (DLP)**.

#### Journal du proxy web Squid (format natif Squid) :

```
1265939281.764 19478 172.16.167.228 TCP_MISS/200 864 GET http://www.example.com/images/home.png - NONE/- image/png
```

| Champ | Exemple de valeur | Signification |
| :--- | :--- | :--- |
| Horodatage | `1265939281.764` | Horodatage Unix epoch avec millisecondes |
| Durée écoulée | `19478` | Millisecondes nécessaires à la transaction |
| IP client | `172.16.167.228` | Adresse IP du client demandeur |
| Code résultat | `TCP_MISS/200` | Résultat du cache / code de réponse HTTP |
| Taille | `864` | Octets de données délivrés |
| Méthode | `GET` | Méthode de requête HTTP |
| URI | `http://www.example.com/images/home.png` | URL de la ressource demandée |
| Code pair | `NONE/-` | Cache voisin consulté |
| Type de contenu | `image/png` | Type MIME issu de l'en-tête de réponse HTTP |

Logiciels proxy web courants : **Squid**, CCProxy, Apache Traffic Server, WinGate.

#### Cisco Umbrella (proxy DNS) :

**Cisco Umbrella** (anciennement OpenDNS) est un service de sécurité DNS hébergé qui supervise les requêtes DNS pour identifier les connexions vers des serveurs C2 ou les tentatives d'exfiltration de données. Il applique une intelligence sur les menaces en temps réel à la gestion des accès DNS.

Exemple de journal proxy DNS :
```
"2015-01-16 17:48:41", "ActiveDirectoryUserName", "ActiveDirectoryUserName, ADSite, Network",
"10.10.1.100", "24.123.132.133", "Allowed", "1 (A)", "NOERROR", "domain-visited.com.",
"Chat, Photo Sharing, Social Networking, Allow List"
```

| Champ | Signification |
| :--- | :--- |
| Horodatage | Heure UTC de la requête DNS |
| Identités | Toutes les identités (utilisateur, site AD, réseau) associées à la requête |
| IP interne | IP du client émettant la requête |
| IP externe | IP externe ayant émis la requête |
| Action | Si la requête a été autorisée ou bloquée |
| Type de requête | Type d'enregistrement DNS demandé (ex. : A, AAAA, MX) |
| Code de réponse | Réponse DNS (ex. : NOERROR, NXDOMAIN) |
| Domaine | Nom de domaine demandé |
| Catégories | Catégories de contenu et décisions de politique |

---

## SECTION 4 — ÉVÉNEMENTS NGFW

Les **pare-feux de nouvelle génération (NGFW — *Next-Generation Firewalls*)** étendent la sécurité au-delà de la couche 4 (IP/port) jusqu'à la couche applicative. Les équipements Cisco NGFW utilisent les **Firepower Services**, qui incluent :
- Visibilité et contrôle applicatifs (AVC)
- IPS de nouvelle génération (NGIPS)
- Filtrage d'URL (par réputation et catégorie)
- Protection avancée contre les maliciels (AMP)

### Types d'événements NGFW

| Type d'événement | Déclencheur | Détails clés journalisés |
| :--- | :--- | :--- |
| **Événement de connexion** | Sessions détectées directement par le NGIPS | Horodatages, IP source/destination, règle de contrôle d'accès correspondante |
| **Événement d'intrusion** | Activité malveillante détectée affectant la disponibilité, l'intégrité ou la confidentialité | Date, heure, type d'exploit, contexte source/cible |
| **Événement hôte ou terminal** | Un hôte apparaît pour la première fois sur le réseau | Matériel de l'équipement, adressage IP, dernière présence connue |
| **Événement de découverte réseau** | Modifications détectées dans le réseau supervisé (hôtes, applications) | Modifications apportées aux hôtes ou applications connus |
| **Événement NetFlow** | Les enregistrements de flux NetFlow indiquent un nouvel hôte ou serveur | Détails de l'hôte/serveur dérivés des enregistrements NetFlow exportés |

**Conseil d'examen — Correspondance rapide :**
- Activité malveillante affectant la disponibilité/intégrité/confidentialité → **Événement d'intrusion**
- Un hôte apparaît pour la première fois sur le réseau → **Événement hôte ou terminal**
- NetFlow détecte un nouvel hôte → **Événement NetFlow** (mécanisme de découverte réseau)
- Modifications détectées sur les hôtes/applications connus → **Événement de découverte réseau**
- Sessions entre hôtes découvertes par le NGFW → **Événement de connexion**

---

## SECTION 5 — SIEM ET PLATEFORMES DE SÉCURITÉ

### 5.1 SIEM

La technologie **SIEM (*Security Information and Event Management*)** assure le reporting en temps réel et l'analyse à long terme des événements de sécurité en collectant et en corrélant les données de journaux à l'échelle de l'organisation.

Le SIEM combine la **gestion des événements de sécurité (SEM)** et la **gestion des informations de sécurité (SIM)** en une plateforme unifiée.

#### Fonctions principales du SIEM :

| Fonction | Description |
| :--- | :--- |
| **Collecte de journaux** | Collecte les enregistrements d'événements provenant de sources à travers l'organisation à des fins forensiques et de conformité |
| **Normalisation** | Mappe les messages de journaux issus de systèmes différents vers un modèle de données commun |
| **Corrélation** | Relie les journaux et événements de systèmes disparates pour accélérer la détection des menaces |
| **Agrégation** | Réduit le volume d'événements en consolidant les enregistrements d'événements dupliqués |
| **Reporting** | Présente les données corrélées dans des tableaux de bord en temps réel et des résumés à long terme |
| **Conformité** | Génère des rapports pour satisfaire aux exigences réglementaires |

#### Sources d'entrée SIEM :

- Alertes IDS/IPS
- Équipements anti-maliciels
- Pare-feux
- Captures complètes de paquets
- Télémétrie NetFlow
- Journaux serveur et syslog

#### Plateformes SIEM courantes :

| Plateforme | Notes |
| :--- | :--- |
| **Splunk** | SIEM commercial très répandu dans les SOC ; édité par un partenaire Cisco |
| **Security Onion avec ELK** | Open-source ; intègre Elasticsearch, Logstash et Kibana ; inclut d'autres outils NSM |

**Conseil d'examen :** Les deux plateformes SIEM à connaître sont **Splunk** et **Security Onion avec ELK**.

---

### 5.2 SOAR

Le **SOAR (*Security Orchestration, Automation, and Response*)** étend les capacités du SIEM en **automatisant les workflows de réponse aux incidents de sécurité** et en facilitant les tâches de réponse aux incidents. Il intègre des outils de plusieurs fournisseurs dans une plateforme unifiée pour répondre à la pénurie d'analystes en cybersécurité et réduire les délais de réponse.

Exemples de plateformes de sécurité intégrées : **Cisco SecureX**, **Fortinet Security Fabric**, **Palo Alto Networks Cortex XDR**.

---

## SECTION 6 — RÉFÉRENTIEL DES OUTILS

### Comparatif des outils pour l'investigation d'incidents

| Outil | Type | Fonction principale | Type de données traité |
| :--- | :--- | :--- | :--- |
| **tcpdump** | Ligne de commande | Capture de paquets et affichage en temps réel ou écriture sur fichier | Capture complète de paquets |
| **Wireshark** | Interface graphique | Capture et analyse de paquets (basé sur tcpdump) | Capture complète de paquets |
| **Zeek (Bro)** | Framework NSM | Génère des journaux de connexions, de transactions et DNS | Session / Transaction |
| **Snort** | NIDS | Détection d'intrusion par signatures ; génère des alertes | Données d'alerte |
| **Splunk** | SIEM | Agrégation, corrélation, tableaux de bord | Journaux intégrés |
| **Security Onion + ELK** | SIEM | Agrégation de journaux et NSM open-source | Journaux intégrés |
| **nfdump** | Ligne de commande | Visualisation des données NetFlow depuis le collecteur nfcapd | Session (NetFlow) |
| **Squid** | Proxy | Proxy web avec journalisation des requêtes/réponses | Transaction / Journaux proxy |
| **Cisco Umbrella** | Proxy DNS | Sécurité DNS, journalisation des requêtes, détection C2 | Journaux proxy DNS |
| **NBAR2** | Moteur (dans AVC) | Reconnaissance applicative par signature | Couche applicative |
| **Cisco Cognitive Intelligence** | Analytique cloud | Analyse statistique/comportementale pour détecter les menaces contournées | Données statistiques |

---

## SECTION 7 — RÉFÉRENCE RAPIDE POUR L'EXAMEN

### Correspondance Questions/Réponses pour les concepts clés

| Thème de la question | Réponse correcte |
| :--- | :--- |
| Protocole détaillé ET charge utile pour tout le trafic | **Capture complète de paquets** |
| Résume ou analyse les données de flux/performance | **Données statistiques** |
| Journaux de serveurs et d'hôtes spécifiques aux équipements | **Données de transaction** |
| Fichiers joints à des e-mails ou téléchargés depuis Internet | **Contenu extrait** |
| 5-uplet + volume de données + durée | **Données de session** |
| Tentative de connexion distante échouée par un utilisateur non autorisé | **Audit d'échec** |
| Erreur disque lors d'une sauvegarde | **Erreur** |
| Espace disque faible | **Avertissement** |
| Outil pour générer et visualiser des captures complètes de paquets | **tcpdump / Wireshark** |
| Deux valeurs obligatoires dans tous les enregistrements de flux NetFlow | **Horodatage de début** + **Horodatage de fin** |
| AVC utilise ___ pour découvrir les applications responsables du trafic | **NBAR2** |
| Deux équipements générant des journaux de contenu suspect dans le trafic applicatif | **Web Security Appliance (WSA)** + **Email Security Appliance (ESA)** |
| Activité malveillante affectant la disponibilité, l'intégrité, la confidentialité | **Événement d'intrusion** |
| Un hôte apparaît pour la première fois sur le réseau | **Événement hôte ou terminal** |
| NetFlow détecte un nouvel hôte | **Événement NetFlow (Découverte réseau)** |
| Sessions entre hôtes détectées par le NGFW | **Événement de connexion** |
| Modifications détectées sur les hôtes et applications connus | **Événement de découverte réseau** |
| Fonctionnalité de tcpdump | Affiche les captures de paquets en temps réel OU écrit dans un fichier |
| Outil Windows pour consulter les journaux d'hôte | **Observateur d'événements** |
| Données statistiques utilisées pour décrire/prédire le comportement réseau | **Statistiques** |
| Description de tcpdump | Analyseur de paquets en ligne de commande |
| Deux plateformes SIEM courantes | **Splunk** + **Security Onion avec ELK** |
| Événement de journal d'hôte Windows pour le fonctionnement normal d'une app/pilote/service | **Information** |
| Journal Windows pour les tentatives de connexion et accès fichiers/objets | **Journaux de sécurité** |
| Deux éléments du 5-uplet | **Port source** + **Protocole** (aussi : IP source/dest, port dest) |
| NBAR2 déployé dans quel module AVC | **Reconnaissance applicative** |
| IDS/IPS identifie une menace → quel type de données est généré ? | **Données d'alerte** |
| Caractéristique opérationnelle de NetFlow | Collecte les métadonnées de base sur les flux, PAS les données/charge utile du flux |
| Cisco Cognitive Intelligence utilise quel type de données | **Données statistiques** |

---

## SECTION 8 — DISTINCTIONS CRITIQUES (PIÈGES D'EXAMEN)

| Concept A | Concept B | Différence clé |
| :--- | :--- | :--- |
| **Données de session** | **Données de transaction** | Session = métadonnées de la conversation entière ; Transaction = paire requête/réponse spécifique au sein de cette session |
| **Capture complète de paquets** | **NetFlow** | La FPC capture la charge utile/le contenu réel ; NetFlow n'enregistre que les métadonnées (enregistrements de flux) |
| **Journaux de sécurité** | **Journaux d'application** | Journaux de sécurité = audits de connexion/accès ; Journaux d'application = événements spécifiques aux logiciels |
| **tcpdump** | **nfdump** | tcpdump = outil FPC ; nfdump = outil de visualisation NetFlow |
| **SIEM** | **SOAR** | SIEM = collecte, corrélation, reporting ; SOAR = automatisation des workflows de réponse |
| **Données d'alerte** | **Données statistiques** | Alertes = générées par les règles IDS/IPS ; Statistiques = dérivées de l'analyse pour la prédiction comportementale |
| **NBAR2** | **NetFlow** | NBAR2 = reconnaissance applicative par signature ; NetFlow = collecte de métadonnées de flux |
| **Audit d'échec** | **Erreur** | Audit d'échec = tentative d'accès sécurisé échouée ; Erreur = défaillance système/fonctionnelle (perte de données) |
| **Avertissement** | **Audit d'échec** | Avertissement = espace disque faible (problème futur) ; Audit d'échec = tentative d'accès non autorisé (sécurité) |
