---
title: "Vérification de connectivité IPV4 IPV6"
description: "Analyse technique avancée des types de messages ICMPv4 et ICMPv6, du fonctionnement des outils de diagnostic, et de l'intégration du Neighbor Discovery Protocol dans les frameworks de surveillance en cybersécurité."
order: 7
---

## PRÉSENTATION DU MODULE

Le **Internet Control Message Protocol (ICMP)** est le principal mécanisme de contrôle et de signalement d'erreurs au sein de la **suite de protocoles TCP/IP**. Bien que le **protocole IP** soit conçu comme un système de livraison sans connexion et sans garantie (best-effort), il ne dispose d'aucun mécanisme natif pour le contrôle de flux, la signalisation d'erreurs ou le diagnostic de chemin. ICMP remplit ces fonctions en fournissant des retours sur le traitement des paquets dans des conditions réseau spécifiques.

Dans le cadre du programme **Cisco CyberOps Associate**, la maîtrise d'ICMP est essentielle pour l'analyse de la ligne de base réseau, le dépannage de la connectivité et la détection d'activités de reconnaissance. ICMP existe en deux versions distinctes : **ICMPv4** pour les environnements IPv4, et **ICMPv6** pour les environnements IPv6. Bien que leurs fonctions principales se recoupent, ICMPv6 intègre des capacités étendues, notamment le **Neighbor Discovery Protocol (NDP)** et la **Stateless Address Autoconfiguration (SLAAC)**, ce qui le rend plus profondément intégré au fonctionnement fondamental de la couche réseau IPv6.

> ⚠️ **Note de sécurité** : ICMP est fréquemment exploité pour la **reconnaissance réseau** (ex. : ping sweeps, cartographie traceroute). Les analystes SOC doivent distinguer l'usage diagnostique légitime de l'activité de scan malveillant. De nombreuses organisations filtrent partiellement ICMP au niveau du périmètre ; cependant, bloquer ICMP complètement peut altérer la **découverte du MTU de chemin (PMTUD)** et le signalement d'erreurs légitime.



## CONCEPTS FONDAMENTAUX ET DÉFINITIONS

### Encapsulation et structure ICMP

Les messages ICMP sont encapsulés directement dans la charge utile (payload) d'un paquet IP.

- En **IPv4**, le champ Protocol de l'en-tête IPv4 est défini à **1** pour indiquer ICMPv4.
- En **IPv6**, le champ Next Header de l'en-tête IPv6 est défini à **58** pour indiquer ICMPv6.

Chaque message ICMP contient trois champs d'en-tête communs : **Type**, **Code** et **Checksum**, suivis d'une section de données variable selon le type de message. Le champ **Type** identifie la catégorie générale du message ; le champ **Code** apporte une précision supplémentaire au sein de cette catégorie.

### Messages ICMP courants

1. **Confirmation d'hôte** : Utilise les messages **ICMP Echo Request** (ping) et **Echo Reply** pour vérifier l'état opérationnel d'un hôte local ou distant.
2. **Destination ou service inaccessible** : Envoyé par un routeur ou l'hôte de destination lorsqu'un paquet ne peut pas être livré. Inclut des sous-codes tels que **Net Unreachable (0)**, **Host Unreachable (1)**, **Protocol Unreachable (2)** et **Port Unreachable (3)** pour ICMPv4. En ICMPv6 : Code 0 = No Route, Code 1 = Administratively Prohibited, Code 3 = Address Unreachable, Code 4 = Port Unreachable.
3. **Temps dépassé (Time Exceeded)** : Généré par un routeur lorsque le champ **Time to Live (TTL)** (IPv4) ou **Hop Limit** (IPv6) est décrémenté à **zéro**, empêchant les boucles de routage infinies. Également généré lors de l'expiration du timer de réassemblage de fragments (Code 1).
4. **Redirection de route** : Utilisé par une passerelle pour informer un hôte qu'un chemin plus efficace vers une destination existe. À traiter avec prudence d'un point de vue sécurité, car ces messages peuvent être falsifiés (spoofed).
5. **Problème de paramètre** : Indique qu'un routeur ou un hôte a rencontré un problème lors du traitement d'un champ d'en-tête (ICMPv4 Type 12 / ICMPv6 Type 4).

### Neighbor Discovery Protocol IPv6 (NDP)

ICMPv6 intègre le **NDP (RFC 4861)**, qui remplace et étend plusieurs protocoles IPv4, notamment ARP, ICMP Router Discovery et ICMP Redirect. NDP fonctionne sur ICMPv6 et utilise le **multicast** plutôt que le broadcast, ce qui réduit le trafic inutile sur le lien.

- **Router Solicitation (RS)** : Envoyé par les hôtes au démarrage pour localiser les routeurs IPv6 sur le lien local (envoyé à l'adresse multicast all-routers `FF02::2`).
- **Router Advertisement (RA)** : Envoyé périodiquement par les routeurs, ou en réponse aux RS, pour fournir les préfixes réseau, longueurs de préfixe, passerelle par défaut et indicateurs (Managed/Other) pour la configuration d'adresse. Envoyé à all-nodes multicast `FF02::1`.
- **Neighbor Solicitation (NS)** : Utilisé pour la résolution d'adresse couche 3 vers couche 2 (analogue à une requête ARP) et la **Duplicate Address Detection (DAD)**. Envoyé à l'adresse multicast solicited-node.
- **Neighbor Advertisement (NA)** : Envoyé en réponse à un message NS pour fournir l'adresse Link-Layer (MAC) de l'émetteur. Également envoyé de manière non sollicitée lorsqu'un nœud change d'adresse MAC.
- **Redirect** : Envoyé par les routeurs pour informer un hôte d'un meilleur premier saut vers une destination spécifique (similaire à l'ICMP Redirect IPv4, Type 5).

> 💡 **Distinction clé** : NDP utilise l'adressage **multicast**, pas le broadcast. C'est une différence fondamentale avec ARP (IPv4) qui utilise le broadcast.



## TAXONOMIE TECHNIQUE ET CLASSIFICATION

Le tableau suivant classe les principaux messages ICMP utilisés dans les deux versions de protocole et leurs fonctions techniques spécifiques.

| Type de message | ICMPv4 | ICMPv6 | Fonction opérationnelle |
| :--- | :---: | :---: | :--- |
| **Echo Request** | Type 8 | Type 128 | Initie un test de connectivité. |
| **Echo Reply** | Type 0 | Type 129 | Répond à l'Echo Request. |
| **Destination Unreachable** | Type 3 | Type 1 | Indique un échec de routage ou d'accès au service. |
| **Time Exceeded** | Type 11 | Type 3 | Indique l'expiration du TTL/Hop Limit. |
| **Redirect** | Type 5 | Type 137 | Suggère une meilleure passerelle de prochain saut. |
| **Parameter Problem** | Type 12 | Type 4 | Champ d'en-tête invalide détecté. |
| **Router Solicitation** | N/A | Type 133 | Hôte recherchant un routeur IPv6. |
| **Router Advertisement** | N/A | Type 134 | Routeur fournissant les paramètres réseau. |
| **Neighbor Solicitation** | N/A | Type 135 | Résolution d'adresse Link-Layer / DAD. |
| **Neighbor Advertisement** | N/A | Type 136 | Réponse au NS avec l'adresse MAC. |

### Codes ICMPv4 Destination Unreachable (Type 3)

| Code | Signification |
| :---: | :--- |
| 0 | Net Unreachable (réseau inaccessible) |
| 1 | Host Unreachable (hôte inaccessible) |
| 2 | Protocol Unreachable (protocole non supporté) |
| 3 | Port Unreachable (port non ouvert) |
| 4 | Fragmentation Needed (bit DF positionné) — utilisé par PMTUD |
| 13 | Communication Administratively Prohibited |

### Codes ICMPv6 Destination Unreachable (Type 1)

| Code | Signification |
| :---: | :--- |
| 0 | No Route to Destination |
| 1 | Communication Administratively Prohibited |
| 2 | Beyond Scope of Source Address |
| 3 | Address Unreachable (résolution NDP échouée) |
| 4 | Port Unreachable |



## ANALYSE OPÉRATIONNELLE

### Test de connectivité via Ping

L'utilitaire **ping** utilise les messages ICMP Echo Request et Echo Reply. Les analystes en cybersécurité utilisent ping pour déterminer l'accessibilité des hôtes et vérifier l'intégrité de la **pile TCP/IP**. La séquence de dépannage systématique suit une approche ascendante (bottom-up) :

1. **Vérification de la boucle locale** : Ping `127.0.0.1` (IPv4) ou `::1` (IPv6). Confirme que la pile IP est installée et fonctionnelle **sur l'hôte local**, indépendamment du câblage physique ou du matériel NIC.
2. **Vérification de la NIC locale** : Ping de **sa propre adresse IP configurée**. Confirme que la carte réseau est active et que l'adresse est correctement liée.
3. **Vérification de la passerelle par défaut** : Ping de la **passerelle locale**. Confirme la connectivité couche 2 et couche 3 sur le segment local, et que la résolution ARP/NDP fonctionne.
4. **Vérification d'un hôte distant** : Ping d'une adresse globale (ex. : `8.8.8.8`). Teste la connectivité couche 3 de bout en bout à travers l'internetwork.
5. **Vérification de la résolution DNS** : Ping d'un nom d'hôte (ex. : `ping www.cisco.com`). Confirme que la résolution DNS fonctionne en plus de la connectivité IP.

> ⚠️ **Important** : Un ping réussi ne garantit **pas** que l'application ou le service cible est opérationnel — il confirme uniquement l'accessibilité au niveau IP. Un ping échoué ne signifie **pas** toujours que l'hôte est hors ligne — il peut être filtré par un pare-feu.

### Découverte de chemin via Traceroute (tracert)

**Traceroute** exploite le message ICMP **Time Exceeded** pour cartographier le chemin couche 3 de la source vers la destination et mesurer la latence par saut.

1. La source envoie une séquence de paquets avec un **TTL/Hop Limit** débutant à **1**.
2. Le premier routeur décrémente le TTL à 0, abandonne le paquet et retourne un message **ICMP Time Exceeded** (Type 11, Code 0) à la source.
3. La source enregistre l'adresse IP du routeur et le temps aller-retour, puis incrémente le TTL/Hop Limit pour la prochaine sonde.
4. Ce processus se répète jusqu'à ce que **l'hôte de destination** soit atteint ou qu'un blocage administratif soit rencontré.

> 💡 **Note d'implémentation** : Sur **Windows**, `tracert` envoie des **ICMP Echo Requests**. Sur **Linux/Unix**, `traceroute` envoie par défaut des datagrammes **UDP** vers un port de numéro élevé. Les deux s'appuient sur les messages ICMP Time Exceeded des routeurs intermédiaires. Certains routeurs sont configurés pour ne **pas** générer de messages Time Exceeded ou les limiter, ce qui provoque des `* * *` (astérisques/timeouts) — cela ne signifie **pas** nécessairement que le chemin est rompu au-delà de ce saut.

### Path MTU Discovery (PMTUD)

**PMTUD** s'appuie sur ICMP pour déterminer la taille maximale de paquet pouvant traverser un chemin sans fragmentation. Si un routeur reçoit un paquet trop grand pour le lien suivant et que le bit **DF (Don't Fragment)** est positionné :

- En **IPv4** : Le routeur abandonne le paquet et envoie un message **ICMPv4 Type 3, Code 4** (Fragmentation Needed) à la source.
- En **IPv6** : La fragmentation par les routeurs est **interdite**. Le routeur abandonne le paquet et envoie un message **ICMPv6 Type 2** (Packet Too Big), qui contient également le MTU du lien contraignant.

> ⚠️ **Implication sécurité** : Bloquer tout ICMP sur un pare-feu peut rompre PMTUD, causant un **routage en trou noir (black-hole routing)** — les sessions semblent s'établir correctement, mais les transferts de données volumineux échouent silencieusement.

### Analyse des journaux et des codes

Lorsqu'un hôte ou un routeur retourne un code ICMP spécifique, il fournit des informations diagnostiques sur l'endroit et la raison de l'échec de livraison. Exemples clés :

- **ICMPv4 Type 3, Code 3** → Port Unreachable (l'application n'écoute pas — utile pour distinguer d'une panne réseau).
- **ICMPv6 Type 1, Code 3** → Address Unreachable (l'adresse ne peut pas être atteinte en couche 2 — ex. : résolution NDP échouée).
- **ICMPv6 Type 1, Code 4** → Port Unreachable (même distinction couche applicative qu'en IPv4).
- **ICMPv4 Type 11, Code 0** → Time Exceeded in Transit (TTL expiré dans un routeur — utilisé par traceroute).
- **ICMPv4 Type 11, Code 1** → Fragment Reassembly Time Exceeded (fragments reçus mais le réassemblage a expiré).



## ÉTUDES DE CAS ET POINTS D'EXAMEN

### Étude de cas : Duplicate Address Detection (DAD)

Dans un environnement IPv6, avant qu'une interface puisse utiliser une adresse Unicast (Global ou Link-Local), elle doit effectuer la **Duplicate Address Detection (DAD)**.

- **Mécanisme** : L'hôte place la nouvelle adresse en état **tentative**, puis envoie un message **ICMPv6 Neighbor Solicitation (Type 135)** à l'adresse multicast solicited-node correspondant à l'adresse tentative. L'IP source de ce NS est l'**adresse non spécifiée (`::`)** car l'adresse n'est pas encore confirmée.
- **Résultat — Pas de conflit** : Si aucune réponse n'est reçue après l'expiration du timer DAD, l'adresse est déclarée unique et assignée à l'interface.
- **Résultat — Conflit détecté** : Si un autre appareil répond avec un **Neighbor Advertisement (Type 136)**, l'adresse est déjà utilisée. L'interface reste en état tentative et l'adresse n'est **pas** assignée — une intervention manuelle est nécessaire.

> 💡 DAD est également effectué lorsqu'un appareil active pour la première fois une adresse link-local (dérivée du MAC via EUI-64 ou générée aléatoirement).

### Étude de cas : Stateless Address Autoconfiguration (SLAAC)

**SLAAC (RFC 4862)** permet à un hôte de configurer sa propre adresse IPv6 Global Unicast sans serveur DHCPv6.

- **Étape 1 — Adresse Link-Local** : L'hôte génère et valide une adresse link-local (fe80::/10) via DAD.
- **Étape 2 — Router Solicitation** : L'hôte envoie un **ICMPv6 Router Solicitation (Type 133)** à `FF02::2` (multicast all-routers).
- **Étape 3 — Router Advertisement** : Le routeur local répond avec un **ICMPv6 Router Advertisement (Type 134)** contenant le **préfixe réseau**, la **longueur du préfixe**, la **passerelle par défaut** (adresse link-local du routeur) et des indicateurs de configuration :
  - **Indicateur M (Managed)** : Si positionné, utiliser DHCPv6 pour l'adresse complète.
  - **Indicateur O (Other)** : Si positionné, utiliser SLAAC pour l'adresse mais **DHCPv6** pour les autres configurations (ex. : serveurs DNS).
- **Étape 4 — Génération de l'adresse** : L'hôte concatène son identifiant d'interface (via **EUI-64** à partir du MAC, ou **génération aléatoire** per RFC 7217 pour la confidentialité) au préfixe reçu.
- **Étape 5 — DAD** : L'hôte exécute DAD sur l'adresse Global Unicast nouvellement formée avant de l'utiliser.

### Points de distinction techniques pour l'examen

| Sujet | Fait clé |
| :--- | :--- |
| **Valeur de décrément TTL/Hop Limit** | Un routeur abandonne un paquet quand le TTL (IPv4) ou Hop Limit (IPv6) atteint **zéro** après décrémentation — pas à l'arrivée à zéro. |
| **Ping `127.0.0.1` réussi** | Confirme uniquement que la **pile IPv4 est installée** sur l'hôte local. Ne vérifie **pas** la NIC, le câblage ou la passerelle. |
| **Ping `::1` réussi** | Confirme uniquement que **IPv6 est installé** sur l'hôte local. Ne vérifie **pas** le câblage ou l'accessibilité de la passerelle. |
| **Astérisques traceroute (`* * *`)** | Ce saut n'a pas retourné de message Time Exceeded dans le délai imparti — ne signifie **pas** nécessairement que le chemin est rompu. |
| **ICMPv6 Type 1, Code 3** | Address Unreachable — la résolution NDP (couche 2) a échoué pour cette destination. |
| **ICMPv4 Type 3, Code 4** | Fragmentation Needed avec bit DF positionné — critique pour PMTUD. |
| **Échec PMTUD** | Bloquer ICMP Type 3 Code 4 (v4) ou Type 2 (v6) provoque un routage en trou noir pour les grands transferts. |
| **NDP vs ARP** | NDP utilise le **multicast ICMPv6** ; ARP utilise le **broadcast**. NDP intègre aussi la Router Discovery et DAD — ARP ne le fait pas. |
| **Adresse source DAD** | Le NS lors du DAD utilise l'**adresse non spécifiée (`::`)** comme source, pas l'adresse tentative. |
| **Indicateur M SLAAC** | Si M=1, l'hôte utilise **DHCPv6** pour l'adresse complète (le préfixe SLAAC est ignoré pour l'adressage). |
| **Indicateur O SLAAC** | Si O=1, l'hôte utilise SLAAC pour l'adresse mais **DHCPv6** pour la configuration complémentaire (ex. : DNS). |
| **Ping sweep (reconnaissance)** | Envoi de ICMP Echo Requests vers une plage d'adresses IP pour découvrir les hôtes actifs. Détecté par IDS/IPS comme un schéma de requêtes Echo séquentielles. |
| **Champ Protocol ICMPv4** | Valeur **1** dans le champ Protocol de l'en-tête IPv4. |
| **Champ Next Header ICMPv6** | Valeur **58** dans le champ Next Header de l'en-tête IPv6. |



## QUESTIONS-RÉPONSES RAPIDES POUR L'EXAMEN

**Q : Quel type et code ICMP un routeur envoie-t-il quand le TTL d'un paquet expire ?**
R : ICMPv4 **Type 11, Code 0** (Time Exceeded — TTL expiré en transit). L'équivalent ICMPv6 est **Type 3, Code 0**.

**Q : Un ping vers 127.0.0.1 réussit mais un ping vers la passerelle par défaut échoue. Qu'est-ce que cela indique ?**
R : La pile IPv4 locale est fonctionnelle, mais il existe un problème de connectivité couche 1/2/3 entre l'hôte et la passerelle (ex. : mauvaise config IP, panne câble, problème switch, ou échec ARP).

**Q : Quels messages ICMPv6 sont utilisés lors de SLAAC ?**
R : **Router Solicitation (Type 133)** envoyé par l'hôte, et **Router Advertisement (Type 134)** envoyé par le routeur.

**Q : Quelle est l'adresse IP source utilisée pendant le DAD ?**
R : L'**adresse non spécifiée (`::`)** — car l'adresse tentative n'est pas encore confirmée comme unique.

**Q : Pourquoi bloquer tout ICMP sur un pare-feu peut-il causer des problèmes même pour des sessions TCP ?**
R : Cela rompt la **Path MTU Discovery (PMTUD)**. Les routeurs ne peuvent plus envoyer les messages ICMPv4 Type 3 Code 4 ou ICMPv6 Type 2 (Packet Too Big), provoquant la perte silencieuse des grands paquets (**routage en trou noir**).

**Q : Quelle est la différence entre ICMPv4 Type 3 Code 1 et Code 3 ?**
R : Code 1 = **Host Unreachable** (échec au niveau routage/réseau). Code 3 = **Port Unreachable** (l'hôte est accessible mais l'application/port n'écoute pas — problème couche 4).

**Q : Vers quelle adresse multicast un hôte envoie-t-il un Router Solicitation ?**
R : `FF02::2` (adresse multicast all-routers sur le lien local).

**Q : Dans traceroute, quel message la destination finale envoie-t-elle pour indiquer qu'elle a été atteinte (implémentation Linux/UDP) ?**
R : Un message **ICMP Port Unreachable (Type 3, Code 3)**, car la sonde UDP arrive sur un port qui n'est pas ouvert sur l'hôte de destination.