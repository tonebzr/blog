---
title: "Fondamentaux de la cybersécurité : Taxonomie des acteurs malveillants, gestion des risques et méthodologies d'attaque"
description: "Analyse technique approfondie des opérations de cybersécurité : relations entre vulnérabilités, menaces et exploits ; classification des acteurs malveillants ; outillage spécialisé utilisé en test d'intrusion et en exploitation réseau."
order: 13
---

## PRÉSENTATION DU MODULE

La cybersécurité désigne l'effort continu visant à protéger les systèmes connectés à Internet et les données associées contre tout accès non autorisé ou toute atteinte à leur intégrité. Cette discipline repose sur une responsabilité partagée entre tous les utilisateurs : signaler les cybercrimes aux autorités compétentes, rester vigilant face aux vecteurs d'attaque véhiculés par le courrier électronique et le trafic web, et préserver la confidentialité des informations sensibles. Les organisations doivent gérer activement leurs actifs en élaborant des politiques de sécurité, en conduisant des tests d'intrusion réguliers et en imposant des mécanismes d'authentification robustes tels que l'authentification à deux facteurs (2FA).

> **Principe fondamental :** Les acteurs malveillants ne font aucune distinction — ils ciblent indifféremment les particuliers, les PME et les grandes organisations. La cybersécurité est donc une responsabilité collective et partagée.

---

## CONCEPTS FONDAMENTAUX ET DÉFINITIONS

La maîtrise de l'environnement opérationnel exige une définition précise des relations entre les faiblesses d'un système et les dangers externes potentiels.

| Terme | Définition |
| :--- | :--- |
| **Menace** (*Threat*) | Danger potentiel pesant sur un actif, qu'il s'agisse de données ou de l'infrastructure réseau sous-jacente. |
| **Vulnérabilité** (*Vulnerability*) | Faiblesse spécifique d'un système ou de sa conception, susceptible d'être exploitée par un acteur malveillant. |
| **Surface d'attaque** (*Attack Surface*) | Somme totale des vulnérabilités d'un système accessibles à un attaquant — l'ensemble des points d'entrée et d'exfiltration potentiels. |
| **Exploit** | Mécanisme ou code utilisé pour tirer parti d'une vulnérabilité afin de compromettre un actif. |
| **Risque** (*Risk*) | Probabilité calculée qu'une menace donnée exploite une vulnérabilité donnée, entraînant une conséquence préjudiciable pour l'organisation. |

### Types d'exploits

| Type | Description |
| :--- | :--- |
| **Exploit distant** (*Remote Exploit*) | S'exécute via le réseau sans nécessiter d'accès préalable ni de compte local sur le système cible. |
| **Exploit local** (*Local Exploit*) | Requiert que l'acteur malveillant dispose préalablement d'un accès utilisateur ou administrateur sur le système. L'accès physique n'est **pas** obligatoirement requis. |

> **Exemple — Surface d'attaque en pratique :** Un système d'exploitation et un navigateur web peuvent chacun nécessiter des correctifs de sécurité. Ensemble, ils constituent une surface d'attaque combinée qu'un acteur malveillant peut exploiter, même si chaque composant n'est que partiellement vulnérable pris isolément.

---

## STRATÉGIES DE GESTION DES RISQUES

La gestion des risques est le processus qui consiste à équilibrer les coûts opérationnels des mesures de protection avec les gains obtenus par la protection des actifs.

| Stratégie | Description | Compromis |
| :--- | :--- | :--- |
| **Acceptation du risque** (*Risk Acceptance*) | Aucune action n'est prise ; le risque est accepté en l'état. | Applicable lorsque le coût des mesures de mitigation dépasse le coût du risque lui-même. Aucune charge supplémentaire, mais exposition totale maintenue. |
| **Évitement du risque** (*Risk Avoidance*) | L'activité ou le dispositif à l'origine du risque est supprimé. | Élimine le risque, mais fait également perdre tous les bénéfices associés à cette activité ou à ce dispositif. |
| **Réduction du risque** (*Risk Reduction*) | Des actions sont prises pour diminuer la probabilité ou l'impact du risque. | Stratégie la plus courante. Nécessite une évaluation rigoureuse des coûts de la perte, du coût de mitigation et des bénéfices opérationnels. |
| **Transfert du risque** (*Risk Transfer*) | Le risque est transféré à un tiers volontaire (ex. : compagnie d'assurance). | Réduit l'exposition financière directe, mais n'élimine pas la vulnérabilité sous-jacente. |

> **Mémo examen :** Évitement = suppression de l'activité. Réduction = stratégie la plus courante, nécessite une analyse coût-bénéfice. Transfert = assurance.

---

## TAXONOMIE DES ACTEURS MALVEILLANTS

Le hacking a considérablement évolué depuis les années 1960, époque à laquelle les premiers acteurs malveillants exploitaient les systèmes de téléphonie à tonalité (*phreaking*). Au milieu des années 1980, des programmes de *war dialing* balayaient les numéros de téléphone à la recherche d'ordinateurs et de BBS connectés. Aujourd'hui, les acteurs malveillants se distinguent par une grande diversité de motivations et de niveaux de compétence.

### Classification par chapeau (*Hat Classification*)

| Catégorie | Motivation | Légalité | Caractéristiques principales |
| :--- | :--- | :--- | :--- |
| **White Hat** (chapeau blanc) | Améliorer la sécurité | Légale | Professionnels éthiques ; conduisent des tests d'intrusion autorisés ; signalent les vulnérabilités aux développeurs ; peuvent percevoir des primes (*bug bounties*). |
| **Gray Hat** (chapeau gris) | Mixte / curiosité | Limite | Commettent des actes techniquement illicites, mais sans intention malveillante ni gain personnel ; divulguent souvent les vulnérabilités après coup. |
| **Black Hat** (chapeau noir) | Gain personnel / malveillance | Illégale | Exploitent les vulnérabilités à des fins lucratives, d'espionnage ou de destruction. |

### Profils étendus des acteurs malveillants

| Type d'acteur | Profil | Motivation typique |
| :--- | :--- | :--- |
| **Script Kiddies** | Peu expérimentés ; utilisent des outils et scripts existants | Notoriété, perturbation — généralement sans but lucratif |
| **Courtiers en vulnérabilités** (*Vulnerability Brokers*) | Hackers gray hat qui découvrent et signalent des exploits aux éditeurs | Récompenses, reconnaissance (programmes de bug bounty) |
| **Hacktivistes** (*Hacktivists*) | Groupes utilisant le hacking pour promouvoir des idéaux politiques ou sociaux | Idéologie (ex. : lancer une attaque DoS contre une entreprise responsable d'une marée noire) |
| **Cybercriminels** | Acteurs organisés ciblant les actifs financiers | Gain financier (skimming, rançongiciels, fraude) |
| **Acteurs étatiques** (*State-Sponsored*) | Soutenus par des États-nations ; très haute sophistication | Espionnage, sabotage d'infrastructures, collecte de renseignements |

### Exemples de classification réels

| Scénario | Classification |
| :--- | :--- |
| Mandaté pour identifier les failles des systèmes de son employeur | ✅ White Hat |
| A piraté des distributeurs automatiques sans autorisation, puis signalé les vulnérabilités au fabricant | ⬜ Gray Hat |
| A laissé un message non autorisé « Votre sécurité est défaillante » après s'être introduit dans un système | ⬜ Gray Hat |
| A installé un skimmer sur un DAB et transféré les fonds volés vers un compte offshore | ❌ Black Hat |
| A utilisé un malware pour dérober des données de cartes bancaires et les revendre au plus offrant | ❌ Black Hat |
| Collabore avec des éditeurs technologiques pour corriger une faille DNS | ✅ White Hat |

---

## INDICATEURS DE COMPROMISSION (IOC) ET INDICATEURS D'ATTAQUE (IOA)

Une défense efficace repose sur l'identification et le partage des indicateurs de menace.

| Type d'indicateur | Focalisation | Nature | Cas d'usage |
| :--- | :--- | :--- | :--- |
| **IOC** (*Indicators of Compromise*) | Preuve qu'une attaque *a eu lieu* | Réactive | Empreintes de fichiers malveillants (SHA256, MD5), adresses IP, journaux de requêtes DNS, modifications non autorisées du système |
| **IOA** (*Indicators of Attack*) | Motivation et *stratégies* employées par les attaquants | Proactive | Identifier les techniques réutilisables ; contrer un IOA peut prévenir de futures attaques exploitant la même stratégie |

### Exemple d'IOC — Fichier malveillant

```
Fichier : "studiox-link-standalone-v20.03.8-stable.exe"
SHA256 : 6a6c28f5666b12beecd56a3d1d517e409b5d6866c03f9be44ddd9efffa90f1e0
SHA1   : eb019ad1c73ee69195c3fc84ebf44e95c147bef8
MD5    : 3a104b73bb96dfed288097e9dc0a11a8

Requêtes DNS :
  - log.studiox.link
  - my.studiox.link
  - _sips._tcp.studiox.link
  - sip.studiox.link

Connexions C2 (Command & Control) :
  - 198.51.100.248
  - 203.0.113.82
```

> **IOA vs IOC en pratique :** Un IOC indique *ce qui s'est passé* (une empreinte de malware spécifique). Un IOA révèle *comment* les attaquants opèrent (ex. : hameçonnage ciblé suivi d'un mouvement latéral) — permettant aux défenseurs de bloquer des stratégies d'attaque entières, et non de simples instances isolées.

---

## CATÉGORIES D'ATTAQUES

Les acteurs malveillants combinent outils et techniques pour mener des attaques variées. Le tableau ci-dessous associe chaque type d'attaque à son mécanisme, à son signal de détection et à un scénario typique d'examen.

| Type d'attaque | Mécanisme | Indicateur clé | Scénario typique |
| :--- | :--- | :--- | :--- |
| **Écoute clandestine** (*Eavesdropping / Sniffing / Snooping*) | Capture et écoute du trafic réseau non chiffré | Passif ; aucune modification des données | L'attaquant lit les communications des utilisateurs du réseau |
| **Modification de données** (*Data Modification*) | Altération des paquets en transit | L'expéditeur et le destinataire ignorent les modifications | Les paquets sont interceptés et altérés sans notification |
| **Usurpation d'adresse IP** (*IP Address Spoofing*) | Falsification de l'IP source pour se faire passer pour un hôte interne légitime | Paquets forgés depuis une source factice | L'acteur malveillant construit des paquets semblant provenir de l'intranet de l'entreprise |
| **Attaque par mot de passe** (*Password-based Attack*) | Obtention d'identifiants valides pour élever les privilèges | Utilisation non autorisée d'un compte | Les pirates se connectent avec les mêmes droits que les utilisateurs légitimes |
| **Déni de service** (*DoS — Denial of Service*) | Saturation ou plantage des systèmes pour bloquer l'accès aux utilisateurs légitimes | Indisponibilité du service | Empêche l'utilisation normale d'un ordinateur ou d'une ressource réseau |
| **Attaque de l'intercepteur** (*MiTM — Man-in-the-Middle*) | Positionnement entre source et destination pour surveiller et contrôler les communications | Interception transparente | L'acteur malveillant capture et contrôle les communications à l'insu des parties |
| **Attaque par clé compromise** (*Compromised-Key Attack*) | Obtention d'une clé de chiffrement secrète | Déchiffrement des communications sécurisées | L'acteur malveillant lit des données confidentielles sans que l'expéditeur ni le destinataire en soient informés |
| **Attaque par renifleur** (*Sniffer Attack*) | Lecture et capture des échanges de paquets réseau | Visibilité totale du contenu si non chiffré | Même les paquets encapsulés (tunnelés) peuvent être lus s'ils ne sont pas chiffrés |

> **Mémo examen — MiTM vs Écoute clandestine :** L'écoute clandestine est *passive* (écoute uniquement). Le MiTM est *actif* (surveillance, capture **et contrôle**).

---

## CATÉGORIES D'OUTILS DE TEST D'INTRUSION

Les professionnels de la cybersécurité — qu'ils opèrent en mode offensif ou défensif — doivent maîtriser les catégories d'outils suivantes. Nombre d'entre eux sont basés sur UNIX/Linux ; une solide maîtrise de Linux est indispensable.

> **Remarque :** Ces outils sont utilisés aussi bien par les professionnels éthiques que par les acteurs malveillants. C'est le contexte et l'autorisation qui déterminent la légalité de leur usage.

| Catégorie d'outil | Usage principal | Exemples notables | Utilisé par |
| :--- | :--- | :--- | :--- |
| **Casseurs de mots de passe** (*Password Crackers*) | Craquer ou récupérer des mots de passe par attaque par force brute ou contournement du chiffrement | John the Ripper, Ophcrack, LOphtCrack, THC Hydra, RainbowCrack, Medusa | Les deux |
| **Outils de hacking sans fil** (*Wireless Hacking Tools*) | Détecter les vulnérabilités de sécurité sur les réseaux sans fil | Aircrack-ng, Kismet, InSSIDer, KisMAC, Firesheep, NetStumbler | Les deux |
| **Outils de scan réseau** (*Network Scanning Tools*) | Sonder les équipements, serveurs et hôtes à la recherche de ports TCP/UDP ouverts | Nmap, SuperScan, Angry IP Scanner, NetScan Tools | Les deux |
| **Outils de forge de paquets** (*Packet Crafting Tools*) | Générer des paquets forgés pour tester la robustesse des pare-feux | Hping, Scapy, Socat, Yersinia, Netcat, Nping, Nemesis | Black Hat |
| **Renifleurs de paquets** (*Packet Sniffers*) | Capturer et analyser les paquets sur des LAN Ethernet ou des WLAN | Wireshark, Tcpdump, Ettercap, Dsniff, EtherApe, Fiddler, SSLstrip | Les deux |
| **Détecteurs de rootkits** (*Rootkit Detectors*) | Détecter les rootkits installés par vérification d'intégrité des fichiers et répertoires | AIDE, Netfilter, PF : OpenBSD Packet Filter | White Hat |
| **Fuzzeurs** (*Fuzzers*) | Découvrir des vulnérabilités système en injectant des entrées malformées | Skipfish, Wapiti, W3af | Black Hat |
| **Outils forensiques** (*Forensic Tools*) | Détecter toute trace de compromission, de malware ou d'accès non autorisé | Sleuth Kit, Helix, Maltego, Encase | White Hat |
| **Débogueurs** (*Debuggers*) | Rétro-ingénierie de binaires pour le développement d'exploits ou l'analyse de malwares | GDB, WinDbg, IDA Pro, Immunity Debugger | Les deux |
| **Systèmes d'exploitation de hacking** (*Hacking OS*) | Systèmes préconfigurés avec des outils optimisés pour les tests d'intrusion | Kali Linux, SELinux, Knoppix, Parrot OS, BackBox Linux | Les deux |
| **Outils de chiffrement** (*Encryption Tools*) | Protéger les données au repos et en transit via des algorithmes de chiffrement | VeraCrypt, CipherShed, OpenSSH, OpenSSL, OpenVPN, Stunnel | White Hat |
| **Outils d'exploitation de vulnérabilités** (*Vulnerability Exploitation Tools*) | Identifier et exploiter des vulnérabilités connues sur des hôtes distants | Metasploit, Core Impact, Sqlmap, Social Engineer Toolkit, Netsparker | Les deux |
| **Scanners de vulnérabilités** (*Vulnerability Scanners*) | Scanner un réseau ou un système à la recherche de ports ouverts et de CVE connus | Nipper, Secunia PSI, Nessus, SAINT, OpenVAS | White Hat |

### Référence rapide outil → cas d'usage

| Objectif de test d'intrusion | Outils recommandés |
| :--- | :--- |
| Sonder les ports ouverts sur les hôtes réseau | Nmap, SuperScan, Angry IP Scanner |
| Détecter un malware ou une trace de compromission | Sleuth Kit, Helix, Encase |
| Effectuer la rétro-ingénierie d'un malware ou développer un exploit | GDB, IDA Pro, Immunity Debugger |
| Tester la sécurité d'un réseau sans fil | Aircrack-ng, KisMAC, Kismet |
| Auditer la robustesse des mots de passe | John the Ripper, THC Hydra, Ophcrack |
| Tester un pare-feu avec des paquets forgés | Hping, Scapy, Nping |
| Scanner les CVE connus sur un réseau | Nessus, OpenVAS, SAINT |

---

## PARTAGE DES MENACES ET CADRES DE CYBERSÉCURITÉ

### Partage automatisé d'indicateurs (*Automated Indicator Sharing — AIS*)

La **CISA** (*Cybersecurity Infrastructure and Security Agency*, agence américaine de cybersécurité) pilote les efforts d'automatisation du partage d'informations sur les cybermenaces. Son système **AIS** (*Automated Indicator Sharing*) permet l'échange en temps réel d'indicateurs d'attaque vérifiés entre le gouvernement américain et les organisations du secteur privé — sans frais.

### Mois national de sensibilisation à la cybersécurité (*NCASM — National Cybersecurity Awareness Month*)

Organisé chaque octobre par la CISA et la **NCSA** (*National Cyber Security Alliance*), le NCASM vise à sensibiliser le grand public. Le thème de l'édition 2019 — *« Own IT. Secure IT. Protect IT. »* — couvrait notamment :

- La sécurité sur les réseaux sociaux
- La gestion des paramètres de confidentialité et l'hygiène des données
- La sensibilisation à la sécurité des applications mobiles
- La mise à jour régulière des logiciels
- Les bonnes pratiques d'achat en ligne
- La sécurité des réseaux Wi-Fi
- La protection des données clients

---

## LISTE DE CONTRÔLE CYBERSÉCURITÉ ORGANISATIONNELLE

Les organisations doivent mettre en œuvre et maintenir les pratiques de sécurité de base suivantes :

- [ ] Recourir à des prestataires informatiques de confiance
- [ ] Maintenir les logiciels de sécurité à jour
- [ ] Conduire des tests d'intrusion réguliers
- [ ] Assurer des sauvegardes redondantes (cloud + support physique)
- [ ] Renouveler périodiquement les identifiants Wi-Fi
- [ ] Maintenir les politiques de sécurité à jour
- [ ] Imposer des politiques de mots de passe robustes
- [ ] Déployer l'authentification à deux facteurs (2FA)

---

## RÉCAPITULATIF RAPIDE — AIDE-MÉMOIRE EXAMEN

### Identification du type d'attaque

| Scénario | Type d'attaque |
| :--- | :--- |
| Des pirates se connectent avec les mêmes droits que les utilisateurs légitimes | Attaque par mot de passe (*Password-based*) |
| Des paquets sont altérés sans que l'expéditeur ni le destinataire en soient informés | Modification de données (*Data Modification*) |
| L'acteur malveillant se positionne entre la source et la destination | Attaque de l'intercepteur (*MiTM*) |
| Une clé de chiffrement secrète est obtenue | Attaque par clé compromise (*Compromised-Key*) |
| L'attaquant lit le trafic circulant sur le réseau | Écoute clandestine (*Eavesdropping*) |
| Des paquets sont forgés pour sembler provenir d'une adresse interne légitime | Usurpation d'adresse IP (*IP Spoofing*) |
| Les utilisateurs légitimes sont empêchés d'accéder aux ressources | Déni de service (*DoS*) |

### Identification rapide du type d'acteur

| Scénario | Type d'acteur |
| :--- | :--- |
| Des écologistes lancent une attaque DoS contre une compagnie pétrolière | Hacktivistes |
| Un État dérobe des secrets de défense à un gouvernement étranger | Acteur étatique (*State-Sponsored*) |
| Un adolescent défigure le serveur web d'un journal local | Script Kiddie |
| Un criminel dérobe des identifiants bancaires à des fins lucratives | Cybercriminel |

### Identification rapide de la stratégie de gestion des risques

| Scénario | Stratégie |
| :--- | :--- |
| Le coût de la correction dépasse le coût du risque → aucune action | Acceptation du risque (*Risk Acceptance*) |
| Le service vulnérable est entièrement arrêté | Évitement du risque (*Risk Avoidance*) |
| Souscription d'une assurance cybersécurité | Transfert du risque (*Risk Transfer*) |
| Application de correctifs et mise en place d'une supervision | Réduction du risque (*Risk Reduction*) |
