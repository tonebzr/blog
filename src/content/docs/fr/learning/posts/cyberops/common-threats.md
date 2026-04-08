---
title: "CyberOps Associate : Taxonomie des Malwares et Méthodologies d'Attaques Réseau"
description: "Analyse technique approfondie des classifications de logiciels malveillants, des vecteurs d'ingénierie sociale et des vecteurs d'attaque au niveau réseau dans l'écosystème CyberOps."
order: 14
---

## PRÉSENTATION DU MODULE

Ce module propose un examen technique rigoureux du paysage des menaces affectant les équipements terminaux et l'infrastructure réseau. Un **malware** (logiciel malveillant) est défini comme du code spécifiquement conçu pour perturber, endommager ou faciliter l'accès non autorisé à des données, des hôtes ou des réseaux. Les malwares évoluent si rapidement que les solutions antimalware ne peuvent pas toujours être mises à jour assez vite pour contrer les nouvelles menaces, rendant leur classification et la compréhension de leurs comportements essentielles.

Les opérations de cybersécurité nécessitent de classifier les menaces en catégories distinctes — **Reconnaissance**, **Accès**, **Ingénierie sociale** et **Déni de service (DoS)** — afin de mettre en œuvre des stratégies d'atténuation et des politiques de sécurité efficaces.

---

## CONCEPTS FONDAMENTAUX & DÉFINITIONS

### Logiciels Malveillants (Malwares)

Les malwares servent de mécanisme de livraison pour des charges utiles malveillantes conçues pour exploiter des vulnérabilités de sécurité.

- **Virus** : Segment de code qui se propage en insérant des copies de lui-même dans d'autres programmes exécutables. Il nécessite un programme hôte et implique généralement une intervention humaine pour la distribution initiale (ex. : supports amovibles infectés, pièces jointes email). Les virus peuvent rester dormants puis s'activer à une date/heure spécifique, et peuvent muter pour échapper à la détection.
- **Ver (Worm)** : Programme autonome qui se réplique indépendamment à travers les infrastructures réseau en exploitant des vulnérabilités logicielles. Les vers sont caractérisés par leur vitesse de propagation rapide, capables d'infecter des centaines de milliers d'hôtes en quelques heures — sans nécessiter d'interaction utilisateur après l'infection initiale.
- **Cheval de Troie (Trojan Horse)** : Logiciel d'apparence légitime qui exécute du code malveillant en utilisant les privilèges de l'utilisateur qui l'exécute. Les chevaux de Troie sont souvent déguisés en jeux ou utilitaires et sont utilisés pour établir des **portes dérobées (backdoors)** d'accès à distance, exfiltrer des données ou désactiver les logiciels de sécurité.
- **Rançongiciel (Ransomware)** : Malware utilisant des algorithmes de chiffrement pour bloquer l'accès aux fichiers et données système. Il est devenu le type de malware le plus lucratif de l'histoire. La restauration de l'accès est conditionnée au paiement d'une rançon, généralement en **Bitcoin** ou autre cryptomonnaie anonyme.
- **Logiciel espion (Spyware)** : Collecte des informations sur un utilisateur et les transmet à un tiers sans son consentement. Les variantes incluent les moniteurs système, les enregistreurs de frappe (keyloggers), les cookies de traçage et les adwares.
- **Logiciel publicitaire (Adware)** : Affiche des publicités non sollicitées sous forme de fenêtres contextuelles pour générer des revenus. Il peut tracer les habitudes de navigation pour diffuser des publicités ciblées.
- **Scareciel (Scareware)** : Utilise l'ingénierie sociale pour provoquer la panique ou l'anxiété en créant une fausse perception de menace, incitant l'utilisateur à installer un malware ou acheter un logiciel frauduleux.
- **Rootkit** : Outil sophistiqué qui s'intègre aux couches les plus basses du système d'exploitation pour dissimuler la présence d'un acteur malveillant et maintenir un accès privilégié persistant. Les rootkits falsifient les résultats des appels système pour masquer les processus, fichiers et connexions réseau malveillants.
- **Hameçonnage (Phishing, en tant que vecteur malware)** : Tente de convaincre des utilisateurs de divulguer des informations sensibles (PII, identifiants, données financières) via des communications frauduleuses.

---

## TAXONOMIE TECHNIQUE & CLASSIFICATION

### Analyse Comparative des Malwares

| Type | Méthode de Propagation | Hôte Requis | Action Humaine Requise | Impact Opérationnel |
| :--- | :--- | :---: | :---: | :--- |
| **Virus** | Attachement à des fichiers/programmes | Oui | Oui | Modification/suppression de fichiers, consommation de ressources |
| **Ver** | Exploitation réseau autonome | Non | Non (après infection) | Saturation réseau, interruption de service |
| **Cheval de Troie** | Exécution initiée par l'utilisateur | Oui (en tant qu'app légitime) | Oui | Exfiltration de données, accès distant, backdoor |
| **Rançongiciel** | Email, malvertising, ingénierie sociale | Non | Partiel | Chiffrement de fichiers, verrouillage opérationnel |
| **Spyware** | Installation furtive | Oui | Non | Collecte/surveillance de données non autorisée |
| **Rootkit** | Bundlé avec d'autres malwares | Oui | Non | Accès persistant caché, falsification des journaux |
| **Adware** | Installation de logiciels groupés | Oui | Oui (installation) | Violation de la vie privée, dégradation des performances |

### Sous-Types de Cheval de Troie

| Type | Description |
| :--- | :--- |
| **Accès distant** | Permet un accès distant non autorisé au système |
| **Envoi de données** | Exfiltre des données sensibles telles que mots de passe ou numéros de carte bancaire |
| **Destructif** | Corrompt ou supprime des fichiers sur le système cible |
| **Proxy** | Utilise la machine de la victime comme point de rebond pour lancer d'autres attaques |
| **FTP** | Active des services de transfert de fichiers non autorisés sur le terminal |
| **Désactivateur de sécurité** | Arrête les antivirus ou désactive les pare-feux |
| **DoS** | Ralentit ou interrompt l'activité réseau depuis l'hôte infecté |
| **Enregistreur de frappe (Keylogger)** | Enregistre les frappes clavier pour dérober des identifiants ou données financières |

### Composants d'un Ver

Toute attaque par ver repose sur trois composants fondamentaux :

1. **Vulnérabilité exploitée** — Installation via un mécanisme d'exploitation (pièce jointe email, fichier exécutable ou cheval de Troie) sur un système vulnérable.
2. **Mécanisme de propagation** — Après avoir obtenu l'accès, le ver se réplique et analyse le réseau à la recherche de nouvelles cibles.
3. **Charge utile (Payload)** — Code malveillant qui exécute une action : création d'une backdoor, lancement d'une attaque DoS ou exfiltration de données.

---

## CATÉGORIES D'ATTAQUES RÉSEAU

Les attaques sont classifiées en trois grandes catégories. La reconnaissance précède généralement les attaques d'accès et les attaques DoS.

### Attaques de Reconnaissance

La reconnaissance est la découverte et la cartographie non autorisées de systèmes, services ou vulnérabilités — analogue à un cambrioleur qui inspecte un quartier avant de passer à l'acte.

| Technique | Description | Outils Exemples |
| :--- | :--- | :--- |
| **Requête d'information** | Collecte de données initiales sur la cible | Google, Whois, site web de l'organisation |
| **Balayage ICMP (Ping Sweep)** | Détermination des adresses IP actives sur le réseau | `fping`, `nmap -sP` |
| **Scan de ports** | Identification des ports ouverts et des services disponibles | Nmap, Angry IP Scanner, NetScanTools |
| **Scan de vulnérabilités** | Interrogation des ports pour identifier la version de l'OS/application | Nessus, OpenVAS, Nipper, SAINT |
| **Exploitation** | Tentative d'exploitation des services vulnérables découverts | Metasploit, Core Impact, SQLmap, Netsparker |

### Attaques d'Accès

Les attaques d'accès exploitent des vulnérabilités connues dans les services d'authentification, FTP ou web afin de récupérer des données, obtenir un accès non autorisé ou élever les privilèges jusqu'au niveau administrateur.

- **Attaques par mot de passe** : Attaques par force brute ou par dictionnaire pour découvrir les mots de passe système via des outils tels que Hydra ou John the Ripper.
- **Attaques par usurpation (Spoofing)** : Le dispositif de l'attaquant se fait passer pour un autre en falsifiant des données — comprend l'**usurpation d'adresse IP**, de **MAC** et de **DHCP**.
- **Exploitation de relations de confiance (Trust Exploitation)** : Abus des relations de confiance établies entre systèmes pour obtenir un accès non autorisé.
- **Redirection de ports (Port Redirection)** : Redirection du trafic via un hôte compromis pour atteindre des cibles autrement inaccessibles.
- **Attaque de l'homme du milieu (MitM)** : Interception et potentielle altération des communications entre deux parties à leur insu.
- **Dépassement de tampon (Buffer Overflow)** : Envoi d'un volume de données supérieur à la capacité d'un tampon, écrasant la mémoire adjacente et permettant potentiellement l'exécution de code arbitraire.

### Attaques par Déni de Service (DoS)

Une attaque DoS provoque des interruptions de service réseau pour les utilisateurs, équipements ou applications. Deux mécanismes principaux existent :

- **Saturation par le volume** : Un volume massif de données est envoyé à un débit que le réseau, l'hôte ou l'application ne peut pas absorber, provoquant ralentissements ou pannes.
- **Paquets malformés** : Des paquets conçus pour exploiter des bogues d'analyse provoquent le crash ou le ralentissement du récepteur.

Une attaque **DDoS (Déni de Service Distribué)** utilise un **botnet** — un réseau de machines compromises (zombies) — pour amplifier le volume d'attaque bien au-delà de ce qu'une seule machine peut générer.

---

## INGÉNIERIE SOCIALE

L'ingénierie sociale est une méthode d'attaque non technique ciblant le **facteur humain** — considéré unanimement comme le maillon faible de la sécurité réseau. L'attaquant manipule des personnes pour les inciter à effectuer des actions ou à divulguer des informations confidentielles.

### Vecteurs d'Attaque par Ingénierie Sociale

| Type d'Attaque | Méthodologie | Catégorie |
| :--- | :--- | :--- |
| **Prétexte (Pretexting)** | Création d'un faux scénario pour persuader la victime de partager des données | Technique/Téléphonique |
| **Hameçonnage (Phishing)** | Envoi d'emails frauduleux se faisant passer pour des sources fiables | Technique |
| **Hameçonnage ciblé (Spear Phishing)** | Phishing ciblé adapté à un individu ou une organisation spécifique | Technique |
| **Hameçonnage vocal (Vishing)** | Phishing vocal par téléphone, souvent avec usurpation d'identité de l'appelant | Technique/Téléphonique |
| **Pourriel (Spam)** | Email en masse non sollicité contenant souvent des liens malveillants ou des malwares | Technique |
| **Appâtage (Baiting)** | Dépôt de supports physiques infectés (ex. : clés USB) dans des lieux publics | Physique |
| **Filature (Tailgating)** | Suivi physique d'une personne autorisée pour accéder à une zone sécurisée | Physique |
| **Observation furtive (Shoulder Surfing)** | Observation discrète de l'écran ou du clavier pour dérober des identifiants | Physique |
| **Fouille de poubelles (Dumpster Diving)** | Inspection des poubelles à la recherche de documents confidentiels | Physique |
| **Usurpation d'identité (Impersonation)** | Prétendre être une personne de confiance pour gagner la confiance de la victime | Physique/Technique |
| **Contrepartie (Quid Pro Quo)** | Demande de données en échange d'un service ou d'un cadeau | Technique/Téléphonique |

### Ingénierie Sociale Assistée par IA Générative

Les acteurs malveillants exploitent de plus en plus l'**IA générative** pour amplifier et automatiser les attaques d'ingénierie sociale :

- **Emails de phishing générés par IA** : Les grands modèles de langage (LLM) de type GPT peuvent générer à grande échelle des emails de phishing hautement convaincants et personnalisés, imitant le style rédactionnel des communications internes légitimes.
- **Technologie Deepfake** : Audio, vidéo ou images générés par IA qui usurpent l'identité de dirigeants ou d'autorités. Exemple : un enregistrement vocal deepfake d'un PDG ordonnant un virement bancaire.
- **Hameçonnage vocal par IA (AI Vishing)** : Génération de voix synthétiques utilisées dans des attaques de phishing téléphonique pour se faire passer pour des agents bancaires, des autorités gouvernementales ou des managers.
- **Usurpation automatisée sur les réseaux sociaux** : Création de faux profils générés par IA (ex. : recruteurs LinkedIn) pour établir une relation de confiance et soutirer des informations sensibles.
- **Spear Phishing augmenté par IA** : Des outils IA extraient des données publiques (réseaux sociaux, sites d'entreprise) pour rédiger des messages d'attaque hyper-personnalisés référençant le travail, les habitudes ou les collègues de la victime.

### Défense Contre l'Ingénierie Sociale

Les organisations doivent adresser à la fois les défenses techniques et humaines :

- Mettre en place une **formation à la sensibilisation à la sécurité** pour tous les employés.
- Établir des **procédures de vérification d'identité** pour les demandes par téléphone, email ou en personne.
- Appliquer une **politique de bureau propre** et une destruction appropriée des documents (broyage).
- Déployer des **filtres email** et des **outils anti-phishing**.
- Utiliser le **Social Engineer Toolkit (SET)** pour des tests de pénétration autorisés et des exercices de sensibilisation.

---

## TECHNIQUES D'ÉVASION

Les acteurs malveillants utilisent des méthodes furtives pour contourner les défenses réseau et hôte. Leur philosophie fondamentale : *« se cacher, c'est survivre »*.

| Méthode d'Évasion | Description |
| :--- | :--- |
| **Chiffrement & Tunneling** | Chiffre ou tunnelise les malwares dans du trafic légitime pour échapper à la détection basée sur les signatures |
| **Fragmentation du trafic** | Découpe les charges utiles malveillantes en petits paquets qui contournent individuellement l'IDS/IPS, puis se réassemblent à destination |
| **Mauvaise interprétation de protocole** | Exploite la façon dont les pare-feux gèrent les champs PDU (TTL, sommes de contrôle) pour faire passer des paquets malveillants |
| **Substitution de trafic** | Encode la charge utile dans un format alternatif (ex. : Unicode au lieu d'ASCII) pour tromper la correspondance de signatures IPS |
| **Insertion de trafic** | Insère des octets supplémentaires dans une séquence malveillante ; les règles IPS manquent la menace tandis que le système cible traite correctement les données |
| **Épuisement des ressources** | Surcharge l'hôte cible pour l'empêcher d'exécuter correctement les mécanismes de détection de sécurité |
| **Pivotage (Pivoting)** | Utilise un hôte interne compromis pour se déplacer latéralement plus profondément dans le réseau avec des identifiants volés |
| **Rootkits** | Dissimule l'activité de l'attaquant au niveau OS en présentant des résultats falsifiés aux outils de surveillance |
| **Proxies** | Route le trafic via des systèmes intermédiaires d'apparence bénigne pour masquer l'infrastructure C2 (Commande et Contrôle) |

---

## ANALYSE OPÉRATIONNELLE

### Comportements Malwares Courants (Indicateurs de Compromission)

La détection d'une infection malware requiert l'analyse des journaux réseau et système pour identifier des comportements anormaux. Les systèmes infectés présentent généralement :

**Indicateurs au niveau hôte :**
- Apparition de fichiers, programmes ou icônes de bureau inhabituels
- Antivirus ou pare-feu désactivés ou reconfigurés de façon inattendue
- Gels système, crashs ou Écran Bleu de la Mort (BSOD)
- Fichiers modifiés ou supprimés sans action utilisateur
- Processus ou services inconnus s'exécutant en arrière-plan
- Augmentation inexpliquée de l'utilisation CPU et/ou mémoire

**Indicateurs au niveau réseau :**
- Connexions sortantes spontanées vers des hôtes internet inconnus
- Ports TCP/UDP inconnus ouverts sur l'hôte
- Emails envoyés automatiquement aux contacts sans intervention de l'utilisateur
- Dégradation des performances réseau ou internet
- Problèmes de connexion aux ressources réseau

> **Remarque** : Cette liste n'est pas exhaustive. Le comportement des malwares continue d'évoluer et de nouveaux indicateurs émergent régulièrement.

### Analyse des Malwares par IA Prédictive et Sandboxing

Les analystes sécurité utilisent des **chambres de détonation** et des **bacs à sable (sandboxes)** pour observer le comportement des malwares de façon sécurisée dans des environnements isolés, sans risquer les systèmes de production.

**Composants clés de l'analyse :**

1. **Analyse statique** : Examen des empreintes (hashes) de fichiers (MD5, SHA-1, SHA-256), du type et de la taille du fichier sans exécuter l'échantillon. Les hashes sont utilisés pour croiser des bases de données de malwares connus.
2. **Analyse comportementale** : Surveillance du flux d'exécution incluant la création de processus, les modifications du système de fichiers et les changements de registre.
3. **Analyse réseau** : Identification des connexions vers des serveurs C2 (Commande et Contrôle), des requêtes DNS et des tentatives d'exfiltration de données.
4. **Scoring de risque** : Utilisation de l'IA prédictive pour estimer la probabilité d'intention malveillante sur la base de patterns comportementaux et de renseignements sur les menaces.

---

## ÉTUDES DE CAS & POINTS D'EXAMEN

### Analyse d'Impact Historique : Propagation de Vers

| Ver | Année | Vulnérabilité Exploitée | Impact Maximum |
| :--- | :---: | :--- | :--- |
| **Code Red** | 2001 | Dépassement de tampon serveur IIS | Plus de 300 000 serveurs infectés en 19 heures |
| **SQL Slammer** | 2003 | Dépassement de tampon MS SQL Server | Plus de 250 000 hôtes en 30 min ; doublement toutes les 8,5 sec |

L'incident **SQL Slammer** est particulièrement notable : un correctif était disponible **6 mois avant** le déclenchement de l'épidémie, et pourtant les systèmes n'avaient pas été mis à jour — soulignant l'importance critique d'une gestion rigoureuse et rapide des correctifs.

### Architecture de Botnet : Le Cas Mirai

Le botnet **Mirai** ciblait les équipements IoT configurés avec des identifiants par défaut, principalement des caméras de vidéosurveillance (CCTV) et des enregistreurs vidéo numériques (DVR), via des attaques par dictionnaire en force brute.

```text
Identifiants par défaut ciblés par Mirai (extrait) :
- root/default       - root/1111
- root/54321         - admin/admin1234
- admin1/password    - guest/12345
- tech/tech          - support/support
```

Une fois compromis, les équipements exécutant les utilitaires **BusyBox** sous Linux étaient intégrés dans un botnet. En **septembre 2016**, un botnet Mirai de plus de 152 000 équipements a lancé la plus grande attaque DDoS connue à l'époque contre un hébergeur web français, atteignant un pic de trafic de **plus de 1 Tb/s**. En **octobre 2016**, le même type de botnet a perturbé les services de **Dyn DNS**, provoquant des pannes internet massives aux États-Unis et en Europe.

> En décembre 2017, trois opérateurs américains ont plaidé coupable, s'exposant à jusqu'à 10 ans d'emprisonnement et 250 000 $ d'amende.

---

## DISTINCTIONS CRITIQUES POUR L'EXAMEN

| Paire de Concepts | Distinction Clé |
| :--- | :--- |
| **Virus vs. Ver** | Un virus s'attache à un fichier et nécessite une propagation assistée par l'humain ; un ver se réplique de façon autonome à travers le réseau. |
| **Phishing vs. Vishing** | Le phishing est basé sur l'email ; le vishing est basé sur la voix/téléphone (manuel ou assisté par IA). |
| **Phishing vs. Spear Phishing** | Le phishing est massif et générique ; le spear phishing est ciblé sur une personne ou organisation spécifique. |
| **Reconnaissance vs. Accès** | La reconnaissance collecte des informations (scans de ports, balayages ICMP) ; les attaques d'accès exploitent activement les systèmes (cassage de mots de passe, MitM). |
| **DoS vs. DDoS** | Un DoS provient d'une source unique ; un DDoS utilise un botnet distribué de machines zombies compromises. |
| **Cheval de Troie vs. Virus** | Un cheval de Troie se déguise en logiciel légitime ; un virus se réplique en s'attachant à d'autres programmes. |
| **Rôle d'un Rootkit** | Obtenir un accès privilégié et persistant tout en dissimulant toute activité de l'attaquant au système d'exploitation et aux outils de surveillance. |
| **Rôle des Zombies** | Machines compromises intégrées dans un botnet, utilisées pour exécuter des attaques DDoS pour le compte de l'acteur malveillant. |
| **Maillon faible** | **Les personnes** — l'ingénierie sociale exploite la psychologie humaine plutôt que les vulnérabilités techniques. |