---
title: "Analyse des Menaces et Classification des Données"
description: "Module technique examinant la taxonomie des acteurs de menaces, la classification des données (PII, PHI, PSI) et les vecteurs d'attaque au sein des infrastructures critiques."
---

## MODULE OVERVIEW

Ce module prépare l'analyste **CyberOps Associate** à identifier les vecteurs d'attaque spécifiques et les motivations des différents acteurs. La compréhension de la distinction entre la cybercriminalité classique et la **Cyberguerre**, ainsi que le comportement technique des différents types de malwares (comme les **Vers** par rapport aux **Rançongiciels**), est essentielle pour une classification précise des incidents et une attribution rigoureuse.

## CORE CONCEPTS & DEFINITIONS

### Attribution Cyber et Identité
* **Acteur de menace (Threat Actor) :** Terme technique désignant l'individu, le groupe ou le dispositif responsable d'une attaque. Dans le cadre de l'attribution cyber, cela permet d'identifier la source de l'activité malveillante.
* **Script Kiddie :** Terme standard de l'industrie pour un hacker amateur qui manque de compétences techniques pour développer ses propres outils, s'appuyant sur des scripts et logiciels préexistants.
* **Botnet :** Réseau d'ordinateurs compromis (zombies) sous le contrôle d'un serveur de commande et de contrôle (**C2**). Son but est de faciliter des activités malveillantes distribuées (DDoS, spam massif).

### Classification des Malwares par Comportement
* **Ver (Worm) :** Logiciel malveillant autonome qui se réplique pour se propager à travers le réseau sans intervention humaine ni fichier hôte.
* **Rançongiciel (Ransomware) :** Attaque spécifique où l'acteur chiffre les données critiques et exige un paiement (souvent en cryptomonnaie) pour rétablir l'accès.
* **Cheval de Troie (Trojan Horse) :** Malware dissimulé sous l'apparence d'un logiciel légitime pour pénétrer un système.

## TECHNICAL TAXONOMY & CLASSIFICATION

### Analyse Comparative : Motivations et Infrastructures

| Concept | Définition Technique | Objectif Principal |
| :--- | :--- | :--- |
| **Cyberguerre** | Opérations d'État ciblant des intérêts nationaux. | Perturbation ou exploitation de ressources vitales (ex: **Stuxnet**). |
| **Cybercriminalité** | Activité illégale motivée par l'appât du gain. | **Gain financier** via le vol de **PII** ou de secrets commerciaux. |
| **Point d'accès malveillant (Rogue Hotspot)** | AP non autorisé imitant une entreprise légitime. | Interception du trafic utilisateur pour le vol d'identifiants. |



## OPERATIONAL ANALYSIS

### Méthodologie d'Attaque et Impact
* **Vecteurs de Malware (Pièces jointes) :** Vecteur utilisé pour contourner les défenses périmétriques. L'objectif est souvent l'exfiltration de **Secrets Commerciaux** (Propriété Intellectuelle) ou l'établissement d'une persistance sur le réseau.
* **Vulnérabilités des Hotspots Publics :** L'utilisation de points d'accès non chiffrés expose le trafic à des attaques de type **Man-in-the-Middle (MitM)**, permettant le détournement de sessions.
* **Information Personnellement Identifiable (PII) :** Données collectées spécifiquement pour **distinguer l'identité des individus**. Sa protection est régie par des cadres comme le **RGPD**.

### Étude de Cas : Systèmes de Contrôle Industriel (ICS)
L'attaque **Stuxnet** demeure l'exemple définitif d'une arme de cyberguerre. Elle a été conçue pour cibler les systèmes **SCADA** d'une installation d'enrichissement d'uranium, prouvant qu'un code numérique peut causer des dommages physiques critiques à une infrastructure nationale.



## CASE STUDIES & EXAM SPECIFICS

### Éviter les pièges de l'examen
Pour réussir la certification CyberOps Associate, distinguez ces concepts :

* **Cyberguerre vs Attaque de Corporation :** La cyberguerre est définie par la cible liée aux **intérêts nationaux**, indépendamment de la taille de l'entreprise visée.
* **Définition PII :** La définition technique exacte est une donnée permettant de **distinguer l'identité des individus**.
* **Ver vs Virus :** Si la question porte sur l'objectif de **propagation autonome sur le réseau**, la réponse technique est le **Ver**.
* **Rogue Hotspot :** Le risque principal n'est pas la saturation du réseau, mais le **détournement du trafic** et le vol d'informations.