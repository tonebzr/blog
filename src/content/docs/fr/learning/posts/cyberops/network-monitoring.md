---
title: "Infrastructure de Sécurité Réseau et Surveillance des Endpoints"
description: "Une analyse technique approfondie des topologies de sécurité réseau, des méthodologies de surveillance du trafic et de l'intégration SIEM/SOAR."
order: 15
---

## PRÉSENTATION DU MODULE

Le paysage actuel de la cybersécurité est défini par le principe selon lequel **tous les réseaux sont des cibles potentielles**, ce qui nécessite une stratégie robuste de **défense en profondeur**. Une infrastructure de sécurité complète doit intégrer plusieurs couches de protection, notamment les **pare-feux**, les **Systèmes de Détection d'Intrusion (IDS)**, les **Systèmes de Prévention d'Intrusion (IPS)** et les **logiciels de sécurité des endpoints**. Ces technologies facilitent la surveillance automatisée et la génération d'alertes ; cependant, les environnements à grande échelle nécessitent une intervention humaine pour évaluer les **faux positifs** — du trafic légitime signalé à tort comme non autorisé.

La responsabilité principale d'un **Analyste en Cybersécurité** est de valider ces alertes et de déterminer l'intégrité des actifs internes. Les questions quotidiennes typiques incluent :
- Le fichier téléchargé par un utilisateur est-il réellement un malware ?
- Le site web visité par un utilisateur est-il véritablement malveillant ?
- Un appareil interne (p. ex., une imprimante) tente-t-il de contacter un serveur externe non autorisé ?

---

## CONCEPTS FONDAMENTAUX & DÉFINITIONS

### Topologie de Sécurité Réseau

Une approche de **défense en profondeur** superpose plusieurs contrôles de sécurité de sorte que si l'un échoue, les autres restent en place. Les composants suivants forment l'épine dorsale d'une infrastructure de sécurité moderne :

| Composant | Rôle |
| :--- | :--- |
| **Pare-feu** | Filtre le trafic selon des règles préconfigurées (stateful/stateless) |
| **IDS** | Détecte et alerte passivement sur les schémas de trafic suspects |
| **IPS** | Détecte et bloque activement le trafic malveillant en ligne |
| **Sécurité des Endpoints** | Protège les hôtes individuels contre les malwares, exploits et accès non autorisés |
| **SIEM / SOAR** | Centralise la collecte de journaux, la corrélation, les alertes et la réponse automatisée |

### Méthodologies de Surveillance Réseau

Pour établir une base de référence du comportement normal du réseau, les analystes utilisent plusieurs protocoles et outils pour surveiller le flux de trafic, la bande passante et l'accès aux ressources. Un comportement anormal s'écartant de cette base indique généralement un incident de sécurité ou une mauvaise configuration.

* **SNMP (Simple Network Management Protocol)** : Permet aux analystes de demander et de recevoir des informations opérationnelles sur les équipements réseau.
* **NetFlow** : Un protocole développé par Cisco utilisé pour la planification réseau, la surveillance de la sécurité et l'analyse du trafic.
* **Analyseurs de paquets** : Des outils comme **Wireshark** capturent des trames dans des fichiers contenant des informations détaillées sur les trames, les interfaces, les horodatages et les longueurs de paquets.
* **Tcpdump** : Un utilitaire en ligne de commande offrant de nombreuses options pour la capture et le filtrage des paquets réseau.

> **Référence Rapide — Sélection d'Outil :**
> | Question | Outil Approprié |
> | :--- | :--- |
> | Demander/recevoir des infos opérationnelles sur un équipement | **SNMP** |
> | Capturer des trames avec horodatages & longueurs | **Wireshark** |
> | Planification réseau & analyse du trafic | **NetFlow** |
> | Reporting de sécurité en temps réel en entreprise | **SIEM** |
> | Capture de paquets en ligne de commande | **Tcpdump** |

### Audit des Endpoints

Les endpoints doivent être surveillés pour détecter les ports ouverts pouvant autoriser des connexions distantes non autorisées. Des vulnérabilités ou des infections par malware peuvent entraîner l'écoute de processus en attente de commandes entrantes.

* **TCPView** : Un utilitaire Windows (Sysinternals) qui fournit un sous-ensemble détaillé en temps réel des fonctionnalités de **Netstat**. Il affiche tous les endpoints **TCP** et **UDP**, y compris les adresses locales/distantes et les états de connexion.
* **Netstat** : Outil en ligne de commande multiplateforme pour afficher les connexions actives, les tables de routage et les statistiques réseau.

> **Activité de Lab — "Que se passe-t-il ?" (15.0.3)**
> L'activité de classe Cisco CyberOps utilise TCPView pour :
> 1. Identifier tous les processus en cours d'exécution et leurs protocoles associés
> 2. Observer les connexions **LISTENING** (en écoute) vs. **ESTABLISHED** (établies) en temps réel
> 3. Surveiller les changements de connexion lorsqu'un navigateur s'ouvre et navigue vers un site web
> 4. Comprendre le codage couleur de TCPView (nouvelles connexions surlignées, connexions fermées en rouge)
> 5. Terminer un processus suspect via clic droit > **End Process** (à utiliser avec précaution — peut causer de l'instabilité)

---

## TAXONOMIE TECHNIQUE & CLASSIFICATION

Les tableaux suivants classifient les méthodes de capture de données et les systèmes de gestion de la sécurité en fonction de leurs caractéristiques opérationnelles et de leur implémentation technique.

### Tableau 1 : Capture de Trafic Matérielle et Logique

| Méthode | Implémentation Technique | Impact Opérationnel | Sécurité en Cas de Panne |
| :--- | :--- | :--- | :--- |
| **Network TAP** | Dispositif de division passif installé en ligne entre deux équipements (p. ex., pare-feu et routeur). Envoie les flux TX et RX vers un équipement de surveillance sur des canaux dédiés. | Transmet tout le trafic (y compris les erreurs de couche physique) vers un équipement d'analyse en temps réel sans dégrader les performances. | Oui — le trafic continue si le TAP perd son alimentation |
| **Mise en Miroir du Trafic (SPAN)** | Technique basée sur un commutateur où les trames sont copiées depuis les ports source ou les VLANs vers un port de destination. | Permet la surveillance dans des environnements segmentés mais peut être limitée par la capacité de traitement du commutateur. | Pas de sécurité dédiée en cas de panne |
| **Remote SPAN (RSPAN)** | Extension du SPAN qui exploite les VLANs pour surveiller le trafic sur des commutateurs distants à travers le réseau. | Étend la visibilité au-delà des commutateurs locaux ; nécessite une infrastructure VLAN. | Dépend de la disponibilité du VLAN |

### Tableau 2 : Terminologie SPAN

| Terme | Description |
| :--- | :--- |
| **Trafic entrant (Ingress)** | Trafic entrant dans le commutateur sur un port SPAN source |
| **Trafic sortant (Egress)** | Trafic quittant le commutateur sur un port SPAN source |
| **Port source** | Un port surveillé pour l'analyse du trafic |
| **Port de destination** | Le port SPAN connecté à l'équipement d'analyse (IDS, serveur de gestion) |
| **Session SPAN** | L'association entre un ou plusieurs ports source et un port de destination |

> **Remarque :** Chaque session SPAN peut utiliser des ports **ou** des VLANs comme sources, mais pas les deux simultanément. Sur certains commutateurs Cisco, le trafic peut être mis en miroir vers plus d'un port de destination.

### Tableau 3 : Fonctionnalités SIEM vs. SOAR

| Système | Rôle Principal | Fonctions Clés | Différenciateur |
| :--- | :--- | :--- | :--- |
| **SIEM** | Reporting en temps réel et analyse à long terme des événements de sécurité | Analyse forensique, corrélation de journaux disparates, agrégation des enregistrements en double, reporting | Déclenche l'alarme — **détecte** les menaces |
| **SOAR** | Améliore le SIEM en facilitant la réponse aux incidents et l'investigation | Gestion des cas, intégration du renseignement sur les menaces, automatisation de la réponse via des **run books** | Permet la réponse — **agit** sur les menaces |

---

## ANALYSE OPÉRATIONNELLE

### Analyser le Trafic avec la Suite ELK

La suite **ELK** (Elasticsearch, Logstash, Kibana) est une solution SIEM open source intégrée dans des plateformes comme **Security Onion**. Elle est couramment utilisée dans les environnements de formation CyberOps comme alternative accessible aux outils propriétaires comme Splunk ou SolarWinds.

* **Logstash** : Fonctionne comme un système de traitement en pipeline qui connecte les entrées de données aux sorties, en appliquant des filtres optionnels pendant le transit.
* **Elasticsearch** : Sert de moteur de recherche en texte intégral orienté documents pour l'indexation des données de sécurité.
* **Kibana** : Fournit un tableau de bord basé sur navigateur pour visualiser et rechercher les données indexées par Elasticsearch.

```
[Entrées] --> Logstash (filtres) --> Elasticsearch (index) --> Kibana (visualisation)
          p. ex., syslog, NetFlow,                              tableaux de bord, alertes
                journaux pare-feu
```

### Plateformes SIEM Commerciales

| Plateforme | Type | Fonctionnalités Notables |
| :--- | :--- | :--- |
| **Splunk Enterprise Security** | Propriétaire | Standard de l'industrie, puissant langage de requête SPL, larges intégrations |
| **SolarWinds Security Event Manager** | Propriétaire | Abordable, reporting de conformité intégré |
| **Security Onion + ELK** | Open Source | Gratuit, utilisé dans la formation Cisco CyberOps, intègre Zeek, Suricata et ELK |

### États de Connexion des Endpoints

Dans une analyse typique avec **TCPView** ou **Netstat**, les états et attributs suivants doivent être identifiés pour assurer la conformité sécurité :

1. **LISTENING** : Le processus attend une connexion entrante sur un port local — indicateur clé de potentielles portes dérobées de malware.
2. **ESTABLISHED** : Une connexion active de bout en bout est actuellement en place entre l'hôte local et l'hôte distant.
3. **TIME_WAIT** : La connexion se ferme ; le côté local attend de s'assurer que le côté distant a bien reçu la terminaison.
4. **CLOSE_WAIT** : Le côté distant a fermé la connexion, en attente que le processus local se ferme.
5. **Identification des Processus** : Chaque connexion est associée à un **Identifiant de Processus (PID)** spécifique et à un exécutable (p. ex., `lsass.exe`, `svchost.exe`).
6. **Versionnage des Protocoles** : La surveillance doit inclure les endpoints **TCP** et **TCPv6** pour s'assurer qu'il n'existe pas de canaux de communication cachés.

---

## CAS PRATIQUES & SPÉCIFICITÉS D'EXAMEN

### Scénario : Identification d'une Persistance Malveillante

Un analyste en cybersécurité observe un processus inconnu dans **TCPView** avec un état **LISTENING** sur un port à numéro élevé. Selon le cadre Cisco CyberOps, les attaquants ont besoin d'un port en écoute pour établir une connexion distante. Si ce port a été ouvert par un processus non autorisé par la politique de sécurité de l'organisation, cela peut indiquer une infection par malware ou une vulnérabilité logicielle. Les analystes peuvent utiliser **TCPView** pour terminer le processus directement via **End Process**, bien que cela comporte un risque d'instabilité du système — seuls les processus connus comme sûrs devraient être terminés de cette façon.

**Procédure d'investigation :**
1. Identifier le PID suspect dans TCPView
2. Croiser le PID avec le **Gestionnaire des tâches** ou `tasklist` pour trouver l'exécutable parent
3. Vérifier le chemin de l'exécutable — les malwares résident souvent dans `%TEMP%` ou `%APPDATA%`
4. Rechercher le hash de l'exécutable sur **VirusTotal** ou une plateforme de renseignement sur les menaces similaire
5. Si confirmé malveillant : isoler l'endpoint, terminer le processus et escalader vers le SOC

### Scénario : Session SPAN sur un Commutateur Cisco

```
! Exemple : Mise en miroir du trafic de F0/1 et F0/2 vers G0/1 (capteur IDS)
Switch(config)# monitor session 1 source interface F0/1 both
Switch(config)# monitor session 1 source interface F0/2 both
Switch(config)# monitor session 1 destination interface G0/1
```

### Différenciateurs pour l'Examen

* **SPAN vs. RSPAN** : Alors que le **SPAN** surveille les ports d'un commutateur local, le **Remote SPAN (RSPAN)** permet aux administrateurs de surveiller le trafic sur des commutateurs distants via des VLANs.
* **TAPs et Sécurité en Cas de Panne** : Les Network TAPs sont conçus pour être sécurisés en cas de panne ; si l'alimentation est perdue, le trafic continue de circuler entre les équipements réseau principaux (p. ex., le pare-feu et le routeur) sans être affecté.
* **Agrégation de Données** : Les systèmes SIEM utilisent l'**agrégation** spécifiquement pour réduire le volume de données d'événements en consolidant les enregistrements en double — essentiel pour gérer des millions d'événements dans les environnements d'entreprise.
* **SIEM vs. SOAR** : Le SIEM **détecte et rapporte** ; le SOAR **automatise la réponse**. Les deux sont complémentaires, pas interchangeables.
* **TCPView vs. Netstat** : TCPView est basé sur une interface graphique, en temps réel et réservé à Windows ; Netstat est en ligne de commande et multiplateforme.
* **IDS vs. IPS** : L'IDS est **passif** (alertes uniquement) ; l'IPS est **en ligne et actif** (peut bloquer le trafic).

---

## QUESTIONS D'ENTRAÎNEMENT

Les questions suivantes reflètent le style de l'examen de certification Cisco CyberOps pour ce module :

1. **Qu'est-ce qui permet aux analystes de demander et de recevoir des informations sur le fonctionnement des équipements réseau ?**
   > Réponse : **SNMP**

2. **Quelle application capture des trames sauvegardées dans un fichier contenant des informations sur les trames, les interfaces, la longueur des paquets et les horodatages ?**
   > Réponse : **Wireshark**

3. **Quel outil peut être utilisé pour la surveillance réseau et de sécurité, la planification réseau et l'analyse du trafic ?**
   > Réponse : **NetFlow**

4. **Quel outil est utilisé dans les organisations d'entreprise pour fournir des rapports en temps réel et une analyse à long terme des événements de sécurité ?**
   > Réponse : **SIEM**

5. **Quel utilitaire propose de nombreuses options en ligne de commande pour capturer des paquets ?**
   > Réponse : **Tcpdump**

---

> **Sujet de Discussion :** Comment différencieriez-vous les cas d'usage d'un Network TAP passif par rapport à une session SPAN logique dans un environnement de centre de données à haute bande passante ? Prenez en compte l'impact sur les performances, la portée de la visibilité et le comportement en cas de panne dans votre réponse.
