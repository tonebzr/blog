---
title: "Protocoles réseau et défis de la supervision de sécurité"
description: "Référence technique complète couvrant les protocoles réseau courants, leurs vulnérabilités de sécurité et les défis opérationnels qu'ils posent aux analystes en cybersécurité lors de la supervision et de la réponse aux incidents. Inclut un Q&R de préparation aux examens."
order: 24
---

## VUE D'ENSEMBLE DU MODULE

La supervision de la sécurité réseau requiert une compréhension approfondie des protocoles standards et de leurs vulnérabilités inhérentes. Des protocoles tels que **Syslog**, **NTP**, **HTTP/S**, **DNS** et **SMTP** sont fondamentaux aux opérations réseau, mais sont fréquemment exploités par des acteurs malveillants à des fins de :

- **Exfiltration de données** — vol discret de données hors du réseau
- **Communication Command-and-Control (CnC)** — maintien du contact avec des maliciels sur des hôtes compromis
- **Obfuscation** — dissimulation des traces d'attaque aux analystes

Ce module analyse les spécifications techniques de ces protocoles, les exploits courants (ex. : **injection d'iFrame**, **tunneling ICMP**, **tunneling DNS**), ainsi que l'impact des technologies réseau telles que **NAT/PAT**, **ACL** et **répartition de charge** sur la visibilité sécurité.

---

## 1. Protocoles fondamentaux : Journalisation et synchronisation

### 1.1 Syslog

**Syslog** est le protocole standard de l'industrie pour la journalisation des messages d'événements des équipements réseau et des hôtes vers un point de collecte centralisé.

| Attribut | Détail |
| :--- | :--- |
| **Port** | UDP 514 |
| **Transport** | UDP (sans connexion) |
| **Rôle** | Agrégation centralisée des journaux |
| **Démon** | `syslogd` / `syslog-ng` |

**Fonctionnement :**
- Les équipements réseau (routeurs, commutateurs, pare-feux, serveurs) agissent en tant que **clients syslog**.
- Ils transmettent des messages journalisés horodatés vers un **serveur syslog** central exécutant un démon syslog.
- Le standard syslog est **neutre vis-à-vis des systèmes**, ce qui signifie que des équipements de différents constructeurs peuvent tous envoyer leurs logs vers le même serveur.
- La collecte centralisée rend la supervision sécurité pratique et cohérente.

**Menaces de sécurité contre Syslog :**

| Menace | Description |
| :--- | :--- |
| **Blocage** | L'attaquant bloque le trafic UDP 514, empêchant les journaux d'atteindre le serveur |
| **Altération** | L'attaquant modifie les données de journal pour effacer les traces d'un exploit |
| **Destruction** | L'attaquant supprime les fichiers journaux pour éliminer les preuves |
| **Manipulation logicielle** | L'attaquant compromet le logiciel client syslog lui-même |

> **Point clé :** L'exfiltration de données peut être une attaque très lente et de longue durée. Les attaquants ciblent spécifiquement les serveurs syslog car les compromettre élimine la piste de preuves qui exposerait l'attaque.

**Atténuation : syslog-ng**
L'implémentation de nouvelle génération **syslog-ng** fournit des fonctionnalités de sécurité renforcées qui atténuent de nombreux exploits ciblant le syslog standard.

---

### 1.2 NTP (Network Time Protocol)

**NTP** synchronise les horloges de l'ensemble des équipements sur un réseau, ce qui est essentiel pour des horodatages de journaux précis et corrélables.

| Attribut | Détail |
| :--- | :--- |
| **Port** | **UDP 123** |
| **Transport** | UDP |
| **Rôle** | Synchronisation temporelle entre équipements réseau |
| **Structure** | Hiérarchie de sources de temps faisant autorité (niveaux Stratum) |

**Pourquoi NTP est important pour la sécurité :**
- Les messages syslog sont horodatés. Lorsque plusieurs équipements rapportent des événements, des horodatages précis permettent aux analystes de **reconstituer la séquence** d'une attaque sur l'ensemble du réseau.
- Si les horloges des équipements sont incohérentes, la corrélation des journaux devient impossible.

**Menaces de sécurité contre NTP :**

| Menace | Description |
| :--- | :--- |
| **Corruption d'horodatage** | L'attaquant compromet l'infrastructure NTP pour corrompre les données temporelles, rendant la corrélation d'événements entre journaux peu fiable et obscurcissant les traces d'attaque |
| **Amplification DDoS** | Les acteurs malveillants exploitent des vulnérabilités dans les logiciels client/serveur NTP pour diriger des attaques **DDoS** à grande échelle — NTP peut servir d'amplificateur car de petites requêtes peuvent déclencher de larges réponses |

> **Conseil d'examen :** NTP fonctionne sur le **port UDP 123**. Les attaques DDoS exploitant NTP sont dirigées sur/via le **port 123**.

---

## 2. Protocoles Web et de communication

### 2.1 HTTP

**HTTP (HyperText Transfer Protocol)** est le fondement du World Wide Web.

| Attribut | Détail |
| :--- | :--- |
| **Port** | TCP 80 |
| **Transport** | TCP |
| **Données** | Transmises **en clair** |

**Vulnérabilité critique : Transmission en clair**
Toutes les informations transportées par HTTP sont transmises sans chiffrement, les rendant vulnérables à :
- **L'interception** (attaques de type man-in-the-middle)
- **L'altération** des données en transit

**Exploit majeur : Injection d'iFrame**

```
Déroulement de l'attaque :
1. L'acteur malveillant compromet un serveur web légitime et fréquemment visité
2. Du code malveillant est implanté → crée un iFrame invisible sur la page web
3. Lorsqu'un utilisateur visite le site légitime, l'iFrame se charge automatiquement
4. L'iFrame déclenche un téléchargement de maliciel, souvent depuis une URL différente
5. L'utilisateur est infecté sans aucune alerte visible
```

**Atténuation :**
- **Le filtrage de réputation web Cisco** détecte lorsqu'un site web tente d'envoyer du contenu depuis une source non fiable, même livré via iFrame.
- Migration vers **HTTPS** pour éviter l'interception en clair.

---

### 2.2 HTTPS

**HTTPS (HTTP Sécurisé)** ajoute une couche de chiffrement à HTTP via **SSL (Secure Sockets Layer)** ou **TLS (Transport Layer Security)**.

| Attribut | Détail |
| :--- | :--- |
| **Port** | TCP 443 |
| **Chiffrement** | SSL/TLS |
| **Objectif** | Confidentialité des données **en transit** |

> **Distinction importante :** HTTPS sécurise le **trafic HTTP en transit uniquement**. Ce n'est **pas** un mécanisme de sécurité du serveur web — il ne protège pas le serveur lui-même.

**Défi de supervision sécurité : Chiffrement de bout en bout**

HTTPS représente un défi majeur pour les analystes sécurité :

| Problème | Impact |
| :--- | :--- |
| Le trafic est chiffré de bout en bout | Les analystes ne peuvent pas inspecter le contenu des charges utiles avec les outils standard |
| Les maliciels peuvent transiter via HTTPS | Les charges utiles malveillantes sont dissimulées aux systèmes de détection d'intrusion |
| Les captures de paquets sont difficiles à déchiffrer | Le trafic chiffré ne peut pas être analysé sans déchiffrement préalable |

**Atténuation :** Les appliances d'**inspection SSL/TLS** (également appelées « Break and Inspect ») peuvent déchiffrer, inspecter, puis rechiffrer le trafic HTTPS à la frontière du réseau.

---

### 2.3 Protocoles de messagerie : SMTP, POP3, IMAP

Ces trois protocoles de messagerie sont hébergés par un unique **serveur de messagerie** et constituent des vecteurs courants de livraison de maliciels et d'exfiltration de données.

| Protocole | Port | Direction | Rôle |
| :--- | :--- | :--- | :--- |
| **SMTP** | TCP 25 | Sortant | Envoie les e-mails **entre serveurs** et de l'hôte vers le serveur de messagerie |
| **POP3** | TCP 110 | Entrant | Récupère les e-mails du serveur vers l'hôte (télécharge et supprime du serveur) |
| **IMAP** | TCP 143 | Entrant | Récupère les e-mails du serveur vers l'hôte (conserve une copie sur le serveur) |

**Menaces de sécurité :**

| Protocole | Menace |
| :--- | :--- |
| **SMTP** | Les maliciels exfiltrent des données depuis des hôtes compromis vers des serveurs CnC ; les maliciels propagent des pièces jointes infectées |
| **POP3** | Livraison de pièces jointes e-mail infectées par des maliciels aux hôtes |
| **IMAP** | Livraison de pièces jointes infectées ; fournit un canal d'accès persistant |

**Étude de cas réelle : Piratage de Sony Pictures (2014)**
> Lors de la violation de Sony Pictures en 2014, les attaquants ont utilisé **SMTP** pour exfiltrer des identifiants d'utilisateurs et des informations personnelles depuis des hôtes internes compromis vers des serveurs CnC externes. Étant donné que SMTP est un protocole à fort volume et couramment observé, il est souvent non surveillé — ce qui en fait un canal d'exfiltration idéal.

> **Conseil d'examen :** SMTP **envoie** les e-mails. POP3 et IMAP **récupèrent** les e-mails. Un **serveur de messagerie** prend en charge les trois protocoles.

---

## 3. Protocoles de couche réseau et contrôles

### 3.1 DNS (Domain Name System)

Le DNS traduit les noms de domaine lisibles par l'humain en adresses IP. Il est fondamental à presque toute communication sur Internet.

| Attribut | Détail |
| :--- | :--- |
| **Port** | UDP 53 |
| **Transport** | UDP (TCP pour les grandes réponses) |
| **Rôle** | Résolution de noms |

**Menaces de sécurité :**

| Menace | Mécanisme |
| :--- | :--- |
| **Exfiltration de données** | Les données sont encodées et dissimulées dans les **messages de requête DNS** (tunneling DNS). Comme le trafic DNS est rarement bloqué, il constitue un canal dissimulé fiable. |
| **Communication CnC** | Les maliciels utilisent les requêtes DNS pour communiquer avec des serveurs CnC contrôlés par l'attaquant |
| **Livraison de charges utiles malveillantes** | Le DNS peut rediriger les utilisateurs vers des serveurs malveillants |

**Tunneling DNS (exfiltration de données) :**
```
Déroulement de l'attaque :
1. L'attaquant contrôle un serveur DNS malveillant (faisant autorité pour le domaine de l'attaquant)
2. Le maliciel sur l'hôte compromis encode les données volées dans les chaînes de requête DNS
   Exemple : [données_base64].domaine-attaquant.com
3. La requête est transmise via l'infrastructure DNS normale vers le serveur de l'attaquant
4. L'attaquant décode les données à partir du journal des requêtes
```

**Atténuation :** Inspection DNS, filtrage DNS et surveillance des requêtes DNS anormalement longues ou en volume élevé.

---

### 3.2 ICMP

**ICMP (Internet Control Message Protocol)** est utilisé pour les diagnostics réseau (ex. : `ping`, `traceroute`) et le signalement d'erreurs.

| Attribut | Détail |
| :--- | :--- |
| **Couche** | Couche 3 (Réseau) |
| **Rôle** | Diagnostics réseau, signalement d'erreurs |

**Menaces de sécurité :**

| Menace | Description |
| :--- | :--- |
| **Tunneling ICMP** | Les données sont encodées et dissimulées dans des paquets ICMP (ex. : dans la charge utile de requêtes/réponses echo) pour exfiltrer des données ou communiquer avec des serveurs CnC |
| **Reconnaissance** | ICMP peut être utilisé pour cartographier la topologie réseau et identifier les hôtes actifs |
| **Attaques DoS** | Un flux de paquets ICMP submerge une cible |

**Bonnes pratiques ACL pour ICMP (entrant depuis Internet) :**

Pour prendre en charge le dépannage tout en limitant l'exposition, n'autoriser que ces types ICMP entrants spécifiques :

| Type ICMP à AUTORISER en entrée | Objectif |
| :--- | :--- |
| **Destination inaccessible** | Signale qu'une destination ne peut être atteinte |
| **Echo Reply (Réponse)** | Autorise les réponses aux requêtes ping internes |
| **Source Quench (Réduction)** | Demande à la source de réduire le débit de trafic |

> **Bloquer tous les autres ICMP entrants**, y compris **les requêtes Echo (Ping)** — les hôtes externes ne doivent pas pouvoir initier des pings vers les équipements internes.
>
> **Conseil d'examen pour le dépannage :** Le message ICMP entrant à autoriser sur une **interface externe** pour le dépannage est **Echo Reply** — cela permet les réponses aux pings initiés depuis l'intérieur.

---

### 3.3 Listes de contrôle d'accès (ACL)

Les ACL sont des ensembles de règles séquentielles appliquées aux interfaces de routeurs/pare-feux qui **autorisent ou refusent le trafic** selon des critères définis.

**Critères de filtrage des ACL :**
- Adresses IP source/destination
- Type de protocole (TCP, UDP, ICMP, etc.)
- Numéros de port source/destination

**Fonctionnement des ACL :**
```
Le paquet arrive → L'ACL évalue les règles de haut en bas → Première correspondance = autoriser ou refuser → Aucune correspondance = refus implicite
```

**Limitations des ACL :**

| Limitation | Détail |
| :--- | :--- |
| **Contournement par usurpation d'IP** | Les attaquants forgent des paquets avec des adresses IP source correspondant aux règles autorisées |
| **Contournement par port** | Les attaquants utilisent des ports autorisés (ex. : port 80, 443) pour véhiculer du trafic malveillant |
| **Manipulation de drapeaux TCP** | Les attaquants utilisent le drapeau `established` dans les en-têtes TCP pour contourner les règles ACL sans état |
| **Vulnérabilité à la reconnaissance** | Les règles ACL peuvent être cartographiées par balayage de ports et tests d'intrusion |
| **Impossibilité d'inspecter la charge utile** | Les ACL sont basées sur des règles et n'inspectent pas le contenu de la couche applicative |

> **Conclusion clé :** Les ACL seules procurent un **sentiment de sécurité illusoire**. Elles doivent être complétées par des outils d'analyse comportementale et contextuelle tels que les **pare-feux nouvelle génération Cisco**, **Cisco AMP (Advanced Malware Protection)** et les appliances de filtrage de contenu e-mail/web.

---

### 3.4 NAT/PAT

**NAT (Network Address Translation)** et **PAT (Port Address Translation)** mappent les adresses IP internes (privées) vers une ou plusieurs adresses IP publiques (globales).

| Technologie | Fonction |
| :--- | :--- |
| **NAT** | Mappe une IP interne vers une IP externe |
| **PAT** | Mappe plusieurs IP internes vers une unique IP externe, différenciées par numéro de port |

**Comment NAT/PAT dissimule les utilisateurs :**
- Les équipements internes utilisent des adresses privées RFC 1918 (ex. : `10.x.x.x`, `192.168.x.x`)
- Tout le trafic sortant semble provenir d'une unique IP publique
- Cela **masque l'identité** des utilisateurs internes aux observateurs externes

**Défis de supervision sécurité :**

| Défi | Détail |
| :--- | :--- |
| **Perte de visibilité des IP internes** | Depuis l'extérieur de la frontière NAT, tout le trafic semble provenir d'une unique IP publique. Il est difficile d'identifier quel équipement interne a initié une session. |
| **Perturbation du NetFlow** | NetFlow enregistre des **flux unidirectionnels** définis par des paires IP/port. NAT brise la continuité des flux au niveau de la passerelle — les flux avant et après la frontière NAT ne peuvent pas être directement liés. |
| **Lacunes dans la piste d'audit** | Les journaux peuvent n'afficher que l'IP publique, rendant impossible l'identification de l'hôte interne spécifique sans accès à la table de traduction NAT. |

**Atténuation :** Les produits sécurité Cisco peuvent « reconstruire » les flux NetFlow fragmentés même lorsque les adresses IP ont été remplacées par NAT.

> **Conseil d'examen :** NAT/PAT complique la supervision **NetFlow** en masquant les adresses IP internes — il ne **chiffre pas** le contenu, et ne **manipule pas** les numéros de port pour dissimuler les applications (il s'agirait d'un effet secondaire de PAT, et non d'un mode d'attaque sécurité).

---

## 4. Technologies avancées et menaces

### 4.1 Chiffrement, encapsulation et tunneling

Le **chiffrement** rend le contenu des paquets illisible pour tout le monde sauf les hôtes destinataires.

| Technologie | Description | Impact sécurité |
| :--- | :--- | :--- |
| **VPN** | Utilise le chiffrement pour créer une connexion point-à-point virtuelle sur une infrastructure publique | Le trafic est illisible pour les équipements intermédiaires |
| **HTTPS/SSL/TLS** | Chiffre le trafic HTTP entre le navigateur et le serveur | Empêche l'inspection du contenu web |
| **Tor** | Chiffrement en couches sur plusieurs nœuds relais (routage en oignon) | Le chemin complet et la destination sont obfusqués |
| **Tunnels de maliciels** | Les maliciels établissent des tunnels chiffrés via des protocoles de confiance (DNS, HTTPS, ICMP) | Le trafic d'exfiltration se fond dans le trafic légitime |

**Confidentialité VPN :** Le trafic VPN reste confidentiel grâce au **chiffrement**. Le tunnel chiffré transite via un protocole commun (ex. : IP), rendant le trafic interne illisible.

> **Conseil d'examen :** Le mécanisme qui garantit la confidentialité du trafic VPN est le **chiffrement** (et non l'encapsulation seule — l'encapsulation enveloppe le paquet, mais le chiffrement le rend illisible).

---

### 4.2 Réseaux pair-à-pair (P2P) et Tor

#### Réseaux P2P

Dans un réseau P2P, les hôtes opèrent à la fois **en tant que clients et serveurs simultanément**.

| Type P2P | Exemples | Risque sécurité |
| :--- | :--- | :--- |
| **Partage de fichiers** | BitTorrent, Napster, Gnutella | Fichiers infectés par des maliciels distribués à tous les pairs |
| **Partage de ressources processeur** | Grilles de recherche contre le cancer, SETI | Utilisation non autorisée des ressources de calcul de l'entreprise |
| **Messagerie instantanée** | Plateformes de messagerie publique génériques | Fuite de données, livraison de maliciels |

**Pourquoi P2P est dangereux dans les réseaux d'entreprise :**
- Contourne les règles de pare-feu via une **numérotation de ports dynamique**
- Se connecte à de nombreuses IP de destination imprévisibles
- Les fichiers partagés sont fréquemment infectés par des maliciels
- Les acteurs malveillants implantent délibérément des maliciels sur des clients P2P pour une distribution massive

#### Tor (The Onion Router)

Tor est un réseau P2P de nœuds relais permettant une **navigation anonyme** via un chiffrement en couches.

**Fonctionnement de Tor :**
```
Utilisateur → [Couche chiffrée 3] → Relais 1
                                     [Couche chiffrée 2] → Relais 2
                                                           [Couche chiffrée 1] → Relais 3
                                                                                 → Destination
```
- Chaque relais ne connaît que le **saut précédent** et le **saut suivant** — aucun nœud ne connaît le chemin complet
- Le trafic est chiffré à chaque couche (comme éplucher un oignon — d'où le « routage en oignon »)
- L'IP de destination n'est connue que du nœud de sortie final

**Défis sécurité posés par Tor :**

| Défi | Détail |
| :--- | :--- |
| **Anonymat pour les attaquants** | Les organisations criminelles utilisent Tor de façon extensive sur le « dark net » |
| **Obfuscation des CnC** | Les maliciels utilisent Tor comme canal de communication vers les serveurs CnC |
| **Contournement des listes de blocage** | Les IP de destination sont masquées par le chiffrement ; seule l'IP du prochain relais Tor est visible, ce qui évite les listes de blocage basées sur les IP |

> **Conseil d'examen :** Tor **permet aux utilisateurs de naviguer sur Internet de façon anonyme** — il ne crée pas de tunnels chiffrés au sens VPN, ne fait pas de répartition de charge et ne manipule pas les adresses IP entre réseaux.

---

### 4.3 Répartition de charge (Load Balancing)

La **répartition de charge** distribue le trafic sur plusieurs serveurs ou chemins réseau pour éviter qu'une ressource unique ne soit submergée.

**Méthodes :**
- **Répartition de charge basée sur DNS :** Un nom de domaine unique est résolu en plusieurs adresses IP ; les différents clients sont dirigés vers différents serveurs.
- **Gestionnaire de répartition de charge matériel (LBM) :** Un équipement dédié distribue le trafic via des algorithmes et surveille activement la santé des serveurs via des **sondes**.

**Défis de supervision sécurité :**

| Défi | Détail |
| :--- | :--- |
| **Plusieurs IP pour une transaction** | Une session utilisateur unique peut sembler provenir de plusieurs adresses IP dans les captures de paquets, ce qui peut paraître suspect |
| **Sondes de santé du LBM** | Un LBM envoie du trafic de sonde aux serveurs backend pour vérifier leur disponibilité. Ces sondes peuvent apparaître comme du trafic suspect ou non autorisé aux yeux d'un analyste non informé |
| **Trafic vers des serveurs indisponibles** | Sans vérification de santé par répartition de charge, le trafic peut être envoyé vers des serveurs hors ligne — c'est le problème central que la répartition de charge résout |

> **Conseil d'examen — Problème de répartition de charge :** Le problème potentiel lié à un nouvel équipement de répartition de charge est qu'**il génère du trafic supplémentaire vers une ressource serveur non disponible** — plus précisément, le trafic de sonde du LBM peut être signalé comme suspect, et les LBM mal configurés peuvent envoyer du trafic vers des serveurs hors ligne avant que les vérifications de santé ne détectent la défaillance.

---

## Tableau de référence rapide des protocoles

| Protocole | Port | Transport | Fonction principale | Risque sécurité principal | Défi de supervision |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Syslog** | UDP 514 | UDP | Collecte centralisée des journaux | Altération, suppression, blocage des journaux | Cible des attaquants pour effacer leurs traces |
| **NTP** | UDP 123 | UDP | Synchronisation temporelle | Corruption d'horodatage ; amplification DDoS | Les horodatages corrompus brisent la corrélation des journaux |
| **HTTP** | TCP 80 | TCP | Trafic web (en clair) | Injection d'iFrame ; interception en clair | Non chiffré mais facile à inspecter |
| **HTTPS** | TCP 443 | TCP | Trafic web chiffré | Charges utiles malveillantes cachées dans le chiffrement | Impossible d'inspecter la charge utile chiffrée |
| **SMTP** | TCP 25 | TCP | Envoi d'e-mails entre serveurs | Livraison de maliciels ; exfiltration vers CnC | Volume élevé → souvent non surveillé |
| **POP3** | TCP 110 | TCP | Récupération d'e-mails (supprime du serveur) | Livraison de pièces jointes infectées | — |
| **IMAP** | TCP 143 | TCP | Récupération d'e-mails (conserve sur serveur) | Livraison de pièces jointes infectées | — |
| **DNS** | UDP 53 | UDP | Résolution de noms | Tunneling DNS (exfiltration dans les requêtes) ; CnC | Rarement bloqué ; haute confiance |
| **ICMP** | — | Couche 3 | Diagnostics réseau / signalement d'erreurs | Tunneling ICMP ; DoS ; reconnaissance | Difficile de distinguer légitime de malveillant |
| **ACL** | — | — | Filtrage du trafic | Contournement par usurpation d'IP ; abus de ports | Basé sur règles uniquement ; pas d'inspection de charge utile |
| **NAT/PAT** | — | — | Traduction d'adresses / masquage d'identité | Masque les IP internes ; brise la continuité NetFlow | Impossible d'identifier les hôtes internes spécifiques |

---

## Q&R d'examen

La section suivante fournit des réponses directes à toutes les questions d'examen, mappées aux concepts correspondants.

---

### Section A — Questions spécifiques aux protocoles

**Q : Lequel des éléments suivants peut transporter des charges utiles malveillantes dans le réseau ?**
> ✅ **SMTP** — Les pièces jointes e-mail via SMTP constituent un vecteur principal de livraison de maliciels.

**Q : Lequel des éléments suivants pose des défis pour le décodage des captures de paquets ?**
> ✅ **HTTPS** — Le chiffrement de bout en bout rend le contenu des captures de paquets illisible sans déchiffrement.

**Q : Lequel des éléments suivants peut être utilisé pour exfiltrer des données dissimulées dans des messages de requête ?**
> ✅ **DNS** — Les attaquants encodent des données volées dans des chaînes de requête DNS (tunneling DNS).

**Q : Les horodatages fournis par quel protocole peuvent être corrompus pour compliquer la corrélation d'événements ?**
> ✅ **NTP** — Compromettre l'infrastructure NTP corrompt les horodatages, rendant la corrélation des journaux entre équipements peu fiable.

**Q : Quel protocole est utilisé pour envoyer des e-mails entre deux serveurs de domaines de messagerie différents ?**
> ✅ **SMTP** — SMTP gère la livraison d'e-mails de serveur à serveur.

**Q : Quel numéro de port est utilisé si un acteur malveillant exploite NTP pour diriger des attaques DDoS ?**
> ✅ **123** — NTP fonctionne sur le port UDP 123.

**Q : Quel type de serveur prend en charge les protocoles SMTP, POP et IMAP ?**
> ✅ **Serveur de messagerie** — Les trois protocoles de messagerie sont hébergés par un serveur de messagerie dédié.

**Q : Quel service réseau synchronise l'heure sur tous les équipements du réseau ?**
> ✅ **NTP** — Network Time Protocol fournit la synchronisation horaire à l'échelle du réseau.

**Q : Quel type de démon serveur accepte les messages envoyés par les équipements réseau pour constituer une collection d'entrées de journal ?**
> ✅ **Syslog** — Le démon syslog collecte les messages journalisés des équipements réseau.

**Q : Quel type de serveur les acteurs malveillants peuvent-ils utiliser pour communiquer via DNS ?**
> ✅ **CnC (Command and Control)** — Les maliciels utilisent les requêtes DNS pour communiquer discrètement avec des serveurs CnC.

---

### Section B — Technologies et protocoles

**Q : Lequel des éléments suivants propage des fichiers infectés par des maliciels et crée des vulnérabilités sur un réseau ?**
> ✅ **P2P** — Les réseaux pair-à-pair distribuent des fichiers partagés infectés par des maliciels et contournent les contrôles des pare-feux.

**Q : Lequel des éléments suivants peut être contourné par des paquets contenant des adresses IP usurpées ?**
> ✅ **ACL** — Les ACL filtrent sur la base des adresses IP ; les IP source usurpées peuvent contourner les règles ACL.

**Q : Lequel des éléments suivants rend le contenu des messages et les pièces jointes illisibles ?**
> ✅ **Chiffrement** — Le chiffrement rend les données illisibles pour tout le monde sauf le destinataire prévu.

**Q : Lequel des éléments suivants dissimule les détails d'identité des utilisateurs qui naviguent sur le web ?**
> ✅ **P2P / Tor** — Tor masque spécifiquement l'identité des utilisateurs via le routage en oignon et le chiffrement en couches.

**Q : Quelle affirmation décrit la fonction fournie par le réseau Tor ?**
> ✅ **Il permet aux utilisateurs de naviguer sur Internet de façon anonyme** — Tor utilise le routage en oignon de sorte qu'aucun nœud unique ne connaisse le chemin complet, permettant une navigation anonyme.

**Q : Comment NAT/PAT peut-il compliquer la supervision de sécurité réseau si NetFlow est utilisé ?**
> ✅ **Il masque les adresses IP internes en leur permettant de partager une ou quelques adresses IP externes** — NAT brise la continuité des flux NetFlow et empêche l'identification des hôtes internes spécifiques.

**Q : Quelle méthode permet au trafic VPN de rester confidentiel ?**
> ✅ **Chiffrement** — Le chiffrement VPN rend le trafic illisible pour tous les équipements intermédiaires.

---

### Section C — ICMP et ACL

**Q : Un analyste cybersécurité examine une ACL de point d'entrée. Quels trois types de trafic ICMP doivent être autorisés à accéder à un réseau interne depuis Internet ? (Choisir trois.)**
> ✅ **Destination inaccessible**, ✅ **Délai dépassé**, ✅ **Echo Reply (Réponse)**
>
> *Remarque : Le texte du cours spécifie Destination inaccessible, Réponse (Echo Reply) et Source Quench/Réduction. Certaines versions de cette question incluent Délai dépassé à la place de Réduction — sélectionner les trois qui correspondent le mieux à la version de votre examen parmi : Destination inaccessible, Réponse, Réduction/Source Quench, Délai dépassé.*

**Q : Pour faciliter le processus de dépannage, quel message ICMP entrant doit être autorisé sur une interface externe ?**
> ✅ **Echo Reply** — Autoriser l'Echo Reply entrant permet les réponses aux pings initiés depuis l'intérieur du réseau, permettant ainsi le dépannage ping sortant.

---

### Section D — Scénarios appliqués

**Q : De quelle façon HTTPS augmente-t-il les défis de supervision sécurité dans les réseaux d'entreprise ?**
> ✅ **Le trafic HTTPS permet le chiffrement de bout en bout** — Cela empêche les outils de supervision sécurité d'inspecter la charge utile du trafic HTTPS.

**Q : Une entreprise acquiert un équipement de répartition de charge. Quel pourrait être un problème potentiel ?**
> ✅ **Il génèrera du trafic supplémentaire vers une ressource serveur non disponible** — Les sondes de santé du LBM peuvent apparaître comme du trafic suspect, et les équipements mal configurés peuvent router du trafic vers des serveurs indisponibles.

**Q : Lequel des éléments suivants peut transporter des charges utiles malveillantes ET pose également un défi pour le décodage des captures de paquets ?**
> - Transporte des charges utiles malveillantes → **SMTP**, **HTTPS**, **DNS**
> - Défis de décodage → **HTTPS** (chiffrement)

---

## Récapitulatif : Faits clés à mémoriser

| Fait | Valeur |
| :--- | :--- |
| Port Syslog | UDP 514 |
| Port NTP | **UDP 123** |
| Port attaque DDoS NTP | **123** |
| Port HTTP | TCP 80 |
| Port HTTPS | TCP 443 |
| Port SMTP | TCP 25 |
| Port POP3 | TCP 110 |
| Port IMAP | TCP 143 |
| Port DNS | UDP 53 |
| Protocole qui corrompt les horodatages | **NTP** |
| Protocole utilisé pour l'exfiltration DNS | **DNS** (tunneling de requêtes) |
| Protocole qui masque les IP internes | **NAT/PAT** |
| Protocole perturbé par NAT dans NetFlow | Flux **NetFlow** |
| Mécanisme de confidentialité VPN | **Chiffrement** |
| Mécanisme d'anonymat Tor | **Routage en oignon** |
| Exploit ICMP pour l'exfiltration | **Tunneling ICMP** |
| Exploit HTTP pour les maliciels | **Injection d'iFrame** |
| Solution Syslog nouvelle génération | **syslog-ng** |
| Méthode de contournement ACL | **Usurpation d'IP** |
| Protocoles du serveur de messagerie | **SMTP + POP3 + IMAP** |
| ICMP entrant autorisé (3 types) | Destination inaccessible, Echo Reply, Source Quench |
