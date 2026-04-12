---
title: "SIO - CyberOps Associate : Analyse et Investigation des Menaces Réseau"
description: "Module de formation technique avancée couvrant la normalisation des données de sécurité, l'analyse PCAP, l'utilisation des expressions régulières, l'investigation de malwares, l'isolation d'hôtes compromis via le 5-tuple, et l'interprétation des données HTTP/DNS dans le contexte d'un SOC outillé par Security Onion, ELK Stack, Sguil, Wireshark et Zeek."
order: 27
---

# SIO - CyberOps Associate


---

## CORE CONCEPTS & DEFINITIONS

### 1. Normalisation des Données (Data Normalization)

**La normalisation** est le processus de conversion de données provenant de sources hétérogènes vers un format commun et standardisé. Dans le contexte NSM (Network Security Monitoring), elle garantit la cohérence des champs de données (timestamps, adresses IP, adresses MAC) afin de permettre des recherches et corrélations efficaces dans un SIEM.

Sans normalisation, une même adresse IPv6 peut apparaître sous quatre formes distinctes dans les logs de sources différentes :

```
2001:db8:acad:1111:2222::33
2001:DB8:ACAD:1111:2222::33
2001:DB8:ACAD:1111:2222:0:0:33
2001:DB8:ACAD:1111:2222:0000:0000:0033
```

De même, les timestamps peuvent coexister dans les formats suivants :

```
Unix Epoch   : 1498656439
Human Readable: Wed, 28 Jun 2017 13:27:19 GMT
ISO 8601     : 2017-06-28T13:27:19+00:00
```

**L'Unix Epoch** est préféré pour les traitements algorithmiques (comparaisons, intervalles). Le format **Human Readable** est préféré pour l'analyse humaine directe.

**Logstash** assure cette transformation via des pipelines ETL (Extract, Transform, Load) avant indexation dans Elasticsearch. Des plugins additionnels peuvent être développés pour des schémas propriétaires.

---

### 2. Réduction des Données NSM (Data Reduction)

La **réduction des données** consiste à identifier et éliminer les flux et entrées de log qui n'apportent pas de valeur analytique pour la sécurité. Les catégories à exclure typiquement sont :

- Trafic chiffré non déchiffrable (IPsec, TLS/SSL sans inspection)
- Trafic de protocoles de routage (OSPF, BGP, STP)
- Trafic broadcast et multicast de routine
- Alertes HIDS de faible sévérité (informational, low impact)
- Entrées syslog de faible priorité (severity levels 6 et 7)

L'objectif est de maximiser le **signal-to-noise ratio** dans les outils d'analyse comme Elasticsearch.

---

### 3. L'Outil AWK pour la Manipulation de Logs

**AWK** est un langage de programmation orienté traitement de texte structuré en colonnes, particulièrement adapté aux fichiers de log délimités. Sa syntaxe principale est :

```bash
awk 'BEGIN {FS=OFS="|"} {$3=strftime("%c",$3)} {print}' applicationX_in_epoch.log
```

**Décomposition des éléments :**

| Élément | Fonction |
|---|---|
| `awk` | Invoque l'interpréteur AWK |
| `BEGIN {}` | Bloc d'initialisation exécuté avant le traitement des lignes |
| `FS=OFS="|"` | Définit le séparateur de champs (Field Separator) et le séparateur de sortie |
| `$3` | Référence la valeur de la 3ème colonne de la ligne courante |
| `strftime("%c",$3)` | Convertit un timestamp Epoch en format lisible |
| `gsub(/\[|\]/,"",$4)` | Substitution globale : supprime les crochets `[` et `]` du champ 4 |
| `{print}` | Affiche la ligne courante après transformation |

**Remarque critique :** Une ligne vide dans un fichier log traité par `strftime()` produit le résultat `||Wed 31 Dec 1969 07:00:00 PM EST`, car la valeur Epoch `0` correspond à l'origine Unix (1er janvier 1970 00:00:00 UTC). Ce comportement est un indicateur de données malformées ou de lignes vides parasites.

---

### 4. Les Expressions Régulières (Regex)

Une **expression régulière (regex)** est un patron symbolique qui décrit un ensemble de chaînes de caractères à identifier dans une opération de recherche ou de filtrage. Deux standards coexistent : **POSIX** et **Perl**.

#### Métacaractères fondamentaux

| Métacaractère | Description |
|---|---|
| `.` | Correspond à n'importe quel caractère unique |
| `*` | Zéro ou plusieurs occurrences de l'élément précédent |
| `^` | Début de ligne |
| `$` | Fin de ligne |
| `[abc]` | Classe de caractères : correspond à `a`, `b` ou `c` |
| `\d` | Correspond à un chiffre décimal (0-9) |
| `\D` | Correspond à tout caractère non numérique |
| `\.` | Correspond au caractère point littéral (échappement) |
| `{m}` | Exactement `m` occurrences |
| `{n,m}` | Entre `n` et `m` occurrences |
| `abc\|123` | Alternance : correspond à `abc` ou à `123` |

#### Exemples de patterns appliqués aux logs de sécurité

| Pattern Regex | Interprétation |
|---|---|
| `^83` | Lignes commençant par `83` |
| `[A-Z]{2,4}` | Séquence de 2 à 4 lettres majuscules consécutives |
| `05:22:2[0-9]` | Timestamps entre 05:22:20 et 05:22:29 |
| `\.com` | Le suffixe `.com` en tant que chaîne littérale |
| `complete\|GET` | La chaîne `complete` ou la méthode HTTP `GET` |
| `0{4}` | Séquence de quatre zéros consécutifs |

Dans **Kibana (Elasticsearch)**, les expressions régulières sont encadrées par des slashes (`/regex/`) dans les requêtes Query DSL :

```json
/d[ao]n/       -> correspond à "dan" et "don"
/<.+>/         -> correspond à tout contenu similaire à une balise HTML
```

---

### 5. Extraction d'Exécutables depuis un PCAP

Une capture PCAP contient l'intégralité des paquets d'une session réseau, y compris les données applicatives transportées. Dans le cas d'un transfert HTTP de malware, **Wireshark** permet de reconstruire le flux TCP et d'en extraire le fichier transféré.

**Procédure d'extraction :**

```
File > Export Objects > HTTP
```

Cette fonctionnalité analyse les PDUs HTTP dans le flux sélectionné et liste les objets applicatifs identifiables (fichiers HTML, exécutables PE, archives, etc.).

**Identification du type de fichier :**

La commande `file` sous Linux analyse les **magic bytes** (signature binaire) en début de fichier :

```bash
$ file W32.Nimda.Amm.exe
W32.Nimda.Amm.exe: PE32+ executable (console) x86-64, for MS Windows
```

Le format **PE32+** identifie un exécutable Windows 64 bits au format Portable Executable.

**Calcul de hash pour identification de malware :**

```bash
$ sha256sum test1.exe
2a9b0ed40f1f0bc0c13ff35d304689e9cadd633781cbcad1c2d2b92ced3f1c85  test1.exe

$ sha1sum fichier_suspect.swf
97a8033303692f9b7618056e49a24470525f7290  fichier_suspect.swf
```

Les valeurs de hash (SHA-1, SHA-256, MD5) servent de **signatures de malware** : une correspondance dans des bases de données de threat intelligence (VirusTotal, Cisco Talos File Reputation) confirme l'identification du fichier malveillant.

---

### 6. Le 5-Tuple comme Vecteur d'Identification

Le **5-tuple** est le jeu de cinq paramètres qui identifient de manière unique une session réseau au niveau du réseau et du transport :

| Composant | Description |
|---|---|
| Source IP Address | Adresse IPv4/IPv6 de l'hôte émetteur |
| Source Port Number | Port TCP/UDP source (éphémère côté client) |
| Destination IP Address | Adresse IPv4/IPv6 de l'hôte destinataire |
| Destination Port Number | Port TCP/UDP destination (service écouté) |
| Protocol | Protocole de transport identifié dans l'en-tête IP (TCP=6, UDP=17, ICMP=1) |

En investigation de sécurité, le 5-tuple permet de :
- Corréler des alertes NIDS avec les flux PCAP correspondants
- Identifier précisément l'hôte compromis et l'hôte attaquant
- Pivoter entre les outils (Sguil → Wireshark → Kibana) sur la base d'un identifiant de flux cohérent

---

### 7. Les Kits d'Exploitation (Exploit Kits)

Un **Exploit Kit (EK)** est un framework malveillant distribué sous forme de service (Crimeware-as-a-Service) qui automatise l'exploitation de vulnérabilités connues dans les navigateurs web et leurs plugins (Flash, Java, PDF readers). Les EKs les plus documentés incluent **RIG EK**, **Angler EK**, **Nuclear EK**.

**Mécanisme d'une attaque drive-by via EK :**

1. L'utilisateur accède à un site web légitime compromis
2. Une balise `<iFrame>` invisible dans le HTML charge du contenu depuis un serveur de redirection
3. Un script JavaScript identifie les vulnérabilités du navigateur et sélectionne l'exploit approprié
4. Le payload (shellcode, dropper) est téléchargé silencieusement et exécuté
5. Un **Remote Access Trojan (RAT)** ou autre malware est installé, établissant une communication C2 (Command & Control)

---

### 8. SQL Injection et Exfiltration DNS

**L'injection SQL** est une technique d'attaque par injection de code dans laquelle un acteur malveillant insère des instructions SQL dans des paramètres d'entrée d'une application web non correctement validés :

```
username='+union+select+ccid,ccnumber,ccv,expiration,null+from+credit_cards+--+&password=
```

Les mots-clés `UNION` et `SELECT` sont des commandes SQL standards utilisées pour fusionner les résultats de deux requêtes et extraire des données de tables arbitraires.

**L'exfiltration DNS** exploite le protocole DNS pour encoder et transmettre des données confidentielles hors du périmètre réseau. Les données sont encodées en hexadécimal et insérées dans des sous-domaines de requêtes DNS :

```
434f4e464944454e5449414c.ns.example.com  ->  CONFIDENTIAL
```

Cette technique est difficile à détecter car DNS (UDP/53) est généralement autorisé par les pare-feux et génère des volumes de trafic significatifs en conditions normales. Le décodage s'effectue avec la commande `xxd` :

```bash
$ xxd -r -p "DNS - Queries.csv" > secret.txt
$ cat secret.txt
CONFIDENTIAL DOCUMENT
DO NOT SHARE
```

---

## TECHNICAL TAXONOMY & CLASSIFICATION

### Architecture Security Onion — Composants et Rôles

| Composant | Type | Fonction Principale | Données Traitées |
|---|---|---|---|
| **Elasticsearch** | Moteur de recherche / SIEM | Stockage, indexation, analyse en temps quasi-réel | Indices JSON (inverted index) |
| **Logstash** | ETL Pipeline | Ingestion, normalisation, transformation des logs | Tous formats de logs bruts |
| **Kibana** | Interface de visualisation | Requêtes, dashboards, investigation | Données indexées Elasticsearch |
| **Beats** | Agents de collecte | Envoi de données opérationnelles vers Elasticsearch | Métriques, logs, trafic réseau |
| **Snort/Suricata** | NIDS | Détection d'intrusion réseau par signatures | Paquets réseau en temps réel |
| **Zeek (Bro)** | Analyseur réseau | Génération de logs de connexions et protocoles | Flux réseau (HTTP, DNS, FTP, SSL...) |
| **OSSEC** | HIDS | Surveillance des paramètres systèmes hôtes | Processus, registry, fichiers système |
| **Sguil** | Console SOC | Agrégation d'alertes, gestion de workflow | Alertes NIDS, HIDS |
| **CapME!** | Interface de transcription | Visualisation des transactions PCAP | Fichiers PCAP |
| **NetworkMiner** | Outil forensique réseau | Extraction d'artefacts depuis PCAP | Fichiers PCAP |

---

### Types de Données ELK — Formats Supportés

| Catégorie | Types | Exemples |
|---|---|---|
| **Core Datatypes** | Text, Numeric, Date, Boolean, Binary, Range | Chaînes de caractères, timestamps, entiers |
| **Complex Datatypes** | Object (JSON), Nested (arrays JSON) | Documents imbriqués, tableaux d'objets |
| **Geo Datatypes** | Geo-point, Geo-shape | Latitude/longitude, polygones géographiques |
| **Specialized Datatypes** | IP addresses, Token count, Histogram | Adresses IPv4/IPv6, décomptes de tokens |

---

### Beats Agents — Classification par Usage

| Agent | Usage Principal | Données Collectées |
|---|---|---|
| **Auditbeat** | Audit système | Données d'audit Linux/Windows |
| **Metricbeat** | Supervision d'infrastructure | Métriques CPU, mémoire, disque |
| **Heartbeat** | Disponibilité des services | Statut uptime des services |
| **Packetbeat** | Surveillance réseau | Trafic réseau applicatif |
| **Journalbeat** | Logs système Linux | Journaux systemd |
| **Winlogbeat** | Événements Windows | Windows Event Log |

---

### Méthodes de Requêtes Elasticsearch (Query DSL)

| Méthode | Syntaxe | Cas d'usage |
|---|---|---|
| **URI Search** | `http://localhost:9200/_search?q=query:ns.example.com` | Requêtes simples via navigateur ou script |
| **cURL** | `curl "localhost:9200/_search?q=query:ns.example.com"` | Automatisation CLI |
| **JSON / Query DSL** | Body JSON avec `{"query": {...}}` | Requêtes complexes structurées |
| **Dev Tools Kibana** | Console interactive Kibana | Développement et test de requêtes |

---

### Opérateurs de Requêtes Kibana

| Opérateur | Syntaxe | Exemple |
|---|---|---|
| **Booléens** | AND, OR, NOT | `"php" OR "zip" OR "exe"` |
| **Champs** | `field: value` | `dst.ip: "192.168.1.5"` |
| **Plages inclusives** | `[val1 TO val2]` | `host:[1 TO 255]` |
| **Plages exclusives** | `{val1 TO val2}` | `TTL:{100 TO 400}` |
| **Wildcards multi-car.** | `*` | `Pas*` (→ Pass, Passwd, Password) |
| **Wildcard mono-car.** | `?` | `P?ssw?rd` (→ Password, P@ssw0rd) |
| **Regex** | `/pattern/` | `/d[ao]n/` (→ dan, don) |
| **Fuzzy** | `term~n` | `term~2` (distance Levenshtein 2) |

---

### Classification des Alertes IDS par Catégorie (Security Onion)

| Catégorie d'Alerte | Description | Exemple d'Event Message |
|---|---|---|
| **ATTACK_RESPONSE** | Réponse indiquant une exploitation réussie | `GPL ATTACK_RESPONSE id check returned root` |
| **ET TROJAN** | Détection de cheval de Troie connu | `ET TROJAN ABUSE.CH SSL Blacklist Malicious SSL certificate detected (Dridex)` |
| **ET CURRENT_EVENTS** | Exploitation active basée sur des signatures récentes | `ET CURRENT_EVENTS RIG EK URI Struct Mar 13 2017 M2` |
| **ET CURRENT_EVENTS EK Landing** | Page d'atterrissage d'un kit d'exploitation | `ET CURRENT_EVENTS RIG EK Landing Sep 12 2016 T2` |
| **Remcos RAT Checkin** | Communication de commande et contrôle RAT | `Remcos RAT Checkin 23` |

---

## OPERATIONAL ANALYSIS

### Méthodologie d'Investigation SOC — Pivot Multi-Outils

L'investigation d'un incident de sécurité dans Security Onion suit un processus de **pivot progressif** entre les outils, du plus général (Kibana dashboard) au plus granulaire (PCAP Wireshark) :

```
Kibana Dashboard (vue macro)
        |
        v
Sguil (alertes NIDS/HIDS corrélées)
        |
        v
CapME! / Transcript (lecture de session applicative)
        |
        v
Wireshark (analyse packet-level, extraction d'objets)
        |
        v
NetworkMiner / sha256sum / file (analyse forensique)
        |
        v
VirusTotal / Cisco Talos (threat intelligence externe)
```

---

### Procédure : Isolation d'un Hôte Compromis via le 5-Tuple

**Étape 1 — Identification de l'alerte initiale dans Sguil**

```
Event Message: GPL ATTACK_RESPONSE id check returned root
Source IP    : 209.165.200.235
Destination  : 209.165.201.17
Alert ID     : 5.1
```

**Étape 2 — Analyse de la transcription (Follow TCP Stream)**

Le transcript Sguil affiche :
- Texte en **rouge** : données transmises par l'attaquant (SRC)
- Texte en **bleu** : réponses de la cible (DST)

La présence de commandes Linux dans la session TCP (ex. : `whoami`, `cat /etc/passwd`, `ls -la`) indique une **exécution de commandes à distance** sur la cible, confirmant l'obtention d'un accès root.

**Étape 3 — Pivot vers Kibana pour corrélation des logs**

Filtrage par IP source dans Kibana (Zeek Hunting > Files), identification du protocole FTP dans le **Sensors Pie Chart**, et filtrage `bro_ftp` pour isoler les transferts FTP :

```
ftp_argument: ftp://209.165.200.235/./confidential.txt
```

**Étape 4 — Reconstruction du fichier exfiltré**

Via Kibana Zeek Files, filtrer `FTP_DATA` pour identifier le MIME type et le contenu du fichier transféré. Le champ `alert_id` permet de pivoter vers le transcript de la session FTP.

**Étape 5 — Recommandations de remédiation**

- Changer immédiatement les credentials root et analyst
- Bloquer l'IP source au niveau du pare-feu périmétrique
- Auditer les ACLs des services FTP et SSH
- Appliquer les correctifs liés à la CVE exploitée

---

### Procédure : Analyse d'un Malware via Drive-By Attack (Exploit Kit RIG)

**Étape 1 — Localisation temporelle dans Kibana**

Réduire la plage temporelle dans Kibana (Absolute Time Range) autour de la période connue de l'incident (janvier 2017). Naviguer vers NIDS Dashboard et zoomer sur le pic d'alertes.

**Étape 2 — Analyse du premier événement NIDS**

```
Event Message : ET CURRENT_EVENTS RIG EK URI Struct Mar 13 2017 M2
Source IP     : <Hôte victime interne>
Destination   : <Serveur EK externe>
Destination Port : 80 (HTTP)
Classification : A Network Trojan was Detected
```

**Étape 3 — Reconstruction du flux HTTP dans CapME!/Wireshark**

Dans la transcription CapME! :
- `SRC: REFERER` = site web légitime initial visité (ex. `www.homeimprovement.com`)
- `SRC: HOST` = serveur malveillant vers lequel le navigateur a été redirigé (ex. `tybenme.com`)
- Le contenu demandé est un fichier **SWF** (Adobe Shockwave Flash) — vecteur d'exploitation classique des EKs

**Étape 4 — Extraction et hachage des artéfacts**

```bash
# Extraction depuis Wireshark : File > Export Objects > HTTP
# Identification SHA-1 du fichier SWF :
$ sha1sum %3fbiw=SeaMonkey.[...].swf
97a8033303692f9b7618056e49a24470525f7290

# Soumission à VirusTotal pour identification
# Résultat : correspondance avec famille de malware connue (ex. Rig.EK.Flash.CVE-2015-xxxx)
```

**Étape 5 — Analyse du fichier HTML de la page compromise**

Le fichier `remodeling-your-kitchen-cabinets.html` contient deux indicateurs d'une attaque drive-by :
- Dans le `<head>` : script malveillant de redirection ou de fingerprinting
- Dans le `<body>` : balise `<iFrame>` invisible pointant vers le serveur EK

---

### Procédure : Investigation SQL Injection + Exfiltration DNS

**SQL Injection — Analyse dans Kibana HTTP Dashboard**

Filtrer sur **Zeek Hunting > HTTP**, identifier les requêtes HTTP GET contenant des patterns SQL dans le champ `uri` :

```
uri: /login.php?username='+union+select+ccid,ccnumber,ccv,expiration,null+from+credit_cards+--+&password=
```

La présence des opérateurs `UNION SELECT` dans l'URI constitue une preuve directe d'une tentative (réussie ou non) d'injection SQL pour exfiltrer des données de table de base de données.

**Exfiltration DNS — Analyse dans Kibana DNS Dashboard**

Filtrer sur **Zeek Hunting > DNS**, identifier les requêtes avec des sous-domaines anormalement longs à structure hexadécimale :

```
Query: 434f4e464944454e5449414c.ns.example.com
```

Procédure de décodage :

```bash
# Extraire les données hexadécimales depuis le CSV Kibana
# Éditer le fichier pour isoler uniquement la partie hexadécimale
434f4e464944454e5449414c20444f43554d454e540a...

# Décoder avec xxd
$ xxd -r -p "DNS - Queries.csv" > secret.txt
$ cat secret.txt
CONFIDENTIAL DOCUMENT
DO NOT SHARE
This document contains information about the last security breach.
```

---

### Procédure : Investigation Attaque Windows (Remcos RAT + Dridex)

**Étape 1 — Analyse chronologique des alertes Sguil (3-19-2019)**

Toutes les alertes sont temporellement groupées, ce qui indique une séquence d'attaque automatisée (infection chain).

**Étape 2 — Identification du vecteur initial**

```
Alert 5.439 : DNS Dynamic Update (possible exfiltration ou mise à jour C2)
Alert 5.440 : HTTP GET → fichier PE32 téléchargé (magic bytes MZ = Windows PE)
```

Les **file signatures** permettent d'identifier le type de fichier sans s'appuyer sur l'extension :

| Magic Bytes (hex) | Type de Fichier |
|---|---|
| `4D 5A` (MZ) | Windows PE Executable (.exe, .dll) |
| `50 4B 03 04` (PK) | Archive ZIP / Office Open XML |
| `25 50 44 46` (%PDF) | Document PDF |
| `FF D8 FF` | Image JPEG |
| `43 57 53` / `46 57 53` | Adobe Flash SWF |

**Étape 3 — Identification du RAT via signature IDS**

```
Alert ID   : 5.480
Event Msg  : Remcos RAT Checkin 23
Protocol   : TCP vers port non-standard (non-well-known port)
Contenu    : Trafic chiffré / obfusqué — non lisible en clair
```

**Remcos** = Remote Control and Surveillance. Le RAT établit un canal C2 chiffré pour exécuter des commandes à distance, enregistrer les frappes clavier, capturer des écrans et exfiltrer des données.

**Étape 4 — Corrélation avec Kibana (Zeek Hunting Dashboards)**

| Dashboard Zeek | Information Extraite |
|---|---|
| **HTTP** | URIs des fichiers téléchargés, serveurs sources |
| **DNS** | Domaines résolus (dont C2 potentiels), requêtes anormales |
| **SSL / x.509** | Certificats malveillants (Dridex SSL Blacklist) |
| **PE** | Exécutables portables identifiés dans le trafic |
| **Kerberos** | Noms d'hôtes et domaines Windows impliqués |
| **SMB** | Partages réseau accédés (mouvement latéral potentiel) |
| **DCE/RPC** | Procédures réseau Windows distantes invoquées |
| **Weird** | Anomalies protocolaires et communications malformées |

---

## CASE STUDIES & EXAM SPECIFICS

### Étude de Cas 1 : Compromission par Accès FTP Root

**Scénario :** Après une attaque, le fichier `confidential.txt` n'est plus accessible sur le serveur cible.

**Chaîne d'exploitation :**
1. Exploitation d'une vulnérabilité documentée → obtention d'un shell root
2. Exécution de commandes Linux via la session TCP (`whoami` retourne `root`)
3. Utilisation du protocole **FTP** pour copier et exfiltrer `confidential.txt`
4. Suppression du fichier sur la cible après exfiltration

**Points distincts pour l'examen :**
- L'alerte `GPL ATTACK_RESPONSE id check returned root` signifie que la commande `id` a retourné `uid=0(root)` — preuve d'escalade de privilèges
- Le protocole FTP génère deux flux : `ftp` (contrôle, port 21) et `ftp-data` (données, port 20 en mode actif ou port dynamique en mode passif)
- Dans Zeek/Kibana, FTP est loggé sous `bro_ftp` pour le contrôle et `FTP_DATA` pour le transfert de données

---

### Étude de Cas 2 : Infection via RIG Exploit Kit

**Scénario :** Un utilisateur visitant un site légitime de décoration intérieure est redirigé vers un EK.

**Séquence technique :**
1. Connexion à `www.homeimprovement.com` (site légitime compromis)
2. HTML contient une iFrame invisible → redirection vers serveur EK (`tybenme.com`)
3. Le serveur EK délivre un fichier SWF exploitant une vulnérabilité Flash Player (CVE)
4. Le shellcode exécuté télécharge un payload supplémentaire (dropper)
5. Le dropper installe le malware final et établit la communication C2

**Points distincts pour l'examen :**
- Un fichier SWF est identifié par ses magic bytes `43 57 53` (CWS) ou `46 57 53` (FWS) en début de fichier
- La valeur SHA-1 `97a8033303692f9b7618056e49a24470525f7290` correspond au fichier SWF malveillant identifié sur VirusTotal
- La **classification NIDS** `A Network Trojan was Detected` est distincte de `Attempted Information Leak` ou `Policy Violation`
- Les EKs sont livrés comme service commercial (Crimeware-as-a-Service) et ciblent principalement les vulnérabilités navigateur non patchées

---

### Étude de Cas 3 : Attaque Windows — Remcos RAT + Dridex

**Scénario :** Un hôte Windows sur le réseau est compromis le 19 mars 2019.

**Indicateurs de compromission (IoCs) :**
- Téléchargement d'un fichier PE32 (MZ header) via HTTP
- Hash SHA256 `2a9b0ed40f1f0bc0c13ff35d304689e9cadd633781cbcad1c2d2b92ced3f1c85` identifié par Cisco Talos comme malware connu
- Alert `Remcos RAT Checkin 23` sur port C2 non standard avec trafic chiffré/obfusqué
- Alert `ET TROJAN ABUSE.CH SSL Blacklist Malicious SSL certificate detected (Dridex)` depuis IP `31.22.4.176`
- DNS queries vers le domaine `toptoptop1.online` (identifié comme malveillant sur VirusTotal)

**Outils Zeek pertinents pour cet incident :**

| Outil | Donnée Clé Extraite |
|---|---|
| HTTP Dashboard | URIs des exécutables téléchargés (`CSPCA.crl`, `ncsi.txt` + malware PE) |
| DNS Dashboard | Résolution de `toptoptop1.online` + requêtes C2 |
| SSL Dashboard | Certificats Dridex blacklistés par ABUSE.CH |
| PE Dashboard | Exécutables portables identifiés dans le flux réseau |
| Kerberos Dashboard | Nom d'hôte et domaine de l'hôte infecté |

**Points distincts pour l'examen :**
- `CSPCA.crl` est un fichier Certificate Revocation List — sa présence n'est pas anormale en soi mais peut masquer des communications C2
- `ncsi.txt` est lié au Network Connectivity Status Indicator de Windows — peut être utilisé pour du profilage d'environnement
- **Dridex** est un banking trojan modulaire qui se propage via des documents Office malveillants (macros VBA) et utilise des communications SSL avec des certificats auto-signés
- **Remcos** (Remote Control and Surveillance) est un RAT commercial détourné à des fins malveillantes, qui utilise des techniques d'obfuscation et de chiffrement pour éviter la détection

---

### Étude de Cas 4 : Injection SQL + Exfiltration DNS

**Scénario :** Des données PII (Personally Identifiable Information) incluant des informations de cartes de crédit ont été exfiltrées.

**SQL Injection — Pattern d'attaque :**

```
username='+union+select+ccid,ccnumber,ccv,expiration,null+from+credit_cards+--+&password=
```

- `'` ferme la chaîne de la requête SQL originale
- `+union+select+` fusionne le résultat avec une nouvelle requête
- `from+credit_cards` cible explicitement la table des cartes de crédit
- `--+` commente la fin de la requête originale (bypass du filtre de mot de passe)

**DNS Exfiltration — Mécanisme :**
- Les données confidentielles sont encodées en hexadécimal
- Chaque bloc hexadécimal est inséré comme sous-domaine d'une requête DNS légitime vers un domaine contrôlé par l'attaquant (`ns.example.com`)
- Le serveur DNS autoritaire de l'attaquant enregistre toutes les requêtes et reconstitue les données
- Cette technique bypass la plupart des DLP (Data Loss Prevention) car DNS est rarement inspecté en profondeur

**Exigences réglementaires liées — PCI DSS :**
- **PCI DSS** (Payment Card Industry Data Security Standard) exige la conservation des traces d'audit des activités utilisateur relatives aux données protégées pendant **12 mois minimum**
- La compromission de numéros de cartes de crédit (PAN — Primary Account Number) déclenche des obligations de notification et d'investigation forensique

---

### Questions d'Examen — Réponses Précises

| Question | Réponse Correcte |
|---|---|
| Quelle fonction SIEM normalise les données en temps réel depuis plusieurs sources ? | **Normalization** |
| Quelle est la valeur des hashes de fichiers pour les investigations de sécurité réseau ? | **Ils peuvent servir de signatures de malware** |
| Quelle technologie est un système SIEM open source ? | **ELK (Elasticsearch, Logstash, Kibana)** |
| Quel est le temps d'affichage par défaut des logs dans Kibana ? | **24 heures** |
| Dans quel langage Elasticsearch est-il écrit ? | **Java** |
| Combien de mois PCI DSS exige-t-il pour la rétention des traces d'audit ? | **12 mois** |
| Quel outil HIDS est intégré à Security Onion ? | **OSSEC** |
| Quel composant ELK est responsable de l'accès, visualisation et investigation des données ? | **Kibana** |
| Quelle est la durée de rétention par défaut des alertes Sguil dans `securityonion.conf` ? | **30 jours** |
| Quel outil permet de démarrer un workflow d'investigation dans Security Onion ? | **Sguil** |
| Quel composant ELK stocke, indexe et analyse les données ? | **Elasticsearch** |
| Quel outil concentre les événements de sécurité de multiples sources et interagit avec Wireshark ? | **Sguil** |

---
